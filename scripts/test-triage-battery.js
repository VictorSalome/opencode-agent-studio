const { classifyTaskAgent } = require('/Users/victorsalome/.claude-or/hooks/lib/jev.js');
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(process.env.HOME, '.codex', 'skills');

const TEST_CASES = [
  {
    name: 'designer',
    prompt: 'Preciso de um componente de card interativo com Tailwind CSS, micro-animação de hover no Framer Motion e suporte a modo escuro.',
    expectedAgent: 'designer',
    expectedSkills: ['tailwind-design-system', 'framer-motion-animator']
  },
  {
    name: 'architect',
    prompt: 'Desenhe uma arquitetura de API REST com Express e rotas protegidas, além de otimizar queries SQL no PostgreSQL para alta concorrência.',
    expectedAgent: 'architect',
    expectedSkills: ['nodejs-backend-patterns', 'api-designer', 'database-optimizer']
  },
  {
    name: 'secops',
    prompt: 'Faça um pentest e auditoria de vulnerabilidades neste endpoint de login procurando falhas OWASP Top 10, SQL injection e CSRF.',
    expectedAgent: 'secops',
    expectedSkills: ['codeprobe-security', 'owasp-top-10', 'web-security']
  },
  {
    name: 'tester',
    prompt: 'Crie uma suite completa de testes E2E com Playwright para o fluxo de checkout e pagamento do e-commerce.',
    expectedAgent: 'tester',
    expectedSkills: ['e2e-tester', 'playwright-e2e-init']
  },
  {
    name: 'reviewer',
    prompt: 'Revise este PR com foco em clean code, remoção de código morto e checagem de regressões arquiteturais.',
    expectedAgent: 'reviewer',
    expectedSkills: ['code-review', 'ponytail-review']
  },
  {
    name: 'documenter',
    prompt: 'Escreva a documentação técnica desta API e gere diagramas Mermaid de fluxo e sequência dos microsserviços.',
    expectedAgent: 'documenter',
    expectedSkills: ['docs', 'archify']
  },
  {
    name: 'explorer',
    prompt: 'Investigue a causa raiz deste bug intermitente de race condition vasculhando os arquivos do repositório.',
    expectedAgent: 'explorer',
    expectedSkills: ['diagnosing-bugs']
  },
  {
    name: 'analyst',
    prompt: 'Refine os requisitos deste módulo de faturamento, quebre em estórias de usuário e defina critérios de aceitação rigorosos.',
    expectedAgent: 'analyst',
    expectedSkills: ['feature-arch', 'gauntlet-loop']
  }
];

async function run() {
  console.log('=== Bateria de Testes: Jev System One + Subagentes + Skills ===\n');

  let passed = 0;
  for (const tc of TEST_CASES) {
    process.stdout.write(`[TEST] Persona: ${tc.name.padEnd(11)} ... `);
    try {
      const res = await classifyTaskAgent(tc.prompt);
      const selected = res.agent;
      const ok = selected === tc.expectedAgent;

      // Valida se skills existem no disco
      const missingSkills = tc.expectedSkills.filter(
        (s) => !fs.existsSync(path.join(SKILLS_DIR, s, 'SKILL.md'))
      );

      if (ok && missingSkills.length === 0) {
        console.log(`OK (Jev: ${selected} | Conf: ${(res.confidence * 100).toFixed(0)}% | Skills: ${tc.expectedSkills.join(', ')})`);
        passed++;
      } else {
        console.log(`FALHOU (Esperado: ${tc.expectedAgent}, Jev: ${selected}, Faltam skills: ${missingSkills.join(', ') || 'nenhuma'})`);
      }
    } catch (err) {
      console.log(`ERRO: ${err.message}`);
    }
  }

  console.log(`\nResultado Triagem Jev: ${passed}/${TEST_CASES.length} aprovados.\n`);
}

run();
