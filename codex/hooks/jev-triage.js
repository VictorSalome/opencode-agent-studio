#!/usr/bin/env node
/**
 * Jev System One Triage Hook for Codex CLI
 * Intercepta prompts e injeta contexto de roteamento e skills via 9Router.
 */

const { classifyTaskAgent } = require('/Users/victorsalome/.claude-or/hooks/lib/jev.js');
const fs = require('fs');

const SKILL_MAP = {
  designer: ['framer-motion-animator', 'tailwind-design-system', 'frontend-design', 'ui-ux-pro-max', 'apple-design'],
  architect: ['nodejs-backend-patterns', 'api-designer', 'database-optimizer', 'sql-pro', 'clean-code-principles'],
  secops: ['codeprobe-security', 'owasp-top-10', 'web-security', 'secure-code-guardian'],
  tester: ['e2e-tester', 'playwright-e2e-init', 'webapp-testing', 'e2e-testing-patterns'],
  reviewer: ['code-review', 'code-review-skill', 'ponytail-review'],
  documenter: ['docs', 'documentation', 'archify'],
  explorer: ['diagnosing-bugs', 'agent-browser'],
  analyst: ['feature-arch', 'grill-me', 'gauntlet-loop']
};

async function main() {
  let inputData = '';
  try {
    inputData = fs.readFileSync(0, 'utf-8');
  } catch {}

  let prompt = '';
  try {
    if (inputData.trim()) {
      const parsed = JSON.parse(inputData);
      prompt = parsed.prompt || parsed.text || inputData;
    }
  } catch {
    prompt = inputData;
  }

  // Fallback se prompt vier como argumento CLI
  if (!prompt && process.argv[2]) {
    prompt = process.argv.slice(2).join(' ');
  }

  if (!prompt || !prompt.trim()) {
    console.log(JSON.stringify({}));
    return;
  }

  try {
    const triage = await classifyTaskAgent(prompt);

    if (triage.agent && triage.agent !== 'none') {
      const skills = SKILL_MAP[triage.agent] || [];
      const additionalContext = [
        '<jev_system_one_triage>',
        `  <target_agent>${triage.agent}</target_agent>`,
        `  <confidence>${(triage.confidence * 100).toFixed(0)}%</confidence>`,
        `  <recommended_skills>${skills.join(', ')}</recommended_skills>`,
        `  <directive>Atue como especialista '${triage.agent}' aplicando rigorosamente as diretrizes das skills vinculadas.</directive>`,
        '</jev_system_one_triage>'
      ].join('\n');

      const response = {
        hookSpecificOutput: {
          additionalContext: additionalContext
        }
      };

      console.log(JSON.stringify(response));
      return;
    }
  } catch (err) {
    // Fail-open silencioso
  }

  console.log(JSON.stringify({}));
}

main();
