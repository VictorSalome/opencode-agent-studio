#!/usr/bin/env node

/**
 * Hook PreToolUse: Guardrail de Bash via Jev System One (9Router)
 * Avalia comandos com potencial destrutivo em <300ms e bloqueia sem gastar tokens do LLM principal.
 */

const { checkCommandDanger } = require('./lib/jev');

let inputBuffer = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputBuffer += chunk;
});

process.stdin.on('end', async () => {
  try {
    if (!inputBuffer.trim()) {
      process.exit(0);
    }

    const payload = JSON.parse(inputBuffer);
    const command = payload?.tool_input?.command || payload?.parameters?.command;

    if (!command || typeof command !== 'string') {
      process.exit(0);
    }

    const trimmed = command.trim();

    // 1. FAST PATH: Comandos comprovadamente seguros passam sem chamada de rede (<2ms)
    const safeRegex = /^(git status|git diff|git log|git branch|ls|cat|grep|find|pwd|which|node -v|npm -v|pnpm test|npm test|pnpm build|tsc --noEmit)/;
    if (safeRegex.test(trimmed) && !trimmed.includes(';') && !trimmed.includes('&&') && !trimmed.includes('|')) {
      process.exit(0);
    }

    // 2. CHECK PATH: Padrões com potencial de destruição avaliados pelo Jev
    const suspiciousRegex = /(rm\s|drop\s|truncate|git\s+push\s+.*--force|git\s+reset\s+--hard|git\s+clean\s+-f|dd\s+if|mkfs|chmod\s+-R\s+777|chown\s+-R|> \/dev)/i;
    if (suspiciousRegex.test(trimmed)) {
      const dangerProb = await checkCommandDanger(trimmed);

      if (dangerProb >= 0.70) {
        const response = {
          permissionDecision: 'deny',
          message: `[GUARDRAIL JEV SYSTEM ONE]: O comando '${trimmed}' tem ${(dangerProb * 100).toFixed(0)}% de probabilidade de destruição irreversível de arquivos ou histórico. Ação bloqueada por segurança. Peça autorização explícita do usuário antes de rodar.`
        };
        process.stdout.write(JSON.stringify(response));
        process.exit(0);
      }
    }

    process.exit(0);
  } catch {
    // Fail-open para garantir continuidade se o 9Router oscilar
    process.exit(0);
  }
});
