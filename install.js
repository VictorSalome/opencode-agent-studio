#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log("");
console.log("🚀 ===================================================");
console.log("   OpenCode Agent Studio - Instalador Automatizado");
console.log("   Powered by @beremaran/opencode-agent-tree");
console.log("======================================================");
console.log("");

const args = process.argv.slice(2);
const shouldInstallClaude = args.includes('--claude');
const shouldInstallOpenCode = args.includes('--opencode') || args.length === 0;

const homeDir = os.homedir();

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
    execSync(process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

if (shouldInstallClaude) {
  console.log("🤖 Configurando Claude Code...");
  const claudeDir = path.join(homeDir, '.claude');
  const claudeTemplateFile = path.join(__dirname, 'config', 'CLAUDE.md.template');
  const claudeConfigFile = path.join(claudeDir, 'CLAUDE.md');

  fs.mkdirSync(claudeDir, { recursive: true });

  if (fs.existsSync(claudeTemplateFile)) {
    fs.copyFileSync(claudeTemplateFile, claudeConfigFile);
    console.log(`✅ Sucesso: ${claudeConfigFile} criado com as diretrizes do Agent Studio.`);
  } else {
    console.log(`⚠️ Aviso: Template ${claudeTemplateFile} não encontrado.`);
  }
}

if (shouldInstallOpenCode) {
  console.log("🤖 Configurando OpenCode...");
  const configDir = path.join(homeDir, '.config', 'opencode');
  const configFile = path.join(configDir, 'opencode.json');
  const backupFile = path.join(configDir, `opencode.json.backup.${Math.floor(Date.now() / 1000)}`);

  fs.mkdirSync(configDir, { recursive: true });

  console.log("📦 1/3: Instalando plugin de orquestração @beremaran/opencode-agent-tree...");
  if (commandExists('opencode')) {
    runCmd('opencode plugin github:beremaran/opencode-agent-tree');
  } else {
    const localOpencode = path.join(homeDir, '.opencode', 'bin', 'opencode' + (process.platform === 'win32' ? '.cmd' : ''));
    if (fs.existsSync(localOpencode)) {
      runCmd(`"${localOpencode}" plugin github:beremaran/opencode-agent-tree`);
    }
  }

  console.log("🌟 2/3: Instalando skills oficiais do ranking mundial...");
  if (commandExists('npx')) {
    console.log("   -> Instalando frontend-design, vercel-react-best-practices, web-design-guidelines, code-review...");
    const skills = [
      'anthropics/skills@frontend-design',
      'vercel-labs/agent-skills@vercel-react-best-practices',
      'vercel-labs/agent-skills@web-design-guidelines',
      'mattpocock/skills@code-review',
      'mattpocock/skills@diagnosing-bugs',
      'mattpocock/skills@grill-me'
    ];
    
    for (const skill of skills) {
      runCmd(`npx skills add ${skill} -g -y`);
    }
  }

  console.log("⚙️  3/3: Configurando agentes e esteira de Quality Gate...");
  const templateFile = path.join(__dirname, 'config', 'opencode.json.template');

  if (fs.existsSync(configFile)) {
    fs.copyFileSync(configFile, backupFile);
    console.log(`   (Backup da sua configuração salvo em: ${backupFile})`);
  }

  let templateData = {};
  try {
    if (fs.existsSync(templateFile)) {
      templateData = JSON.parse(fs.readFileSync(templateFile, 'utf8'));
    }
  } catch (e) {}

  let currentData = {};
  if (fs.existsSync(configFile)) {
    try {
      currentData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (e) {}
  }

  const merged = { ...currentData, ...templateData };
  if (currentData.provider) merged.provider = currentData.provider;
  if (currentData.model) merged.model = currentData.model;

  const globalModel = merged.model;
  if (globalModel) {
    if (merged.agent) {
      for (const agentName in merged.agent) {
        merged.agent[agentName].model = globalModel;
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

  fs.writeFileSync(configFile, JSON.stringify(merged, null, 2));

  console.log("✅ Sucesso: Instalação do OpenCode concluída.");
}

console.log("");
console.log("🎉 Instalação concluída!");
console.log("Abra uma nova sessão do OpenCode ou Claude Code e aproveite sua Software House autônoma.");
console.log("");
