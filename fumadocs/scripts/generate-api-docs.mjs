/**
 * Generates MDX endpoint pages from the public OpenAPI snapshot.
 * Run after scripts/build-openapi.mjs. Output is committed.
 *
 * Usage: node scripts/generate-api-docs.mjs
 */
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
// relative input so generated MDX references a portable path (run from app root)
process.chdir(root);

const openapi = createOpenAPI({
  input: ['./openapi/openapi.public.json'],
});

// clean slugs: "Get content" under tag "Content" -> content/get-content.mdx
const overlay = JSON.parse(readFileSync('./openapi/overlay.json', 'utf8'));

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

await generateFiles({
  input: openapi,
  output: './content/docs/api',
  per: 'operation',
  groupBy: 'tag',
  name: (output) => {
    if (output.type === 'operation') {
      const key = `${output.item.method.toUpperCase()} ${output.item.path}`;
      const op = overlay.operations[key];
      if (op) return slugify(op.summary);
    }
    return output.item.name;
  },
});

// Write a meta.json into each generated tag folder so the collapsible folder
// title shows the proper tag casing (e.g. "Live Streams", "Ad Configuration").
// These folders are the sidebar's collapsible sections — no separator needed.
for (const tag of overlay.tags ?? []) {
  const dir = path.join('./content/docs/api', slugify(tag.name));
  writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ title: tag.name }, null, 2) + '\n');
}
console.log(`wrote ${(overlay.tags ?? []).length} group meta.json titles`);
