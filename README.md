# OpenCode & Claude Code Agent Studio (v1.1.0)

Transforme o seu **OpenCode** e **Claude Code** em uma **Software House Autônoma Completa**, com governança estrita de ferramentas, controle de escopo (Scope Lock), hooks determinísticos de delegação, testes visuais no navegador via MCP e auditoria independente com nota de corte.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenCode](https://img.shields.io/badge/OpenCode-V2-blue)](https://opencode.ai)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Supported-purple)](https://claude.ai)
[![Copilot CLI](https://img.shields.io/badge/Copilot%20CLI-Synergy-black)](https://github.com/github/gh-copilot)

---

## 🚀 Instalação Rápida (Via npx)

Instale ou atualize a arquitetura diretamente pelo terminal sem precisar clonar o repositório manualmente:

### No OpenCode (Padrão):
```bash
npx opencode-agent-studio
```

### No Claude Code (Oficial ou claude-or):
```bash
npx opencode-agent-studio --claude
```

### Em Todos (OpenCode + Claude Code):
```bash
npx opencode-agent-studio --all
```

> **Compatibilidade Total:** Funciona de forma transparente no **macOS**, **Linux** e **Windows**.  
> **Preservação Segura:** O instalador faz backup automático da sua configuração existente e **preserva seus provedores, chaves de API e MCPs já configurados**.

---

## 🏛️ O Ecossistema Tri-CLI (Sinergia de Terminal)

| CLI | Papel Estratégico | Nível de Atuação |
| :--- | :--- | :--- |
| **Claude Code (`claude-or`)** | Motor principal de engenharia autônoma em árvore, subagentes com modelos de time (`team-*`), testes com Puppeteer MCP e hooks de bloqueio. | Arquitetura, features fullstack, UI anti-slop e refatorações complexas. |
| **OpenCode** | Roteamento multi-provedor (9Router, local, OpenAI, Anthropic) com Default Deny físico no engine e governança estrita de permissões. | Ambientes corporativos, restrição física de tools e otimização de custos. |
| **GitHub Copilot CLI** | Assistente ágil de terminal para comandos Git, shell helpers, abertura de PRs e inspeção de CI. | Comandos Git pontuais, automação rápida e fechamento de PRs. Consulte [docs/COPILOT_CLI.md](./docs/COPILOT_CLI.md). |

---

## 🧠 Como a Arquitetura Funciona

Diferente de assistentes convencionais que tentam fazer tudo no mesmo prompt (gerando código incompleto, quebrando arquivos alheios ou usando `any`), o **Agent Studio** adota o modelo hierárquico com **Separação Rigorosa de Responsabilidades**:

$$\text{Permissão Efetiva} = \text{CAPABILITY} \cap \text{SCOPE LOCK}$$

```text
                     [ VOCÊ ]
                        │ (Entrevista Grill-Me em 5 Estágios)
                        ▼
                ┌───────────────┐
                │    MANAGER    │ (Orquestrador - team-heavy)
                └───────┬───────┘
                        │ Despacha em background (Hook bloqueia escrita direta)
                        ▼
                ┌───────────────┐
                │   ARCHITECT   │ (Tech Lead Fullstack - team-builder)
                └───────┬───────┘
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
┌───────────┐     ┌───────────┐     ┌───────────┐
│ EXPLORER  │     │ DESIGNER  │     │  TESTER   │ (Puppeteer MCP)
└───────────┘     └───────────┘     └───────────┘
      ▼                 ▼                 ▼
┌───────────┐     ┌───────────┐     ┌───────────┐
│  SECOPS   │     │DOCUMENTER │     │ REVIEWER  │ (Evidence-Gated Audit)
└───────────┘     └───────────┘     └───────────┘
```

---

## 🛡️ Hooks Determinísticos de Governança (Claude Code)

Instalados automaticamente em `~/.claude/hooks/` (ou `~/.claude-or/hooks/`):

1. **`PreToolUse` (Enforce Agent Delegation):**
   * Bloqueia fisicamente as ferramentas `Write` e `Edit` na sessão raiz do Orquestrador para qualquer arquivo de código.
   * Obriga o Orquestrador a delegar o trabalho para a equipe de subagentes especializados, mantendo o contexto limpo.

2. **`PostToolUse` (Auto-Format com Prettier):**
   * Executa formatação automática e silenciosa (<50ms) após cada edição de arquivo.
   * Evita discussões sobre estilo e economiza tokens na revisão.

---

## 📋 Protocolo Grill-Me em 5 Estágios Formais

Antes de qualquer linha de código ser escrita em demandas abertas:

1. **Estágio 1 (Explore First):** Mineração autônoma de arquivos e schemas existentes antes de perguntar ao usuário.
2. **Estágio 2 (Árvore de Decisão):** Mapeamento em 4 ramos (Escopo, Arquitetura, Bordas/Falhas, Segurança).
3. **Estágio 3 (Rodadas na Fronteira):** Interrogatório ativo via tool `question`, onde toda pergunta obrigatoriamente inclui uma opção **(Recomendado)** fundamentada.
4. **Estágio 4 (Aprofundamento):** Eliminação de respostas vagas e fixação de contratos padrão.
5. **Estágio 5 (Síntese & Scope Lock):** Emissão de relatório de decisões travadas e disparo da equipe apenas após o alinhamento.

---

## 🎨 As 7 Leis Anti-Slop de Design Visual

1. **Tipografia com Identidade:** Proibido system fonts puras. Google Fonts no `<head>` (Syne, Plus Jakarta Sans, Space Grotesk). Títulos com tracking negativo (`-0.02em` a `-0.04em`).
2. **Double-Bezel:** Cards com moldura dupla (container externo sutil + container interno tátil).
3. **Bento Grid Assimétrico:** Proibido 3 cards simétricos idênticos. Hierarquia visual com Hero de 2 colunas.
4. **Paleta Orgânica Profunda:** Fundos ultra-dark (#050505 a #0D0D0D) ou Creme Clássico (#FBF9F5). Zero glow roxo genérico.
5. **Física de Movimento Real:** Animações inerciais com `cubic-bezier(0.16, 1, 0.3, 1)` ou GSAP timelines.
6. **Ergonomia Mobile:** Targets de toque de no mínimo 44px e `touch-action: manipulation`.
7. **Acessibilidade:** Regra obrigatória `@media (prefers-reduced-motion: reduce)`.

---

## 🔍 Evidence-Gated Audit & Memória Contínua

* **Proibido Auto-Relato:** O `reviewer` nunca aceita mensagens verbais de "está pronto". O veredito `PASS` exige prova factual (código de saída zero de testes/build, print visual do Puppeteer salvo em disco ou `git diff` limpo).
* **Registro de Armadilhas (`pitfalls.md`):** Todo bug corrigido gera um registro de 3 linhas (Problema, Causa e Regra Preventiva). Agentes consultam esse arquivo no início da sessão para evitar regressões.
* **Isolamento com Git Worktrees:** Subagentes concorrentes utilizam `isolation: "worktree"` para trabalhar em cópias temporárias sem gerar conflitos de merge.

---

## 👥 Matriz de Subagentes Nativos

| Subagente | Modelo Sugerido | Ferramentas | Missão Principal |
| :--- | :--- | :--- | :--- |
| **`architect`** | `team-builder` | `Read, Glob, Grep, Edit, Write, Bash, Agent, Skill` | Arquitetura, modelagem de banco, APIs e coordenação. |
| **`designer`** | `team-heavy` | `Read, Glob, Grep, Edit, Write, Bash, Agent, Skill, mcp__puppeteer__*` | UI/UX de alta fidelidade, animações e regras Anti-Slop. |
| **`reviewer`** | `team-builder` | `Read, Glob, Grep, Bash, Agent, Skill` | Auditoria independente, quality gate e emissão de PASS/FAIL. |
| **`tester`** | `team-worker` | `Read, Glob, Grep, Edit, Write, Bash, Skill, mcp__puppeteer__*` | QA, testes automatizados e testes visuais no navegador real. |
| **`investigator`**| `team-heavy` | `Read, Glob, Grep, Bash, Agent, Skill` | Diagnóstico de causa-raiz com prova factual antes de editar código. |
| **`secops`** | `team-heavy` | `Read, Glob, Grep, Bash, Skill` | Segurança ofensiva, OWASP Top 10 e auditoria de vulnerabilidades. |
| **`documenter`** | `team-worker` | `Read, Glob, Grep, Edit, Write, Skill` | Documentação técnica, diagramas Mermaid/SVG e specs OpenAPI. |
| **`explorer`** | `team-fast` | `Read, Glob, Grep` | Mapeamento read-only de repositórios e inventário de código. |
| **`analyst`** | `team-fast` | `Read, Glob, Grep, Agent, Skill` | Condução do interrogatório dos 5 estágios do Grill-Me. |

---

## 📄 Licença

Distribuído sob licença MIT. Consulte [LICENSE](./LICENSE) para mais detalhes.
