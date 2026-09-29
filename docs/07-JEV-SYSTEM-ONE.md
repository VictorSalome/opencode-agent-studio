# 07 - Jev System One (Integração Local via 9Router)

Este documento descreve a integração do **Jev System One** (`oc/jev-1.13-free`) no ecossistema `claude-or` para decisões determinísticas rápidas sem consumo de tokens em modelos geradores de texto.

---

## 1. O Que É o Jev no 9Router?

O 9Router v0.5.91 expõe nativamente o endpoint:
* **URL:** `http://localhost:20128/v1/systemone`
* **Provedor:** `OpenCode Free` (`oc/jev-1.13-free`)
* **Custo:** 0 tokens faturados (grátis)
* **Tempo de Resposta:** ~200ms a 400ms

Diferente de LLMs convencionais que geram prosa ou código, o Jev recebe um estado e perguntas tipadas (`noul`), retornando probabilidades calibradas (0.00 a 1.00).

---

## 2. Componentes Criados

### 1. Biblioteca Cliente (`~/.claude-or/hooks/lib/jev.js`)
Módulo nativo em Node.js (sem dependências externas) que encapsula as chamadas HTTP para o 9Router:
* `askJev(state, questions)`: Avaliação genérica com timeout e fail-safe.
* `checkCommandDanger(command)`: Retorna probabilidade de um comando shell ser destrutivo.
* `classifyTaskAgent(task)`: Classifica a tarefa indicando a melhor persona (`designer`, `architect`, `secops`, `tester`) com índice de confiança.

### 2. Hook `PreToolUse` para Bash (`~/.claude-or/hooks/guard-bash-commands.js`)
Intercepta comandos `Bash` antes da execução:
1. **Fast-path local (<2ms):** Comandos seguros (`git status`, `ls`, `cat`, `pnpm test`) são liberados imediatamente.
2. **Avaliação Jev:** Comandos suspeitos (`rm`, `drop`, `force`, `reset --hard`) são enviados ao Jev.
3. Se a probabilidade de destruição for **>= 70%**, o comando é bloqueado com mensagem explicativa e exige autorização manual do usuário.
4. **Fail-Open:** Se o 9Router estiver indisponível, o hook libera a execução sem travar o Claude.

---

## 3. Exemplo Prático de Teste

```bash
# Teste via cliente Node.js:
node -e "
const { checkCommandDanger, classifyTaskAgent } = require('./hooks/lib/jev');
checkCommandDanger('rm -rf /dados').then(d => console.log('Perigo:', d));
classifyTaskAgent('Criar modal com Tailwind e React').then(a => console.log('Agente:', a));
"
```
