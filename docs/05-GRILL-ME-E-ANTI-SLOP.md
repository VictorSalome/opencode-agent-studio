# 05 - Protocolos Grill-Me, Anti-Slop e Evidence-Gated Audit

## 1. O Protocolo Grill-Me em 5 Estágios Formais

Antes de qualquer linha de código ser escrita em tarefas com escopo em aberto, o Orquestrador (ou o subagente `analyst`) percorre obrigatoriamente os 5 estágios:

```text
[ Pedido do Usuário ]
          │
          ▼
┌───────────────────────────────────────────────┐
│ ESTÁGIO 1: EXPLORE FIRST                      │
│ - Mineração autônoma de código/schemas        │
│ - Zero perguntas óbvias que o repo já responde│
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ ESTÁGIO 2: ÁRVORE DE DECISÃO                  │
│ - Mapear Escopo, Arquitetura, Bordas, Segurança│
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ ESTÁGIO 3: RODADAS NA FRONTEIRA               │
│ - Entrevista via tool `question`               │
│ - TODA pergunta DEVE ter opção (Recomendado)  │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ ESTÁGIO 4: APROFUNDAMENTO                     │
│ - Eliminar "depois a gente vê"                │
│ - Travar contratos e comportamentos padrão    │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ ESTÁGIO 5: SÍNTESE E SCOPE LOCK               │
│ - Emissão de Relatório de Decisões Travadas   │
│ - Despacho da equipe somente após o OK final  │
└───────────────────────────────────────────────┘
```

---

## 2. As 7 Leis de Design Anti-Slop

Aplicadas pelo subagente `designer` para erradicar a "estética genérica de IA":

1. **Tipografia com Identidade:** Proibido system fonts puras (Arial, Roboto, Inter padrão). Obrigatório Google Fonts no `<head>` (Syne, Plus Jakarta Sans, Space Grotesk, Cinzel). Títulos com tracking negativo (`letter-spacing: -0.02em` a `-0.04em`).
2. **Double-Bezel (Moldura Mecânica):** Todo card tátil possui container externo com borda fina translúcida (`border border-white/10`) e padding mínimo envolvendo container interno (`bg-neutral-950 border border-white/5`).
3. **Bento Grid Assimétrico:** Proibido 3 cards simétricos idênticos. Sempre utilizar hierarquia com card Hero ocupando 2 colunas e cards de suporte menores.
4. **Paleta Orgânica Profunda:** Fundos ultra-dark (#050505 a #0D0D0D) ou Creme Clássico (#FBF9F5). Proibido gradiente neon roxo genérico.
5. **Física de Movimento Real:** Curvas de aceleração inercial em CSS: `cubic-bezier(0.16, 1, 0.3, 1)`.
6. **Ergonomia Mobile:** Targets de toque de pelo menos 44px e `touch-action: manipulation`.
7. **Acessibilidade:** Regra `@media (prefers-reduced-motion: reduce)` em todo bloco de animação.

---

## 3. Evidence-Gated Audit (Auditoria por Evidência Mecânica)

Inspirado no framework `dm7ds/claude-code-framework`, o `reviewer` opera sob uma regra de ferro:

> **"Auto-relato verbal é proibido. O reviewer só emite PASS mediante evidência mecânica verificável."**

### Evidências Aceitas:
1. **Execução de Código:** Saída de comando com exit code 0 (`npm test`, `node -c`, `tsc --noEmit`).
2. **Evidência Visual:** Screenshot salvo no disco e inspecionado via Puppeteer MCP (`mcp__puppeteer__puppeteer_screenshot`).
3. **Diff Limpo:** `git diff` sem arquivos temporários, sem stubs vazios (`// TODO`) e sem quebra de escopo.

---

## 4. Registro de Aprendizado Contínuo (`pitfalls.md`)

Para garantir que o agente não repita os mesmos erros em sessões futuras:
- Toda falha, bug de borda ou regressão corrigida gera 3 linhas em `pitfalls.md` na raiz do projeto:
  * `[PROBLEMA]`: Sintoma exato e o que quebrou.
  * `[CAUSA]`: Motivo técnico fundamental.
  * `[REGRA PREVENTIVA]`: Diretriz de engenharia permanente para evitar reincidência.
- O `architect` e o `investigator` consultam o `pitfalls.md` existente no início da sessão.

---

## 5. Isolamento Concorrente com Git Worktree

Quando múltiplas tarefas independentes precisam ser executadas simultaneamente em um repositório Git:
- O Orquestrador passa `isolation: "worktree"` na chamada `Agent`.
- O Claude Code cria um worktree temporário em branch isolada.
- Os agentes trabalham em paralelo sem gerar conflitos de edição ou lock de arquivos.
- A integração só ocorre na branch principal após o carimbo `PASS` do `reviewer`.
