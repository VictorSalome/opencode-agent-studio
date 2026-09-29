#!/usr/bin/env node

const fs = require('fs');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    fs.appendFileSync('/tmp/user-prompt-submit.log', input + '\n');
  } catch {}
  process.exit(0);
});
