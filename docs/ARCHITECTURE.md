# ARQUITETURA MULTIAGENTE DE ORQUESTRAÇÃO ROBUSTA — OPENCODE (V2)

Este documento define formalmente a arquitetura de orquestração hierárquica, matriz de governança de ferramentas, máquina de estados e quality gate implementados no OpenCode.

---

## 1. PRINCÍPIO FUNDAMENTAL: SEPARAÇÃO DE RESPONSABILIDADES

A governança do sistema separa rigorosamente quatro dimensões:

1. **ROLE:** A missão e responsabilidade funcional do agente no fluxo.
2. **CAPABILITY:** O conjunto de ferramentas que o agente tecnicamente tem permissão para invocar no engine do OpenCode (Default Deny).
3. **SCOPE LOCK:** O conjunto estrito de arquivos, diretórios e módulos autorizados especificamente para a tarefa em execução.
4. **QUALITY GATE:** A auditoria independente e cega que decide se o trabalho atende a nota mínima de 9.0/10.0 para ser aceito.

> **Regra de Ouro:**  
> $$\text{Permissão Efetiva} = \text{CAPABILITY} \cap \text{SCOPE LOCK}$$  
> Um agente pode ter a capability de escrita, mas está estritamente proibido de usá-la fora do Scope Lock aprovado da tarefa.

---

## 2. NÍVEIS CONCEITUAIS DE AUTONOMIA

- **L0:** Nenhum acesso à ferramenta ou recurso.
- **L1 (Read-Only):** Leitura de arquivos e inspeção estrutural (`read`, `glob`, `grep`).
- **L2 (Execução Controlada / Auditoria):** Leitura total + execução controlada de auditoria via shell (`curl`, `git diff`, `git status`). Sem escrita.
- **L3 (Escrita Limitada ao Domínio):** Leitura total + escrita e edição estritamente limitadas ao seu domínio (`*.test.*` para Tester, UI para Designer, `.md`/`.svg` para Documenter). Shell bloqueado no engine quando não aplicável.
- **L4 (Autonomia Total Dentro do Scope Lock):** Leitura, escrita e execução via shell dentro dos limites do Scope Lock e diretrizes do projeto.

---

## 3. CAPABILITY MATRIX REAL (DEFAULT DENY)

As permissões abaixo estão configuradas no engine do OpenCode (`permissions` em `opencode.json`):

| Capability / Tool | Manager | Explorer | Architect | Designer | Tester | SecOps | Documenter | Reviewer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **read / glob / grep** | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW |
| **write / edit / patch** | **DENY** | **DENY** | ALLOW (no Scope) | ALLOW (UI only) | ALLOW (Tests only) | **DENY** | ALLOW (Docs only) | **DENY** |
| **shell (bash / CLI)** | **DENY** | **DENY** | ALLOW (CLI nativo) | **DENY** | ALLOW (npm test/E2E) | ALLOW (audit/curl) | **DENY** | ALLOW (git diff only) |
| **subagent (task)** | ALLOW | **DENY** | **DENY** | **DENY** | **DENY** | **DENY** | **DENY** | **DENY** |
| **webfetch / websearch** | ALLOW | **DENY** | ALLOW | **DENY** | **DENY** | **DENY** | **DENY** | **DENY** |

---

## 4. MÁQUINA DE ESTADOS FORMAL (STATE MACHINE)

```text
       [ USUÁRIO ]
            │ (Conversa ativa e contínua com o Manager)
            ▼
       ┌─────────┐
       │ PLANNED │ ◄── Explorer mapeia + Architect formula estratégia e fixa SCOPE LOCK
       └────┬────┘
            │
            ▼
    ┌──────────────┐
    │ IMPLEMENTING │ ◄── Designer (UI) e/ou Architect (Backend/Lógica)
    └───────┬──────┘
            │
            ▼
     ┌────────────┐
     │ VERIFYING  │ ◄── Tester (testes/portas) e/ou SecOps (auditoria de superfície)
     └──────┬─────┘
            │
            ▼
     ┌────────────┐
     │ REVIEWING  │ ◄── Reviewer independente (Quality Gate)
     └──────┬─────┘
            ├─── Se SCORE < 9.0 ou FAIL ──┐
            │                             ▼
            │                    ┌─────────────────┐
            │                    │ CORREÇÃO (max 2)│
            │                    └────────┬────────┘
            │                             │ Volta para IMPLEMENTING/VERIFYING
            ▼                             │
     ┌─────────────┐                      │
     │    PASS     │ ◄────────────────────┘ (Somente com STATUS = PASS e SCORE >= 9.0)
     └─────────────┘
```

