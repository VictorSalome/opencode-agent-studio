const http = require('http');

const JEV_HOST = '127.0.0.1';
const JEV_PORT = 20128;
const JEV_PATH = '/v1/systemone';
const JEV_TOKEN = 'sk-6f30c8b06dc6eee8-zv4y2k-64af2432';
const JEV_MODEL = 'oc/jev-1.13-free';

/**
 * Consulta o System One (Jev) via 9Router
 * @param {string} state - Contexto a avaliar
 * @param {Record<string, { type: 'noul', instructions: string }>} questions - Perguntas tipadas
 * @param {number} timeoutMs - Timeout em milissegundos
 * @returns {Promise<Record<string, number>>} Mapa com probabilidades (0.0 a 1.0)
 */
function askJev(state, questions, timeoutMs = 2500) {
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
                if (val && typeof val.noul === 'number') {
                  result[key] = val.noul;
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
 * Verifica probabilidade de comando bash ser destrutivo
 * @param {string} command
 * @returns {Promise<number>} Probabilidade de destruição (0.0 a 1.0)
 */
async function checkCommandDanger(command) {
  try {
    const res = await askJev(command, {
      is_destructive: {
        type: 'noul',
        instructions:
          'Does this shell command permanently delete files, drop databases, force push git branches or wipe data?'
      }
    });
    return res.is_destructive ?? 0;
  } catch {
    // Fail-safe: se Jev estiver fora, retorna 0 para não travar
    return 0;
  }
}

/**
 * Classifica a persona de engenharia mais indicada para a tarefa
 * @param {string} task
 * @returns {Promise<{ agent: string, confidence: number }>}
 */
async function classifyTaskAgent(task) {
  try {
    const res = await askJev(task, {
      is_ui: {
        type: 'noul',
        instructions: 'Is this task mainly about frontend, UI/UX, styling, Tailwind, components, or visual layouts?'
      },
      is_backend: {
        type: 'noul',
        instructions: 'Is this task mainly about backend APIs, database models, business logic, or server routes?'
      },
      is_secops: {
        type: 'noul',
        instructions: 'Is this task about penetration testing, security auditing, tokens, or vulnerabilities?'
      },
      is_tester: {
        type: 'noul',
        instructions: 'Is this task about E2E tests, browser automation, or test suites?'
      }
    });

    const candidates = [
      { agent: 'designer', prob: res.is_ui || 0 },
      { agent: 'architect', prob: res.is_backend || 0 },
      { agent: 'secops', prob: res.is_secops || 0 },
      { agent: 'tester', prob: res.is_tester || 0 }
    ].sort((a, b) => b.prob - a.prob);

    return { agent: candidates[0].agent, confidence: candidates[0].prob };
  } catch {
    return { agent: 'architect', confidence: 0 };
  }
}

module.exports = {
  askJev,
  checkCommandDanger,
  classifyTaskAgent
};
