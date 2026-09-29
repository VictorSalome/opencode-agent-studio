/**
 * Plugin OpenCode: Jev System One Motor Determinístico
 * Integração 100% transparente e automática para OpenCode:
 * 1. Triagem Contínua em background de todo prompt do usuário (0 tokens do LLM principal).
 * 2. Guardrail destrutivo de comandos Shell / Bash (<300ms).
 */

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { checkCommandDanger, classifyTaskAgent } = require("/Users/victorsalome/.claude-or/hooks/lib/jev.js");

// Cache em memória para não consultar o Jev mais de uma vez no mesmo prompt
const triagedPrompts = new Map();

export default {
  id: "jev-opencode-motor",
  setup: async (ctx) => {
    try {
      // =========================================================================
      // 1. MOTOR DE TRIAGEM AUTOMÁTICA (session.context)
      // Executa automaticamente a cada turno antes de chamar o modelo principal.
      // =========================================================================
      if (ctx?.session?.hook) {
        ctx.session.hook("context", async (data) => {
          try {
            if (process.env.DISABLE_JEV === "1" || process.env.JEV_GUARD === "0") {
              return;
            }

            // Localiza a última mensagem enviada pelo usuário
            const userMsg = [...(data?.messages || [])].reverse().find((m) => m.role === "user");
            if (!userMsg) return;

            let promptText = "";
            if (Array.isArray(userMsg.content)) {
              promptText = userMsg.content
                .filter((part) => part.type === "text" && typeof part.text === "string")
                .map((part) => part.text)
                .join(" ")
                .trim();
            } else if (typeof userMsg.content === "string") {
              promptText = userMsg.content.trim();
            }

            // Ignora comandos internos, saudações ou prompts muito curtos
            if (
              !promptText ||
              promptText.length < 10 ||
              promptText.startsWith("/") ||
              /^(olá|oi|bom dia|boa tarde|boa noite|status|clear|help|ok|sim|não)$/i.test(promptText)
            ) {
              return;
            }

            // Verifica cache por sessão/prompt
            const cacheKey = `${data.sessionID || ""}:${promptText}`;
            let triage = triagedPrompts.get(cacheKey);

            if (!triage) {
              triage = await classifyTaskAgent(promptText);
              triagedPrompts.set(cacheKey, triage);

              // Limpeza básica do cache
              if (triagedPrompts.size > 200) {
                const firstKey = triagedPrompts.keys().next().value;
                triagedPrompts.delete(firstKey);
              }
            }

            // Se classificado com confiança para um especialista, injeta no system prompt
            if (triage && triage.agent && triage.agent !== "none" && triage.confidence >= 0.60) {
              const pct = (triage.confidence * 100).toFixed(0);
              const reminderText = `\n<jev_system_one_triage>\n[MOTOR JEV SYSTEM ONE]: Esta tarefa foi avaliada determinísticamente via 9Router. Especialista recomendado: '${triage.agent}' (${pct}% de confiança). Priorize delegar esta tarefa para o subagente especialista.\n</jev_system_one_triage>\n`;

              if (Array.isArray(data.system)) {
                data.system.push({ type: "text", text: reminderText });
              } else if (typeof data.system === "string") {
                data.system += `\n${reminderText}`;
              }
            }
          } catch {
            // Fail-open: falha de rede no Jev nunca quebra a sessão
          }
        });
      }

      // =========================================================================
      // 2. MOTOR GUARDRAIL DE COMANDOS SHELL (tool.execute.before)
      // Intercepta qualquer comando antes de ser enviado ao sistema operacional.
      // =========================================================================
      if (ctx?.tool?.hook) {
        ctx.tool.hook("execute.before", async (data) => {
          try {
            if (process.env.DISABLE_JEV === "1" || process.env.JEV_GUARD === "0") {
              return;
            }

            const toolName = data?.tool || "";
            if (toolName !== "shell" && toolName !== "bash") {
              return;
            }

            const cmd = (data?.input?.command || "").trim();
            if (!cmd) return;

            // Fast-path: Comandos seguros conhecidos passam em <1ms sem chamada HTTP
            const safeRegex = /^(git status|git diff|git log|git branch|ls|cat|grep|find|pwd|which|node -v|npm -v|pnpm test|npm test|pnpm build|tsc --noEmit)/;
            if (safeRegex.test(cmd) && !cmd.includes(";") && !cmd.includes("&&") && !cmd.includes("|")) {
              return;
            }

            // Padrões com potencial de destruição avaliados pelo Jev
            const suspiciousRegex = /(rm\s|drop\s|truncate|git\s+push\s+.*--force|git\s+reset\s+--hard|git\s+clean\s+-f|dd\s+if|mkfs|chmod\s+-R\s+777|chown\s+-R|> \/dev)/i;
            if (!suspiciousRegex.test(cmd)) {
              return;
            }

            // Avalia perigo no Jev (9Router)
            const danger = await checkCommandDanger(cmd);
            if (danger >= 0.70) {
              const pct = (danger * 100).toFixed(0);
              throw new Error(
                `[GUARDRAIL JEV SYSTEM ONE]: O comando '${cmd}' foi bloqueado pelo motor Jev por ter ${pct}% de probabilidade de destruição irreversível de arquivos ou histórico. Peça autorização explícita do usuário antes de rodar.`
              );
            }
          } catch (err) {
            // Se foi bloqueio intencional do guardrail, propaga o erro para o OpenCode abortar a tool
            if (err.message && err.message.includes("[GUARDRAIL JEV SYSTEM ONE]")) {
              throw err;
            }
            // Outros erros: fail-open
          }
        });
      }
    } catch {
      // Fail-open
    }
  }
};
