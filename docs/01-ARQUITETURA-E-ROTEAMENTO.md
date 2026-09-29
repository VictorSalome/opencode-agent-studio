# 01 - Arquitetura e Roteamento

## 1. Visão Geral

A instância `claude-or` é uma instalação isolada do Claude Code configurada para operar através do 9Router local, permitindo utilizar modelos de ponta com roteamento de custos, supressão de restrições de contexto e sanitização de tool calls.

```text
[ Terminal / Usuário ]
          │ (Executa: claude-or)
          ▼
┌──────────────────────────────────────┐
│  Launcher: ~/.local/bin/claude-or     │
│  - Configura CLAUDE_CONFIG_DIR       │
│  - Auto-cura de porta 20129          │
│  - Injeta variáveis de Team Models   │
└──────────────────┬───────────────────┘
                   │ HTTP (Anthropic Protocol)
                   ▼
┌──────────────────────────────────────┐
│  Proxy Sanitizador: Porta 20129      │ (~/.9router-proxy/index.js)
│  - Corrige schemas de tools          │
│  - Limpa parâmetros de API           │
└──────────────────┬───────────────────┘
                   │ HTTP
                   ▼
┌──────────────────────────────────────┐
│  9Router Principal: Porta 20128      │ (App Nativo 9Router)
│  - Roteia para provedores externos   │
│  - Mapeia "team-*" para os LLMs      │
└──────────────────────────────────────┘
```

---

## 2. O Launcher (`~/.local/bin/claude-or`)

O arquivo executável configura o ambiente isolado antes de invocar o binário nativo do Claude Code:

* **Diretório de Configuração:** `CLAUDE_CONFIG_DIR="$HOME/.claude-or"`
* **Endpoint Base:** `ANTHROPIC_BASE_URL="http://127.0.0.1:20129"`
* **Token:** `sk-6f30c8b06dc6eee8-zv4y2k-64af2432`
* **Mapeamento de Modelos Padrão:**
  * `ANTHROPIC_DEFAULT_OPUS_MODEL="team-heavy"`
  * `ANTHROPIC_DEFAULT_SONNET_MODEL="team-heavy"`
  * `ANTHROPIC_DEFAULT_HAIKU_MODEL="team-fast"`
  * `CLAUDE_CODE_SUBAGENT_MODEL="team-builder"`
* **Supressão de Limites de Janela:** `CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT=1` (evita que o Claude Code bloqueie modelos desconhecidos assumindo limite padrão de 200k tokens).
* **Limpeza de Sessão Filha:** `unset CLAUDE_CODE_CHILD_SESSION` e afins para garantir interface interativa completa.
* **Auto-Cura da Porta 20129:** Se a porta 20129 não estiver ouvindo, o script dispara automaticamente `~/.9router-proxy/start.sh` e verifica se o 9Router na 20128 está ligado.

---

## 3. Matriz de Modelos de Time (`team-*`)

| Identificador | Nível de Raciocínio | Papel no Ecossistema | Agentes Designados |
| :--- | :--- | :--- | :--- |
| **`team-heavy`** | Máximo (`effortLevel: high`) | Orquestração global, design refinado, segurança e depuração profunda | `Manager` (sessão raiz), `designer`, `investigator`, `secops` |
| **`team-builder`** | Alto (`effortLevel: medium`) | Engenharia de software fullstack, refatoração e auditoria sênior | `architect`, `reviewer` |
| **`team-worker`** | Médio (`effortLevel: low`) | Execução de testes E2E no navegador e redação técnica | `tester`, `documenter` |
| **`team-fast`** | Rápido (`effortLevel: low`) | Leitura de repositório, inventário de rotas e entrevistas de escopo | `explorer`, `analyst` |
