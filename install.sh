#!/usr/bin/env bash

set -e

echo ""
echo "🚀 ==================================================="
echo "   OpenCode Agent Studio - Instalador Automatizado"
echo "   Powered by @beremaran/opencode-agent-tree"
echo "======================================================"
echo ""

CONFIG_DIR="$HOME/.config/opencode"
CONFIG_FILE="$CONFIG_DIR/opencode.json"
BACKUP_FILE="$CONFIG_DIR/opencode.json.backup.$(date +%s)"

mkdir -p "$CONFIG_DIR"

# 1. Instalar o plugin core
echo "📦 1/3: Instalando plugin de orquestração @beremaran/opencode-agent-tree..."
if command -v opencode >/dev/null 2>&1; then
  opencode plugin add github:beremaran/opencode-agent-tree || true
elif [ -f "$HOME/.opencode/bin/opencode" ]; then
  "$HOME/.opencode/bin/opencode" plugin add github:beremaran/opencode-agent-tree || true
fi

# 2. Instalar as skills mais populares do mundo se o npx estiver disponível
echo "🌟 2/3: Instalando skills oficiais do ranking mundial..."
if command -v npx >/dev/null 2>&1; then
  echo "   -> Instalando frontend-design, vercel-react-best-practices, web-design-guidelines, code-review..."
  npx skills add anthropics/skills@frontend-design -g -y >/dev/null 2>&1 || true
  npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y >/dev/null 2>&1 || true
  npx skills add vercel-labs/agent-skills@web-design-guidelines -g -y >/dev/null 2>&1 || true
  npx skills add mattpocock/skills@code-review -g -y >/dev/null 2>&1 || true
  npx skills add mattpocock/skills@diagnosing-bugs -g -y >/dev/null 2>&1 || true
  npx skills add mattpocock/skills@grill-me -g -y >/dev/null 2>&1 || true
fi

# 3. Aplicar configuração
echo "⚙️  3/3: Configurando agentes e esteira de Quality Gate..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/config/opencode.json.template"

if [ -f "$CONFIG_FILE" ]; then
  cp "$CONFIG_FILE" "$BACKUP_FILE"
  echo "   (Backup da sua configuração salvo em: $BACKUP_FILE)"
fi

# Se já houver configuração com provider/model, mesclamos via node
if command -v node >/dev/null 2>&1; then
  node -e '
  const fs = require("fs");
  const template = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  let current = {};
  if (fs.existsSync(process.argv[2])) {
    try { current = JSON.parse(fs.readFileSync(process.argv[2], "utf8")); } catch(e){}
  }
  const merged = { ...current, ...template };
  if (current.provider) merged.provider = current.provider;
  if (current.model) merged.model = current.model;
  fs.writeFileSync(process.argv[2], JSON.stringify(merged, null, 2));
  ' "$TEMPLATE_FILE" "$CONFIG_FILE"
else
  cp "$TEMPLATE_FILE" "$CONFIG_FILE"
fi

echo ""
echo "✅ Instalação concluída com sucesso!"
echo "Abra uma nova sessão do OpenCode e aproveite sua Software House autônoma."
echo ""
