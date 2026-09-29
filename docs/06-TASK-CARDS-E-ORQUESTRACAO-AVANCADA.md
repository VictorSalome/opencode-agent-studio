# 06 - Task Cards, Wave Scheduling, Circuit Breaker e Hook SessionStart

Este documento detalha os 4 padrões avançados de orquestração de subagentes implementados no `claude-or` e `opencode-agent-studio`.

---

## 1. Contrato por Task Card

O Manager e o Tech Lead (`architect`) nunca despacham subagentes com texto vago. A invocação utiliza um **Task Card estruturado**:

```yaml
TASK_CARD:
  AGENTE: "architect"
  MODELO: "team-builder"
  OBJETIVO: "Implementar rota POST /api/v1/auth/refresh com validação de refresh token"
  ARQUIVOS_PERMITIDOS:
    - "src/routes/auth.ts"
    - "src/services/token.ts"
  ARQUIVOS_PROIBIDOS:
    - "src/middlewares/auth.ts"
    - "package.json"
  CRITERIO_DE_PRONTO: "pnpm test tests/auth.test.ts"
  EVIDENCIA_REQUERIDA: "Exit code 0 com 5 asserções válidas"
```

### Benefícios:
- **Zero Scope Creep:** O subagente não edita arquivos adjacentes.
- **Auto-Verificação Determinística:** O subagente sabe exatamente o que precisa rodar para comprovar entrega antes de devolver o controle.

---

## 2. Wave Scheduling (Execução em Ondas Concorrentes)

Para reduzir o tempo de resposta em tarefas amplas, as chamadas são organizadas em ondas temporais:

```text
[ ENTRADA DO USUÁRIO ]
          │ (Grill-Me 5 Estágios)
          ▼
┌────────────────────────────────────────────────────────┐
│ ONDA 1: RECONHECIMENTO PARALELO                        │
│ • explorer (Mapeia estrutura, rotas e dependências)    │
│ • analyst  (Formaliza critérios de aceite e Gherkin)   │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ ONDA 2: CONSTRUÇÃO COORDENADA                          │
│ • architect (Backend, models e rotas core)             │
│ • designer  (Frontend visual, Double-Bezel, Anti-Slop) │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ ONDA 3: VALIDAÇÃO CONCORRENTE PARALELA                 │
│ • tester (Puppeteer MCP: screenshots e testes E2E)     │
│ • secops (Varredura OWASP Top 10 e auditoria de auth)  │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ ONDA 4: GATE DE INTEGRAÇÃO & AUDITORIA                 │
│ • reviewer (Evidence-Gated Audit: PASS ou FAIL factual)│
└────────────────────────────────────────────────────────┘
```

---

## 3. Circuit Breaker (Disjuntor de Retentativas)

Proteção contra loops infinitos de alucinação e gasto desnecessário de tokens:
- **Limite:** Máximo de 2 tentativas consecutivas para o mesmo erro.
- **Comportamento no Trip:**
  1. O subagente aborta o loop imediatamente.
  2. Executa `git checkout` / `git restore` nos arquivos que causaram a regressão.
  3. Devolve `CIRCUIT_BREAKER_TRIPPED` com a causa exata para o Manager.
  4. O Manager assume e despacha o `investigator` ou solicita orientação ao usuário.

---

## 4. Hook `SessionStart`: Injeção de Inteligência do Repositório

Arquivo: `~/.claude-or/hooks/session-start.js`

Executado automaticamente ao iniciar ou dar `/resume` em qualquer sessão do Claude Code:
1. Detecta se a pasta é um repositório Git.
2. Identifica branch atual, status de arquivos modificados (`git status -s`) e últimos commits (`git log -n 3`).
3. Lê as últimas 3 regras de prevenção em `pitfalls.md`.
4. Injeta tudo via `hookSpecificOutput.additionalContext`.

O modelo já começa a conversa sabendo o estado do projeto sem gastar chamadas de ferramenta adicionais.
