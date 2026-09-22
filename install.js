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

// Resolução multiplataforma do diretório de configuração do OpenCode
function getOpenCodeConfigDir() {
  if (isWindows && process.env.APPDATA) {
    const winPath = path.join(process.env.APPDATA, 'opencode');
    if (fs.existsSync(winPath)) return winPath;
  }
  return path.join(homeDir, '.config', 'opencode');
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

  // Garante sincronização de modelos entre subagentes e orquestrador
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
}

console.log("");
console.log("🎉 Instalação concluída com sucesso!");
console.log("👉 Para começar, abra ou reinicie sua sessão do OpenCode:");
console.log("   opencode");
console.log("");
