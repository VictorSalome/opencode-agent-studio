const http = require('http');

const JEV_HOST = '127.0.0.1';
const JEV_PORT = 20128;
const JEV_PATH = '/v1/systemone';
const JEV_TOKEN = 'sk-6f30c8b06dc6eee8-zv4y2k-64af2432';
const JEV_MODEL = 'oc/jev-1.13-free';

/**
 * Executa uma requisição ao Jev System One
 */
function askJevOnce(state, questions, timeoutMs) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: JEV_MODEL,
      state: String(state || ''),
      questions
    });

    const req = http.request(
      {
        hostname: JEV_HOST,
        port: JEV_PORT,
        path: JEV_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JEV_TOKEN}`,
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: timeoutMs
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Jev HTTP ${res.statusCode}: ${data}`));
          }
          try {
            const parsed = JSON.parse(data);
            const result = {};
            if (parsed.answers) {
              for (const [key, val] of Object.entries(parsed.answers)) {
                if (!val) continue;
                if (typeof val.noul === 'number') {
                  result[key] = val.noul;
                } else if (val.choice !== undefined) {
                  result[key] = {
                    choice: val.choice,
                    confidence: typeof val.confidence === 'number' ? val.confidence : 1,
                    probabilities: val.probabilities || {}
                  };
                }
              }
            }
            resolve(result);
          } catch (e) {
            reject(new Error(`Erro parse Jev: ${e.message}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Jev timeout'));
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

/**
 * Consulta o System One (Jev) via 9Router com 1 retry rápido (técnica jev-gateway)
 * Suporta perguntas noul e choice com validação tipada.
 * @param {string} state - Contexto a avaliar
 * @param {Record<string, any>} questions - Perguntas tipadas
 * @param {number} timeoutMs - Timeout em milissegundos
 * @returns {Promise<Record<string, any>>}
 */
async function askJev(state, questions, timeoutMs = 4000) {
  try {
    return await askJevOnce(state, questions, timeoutMs);
  } catch {
    await new Promise((r) => setTimeout(r, 100));
    return await askJevOnce(state, questions, timeoutMs);
  }
}

/**
 * Verifica perigo do comando com validação cruzada (destruição + necessidade de confirmação)
 * Técnica inspirada no jev-gateway: cross-check noul
 * @param {string} command
 * @returns {Promise<number>} Probabilidade ponderada de risco (0.0 a 1.0)
 */
async function checkCommandDanger(command) {
  try {
    const res = await askJev(command, {
      is_destructive: {
        type: 'noul',
        instructions:
          'Does this shell command permanently delete files, drop databases, force push git branches or wipe data?'
      },
      needs_confirmation: {
        type: 'noul',
        instructions:
          'Should a safe system ask human confirmation before running this command?'
      }
    });

    const isDestructive = typeof res.is_destructive === 'number' ? res.is_destructive : 0;
    const needsConfirm = typeof res.needs_confirmation === 'number' ? res.needs_confirmation : 0;

    return Math.max(isDestructive, needsConfirm);
  } catch {
    // Fail-open: se Jev estiver fora, retorna 0 para não travar
    return 0;
  }
}

/**
 * Classifica a persona de engenharia ideal com choice + noul cross-check
 * @param {string} task
 * @returns {Promise<{ agent: string, confidence: number, needsSpecialist: number }>}
 */
async function classifyTaskAgent(task) {
  try {
    const res = await askJev(task, {
      target_agent: {
        type: 'choice',
        instructions: 'Which engineering specialist subagent should handle this task?',
        criteria: {
          designer: 'UI/UX, CSS, Tailwind, layouts, animations, mobile design',
          architect: 'Backend API, DB schemas, system architecture, core logic',
          secops: 'Security audit, OWASP, pentest, vulnerability check, auth hardening',
          tester: 'Writing test suites, end-to-end tests, Playwright, integration testing, QA',
          reviewer: 'Code review, PR diff audit, clean code standards',
          documenter: 'Technical documentation, architecture diagrams, README',
          explorer: 'Codebase search, file mapping, quick investigation',
          analyst: 'Requirements gathering, scope breakdown, planning, user stories',
          none: 'General conversational question, no engineering action needed'
        }
      },
      needs_specialist: {
        type: 'noul',
        instructions: 'Does this task require delegating to a specialist subagent?'
      }
    });

    const target = res.target_agent;
    const needsSpecialist = typeof res.needs_specialist === 'number' ? res.needs_specialist : 0.5;

    if (target && target.choice && target.choice !== 'none') {
      return {
        agent: target.choice,
        confidence: target.confidence,
        needsSpecialist
      };
    }

    return { agent: 'none', confidence: 0, needsSpecialist };
  } catch {
    return { agent: 'none', confidence: 0, needsSpecialist: 0 };
  }
}

module.exports = {
  askJev,
  checkCommandDanger,
  classifyTaskAgent
};
