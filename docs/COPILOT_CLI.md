# GitHub Copilot CLI // Integração e Sinergia com o Agent Studio

O **GitHub Copilot CLI** atua no ecossistema como a ferramenta rápida de apoio cirúrgico direto no terminal, complementando o poder do **Claude Code** (orquestração profunda em árvore) e do **OpenCode** (soberania total de provedores e governança no engine).

---

## 1. Posicionamento Estratégico

| Ferramenta | Especialidade Principal | Quando Usar |
| :--- | :--- | :--- |
| **Claude Code (`claude-or`)** | Arquitetura multi-agente, raciocínio em árvore, testes visuais no navegador e automação pesada. | Novas features completas, sistemas fullstack, refatorações amplas e auditoria cega. |
| **OpenCode** | Roteamento multi-provedor (9Router, Ollama, OpenAI, Anthropic) com Default Deny físico no engine. | Ambientes corporativos, restrição física de ferramentas e tarefas orientadas a custos. |
| **GitHub Copilot CLI** | Execução atômica no terminal, comandos Git pontuais, criação de PRs e explicações rápidas. | Comandos de shell esquecidos, commits rápidos, abertura de PRs e scripts pontuais. |

---

## 2. Como Utilizar o Copilot CLI no Fluxo

### 1. Comandos de Shell e Git Inteligentes
Ao invés de tentar lembrar sintaxes complexas de Git ou ferramentas de sistema:
```bash
# Sugestão de comandos shell
gh copilot suggest "listar portas em escuta ordenadas por PID no macOS"

# Sugestão de comandos Git específicos
gh copilot suggest -t git "reverter último commit mantendo as alterações staged"
```

### 2. Explicação Rápida de Comandos Obscuros
Antes de rodar um comando potencialmente destrutivo sugerido por scripts legados:
```bash
gh copilot explain "find . -type f -name '*.log' -mtime +30 -exec rm -f {} +"
```

### 3. Fechamento de Ciclo (Git & Pull Requests)
Após o `reviewer` do Claude Code ou OpenCode emitir o carimbo `PASS`:
```bash
# Criação assistida do Pull Request via CLI
gh pr create --fill
```

---

## 3. Diretrizes de Coexistência Sem Conflitos

1. **Evite Concorrência Direta no Mesmo Repositório:** Não execute o Copilot CLI para gerar código no mesmo arquivo enquanto um subagente do Claude Code ou OpenCode estiver com a tarefa ativa.
2. **Use Copilot CLI para Infraestrutura e Git:** O Copilot CLI brilha em preparar branches, checar credenciais do GitHub CLI (`gh auth status`) e inspecionar logs de CI (`gh run list`).
