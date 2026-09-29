# 02 - Matriz de Subagentes e Delegação

## 1. Visão Geral

Diferente de sistemas que concentram todo o raciocínio em um único contexto (estourando a janela e acumulando ruído), o `claude-or` adota subagentes declarados como arquivos markdown individuais em `~/.claude-or/agents/`.

Cada arquivo define no frontmatter YAML:
- `name`: Identificador chamado pelo `Agent(subagent_type: "...")`
- `description`: Gatilhos para o orquestrador saber quando disparar
- `tools`: Ferramentas autorizadas (Default Deny para as demais)
- `model`: Modelo de time atribuído (`team-*`)

---

## 2. Catálogo de Subagentes

### 1. `architect` (`model: team-builder`)
* **Papel:** Líder técnico e construtor fullstack. Modela arquitetura, APIs, banco de dados e cria código no escopo.
* **Ferramentas:** `Read, Glob, Grep, Edit, Write, Bash, Agent, Skill`
* **Delegação Filha:** Pode disparar `explorer` (leitura), `designer` (UI), `tester` (testes) e `reviewer` (auditoria).

### 2. `designer` (`model: team-heavy`)
* **Papel:** Especialista em interfaces visuais de alta fidelidade, animações GSAP/Framer e padrões Anti-Slop.
* **Ferramentas:** `Read, Glob, Grep, Edit, Write, Bash, Agent, Skill, mcp__puppeteer__puppeteer_navigate, mcp__puppeteer__puppeteer_screenshot`
* **Delegação Filha:** Pode disparar `tester` para validação visual no navegador real.

### 3. `reviewer` (`model: team-builder`)
* **Papel:** Auditor de qualidade, guardião de padrões e emissor de veredito formal (`PASS` / `FAIL`).
* **Ferramentas:** `Read, Glob, Grep, Bash, Agent, Skill`
* **Delegação Filha:** Pode disparar `secops` (se notar riscos de injeção/auth) ou `tester` (se precisar rodar testes automatizados para reproduzir falhas).

### 4. `investigator` (`model: team-heavy`)
* **Papel:** Diagnóstico de causa-raiz para bugs difíceis, vazamentos de memória e erros de build.
* **Ferramentas:** `Read, Glob, Grep, Bash, Agent, Skill`
* **Delegação Filha:** Pode despachar `explorer` e `tester`.

### 5. `analyst` (`model: team-fast`)
* **Papel:** Conduz o interrogatório dos 5 estágios do Grill-Me antes de tocar em código.
* **Ferramentas:** `Read, Glob, Grep, Agent, Skill`
* **Delegação Filha:** Pode despachar `explorer` na fase de "Explore First".

### 6. `tester` (`model: team-worker`)
* **Papel:** QA Automation, testes E2E e testes visuais no navegador real.
* **Ferramentas:** `Read, Glob, Grep, Edit, Write, Bash, Skill, mcp__puppeteer__*`
* **Folha de Execução:** Não delega; executa e retorna evidência com prints e logs de saída.

### 7. `secops` (`model: team-heavy`)
* **Papel:** Segurança ofensiva, pentest, auditoria OWASP Top 10 e proteção contra vazamento de credenciais.
* **Ferramentas:** `Read, Glob, Grep, Bash, Skill`
* **Folha de Execução:** Emite relatório com vetor de ataque e remediação cirúrgica.

### 8. `documenter` (`model: team-worker`)
* **Papel:** Redação técnica, diagramação de arquitetura com Mermaid/SVG e especificações OpenAPI.
* **Ferramentas:** `Read, Glob, Grep, Edit, Write, Skill`
* **Folha de Execução:** Cria ou atualiza documentação sem mexer em arquivos de código.

### 9. `explorer` (`model: team-fast`)
* **Papel:** Mapeamento de codebase e inventário de pastas e dependências.
* **Ferramentas:** `Read, Glob, Grep` (Strict Read-Only, sem Bash, sem Write).
* **Folha de Execução:** Produz mapas objetivos e árvores de arquivos relevantes.

---

## 3. Árvore de Execução em Cascata (Nesting)

```text
ORQUESTRADOR (Manager - team-heavy)
   │
   ├─► analyst (team-fast)
   │     └─► explorer (team-fast) [Explore First]
   │
   ├─► architect (team-builder)
   │     ├─► explorer (team-fast) [Mapear contratos de API]
   │     ├─► designer (team-heavy) [Construir frontend Anti-Slop]
   │     │     └─► tester (team-worker) [Screenshot no Puppeteer MCP]
   │     │
   │     └─► tester (team-worker) [Rodar testes unitários/E2E]
   │
   └─► reviewer (team-builder) [Quality Gate Obrigatório]
         ├─► secops (team-heavy) [Auditar auth/injeções]
         └─► Veredito Final: PASS ou FAIL (com evidência)
```
