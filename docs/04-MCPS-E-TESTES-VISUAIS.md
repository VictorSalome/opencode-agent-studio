# 04 - MCPs e Automação Visual

## 1. Visão Geral dos Servidores MCP

O Claude-OR integra dois servidores Model Context Protocol (MCP) essenciais para automação no ciclo de desenvolvimento:

1. **`puppeteer` (`mcp__puppeteer`):** Controle programático de navegador Chromium headless para navegação, cliques, preenchimento de inputs e captura de screenshots de alta resolução.
2. **`github` (`mcp__github`):** Integração com repositórios remotos, branches, commits, pull requests e issues.

---

## 2. Servidor MCP Puppeteer

Configurado em `~/.claude-or/.claude.json`:

```json
"puppeteer": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
  "env": {}
}
```

### Ferramentas Expostas:
* `mcp__puppeteer__puppeteer_navigate`: Acessa URLs locais (`http://localhost:...` ou `file://...`) e externas.
* `mcp__puppeteer__puppeteer_screenshot`: Tira um screenshot do viewport e salva o arquivo de imagem no disco.
* `mcp__puppeteer__puppeteer_click`: Simula cliques físicos em elementos CSS.
* `mcp__puppeteer__puppeteer_fill`: Preenche campos de formulário e inputs.
* `mcp__puppeteer__puppeteer_hover`: Simula hover de mouse sobre cards e botões.
* `mcp__puppeteer__puppeteer_evaluate`: Executa scripts JavaScript arbitrários no contexto da página.

### Uso no Fluxo de Desenvolvimento:
O subagente `designer` ou `tester` aciona a navegação após salvar o arquivo HTML, tirando um screenshot para inspecionar o layout renderizado sem necessidade de intervenção humana.

---

## 3. Servidor MCP GitHub

Configurado em `~/.claude-or/.claude.json`:

```json
"github": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "<TOKEN_PAT>"
  }
}
```

### Ferramentas Expostas:
* Leitura de repositórios, issues, PRs e commits.
* Criação de branches, envio de commits e abertura de Pull Requests automatizados.

---

## 4. Política de Permissões (Zero Interrupção)

Para evitar que o Claude Code pare a execução a cada navegação ou screenshot pedindo confirmação no terminal, as permissões foram aprovadas em `~/.claude-or/settings.json`:

```json
"permissions": {
  "allow": [
    "mcp__puppeteer__*",
    "mcp__github__*"
  ]
}
```

> **Atenção sobre a Sintaxe:** O Claude Code exige o prefixo literal do servidor (`mcp__<servidor>__*`). Não utilize o wildcard genérico `"mcp__*"` nem parênteses `"mcp__*(*)"`, pois a CLI emitirá um aviso de regra inválida.
