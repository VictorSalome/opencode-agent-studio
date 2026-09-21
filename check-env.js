const { execSync } = require('child_process');
const os = require('os');

const isWin = os.platform() === 'win32';
const checkCmd = isWin ? 'where' : 'command -v';

const tools = ['node', 'npm', 'npx'];

console.log('Checking environment tools...\n');

tools.forEach((tool) => {
  try {
    const result = execSync(`${checkCmd} ${tool}`, { stdio: 'pipe' }).toString().trim();
    // On Windows, `where` might return multiple lines. Take the first one.
    const path = isWin ? result.split('\n')[0].trim() : result;
    console.log(`[OK] ${tool} found at: ${path}`);
  } catch (err) {
    console.log(`[FAIL] ${tool} missing from PATH.`);
  }
});
