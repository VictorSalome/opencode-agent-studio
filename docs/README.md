# Claude-OR // Documentação Técnica do Ecossistema

Este diretório contém a documentação completa da instância isolada `claude-or`, integrada ao 9Router com suíte de modelos de time, governança por hooks, delegação de subagentes em árvore, testes visuais por MCP e auditoria por evidências.

## Índice de Documentos

1. [01 - Arquitetura e Roteamento](./01-ARQUITETURA-E-ROTEAMENTO.md)
   - Launcher `~/.local/bin/claude-or`
   - Proxy sanitizador de schemas (porta 20129 -> 20128)
   - Auto-cura de portas e bypass de janela de contexto
   - Mapeamento da suíte de Modelos de Time (`team-*`)

2. [02 - Matriz de Subagentes e Delegação](./02-SUBAGENTES-E-DELEGACAO.md)
   - Catálogo dos 9 subagentes nativos em `~/.claude-or/agents/`
   - Hierarquia de delegação aninhada (Árvore de Execução)
   - Ferramentas autorizadas por função (Default Deny)

3. [03 - Hooks e Governança Mecânica](./03-HOOKS-E-GOVERNANCA.md)
   - Hook `PreToolUse`: Bloqueio mecânico de escrita na sessão raiz
   - Hook `PostToolUse`: Auto-formatação silenciosa com Prettier
   - Configuração no `settings.json`

4. [04 - MCPs e Automação Visual](./04-MCPS-E-TESTES-VISUAIS.md)
   - Servidor MCP Puppeteer (`mcp__puppeteer`) para testes visuais e screenshots
   - Servidor MCP GitHub (`mcp__github`) para gestão de repositórios e PRs
   - Regras de permissão wildcard em `permissions.allow`

5. [05 - Protocolos Grill-Me, Anti-Slop e Evidence-Gated Audit](./05-GRILL-ME-E-ANTI-SLOP.md)
   - Protocolo Grill-Me em 5 Estágios Formais
   - As 7 Leis de Design Anti-Slop (Double-Bezel, Tipografia, Spring Physics)
   - Evidence-Gated Audit: Veredito factual obrigatório
   - Registro de aprendizado contínuo (`pitfalls.md`) e Git Worktrees

6. [06 - Task Cards e Orquestração Avançada](./06-TASK-CARDS-E-ORQUESTRACAO-AVANCADA.md)
   - Contrato por Task Card estruturado em YAML
   - Wave Scheduling (execução paralela em 4 ondas)
   - Circuit Breaker (disjuntor de 2 retentativas com auto-rollback)
   - Hook `SessionStart`: Injeção automática de inteligência do repositório

7. [07 - Jev System One](./07-JEV-SYSTEM-ONE.md)
   - Integração do endpoint `http://localhost:20128/v1/systemone`
   - Biblioteca cliente `hooks/lib/jev.js`
   - Guardrail de comandos Bash em `PreToolUse`
   - Classificação semântica instantânea de subagentes


