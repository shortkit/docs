/**
 * Generates MDX endpoint pages from the public OpenAPI snapshot.
 * Run after scripts/build-openapi.mjs. Output is committed.
 *
 * Usage: node scripts/generate-api-docs.mjs
 */
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';
import { readFileSync } from 'node:fs';
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

void generateFiles({
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
