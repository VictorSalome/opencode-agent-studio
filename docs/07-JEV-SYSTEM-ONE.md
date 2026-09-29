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

O `claude-or` integra o Jev em dois momentos automáticos do ciclo de vida:

### A. Triagem Contínua de Toda Mensagem (`UserPromptSubmit`)
* Hook configurado em `~/.claude-or/hooks/jev-prompt-triage.js`.
* Disparado **imediatamente quando o usuário envia qualquer pedido no chat** (antes do modelo principal começar a gerar).
* O Jev avalia o texto em 250ms e injeta no contexto do Orquestrador:
  ```
  [TRIAGEM JEV SYSTEM ONE]: Esta solicitação foi avaliada determinísticamente pelo Jev (9Router). Especialista recomendado: 'designer' (98% de confiança). Priorize a delegação para este subagente.
  ```
* Garante que **toda tarefa enviada consulte o Jev no 9Router** e chegue ao Orquestrador já com a rota ideal mastigada.

### B. Guardrail de Comandos Perigosos (`PreToolUse`)
* Hook configurado em `~/.claude-or/hooks/guard-bash-commands.js` no matcher `"Bash"`.
* Se o modelo tentar rodar um comando com risco de destruição (`rm `, `git push --force`, `drop table`), o Jev avalia em 300ms.
* Se risco $\ge 70\%$, emite `permissionDecision: "deny"` e impede a execução sem intervenção humana.

---

## 3. Como Funciona no OpenCode

O OpenCode agora também conta com o motor Jev **100% automático e invisível**, através do plugin nativo `~/.config/opencode/plugins/jev-opencode-plugin.js`:

1. **Triagem Automática em Background (`session.context`):**
   * Disparado a cada turno da conversa antes do LLM gerar texto.
   * O Jev avalia o texto do usuário em ~250ms e injeta a tag `<jev_system_one_triage>` no system prompt do Manager recomendando o subagente ideal.
   * O usuário não precisa mencionar `jev` nem `route`. Tudo flui em linguagem natural.

2. **Guardrail de Comandos Shell (`tool.execute.before`):**
   * Intercepta qualquer chamada às ferramentas `shell` e `bash` no OpenCode.
   * Executa fast-path para comandos seguros (<1ms) e valida comandos perigosos com o Jev.
   * Se o risco de destruição for $\ge 70\%$, a execução é abortada antes de tocar no sistema operacional e o OpenCode recebe erro com a explicação do bloqueio.

3. **Acesso Global via CLI (`jev`):**
   * O binário `jev` continua disponível no `$PATH` caso o usuário ou subagentes queiram fazer checagens diretas via terminal:
     ```bash
     jev danger "rm -rf build/"
     jev route "Desenvolver formulário acessível em React"
     ```

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
