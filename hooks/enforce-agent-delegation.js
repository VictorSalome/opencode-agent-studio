#!/usr/bin/env node

/**
 * Hook de Enforçamento Mecânico de Delegação (ashahawy2/claude-multi-agent-framework pattern)
 * Bloqueia a sessão principal de editar ou criar arquivos de código diretamente.
 * Obriga a delegação para subagentes especializados (architect, designer, etc.).
 */

const fs = require('fs');
const path = require('path');

let inputBuffer = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputBuffer += chunk;
});

process.stdin.on('end', () => {
  try {
    if (!inputBuffer.trim()) {
      process.exit(0);
    }

    const payload = JSON.parse(inputBuffer);
    const { tool_name, tool_input, agent_id, agent_type } = payload;

    // Se a chamada vem de um subagente ativo (architect, designer, tester, etc.), permita
    if (agent_id || agent_type) {
      process.exit(0);
    }

    // Se é a sessão raiz (orquestrador principal), verifique o arquivo
    const filePath = tool_input?.file_path || '';
    if (!filePath) {
      process.exit(0);
    }

    const ext = path.extname(filePath).toLowerCase();

    // Extensões de código proibidas na sessão raiz
    const CODE_EXTENSIONS = new Set([
      '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
      '.html', '.htm', '.css', '.scss', '.sass', '.less',
      '.py', '.go', '.rs', '.java', '.kt', '.swift',
      '.c', '.cpp', '.h', '.hpp', '.cs', '.php',
      '.vue', '.svelte', '.astro', '.sh', '.bash', '.zsh',
      '.sql', '.rb', '.lua'
    ]);

    // Arquivos e pastas sempre permitidos para o orquestrador (documentação, configs, tracking)
    const isAllowedDocOrConfig =
      ext === '.md' ||
      ext === '.markdown' ||
      ext === '.txt' ||
      ext === '.json' ||
      filePath.includes('.claude') ||
      filePath.includes('.claude-or') ||
      filePath.includes('CLAUDE.md');

    if (CODE_EXTENSIONS.has(ext) && !isAllowedDocOrConfig) {
      // Bloqueio mecânico com instrução explícita para o Claude Code
      const response = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: `[BLOQUEIO DE GOVERNANÇA]: Você está na sessão raiz (Orquestrador) e está proibido de escrever ou editar código diretamente (${path.basename(filePath)}). DELEGUE OBRIGATORIAMENTE para o subagente especializado apropriado (ex: architect, designer, tester) usando a ferramenta Agent.`
        }
      };
      process.stdout.write(JSON.stringify(response));
      process.exit(0);
    }

    // Caso não seja código, permita normalmente
    process.exit(0);
  } catch (err) {
    // Fail-open em caso de erro de parse para não quebrar a sessão
    process.exit(0);
  }
});
