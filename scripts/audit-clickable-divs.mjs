#!/usr/bin/env node
/**
 * Audit script: find clickable div/span patterns that should be semantic buttons/links.
 * Heuristics:
 *  - div/span with onClick
 *  - role="button"/role="link" on non-interactive elements
 *  - tabIndex>=0 on non-interactive elements
 *
 * Prints file:line with matched code lines.
 */

import { globby } from 'globby';
import fs from 'fs/promises';

const roots = [
  'client/src/**/*.tsx',
  'client/src/**/*.ts',
  'server/**/*.ts',
];

const patterns = [
  { re: /<(div|span)[^>]*onClick=/i, kind: 'onClick' },
  { re: /<(div|span)[^>]*role=("|')button\2/i, kind: 'roleButton' },
  { re: /<(div|span)[^>]*role=("|')link\2/i, kind: 'roleLink' },
  { re: /<(div|span)[^>]*tabIndex=\{?\s*0\s*\}?/i, kind: 'tabIndex' },
];

function suggestion(kind, tag) {
  const doc = 'ACCESSIBILITY_PATTERNS.md';
  switch (kind) {
    case 'onClick':
    case 'roleButton':
      return `Replace <${tag}> with <button> for actions. Add type="button", aria-label if icon-only, and focus-visible styles. See ${doc}.`;
    case 'roleLink':
      return `Replace <${tag}> with <a> for navigation. Ensure href is present and accessible name provided. See ${doc}.`;
    case 'tabIndex':
      return `Avoid tabIndex on non-interactive elements. Use native <button>/<a> or add proper semantics only when necessary. See ${doc}.`;
    default:
      return `Review semantics and convert to native interactive element. See ${doc}.`;
  }
}

(async () => {
  const files = await globby(roots, { gitignore: true });
  let count = 0;
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, idx) => {
      for (const { re, kind } of patterns) {
        const match = re.exec(line);
        if (match) {
          const tag = match[1] || 'div';
          count++;
          console.log(`${file}:${idx + 1}: ${line.trim()}`);
          console.log(`  Suggestion: ${suggestion(kind, tag)}`);
          break;
        }
      }
    });
  }
  console.error(`\nAudit complete. Potential issues found: ${count}`);
})();
