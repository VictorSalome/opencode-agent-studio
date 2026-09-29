#!/usr/bin/env node

/**
 * Hook UserPromptSubmit: Triagem Determinística Instantânea via Jev System One (9Router)
 * Executa em TODA mensagem do usuário (<300ms) sem gastar tokens do LLM principal.
 * Avalia o melhor subagente e injeta a recomendação no contexto do Orquestrador.
 */

const { classifyTaskAgent } = require('./lib/jev');

let inputBuffer = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  inputBuffer += chunk;
});

process.stdin.on('end', async () => {
  try {
    if (!inputBuffer.trim()) {
      process.exit(0);
    }

    if (process.env.DISABLE_JEV === '1' || process.env.JEV_GUARD === '0') {
      process.exit(0);
    }

    const payload = JSON.parse(inputBuffer);
    const prompt = (payload?.prompt || '').trim();

    // Se for comando simples, saudação ou muito curto, não precisa de triagem
    if (prompt.length < 10 || prompt.startsWith('/') || /^(olá|oi|bom dia|boa tarde|boa noite|status|clear|help)$/i.test(prompt)) {
      process.exit(0);
    }

    // Consulta instantânea ao Jev no 9Router
    const classification = await classifyTaskAgent(prompt);

    if (classification && classification.agent !== 'none' && classification.confidence >= 0.60) {
      const pct = (classification.confidence * 100).toFixed(0);
      const response = {
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: `[TRIAGEM JEV SYSTEM ONE]: Esta solicitação foi avaliada determinísticamente pelo Jev (9Router). Especialista recomendado: '${classification.agent}' (${pct}% de confiança). Priorize a delegação para este subagente.`
        }
      };
      process.stdout.write(JSON.stringify(response));
    }

    process.exit(0);
  } catch {
    // Fail-open: se o Jev oscilar, a conversa continua normalmente
    process.exit(0);
  }
});
