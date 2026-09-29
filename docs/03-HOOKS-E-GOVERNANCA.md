# 03 - Hooks e Governança Mecânica

## 1. Por Que Usar Hooks?

Instruções em prompts e arquivos `CLAUDE.md` são diretrizes cognitivas. Modelos em sessões longas sofrem de "deriva comportamental", onde o orquestrador tenta "resolver rapidinho" e escreve código diretamente, poluindo a janela de contexto principal com detalhes de implementação.

Os hooks do Claude Code são interceptores determinísticos que executam scripts locais antes (`PreToolUse`) e depois (`PostToolUse`) de qualquer chamada de ferramenta.

---

## 2. Hook `PreToolUse`: Bloqueio Mecânico de Delegação

* **Arquivo:** `~/.claude-or/hooks/enforce-agent-delegation.js`
* **Matchers Registrados:** `Write`, `Edit`

### Como Funciona:
1. Quando qualquer tool call `Write` ou `Edit` é gerada, o Claude Code passa o JSON do evento via `stdin`.
2. O script verifica se o payload contém `agent_id` ou `agent_type`.
   * Se **sim** (é um subagente legítimo como `architect` ou `designer`), o hook dá `process.exit(0)` silencioso (operação liberada).
   * Se **não** (a chamada partiu da sessão raiz do Orquestrador):
     - Inspeciona a extensão do arquivo alvo.
     - Se for arquivo de código (`.js`, `.ts`, `.tsx`, `.html`, `.css`, `.py`, `.go`, etc.), o hook emite uma resposta JSON com `permissionDecision: "deny"` e instrução explícita:
       `[BLOQUEIO DE GOVERNANÇA]: Você está na sessão raiz (Orquestrador) e está proibido de escrever ou editar código diretamente. DELEGUE OBRIGATORIAMENTE para o subagente especializado apropriado usando a ferramenta Agent.`
     - Arquivos de documentação (`.md`, `.json`, `.txt`) permanecem liberados para o Orquestrador atualizar planos e relatórios.

### Resultado Comprovado:
O Orquestrador nunca consegue tocar em arquivos de código. Ao ser barrado, ele imediatamente despacha o `architect` em segundo plano de forma 100% autônoma.

---

## 3. Hook `PostToolUse`: Auto-Formatação Silenciosa (Prettier)

* **Arquivo:** `~/.claude-or/hooks/auto-format.js`
* **Matchers Registrados:** `Write`, `Edit`

### Como Funciona:
1. Imediatamente após um subagente escrever ou editar um arquivo com sucesso, o hook é acionado.
2. O script identifica o caminho do arquivo recém-gravado.
3. Se for um arquivo estilizável (`.js`, `.ts`, `.tsx`, `.jsx`, `.html`, `.css`, `.json`, `.vue`), ele dispara assincronamente:
   `prettier --write <caminho_do_arquivo>`
4. A formatação ocorre em menos de 50ms sem emitir saída no terminal.

### Benefício:
Elimina debates sobre indentação, aspas e ponto-e-vírgula. O subagente foca na lógica, o código fica padronizado na hora e o `reviewer` gasta zero tokens reclamando de linting.

---

## 4. Registro no `settings.json`

Configurado em `~/.claude-or/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node /Users/victorsalome/.claude-or/hooks/enforce-agent-delegation.js"
          }
        ]
      },
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node /Users/victorsalome/.claude-or/hooks/enforce-agent-delegation.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node /Users/victorsalome/.claude-or/hooks/auto-format.js"
          }
        ]
      },
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node /Users/victorsalome/.claude-or/hooks/auto-format.js"
          }
        ]
      }
    ]
  }
}
```
