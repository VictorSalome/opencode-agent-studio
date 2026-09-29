# 07 - Jev System One (Integração Local via 9Router)

Este documento descreve a governança, integração e uso do **Jev System One** (`oc/jev-1.13-free`) tanto no **Claude Code (`claude-or`)** quanto no **OpenCode**, além do fluxo de sincronização contínua com o repositório `opencode-agent-studio`.

---

## 1. O Que É o Jev no 9Router?

O 9Router (v0.5.91+) expõe localmente o endpoint System One:
* **Endpoint Local:** `http://localhost:20128/v1/systemone`
* **Provedor Upstream:** OpenCode Free (`oc/jev-1.13-free`)
* **Custo Faturado:** 0 tokens (gratuito)
* **Latência:** ~200ms a 350ms
* **Função:** Avaliação determinística rápida via probabilidade matemática (`noul`: 0.00 a 1.00), sem gerar prosa e sem gastar tokens dos modelos primários (Sonnet, Opus, GPT-6).

---

## 2. Como Funciona no Claude Code (`claude-or`)

1. **Interceptação por Hook PreToolUse:**
   * Configurado em `~/.claude-or/settings.json` no matcher `"Bash"`.
   * Dispara o script `~/.claude-or/hooks/guard-bash-commands.js`.
2. **Fast-Path Local (<2ms):**
   * Comandos seguros (`git status`, `git diff`, `ls`, `grep`, `npm test`, `tsc`) passam instantaneamente sem chamada de rede.
3. **Avaliação pelo Jev:**
   * Comandos de alto risco (`rm `, `git push --force`, `git reset --hard`, `drop table`, `truncate`) são enviados ao Jev.
   * Se a probabilidade de destruição for $\ge 70\%$, o hook emite:
     ```json
     {
       "hookSpecificOutput": {
         "hookEventName": "PreToolUse",
         "permissionDecision": "deny",
         "permissionDecisionReason": "[GUARDRAIL JEV SYSTEM ONE]: O comando tem 86% de probabilidade de destruição..."
       }
     }
     ```
   * O Claude Code é mecanicamente impedido de rodar o comando e pede confirmação expressa ao usuário.
4. **Fail-Open:**
   * Caso o 9Router caia ou oscile, o hook libera a execução para não congelar o fluxo de trabalho.

---

## 3. Como Funciona no OpenCode

1. **Acesso Global via CLI (`jev`):**
   * O executável global `jev` (`~/.npm-global/bin/jev`) está no `$PATH` do OpenCode.
   * Qualquer subagente (`architect`, `secops`, `tester`) pode executar chamadas de triagem sem gastar tokens da cota do OpenCode:
     ```bash
     jev danger "rm -rf build/"
     jev route "Desenvolver formulário acessível em React"
     ```
2. **API HTTP Direta:**
   * Scripts, plugins ou ferramentas em Node.js no OpenCode podem bater direto em `http://localhost:20128/v1/systemone` com header `Authorization: Bearer sk-6f30c...`.
3. **Triagem de Orquestração:**
   * Em vez de fazer uma chamada cara a um modelo Staff para decidir quem deve executar uma tarefa, o orquestrador executa `jev route "<tarefa>"` e obtém a especialidade ideal em 300ms.

---

## 4. Como Habilitar e Desabilitar

### Modo Temporário (Sessão Atual)
```bash
# Executar sessão do claude-or com o Jev desligado
DISABLE_JEV=1 claude-or
```

### Modo Shell Persistente (`~/.zshrc`)
```bash
# Desligar para todas as sessões
export DISABLE_JEV=1

# Religar
unset DISABLE_JEV
```

### Desativação Definitiva via Configuração
Remova o bloco `"matcher": "Bash"` em `hooks.PreToolUse` do arquivo `~/.claude-or/settings.json`.

---

## 5. Como Testar no Terminal

O CLI `jev` foi empacotado para testes manuais rápidos:

```bash
# 1. Checar conectividade do 9Router
jev status

# 2. Testar guardrail de comando destrutivo (retorna exit code 1)
jev danger "rm -rf /Users/meus-projetos"

# 3. Testar comando seguro (retorna exit code 0)
jev danger "git status"

# 4. Roteamento de especialidade de subagente
jev route "Criar landing page com Tailwind CSS e Framer Motion"
# -> designer (98% confiança)

jev route "Verificar vulnerabilidades de injeção SQL e CSRF no endpoint de login"
# -> secops (99% confiança)

# 5. Pergunta personalizada direta ao modelo
jev ask "JWT armazenado no localStorage" "Is this vulnerable to XSS token theft?"
# -> Probabilidade: 95.0%
```

---

## 6. Sincronização Contínua com `opencode-agent-studio`

Para garantir que o repositório `opencode-agent-studio` permaneça como a **fonte única de verdade (Single Source of Truth)** entre o Claude Code e o OpenCode:

### O Que é Sincronizado:
1. `~/.claude-or/hooks/` ➔ `opencode-agent-studio/hooks/` e `~/configs/.claude-or/hooks/`
2. `~/.claude-or/agents/` ➔ `opencode-agent-studio/agents/` e `~/configs/.claude-or/agents/`
3. `~/.claude-or/docs/` ➔ `opencode-agent-studio/docs/` e `~/configs/.claude-or/docs/`
4. Binários CLI (`bin/jev`) ➔ `opencode-agent-studio/bin/` e `~/.npm-global/bin/`

### Comando de Sincronização Automática:
Sempre que você alterar ou atualizar arquivos no `claude-or` ou no `opencode`, execute na pasta do studio:

```bash
cd /Users/victorsalome/opencode-agent-studio
npm run sync
```
Esse comando faz a cópia bidirecional segura, atualiza a documentação, empacota os binários e comita as alterações.
