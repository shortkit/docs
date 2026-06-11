/**
 * Flags SDK version strings in MDX content that aren't in versions.json.
 * Run after bumping versions.json on a release to find every stale mention.
 *
 * Usage: node scripts/check-versions.mjs   (exit 1 if stale versions found)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const versions = JSON.parse(readFileSync(path.join(root, 'versions.json'), 'utf8'));
const allowed = new Set(
  Object.entries(versions)
    .filter(([k]) => k !== 'comment' && k !== 'allowedOther')
    .map(([, v]) => v)
    .concat(versions.allowedOther ?? []),
);

const VERSION_RE = /\b0\.\d+\.\d+\b/g;
const issues = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    // the changelog legitimately references historical versions
    if (p.includes(`${path.sep}changelog`)) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (entry.endsWith('.mdx')) {
      const lines = readFileSync(p, 'utf8').split('\n');
      lines.forEach((line, i) => {
        for (const m of line.matchAll(VERSION_RE)) {
          if (!allowed.has(m[0])) {
            issues.push(`${path.relative(root, p)}:${i + 1} unknown version ${m[0]}`);
          }
        }
      });
    }
  }
}

walk(path.join(root, 'content/docs'));

if (issues.length) {
  console.error(issues.join('\n'));
  process.exit(1);
}
console.log('versions clean');
