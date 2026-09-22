# OpenCode & Claude Code Agent Studio

Transforme o seu **OpenCode** e **Claude Code** em uma **Software House Autônoma Completa**, com governança estrita de ferramentas, controle de escopo (Scope Lock), máquina de estados e auditoria independente com nota de corte.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenCode](https://img.shields.io/badge/OpenCode-V2-blue)](https://opencode.ai)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Supported-purple)](https://claude.ai)
[![Plugin](https://img.shields.io/badge/Powered%20By-%40beremaran%2Fopencode--agent--tree-purple)](https://github.com/beremaran/opencode-agent-tree)

---

## 🚀 Instalação Rápida (Via npx)

Você pode instalar ou atualizar a arquitetura diretamente pelo terminal sem precisar clonar o repositório manualmente:

### No OpenCode (Padrão):
```bash
npx opencode-agent-studio
```

### No Claude Code:
```bash
npx opencode-agent-studio --claude
```

### Em Ambos:
```bash
npx opencode-agent-studio --opencode --claude
```

> **Compatibilidade Total:** Funciona de forma transparente no **macOS**, **Linux** e **Windows** (PowerShell / CMD).  
> **Preservação Segura:** O instalador faz backup automático da sua configuração existente e **preserva seus provedores, chaves de API e MCPs já configurados**.

---

## 🧠 Como a Arquitetura Funciona

Diferente de assistentes convencionais que tentam fazer tudo no mesmo prompt (gerando código incompleto, quebrando arquivos alheios ou usando `any`), o **Agent Studio** adota o modelo hierárquico com **Separação Rigorosa de Responsabilidades**:

$$\text{Permissão Efetiva} = \text{CAPABILITY} \cap \text{SCOPE LOCK}$$

```text
                     [ VOCÊ ]
                        │ (Conversa ativa e contínua em tempo real)
                        ▼
                ┌───────────────┐
                │    MANAGER    │ (Orquestrador & Comunicador Humano)
                └───────┬───────┘
                        │ Despacha em background (background: true)
                        ▼
                ┌───────────────┐
                │   ARCHITECT   │ (Tech Lead & Executor Central)
                └───────┬───────┘
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
┌───────────┐     ┌───────────┐     ┌───────────┐
│ EXPLORER  │     │ DESIGNER  │     │  TESTER   │
└───────────┘     └───────────┘     └───────────┘
      ▼                 ▼                 ▼
┌───────────┐     ┌───────────┐     ┌───────────┐
│  SECOPS   │     │DOCUMENTER │     │ REVIEWER  │ (Quality Gate: Nota >= 9/10)
└───────────┘     └───────────┘     └───────────┘
```

---

## 💬 Conversa Contínua com o Manager (Sem Travamentos)

- O **Manager** é o seu parceiro direto. Ele **nunca fica em silêncio** e está sempre disponível para tirar dúvidas enquanto o projeto é construído.
- **Delegação Não Bloqueante (`background: true`):** Todas as subtarefas pesadas rodam em segundo plano. Você pode continuar conversando, ajustando planos ou fazendo perguntas enquanto os especialistas trabalham.

---

## 🛡️ Capability Matrix Real (Default Deny no Engine)

As permissões são bloqueadas fisicamente no motor do OpenCode (`permissions` no schema v2):

| Agente | Nível | read / glob / grep | write / edit / patch | shell (CLI nativo) | subagent (task) | webfetch / search |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Manager** | L4 (Orquestração) | ALLOW | **DENY** | **DENY** | ALLOW | ALLOW |
| **Explorer** | L1 (Read-Only) | ALLOW | **DENY** | **DENY** | **DENY** | **DENY** |
| **Architect** | L4 (Tech Lead) | ALLOW | ALLOW (no escopo) | ALLOW (CLI nativo) | **DENY** | ALLOW |
| **Designer** | L3 (UI Only) | ALLOW | ALLOW (UI components)| **DENY** | **DENY** | **DENY** |
| **Tester** | L3 (Tests Only) | ALLOW | ALLOW (`*.test.*`) | ALLOW (npm test/E2E)| **DENY** | **DENY** |
| **SecOps** | L2 (Audit) | ALLOW | **DENY** | ALLOW (curl/scans) | **DENY** | **DENY** |
| **Documenter** | L3 (Docs Only) | ALLOW | ALLOW (`*.md`, `*.svg`)| **DENY** | **DENY** | **DENY** |
| **Reviewer** | L1/L2 (Auditor) | ALLOW | **DENY** | ALLOW (git diff only)| **DENY** | **DENY** |

---

## 🔄 Máquina Formal de Estados (State Machine)

Toda tarefa transita estritamente pelo pipeline de governança:

1. **`PLANNED`**: Explorer mapeia a estrutura e Architect define a estratégia e o contrato de **Scope Lock**.
2. **`IMPLEMENTING`**: Designer (UI) e Architect (API/DB) criam o código estritamente dentro dos arquivos permitidos.
3. **`VERIFYING`**: Tester valida portas/testes automatizados e SecOps audita a superfície de segurança.
4. **`REVIEWING`**: Reviewer independente realiza auditoria cega dos padrões e do escopo.
5. **`PASS`**: Conclusão liberada SOMENTE se `STATUS = PASS` e `SCORE >= 9.0/10.0`.

---

## ⚖️ Quality Gate Implacável (10 Vetos Automáticos)

O **Reviewer** é completamente cego, independente e não possui permissão de escrita (não pode "ajeitar" código). Ele emite a nota em 7 dimensões:

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
BLOCKING ISSUES: <detalhes ou nenhum>
==================================================
```

### Vetos que geram FAIL Imediato (SCORE = 0):
1. Presença de `any`.
2. Presença de `// @ts-ignore` ou `// @ts-expect-error`.
3. Presença de `/* eslint-disable */`.
4. Arquivo alterado fora do `ALLOWED_FILES` do Scope Lock.
5. Inclusão de comentários `// TODO` ou código pela metade.
6. Mocks em código de produção ou stubs não implementados.
7. Credenciais, senhas ou tokens expostos.
8. Dependências adicionadas sem autorização prévia.
9. Testes anteriores apagados ou enfraquecidos.
10. Scripts Python para tarefas de CLI quando ferramentas nativas de terminal eram aplicáveis.

---

## 💻 Comandos Nativos de Terminal (Bash Puro)

Os agentes são estritamente instruídos a utilizar os utilitários nativos de CLI:
- **SQLite:** `sqlite3 <banco.db> ".tables"`, `sqlite3 <banco.db> ".schema"`
- **Arquivos & Disco:** `ls -lh`, `du -sh`, `find`, `file`
- **Logs & Processos:** `grep`, `tail -n`, `lsof`, `ps aux`

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais informações.
