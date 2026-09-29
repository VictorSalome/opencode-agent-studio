#!/usr/bin/env node

/**
 * Hook PostToolUse: Auto-Format pós-edição/escrita.
 * Formata silenciosamente arquivos de código recém-escritos com prettier.
 * ponytail: stdlib child_process.execFile + global prettier; upgrade path: biome/eslint per project.
 */

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

let inputBuffer = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputBuffer += chunk;
});

process.stdin.on('end', () => {
  try {
    if (!inputBuffer.trim()) {
      process.exit(0);
    }

    const payload = JSON.parse(inputBuffer);
    const { tool_name, tool_input, cwd } = payload;

    if (tool_name !== 'Write' && tool_name !== 'Edit') {
      process.exit(0);
    }

    const rawPath = tool_input?.file_path;
    if (!rawPath) {
      process.exit(0);
    }

    const resolvedPath = path.isAbsolute(rawPath)
      ? rawPath
      : path.resolve(cwd || process.cwd(), rawPath);

    if (!fs.existsSync(resolvedPath)) {
      process.exit(0);
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const FORMATTABLE = new Set([
      '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
      '.html', '.htm', '.css', '.scss', '.json',
      '.md', '.markdown', '.yaml', '.yml', '.vue'
    ]);

    if (!FORMATTABLE.has(ext)) {
      process.exit(0);
    }

    // Executa prettier de forma assíncrona tolerante a falhas
    execFile('prettier', ['--write', resolvedPath], { timeout: 5000 }, () => {
      // Ignora stdout/stderr para não poluir o transcript do Claude
      process.exit(0);
    });
  } catch {
    process.exit(0);
  }
});
