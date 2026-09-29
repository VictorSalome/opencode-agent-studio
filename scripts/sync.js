#!/usr/bin/env node

/**
 * Script de Sincronização Bidirecional / Espelhamento
 * Mantém sincronizados:
 * 1. ~/.claude-or/ (ambiente ativo de execução)
 * 2. ~/configs/.claude-or/ (backup persistente)
 * 3. /Users/victorsalome/opencode-agent-studio/ (repositório versionado no Git)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const homeDir = os.homedir();
const claudeOrDir = path.join(homeDir, '.claude-or');
const backupDir = path.join(homeDir, 'configs', '.claude-or');
const studioDir = path.resolve(__dirname, '..');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      if (entry.name.endsWith('.js') || entry.name.endsWith('.sh') || !path.extname(entry.name)) {
        try { fs.chmodSync(destPath, 0o755); } catch {}
      }
      count++;
    }
  }
  return count;
}

console.log('🔄 Iniciando sincronização do Ecossistema Multiagente...');

// 1. Hooks
const hooksCount1 = copyDirRecursive(path.join(claudeOrDir, 'hooks'), path.join(studioDir, 'hooks'));
const hooksCount2 = copyDirRecursive(path.join(claudeOrDir, 'hooks'), path.join(backupDir, 'hooks'));
console.log(`✅ Hooks sincronizados (${hooksCount1} arquivos)`);

// 2. Agents
const agentsCount1 = copyDirRecursive(path.join(claudeOrDir, 'agents'), path.join(studioDir, 'agents'));
const agentsCount2 = copyDirRecursive(path.join(claudeOrDir, 'agents'), path.join(backupDir, 'agents'));
console.log(`✅ Subagentes sincronizados (${agentsCount1} arquivos)`);

// 3. Documentação técnica (docs 01 a 07 + README)
const docsCount1 = copyDirRecursive(path.join(claudeOrDir, 'docs'), path.join(studioDir, 'docs'));
const docsCount2 = copyDirRecursive(path.join(claudeOrDir, 'docs'), path.join(backupDir, 'docs'));
console.log(`✅ Documentação técnica sincronizada (${docsCount1} arquivos)`);

// 4. Configs mestras (CLAUDE.md e settings.json)
if (fs.existsSync(path.join(claudeOrDir, 'CLAUDE.md'))) {
  fs.copyFileSync(path.join(claudeOrDir, 'CLAUDE.md'), path.join(backupDir, 'CLAUDE.md'));
  fs.copyFileSync(path.join(claudeOrDir, 'CLAUDE.md'), path.join(studioDir, 'config', 'CLAUDE.md.template'));
}
if (fs.existsSync(path.join(claudeOrDir, 'settings.json'))) {
  fs.copyFileSync(path.join(claudeOrDir, 'settings.json'), path.join(backupDir, 'settings.json'));
}
console.log(`✅ Configurações mestras sincronizadas`);

// 5. Binário Jev
const binJev = path.join(studioDir, 'bin', 'jev');
if (fs.existsSync(binJev)) {
  const localBin = path.join(homeDir, '.local', 'bin', 'jev');
  const npmBin = path.join(homeDir, '.npm-global', 'bin', 'jev');
  try {
    fs.mkdirSync(path.dirname(localBin), { recursive: true });
    fs.copyFileSync(binJev, localBin);
    fs.chmodSync(localBin, 0o755);
  } catch {}
  try {
    fs.mkdirSync(path.dirname(npmBin), { recursive: true });
    fs.copyFileSync(binJev, npmBin);
    fs.chmodSync(npmBin, 0o755);
  } catch {}
  console.log(`✅ Binário CLI 'jev' sincronizado em ~/.npm-global/bin e ~/.local/bin`);
}

// 6. Plugins OpenCode
const opencodePluginsDir = path.join(homeDir, '.config', 'opencode', 'plugins');
const studioPluginsDir = path.join(studioDir, 'plugins');
const pluginsCount = copyDirRecursive(opencodePluginsDir, studioPluginsDir);
console.log(`✅ Plugins OpenCode sincronizados (${pluginsCount} arquivos)`);

// 7. Configurações Codex CLI
const codexHome = path.join(homeDir, '.codex');
const studioCodexDir = path.join(studioDir, 'codex');
if (fs.existsSync(codexHome)) {
  fs.mkdirSync(studioCodexDir, { recursive: true });
  const codexAgents = path.join(codexHome, 'AGENTS.md');
  const codexConfig = path.join(codexHome, 'config.toml');
  if (fs.existsSync(codexAgents)) {
    fs.copyFileSync(codexAgents, path.join(studioCodexDir, 'AGENTS.md'));
  }
  if (fs.existsSync(codexConfig)) {
    fs.copyFileSync(codexConfig, path.join(studioCodexDir, 'config.toml'));
  }

  // Sincroniza skill jev-system-one e hooks
  const codexJevSkill = path.join(codexHome, 'skills', 'jev-system-one', 'SKILL.md');
  const studioJevSkillDir = path.join(studioCodexDir, 'skills', 'jev-system-one');
  if (fs.existsSync(codexJevSkill)) {
    fs.mkdirSync(studioJevSkillDir, { recursive: true });
    fs.copyFileSync(codexJevSkill, path.join(studioJevSkillDir, 'SKILL.md'));
  }

  const codexHook = path.join(codexHome, 'hooks', 'jev-triage.js');
  const studioHooksDir = path.join(studioCodexDir, 'hooks');
  if (fs.existsSync(codexHook)) {
    fs.mkdirSync(studioHooksDir, { recursive: true });
    fs.copyFileSync(codexHook, path.join(studioHooksDir, 'jev-triage.js'));
  }

  console.log(`✅ Configurações, AGENTS.md, hooks e skills do Codex CLI sincronizados em codex/`);
}

console.log('🎉 Sincronização concluída com sucesso entre .claude-or, backup e opencode-agent-studio!');