---

## 5. PROTOCOLO DE SCOPE LOCK

Antes de iniciar qualquer implementação, o Manager e o Architect definem o contrato de Scope Lock no prompt de delegação:

```text
=== SCOPE LOCK ===
ALLOWED_FILES:
  - src/api/routes.ts
  - src/services/user.ts
ALLOWED_MODULES:
  - user-management
FORBIDDEN_FILES:
  - src/auth/*
  - .env*
  - ormconfig.ts
FORBIDDEN_ACTIONS:
  - Adicionar novas dependências no package.json
  - Remover testes existentes
  - Alterar esquemas de banco fora do escopo
```

O Reviewer executa `git diff --name-only` e compara com `ALLOWED_FILES`. Qualquer arquivo fora da lista gera **reprovação imediata**.

---

## 6. ROTEAMENTO DINÂMICO (DYNAMIC ROUTING)

O Manager nunca despacha todos os agentes indiscriminadamente. O grafo mínimo é selecionado sob demanda:

- **Bug / Ajuste Backend:** `Explorer` → `Architect` → `Tester` → `Reviewer`
- **Bug / Ajuste Frontend:** `Explorer` → `Designer` → `Tester` → `Reviewer`
- **Feature Fullstack:** `Explorer` → `Designer` (UI) → `Architect` (API/DB) → `Tester` → `Reviewer`
- **Segurança / Pentest:** `Explorer` → `SecOps` → `Reviewer`
- **Documentação / Diagramas:** `Explorer` → `Documenter` → `Reviewer`

---

## 7. POLÍTICA DE RETRY CONTROLADO

O Architect possui tolerância máxima de **2 retries** em caso de falha de build ou teste:

1. **Tentativa 1:** Diagnóstico de causa raiz (`diagnosing-bugs`) → Formular hipótese A → Aplicar correção → Re-executar.
2. **Tentativa 2 (se persistir erro):** Descartar hipótese A → Formular hipótese alternativa B → Aplicar correção → Re-executar.
3. **Persistência de erro após 2 tentativas:** **ESCALATE IMEDIATO** para o Manager comunicar ao usuário, acompanhado do log técnico da falha. Proibido tentar às cegas repetidamente.

---

## 8. QUALITY GATE REPORT & VETOS AUTOMÁTICOS

O `Reviewer` é completamente cego e isolado (sem permissão de escrita). Ele avalia a entrega e emite obrigatoriamente:

```text
==================================================
QUALITY GATE REPORT
==================================================
1. Scope Lock Compliance: [PASS / FAIL] (Peso 2.0)
2. Type Safety & Strict:  [PASS / FAIL] (Peso 1.5)
3. Tests & Assertions:    [PASS / FAIL] (Peso 1.5)
4. Regression Prevention: [PASS / FAIL] (Peso 1.5)
5. Security & OWASP:      [PASS / FAIL] (Peso 1.5)
6. Architecture & Clean:  [PASS / FAIL] (Peso 1.0)
7. Code Quality & Idiom:  [PASS / FAIL] (Peso 1.0)
--------------------------------------------------
SCORE: [X.X] / 10.0
STATUS: [PASS / FAIL]
BLOCKING ISSUES:
- <Nenhum ou lista detalhada com arquivo, linha e correção requerida>
==================================================
```

### 10 Vetos Automáticos (FAIL imediato e SCORE = 0):
1. Presença de `any` em TypeScript.
2. Presença de `// @ts-ignore` ou `// @ts-expect-error`.
3. Presença de `/* eslint-disable */`.
4. Arquivos modificados fora da lista `ALLOWED_FILES` do Scope Lock.
5. Inclusão de comentários `// TODO` ou código pela metade.
6. Funções stub, mocks em código de produção ou placeholders não implementados.
7. Chaves, tokens ou credenciais expostas no código.
8. Dependências adicionadas no `package.json` sem autorização prévia.
9. Testes existentes apagados, comentados ou enfraquecidos.
10. Uso de scripts Python para tarefas de CLI quando ferramentas nativas de terminal eram aplicáveis.

**Critério de Aprovação:** A tarefa só é aceita se **`STATUS = PASS`** e **`SCORE >= 9.0/10.0`**.
