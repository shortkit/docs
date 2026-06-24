/**
 * Builds the committed public OpenAPI snapshot from the raw FastAPI dump.
 *
 * - Allowlists public endpoints (fail closed: anything not listed is dropped).
 * - Keeps only schemas transitively referenced by kept operations.
 * - Scrubs vendor terminology; the build FAILS if any kept content still
 *   matches a forbidden pattern after the overlay is applied.
 * - Merges docs-owned prose from overlay.json (descriptions live in the docs
 *   repo, not in API source code).
 *
 * Usage: node scripts/build-openapi.mjs
 * Input: openapi/openapi.full.json (raw dump, gitignored)
 * Output: openapi/openapi.public.json (committed)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const spec = JSON.parse(readFileSync(path.join(root, 'openapi/openapi.full.json'), 'utf8'));
const overlay = JSON.parse(readFileSync(path.join(root, 'openapi/overlay.json'), 'utf8'));

// Public endpoint allowlist: "METHOD /path". Extend as endpoints are documented.
const ALLOW = new Set(Object.keys(overlay.operations));

const FORBIDDEN = /\b(mux|livekit|oci|gcp|google cloud|cloud run|pubsub|alembic|googleapis\.com|amazonaws\.com)\b/i;

// --- filter paths ---------------------------------------------------------
const paths = {};
for (const [route, methods] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    const key = `${method.toUpperCase()} ${route}`;
    if (!ALLOW.has(key)) continue;
    const { responseExamples, ...entry } = overlay.operations[key];
    const merged = { ...op, ...entry };
    // FastAPI routers return raw dicts (no response_model), so the dumped
    // schema has empty 2xx bodies — docs-owned examples fill them in.
    for (const [status, example] of Object.entries(responseExamples ?? {})) {
      merged.responses ??= {};
      // `$examples` (a named map) emits OpenAPI `examples` for endpoints whose
      // response shape varies (e.g. video vs carousel upload); otherwise a
      // single `example`.
      const media = example && example.$examples
        ? { examples: example.$examples }
        : { example };
      merged.responses[status] = {
        description: merged.responses[status]?.description ?? 'Successful response',
        content: { 'application/json': media },
      };
    }
    paths[route] ??= {};
    paths[route][method] = merged;
  }
}
if (Object.values(paths).length === 0) throw new Error('no operations kept — allowlist empty?');

// --- collect transitively referenced schemas ------------------------------
const kept = new Set();
function collectRefs(node) {
  if (Array.isArray(node)) return node.forEach(collectRefs);
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === '$ref' && typeof v === 'string') {
        const name = v.split('/').pop();
        if (!kept.has(name)) {
          kept.add(name);
          collectRefs(spec.components?.schemas?.[name]);
        }
      } else collectRefs(v);
    }
  }
}
collectRefs(paths);
const schemas = Object.fromEntries(
  Object.entries(spec.components?.schemas ?? {}).filter(([name]) => kept.has(name)),
);

// --- assemble -------------------------------------------------------------
const out = {
  openapi: spec.openapi,
  info: overlay.info,
  servers: overlay.servers,
  tags: overlay.tags,
  paths,
  components: { schemas, securitySchemes: overlay.securitySchemes },
};

// --- scrub replacements (overlay-driven), then gate (fail closed) ----------
let serialized = JSON.stringify(out, null, 2);
for (const [from, to] of Object.entries(overlay.replacements ?? {})) {
  serialized = serialized.split(from).join(to);
}
const leak = serialized.match(FORBIDDEN);
if (leak) {
  throw new Error(
    `vendor/internal term "${leak[0]}" still present in public spec — fix the overlay or extend the scrub`,
  );
}

writeFileSync(path.join(root, 'openapi/openapi.public.json'), serialized);
console.log(
  `wrote openapi.public.json: ${Object.keys(paths).length} paths, ${Object.keys(schemas).length} schemas`,
);
