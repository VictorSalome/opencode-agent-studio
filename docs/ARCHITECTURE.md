# ARQUITETURA DE ORQUESTRAÇÃO HIERÁRQUICA E DINÂMICA DO OPENCODE (V2)

Este documento descreve a esteira de multi-agentes automatizada por demanda implementada no OpenCode.

---

## 1. MECANISMO DE EXECUÇÃO

- **Agente Principal (Diretor):** `Manager` (bloqueado de usar `edit` e `bash` fisicamente pelo plugin `@beremaran/opencode-agent-tree`).
- **Roteamento Dinâmico:** O `Manager` classifica o pedido do usuário e despacha a tarefa de construção sob demanda para o especialista adequado.
- **Quality Gate Universal:** O último passo de QUALQUER plano é obrigatoriamente a auditoria cega do `reviewer`. Nenhuma tarefa é encerrada sem o carimbo `PASS`.

---

## 2. CONSTITUIÇÃO DE ENGENHARIA SÊNIOR (5 REGRAS INVIOLÁVEIS)

Todos os agentes (Manager, Construtores e Reviewer) operam sob estas leis estritas. Qualquer violação acarreta **`FAIL` IMEDIATO** na revisão:

1. **Escopo Fechado (Zero Danos Colaterais):** É expressamente PROIBIDO alterar, renomear ou reformatar arquivos fora do escopo estrito da tarefa. Modifique apenas o necessário.
2. **Zero Gambiarras de Tipagem:** PROIBIDO usar `any`, `// @ts-ignore`, `// @ts-expect-error` ou desabilitar regras do linter (`/* eslint-disable */`). Erros de tipagem DEVEM ser resolvidos corrigindo as interfaces.
3. **Código 100% Funcional (Zero Placeholders):** PROIBIDO deixar funções pela metade, stubs vazios ou comentários com `// TODO: implementar depois`. Entregue código real, testado e conectado.
4. **Blindagem de Segredos (Zero Hardcode):** NUNCA insira chaves de API, senhas ou tokens direto no código. Use sempre variáveis de ambiente (`process.env`) e atualize o `.env.example`.
5. **Preservação Absoluta de Testes:** É ESTRITAMENTE PROIBIDO apagar, comentar ou enfraquecer asserções de testes existentes para mascarar quebras. Se um teste existente falhou, corrija a implementação.

---

## 3. RESPEITO AO TOOLING (ZERO POLUIÇÃO DE DEPENDÊNCIAS)

- **Trabalhe com o que existe:** É expressamente PROIBIDO rodar comandos como `npm install`, `yarn add`, `pnpm add` ou `bun add` adicionando novas dependências ou bibliotecas sem autorização explícita do usuário.
- **Projetos sem Testes:** Se o projeto NÃO possuir framework de testes (Jest, Vitest, etc.) configurado no `package.json`, os agentes NÃO devem tentar instalar libs de teste e NÃO devem criar arquivos `.test.ts`. A validação é feita exclusivamente via análise estática, tipagem TypeScript estrita e lógica nativa.

---

## 4. EQUIPE DE AGENTES ESPECIALISTAS (SOB DEMANDA)

| Agente | Domínio / Especialidade | Skills Nativas Embutidas | Quando é Acionado? |
| :--- | :--- | :--- | :--- |
| **`architect`** | Backend, APIs & Lógica | `api-designer`, `fullstack-guardian` | Rotas, banco SQLite, CRUD, schemas, regras de negócio e tipagem. |
| **`designer`** | UI/UX & Frontend | `ui-ux-pro-max`, `tailwind-design-system`, `impeccable`, `framer-motion-animator` | Telas React, componentes visuais, Tailwind, animações, modais e layouts. |
| **`tester`** | Testes Ponta a Ponta (E2E) | `e2e-tester`, `webapp-testing`, `playwright-e2e-init` | Testes no navegador com Playwright (apenas quando solicitado ou já configurado). |
| **`secops`** | Pentesting & Segurança Ofensiva | `security-pentest`, `codeprobe-security`, `owasp-top-10` | Varredura de vulnerabilidades (SQLi, XSS, quebra de token, OWASP Top 10). |
| **`documenter`** | Documentação & Diagramas | `archify`, `docs`, `docx`, `pdf` | Diagramas interativos de arquitetura (SVG), fluxogramas e specs técnicas. |
| **`explore`** | Descoberta do Repositório | *Nativo* | Mapear pastas e investigar arquivos quando o projeto for gigante. |
| **`reviewer`** | **Quality Gate Final (Obrigatório)** | `code-review`, `gauntlet-loop` | **Sempre o último.** Avalia em 2 eixos (Fowler x Spec), audita a Constituição Sênior e emite `PASS`/`FAIL`. |

---

## 5. FLUXO CRONOLÓGICO SOB DEMANDA

```text
Usuário faz o pedido (sem burocracia de prompt)
                     │
                     ▼
                 [ MANAGER ]
                     │
         (Classifica a intenção no PLAN)
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    [ designer ] [ architect ] [ secops ] ... (Outros conforme o escopo)
         │           │           │
         └───────────┬───────────┘
                     ▼
          (Construção Concluída)
                     │
                     ▼
               [ reviewer ] 
   (Audita: Fowler + Spec + 5 Regras Sênior)
              ┌──────┴──────┐
              ▼             ▼
           [ FAIL ]      [ PASS ]
              │             │
    (Manda corrigir         ▼
     e repete)       Finaliza e entrega ao Usuário!
```

---

## 6. LOCALIZAÇÃO DOS ARQUIVOS

- Configuração Oficial: `~/.config/opencode/opencode.json`
- Documentação: `~/.opencode/docs/ARCHITECTURE.md`
- Binário OpenCode: `~/.opencode/bin/opencode`
