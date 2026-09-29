#!/usr/bin/env node

/**
 * Hook SessionStart: Injeção Automática de Estado do Repositório
 * Injeta branch atual, arquivos modificados, últimos commits e armadilhas (pitfalls.md)
 * no início e no resume de cada sessão, economizando tokens e alinhando o contexto.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let inputBuffer = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputBuffer += chunk;
});

process.stdin.on('end', () => {
  try {
    let payload = {};
    if (inputBuffer.trim()) {
      try {
        payload = JSON.parse(inputBuffer);
      } catch {}
    }

    const cwd = payload.cwd || process.cwd();
    let branch = 'unknown';
    let statusSummary = 'Nenhuma alteração pendente (working tree limpa)';
    let recentCommits = 'Nenhum commit recente';
    let isGit = false;

    try {
      execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'ignore' });
      isGit = true;
    } catch {}

    if (isGit) {
      try {
        branch = execSync('git branch --show-current', { cwd, encoding: 'utf8' }).trim() || 'detached HEAD';
      } catch {}

      try {
        const rawStatus = execSync('git status -s', { cwd, encoding: 'utf8' }).trim();
        if (rawStatus) {
          const lines = rawStatus.split('\n');
          statusSummary = lines.length > 8
            ? `${lines.slice(0, 8).join('\n')}\n... e mais ${lines.length - 8} arquivo(s)`
            : rawStatus;
        }
      } catch {}

      try {
        recentCommits = execSync('git log -n 3 --oneline', { cwd, encoding: 'utf8' }).trim() || recentCommits;
      } catch {}
    }

    // Leitura de pitfalls.md (prevenção de reincidência de bugs)
    let pitfallsContext = 'Nenhum pitfalls.md registrado no projeto.';
    const pitfallsPath = path.join(cwd, 'pitfalls.md');
    if (fs.existsSync(pitfallsPath)) {
      try {
        const rawPitfalls = fs.readFileSync(pitfallsPath, 'utf8');
        const lines = rawPitfalls.split('\n').filter((l) => l.trim().length > 0);
        pitfallsContext = lines.slice(-9).join('\n'); // Últimas 3 regras (3 linhas cada)
      } catch {}
    }

    const contextText = [
      '=== [SESSION START: REPOSITORY INTELLIGENCE] ===',
      `• Diretório: ${cwd}`,
      `• Git Repo: ${isGit ? `Sim (Branch: ${branch})` : 'Não (Diretório comum)'}`,
      isGit ? `• Alterações Pendentes:\n${statusSummary}` : '',
      isGit ? `• Últimos Commits:\n${recentCommits}` : '',
      `• Aprendizados Recentes (pitfalls.md):\n${pitfallsContext}`,
      '================================================='
    ].filter(Boolean).join('\n');

    const output = {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: contextText
      }
    };

    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  } catch {
    // Fail-open para nunca interromper a sessão
    process.exit(0);
  }
});
