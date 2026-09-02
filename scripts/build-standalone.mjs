#!/usr/bin/env node
/**
 * Assembles a self-contained production bundle in .next/standalone.
 *
 * `next build` with `output: "standalone"` emits server.js plus a traced
 * node_modules, but deliberately leaves out three things we need on a single
 * host with no CDN:
 *
 *   1. public/ and .next/static  — not copied by design (docs assume a CDN).
 *   2. .env files                — server.js does process.chdir(__dirname),
 *                                  so a .env.local at the repo root is never
 *                                  read. It has to live inside standalone/.
 *   3. a usable `start` script   — the copied package.json inherits
 *                                  "next start", which is wrong in there.
 *
 * Run via: npm run build:standalone
 */
import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, ".next", "standalone");

if (!existsSync(OUT)) {
  console.error(
    "✗ .next/standalone not found.\n" +
      "  Run `next build` first, and check that next.config.ts sets output: \"standalone\".",
  );
  process.exit(1);
}

// 1. Static assets the minimal server expects to find beside it.
cpSync(join(ROOT, "public"), join(OUT, "public"), { recursive: true });
cpSync(join(ROOT, ".next", "static"), join(OUT, ".next", "static"), { recursive: true });
console.log("✓ copied public/ and .next/static");

// 2. Secrets — the server only sees env files in its own directory.
const envFiles = [".env", ".env.production", ".env.local", ".env.production.local"];
const copied = envFiles.filter((file) => {
  if (!existsSync(join(ROOT, file))) return false;
  cpSync(join(ROOT, file), join(OUT, file));
  return true;
});

if (copied.length > 0) {
  console.log(`✓ copied env file(s): ${copied.join(", ")}`);
} else {
  console.warn(
    "! no .env file found — set RESEND_API_KEY, CONTACT_TO_EMAIL and\n" +
      "  CONTACT_FROM_EMAIL as real environment variables, or the contact\n" +
      "  form will answer 503 (see DEPLOY.md).",
  );
}

// 3. Make `npm start` work inside standalone/, for panels that run it that way.
const pkgPath = join(OUT, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.scripts = { start: "node server.js" };
delete pkg.devDependencies;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log('✓ standalone package.json start script set to "node server.js"');

console.log(
  `\nBundle ready: ${OUT}\n` +
    "Start it with:  PORT=3000 node server.js   (from inside that directory)",
);
