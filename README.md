# 🚀 OpenCode & Claude Code Agent Studio

**Transforme o seu OpenCode e Claude Code em uma Software House Autônoma Completa.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenCode](https://img.shields.io/badge/OpenCode-V2-blue)](https://opencode.ai)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Supported-purple)](https://claude.ai)
[![Plugin](https://img.shields.io/badge/Powered%20By-%40beremaran%2Fopencode--agent--tree-purple)](https://github.com/beremaran/opencode-agent-tree)

---

## 🎯 O Problema que este Blueprint Resolve

Agentes de IA convencionais sofrem de **três vícios graves**:
1. **Causam danos colaterais:** Você pede para alterar um botão e eles refatoram 10 arquivos aleatórios.
2. **Gambiarras invisíveis:** Usam `any`, `@ts-ignore` e `eslint-disable` para mascarar erros de tipagem.
3. **Falta de validação cega:** O mesmo agente que escreve o código se auto-avalia, diz que está tudo bem e entrega tarefas quebradas.

---

## 💡 A Solução (Suporte Duplo: OpenCode + Claude Code)

O **Agent Studio** utiliza o bloqueio físico de permissões e governança de subagentes para criar uma **esteira hierárquica e sob demanda**:

```text
Você (Prompt simples, sem comandos especiais)
  │
  ▼
[ MANAGER ] (Diretor)
  │ 🚫 Não coda diretamente
  │ 🎯 Classifica a intenção no planejamento (PLAN)
  │
  ├─▶ [ designer ]   ── Telas React, Tailwind, Framer Motion (Anthropic & Vercel Guidelines)
  ├─▶ [ architect ]  ── Backend, APIs REST, Banco, Bugs (Vercel Best Practices & RFC 7807)
  ├─▶ [ tester ]     ── Testes ponta a ponta reais com Playwright no navegador
  ├─▶ [ secops ]     ── Pentest ofensivo e varredura de OWASP Top 10
  ├─▶ [ documenter ] ── Diagramas SVG interativos e documentação técnica
  │
  ▼
[ REVIEWER ] (Auditor Cego / Quality Gate)
  │ 🔍 Avaliação em 2 eixos (Padrões Martin Fowler x Especificação do Usuário)
  │ 🛑 Veto Imediato: Se violar a Constituição Sênior -> FAIL
  │
  └─▶ Entrega ao Usuário SOMENTE com carimbo [ PASS ]
```

---

## 👥 A Equipe Especializada

| Agente | Função | Skills Oficiais Embutidas (Top Mundial) |
| :--- | :--- | :--- |
| **`Manager`** | Diretor / Orquestrador | `grill-me` (Matt Pocock #2 mundial) |
| **`designer`** | UI/UX & Frontend | `frontend-design` (Anthropic #6), `web-design-guidelines` (Vercel #41), `ui-ux-pro-max`, `impeccable` |
| **`architect`** | Backend & Fullstack | `vercel-react-best-practices` (Vercel #13), `api-designer`, `fullstack-guardian`, `diagnosing-bugs` (Matt Pocock) |
| **`reviewer`** | **Quality Gate Mandatório** | `code-review` (Matt Pocock #63), `gauntlet-loop` |
| **`tester`** | Testes E2E | `e2e-tester`, `webapp-testing`, `playwright-e2e-init` |
| **`secops`** | Pentest & OWASP | `security-pentest`, `codeprobe-security`, `owasp-top-10` |
| **`documenter`**| Arquitetura & SVG | `archify`, `docs`, `docx`, `pdf` |

---

## 📜 Constituição de Engenharia Sênior (5 Regras Invioláveis)

Nenhum código é aprovado pelo `reviewer` se violar estas diretrizes:
1. **Escopo Fechado:** Proibido tocar em arquivos fora da solicitação.
2. **Zero Gambiarras:** Proibido `any`, `@ts-ignore` e `eslint-disable`.
3. **Código 100% Funcional:** Zero stubs vazios ou comentários `// TODO`.
4. **Zero Chaves Expostas:** Credenciais sempre via `.env`.
5. **Zero Poluição de Dependências:** O agente trabalha com o que o projeto tem. Proibido `npm install` sem autorização explícita. Se o projeto não tem Jest/Vitest, a auditoria é feita via análise estática e tipagem estrita.

---

## ⚡ Instalação Rápida

### Opção A: Para OpenCode
Clone o repositório e execute o instalador:
```bash
git clone https://github.com/VictorSalome/opencode-agent-studio.git
cd opencode-agent-studio
./install.sh
```

### Opção B: Para Claude Code
Basta copiar o template de governança para o seu diretório global:
```bash
cp config/CLAUDE.md.template ~/.claude/CLAUDE.md
# Ou se você usa um diretório personalizado:
# cp config/CLAUDE.md.template ~/.claude-or/CLAUDE.md
```

---

## 🛠️ Como Usar

Basta abrir o seu **OpenCode** ou **Claude Code** e digitar qualquer necessidade de negócio em linguagem natural:

- *"Crie uma tela de Login moderna com Tailwind e validação com Zod."*  
  ➡️ O Manager aciona o **`designer`** e valida com o **`reviewer`**.
- *"Crie o endpoint POST /api/tickets salvando no banco de dados."*  
  ➡️ O Manager aciona o **`architect`** e valida com o **`reviewer`**.
- *"Verifique se temos vulnerabilidades de injeção no endpoint de login."*  
  ➡️ O Manager aciona o **`secops`** e valida com o **`reviewer`**.

---

## 🙏 Créditos e Agradecimentos

- **Motor de Orquestração OpenCode:** Desenvolvido graças ao plugin oficial [`@beremaran/opencode-agent-tree`](https://github.com/beremaran/opencode-agent-tree).
- **Skills de Classe Mundial:**
  - [Matt Pocock](https://github.com/mattpocock/skills) (`code-review`, `diagnosing-bugs`, `grill-me`).
  - [Anthropic](https://github.com/anthropics/skills) (`frontend-design`).
  - [Vercel](https://github.com/vercel-labs/agent-skills) (`vercel-react-best-practices`, `web-design-guidelines`).
  - [pbakaus](https://github.com/pbakaus/impeccable) (`impeccable`).

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.
