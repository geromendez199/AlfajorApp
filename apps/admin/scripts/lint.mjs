#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const currentDir = new URL('.', import.meta.url).pathname;
const adminRoot = join(currentDir, '..');
const ignoreDirs = new Set(['node_modules', '.next', 'build', 'dist', '.turbo']);
const lintedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);

const issues = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      walk(join(dir, entry.name));
    } else if (lintedExtensions.has(extname(entry.name))) {
      lintFile(join(dir, entry.name));
    }
  }
}

function lintFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (/\s+$/.test(line)) {
      issues.push(`${filePath}: Trailing whitespace on line ${lineNumber}`);
    }
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push(`${filePath}: TODO/FIXME left on line ${lineNumber}`);
    }
  });

  if (!content.endsWith('\n')) {
    issues.push(`${filePath}: File must end with a newline`);
  }
}

walk(adminRoot);

if (issues.length) {
  console.error('Lint failed with the following issues:\n');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exitCode = 1;
} else {
  console.log('Lint succeeded: admin sources are clean.');
}
