#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Se node estiver presente, use o instalador completo em JS
if command -v node >/dev/null 2>&1; then
  node "$SCRIPT_DIR/install.js" "$@"
  exit 0
fi

echo ""
echo "🚀 ==================================================="
echo "   OpenCode & Claude Code Agent Studio - Instalador"
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

# 2. Instalar as skills mais populares se o npx estiver disponível
echo "🌟 2/3: Instalando skills recomendadas..."
if command -v npx >/dev/null 2>&1; then
  npx skills add anthropics/skills@frontend-design -g -y >/dev/null 2>&1 || true
  npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y >/dev/null 2>&1 || true
  npx skills add vercel-labs/agent-skills@web-design-guidelines -g -y >/dev/null 2>&1 || true
  npx skills add mattpocock/skills@code-review -g -y >/dev/null 2>&1 || true
  npx skills add mattpocock/skills@diagnosing-bugs -g -y >/dev/null 2>&1 || true
  npx skills add mattpocock/skills@grill-me -g -y >/dev/null 2>&1 || true
fi

# 3. Aplicar configuração
echo "⚙️  3/3: Configurando agentes e esteira de Quality Gate..."
TEMPLATE_FILE="$SCRIPT_DIR/config/opencode.json.template"

if [ -f "$CONFIG_FILE" ]; then
  cp "$CONFIG_FILE" "$BACKUP_FILE"
  echo "   (Backup da sua configuração salvo em: $BACKUP_FILE)"
fi

cp "$TEMPLATE_FILE" "$CONFIG_FILE"

echo ""
echo "✅ Instalação concluída com sucesso!"
echo "Abra uma nova sessão do OpenCode e aproveite sua Software House autônoma."
echo ""
