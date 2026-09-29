#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log("");
console.log("🚀 ===================================================");
console.log("   OpenCode & Claude Code Agent Studio - v1.1.0");
console.log("   Multi-Agent Architecture, Governance & Anti-Slop");
console.log("======================================================");
console.log("");

const args = process.argv.slice(2);
const shouldInstallClaude = args.includes('--claude') || args.includes('--all');
const shouldInstallClaudeOr = args.includes('--claude-or') || args.includes('--all');
const shouldInstallOpenCode = args.includes('--opencode') || args.includes('--all') || (!shouldInstallClaude && !shouldInstallClaudeOr);

const homeDir = os.homedir();
const isWindows = process.platform === 'win32';

function runCmd(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (e) {
    return false;
  }
}

function commandExists(cmd) {
  try {
    execSync(isWindows ? `where ${cmd}` : `command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      if (entry.name.endsWith('.js') || entry.name.endsWith('.sh')) {
        try { fs.chmodSync(destPath, 0o755); } catch {}
      }
    }
  }
}

function configureClaudeDirectory(targetDir, name) {
  console.log(`🤖 Configurando ${name} (${targetDir})...`);
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. CLAUDE.md
  const claudeTemplateFile = path.join(__dirname, 'config', 'CLAUDE.md.template');
  const claudeConfigFile = path.join(targetDir, 'CLAUDE.md');
  if (fs.existsSync(claudeTemplateFile)) {
    fs.copyFileSync(claudeTemplateFile, claudeConfigFile);
    console.log(`   ✅ CLAUDE.md instalado.`);
  }

  // 2. Agents
  const agentsSrc = path.join(__dirname, 'agents');
  const agentsDest = path.join(targetDir, 'agents');
  if (fs.existsSync(agentsSrc)) {
    copyDirRecursive(agentsSrc, agentsDest);
    console.log(`   ✅ Subagentes instalados em agents/`);
  }

  // 3. Hooks
  const hooksSrc = path.join(__dirname, 'hooks');
  const hooksDest = path.join(targetDir, 'hooks');
  if (fs.existsSync(hooksSrc)) {
    copyDirRecursive(hooksSrc, hooksDest);
    console.log(`   ✅ Hooks de governança instalados em hooks/`);
  }

  // 4. Settings.json hooks merge
  const settingsFile = path.join(targetDir, 'settings.json');
  let settings = {};
  if (fs.existsSync(settingsFile)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    } catch {}
  }

  settings.hooks = settings.hooks || {};
  const delegationScript = path.join(hooksDest, 'enforce-agent-delegation.js');
  const formatScript = path.join(hooksDest, 'auto-format.js');
  const sessionStartScript = path.join(hooksDest, 'session-start.js');
  const guardBashScript = path.join(hooksDest, 'guard-bash-commands.js');
  const jevTriageScript = path.join(hooksDest, 'jev-prompt-triage.js');

  settings.hooks.UserPromptSubmit = [
    {
      hooks: [{ type: "command", command: `node "${jevTriageScript}"` }]
    }
  ];

  settings.hooks.SessionStart = [
    {
      hooks: [{ type: "command", command: `node "${sessionStartScript}"` }]
    }
  ];

  settings.hooks.PreToolUse = [
    {
      matcher: "Bash",
      hooks: [{ type: "command", command: `node "${guardBashScript}"` }]
    },
    {
      matcher: "Write",
      hooks: [{ type: "command", command: `node "${delegationScript}"` }]
    },
    {
      matcher: "Edit",
      hooks: [{ type: "command", command: `node "${delegationScript}"` }]
    }
  ];

  settings.hooks.PostToolUse = [
    {
      matcher: "Write",
      hooks: [{ type: "command", command: `node "${formatScript}"` }]
    },
    {
      matcher: "Edit",
      hooks: [{ type: "command", command: `node "${formatScript}"` }]
    }
  ];

  settings.permissions = settings.permissions || {};
  settings.permissions.allow = settings.permissions.allow || [];
  const requiredPermissions = ["mcp__puppeteer__*", "mcp__github__*"];
  for (const perm of requiredPermissions) {
    if (!settings.permissions.allow.includes(perm)) {
      settings.permissions.allow.push(perm);
    }
  }

  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
  console.log(`   ✅ settings.json configurado com hooks e permissões MCP.`);
}

if (shouldInstallClaude) {
  configureClaudeDirectory(path.join(homeDir, '.claude'), 'Claude Code Oficial');
}

if (shouldInstallClaudeOr || (fs.existsSync(path.join(homeDir, '.claude-or')) && shouldInstallClaude)) {
  configureClaudeDirectory(path.join(homeDir, '.claude-or'), 'Claude Code 9Router (claude-or)');
}

// Resolução multiplataforma do diretório de configuração do OpenCode
function getOpenCodeConfigDir() {
  if (isWindows && process.env.APPDATA) {
    const winPath = path.join(process.env.APPDATA, 'opencode');
    if (fs.existsSync(winPath)) return winPath;
  }
  return path.join(homeDir, '.config', 'opencode');
}

if (shouldInstallOpenCode) {
  console.log("🤖 Configurando OpenCode...");
  const configDir = getOpenCodeConfigDir();
  const configFile = path.join(configDir, 'opencode.json');
  const backupFile = path.join(configDir, `opencode.json.backup.${Math.floor(Date.now() / 1000)}`);

  fs.mkdirSync(configDir, { recursive: true });

  console.log("📦 1/3: Instalando plugin de orquestração @beremaran/opencode-agent-tree...");
  if (commandExists('opencode')) {
    runCmd('opencode plugin github:beremaran/opencode-agent-tree');
  } else {
    const localOpencode = path.join(homeDir, '.opencode', 'bin', 'opencode' + (isWindows ? '.cmd' : ''));
    if (fs.existsSync(localOpencode)) {
      runCmd(`"${localOpencode}" plugin github:beremaran/opencode-agent-tree`);
    }
  }

  console.log("🌟 2/3: Instalando skills recomendadas do ecossistema...");
  if (commandExists('npx')) {
    const skills = [
      'anthropics/skills@frontend-design',
      'vercel-labs/agent-skills@vercel-react-best-practices',
      'vercel-labs/agent-skills@web-design-guidelines',
      'mattpocock/skills@code-review',
      'mattpocock/skills@diagnosing-bugs',
      'mattpocock/skills@grill-me'
    ];
    
    for (const skill of skills) {
      console.log(`   -> npx skills add ${skill}...`);
      runCmd(`npx -y skills add ${skill} -g -y`);
    }
  }

  console.log("⚙️  3/3: Configurando agentes, permissões reais (Default Deny) e Quality Gate...");
  const templateFile = path.join(__dirname, 'config', 'opencode.json.template');

  if (fs.existsSync(configFile)) {
    fs.copyFileSync(configFile, backupFile);
    console.log(`   (Backup da sua configuração atual salvo em: ${backupFile})`);
  }

  let templateData = {};
  try {
    if (fs.existsSync(templateFile)) {
      templateData = JSON.parse(fs.readFileSync(templateFile, 'utf8'));
    }
  } catch (e) {
    console.error("Erro ao ler template:", e.message);
  }

  let currentData = {};
  if (fs.existsSync(configFile)) {
    try {
      currentData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (e) {
      console.error("Erro ao ler configuração atual:", e.message);
    }
  }

  // Fusão não destrutiva: preserva provedores, chaves, MCPs e modelos do usuário
  const merged = { ...currentData, ...templateData };
  if (currentData.provider) merged.provider = currentData.provider;
  if (currentData.model) merged.model = currentData.model;
  if (currentData.mcp) merged.mcp = currentData.mcp;

  // Garante sincronização de modelos entre subagentes e orquestrador se não definidos
  const globalModel = merged.model;
  if (globalModel) {
    if (merged.agent) {
      for (const agentName in merged.agent) {
        if (!merged.agent[agentName].model) {
          merged.agent[agentName].model = globalModel;
        }
      }
    }
    if (merged.plugins) {
      for (const plugin of merged.plugins) {
        if (plugin.package === 'github:beremaran/opencode-agent-tree' && plugin.options) {
          plugin.options.subagentModel = globalModel;
          plugin.options.orchestratorModel = globalModel;
        }
      }
    }
  }

  fs.writeFileSync(configFile, JSON.stringify(merged, null, 2), 'utf8');

  console.log("✅ Sucesso: Configuração do OpenCode atualizada com sucesso!");
  console.log(`   Destino: ${configFile}`);

  // Instalação do Plugin Jev no OpenCode
  const pluginSrc = path.join(__dirname, 'plugins', 'jev-opencode-plugin.js');
  const pluginDestDir = path.join(openCodeConfigDir, 'plugins');
  if (fs.existsSync(pluginSrc)) {
    try {
      fs.mkdirSync(pluginDestDir, { recursive: true });
      fs.copyFileSync(pluginSrc, path.join(pluginDestDir, 'jev-opencode-plugin.js'));
      console.log("⚡ Plugin nativo 'jev-opencode-plugin.js' instalado em plugins/");
    } catch (e) {
      console.error("Erro ao copiar plugin OpenCode:", e.message);
    }
  }
}

// Instalação do CLI Jev System One
const binJevSrc = path.join(__dirname, 'bin', 'jev');
if (fs.existsSync(binJevSrc)) {
  const destPaths = [
    path.join(homeDir, '.npm-global', 'bin', 'jev'),
    path.join(homeDir, '.local', 'bin', 'jev')
  ];
  for (const d of destPaths) {
    try {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(binJevSrc, d);
      fs.chmodSync(d, 0o755);
    } catch {}
  }
  console.log("⚡ CLI 'jev' System One instalado globalmente.");
}

console.log("");
console.log("🎉 Instalação concluída com sucesso!");
console.log("👉 Para começar:");
console.log("   OpenCode:   opencode");
console.log("   Claude-OR:  claude-or");
console.log("   Copilot:    gh copilot --help");
console.log("");
