/**
 * CI guard: fails if any "use client" file imports the service role key or createServiceClient.
 * Run: node scripts/check-service-key.mjs
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const SRC = new URL("../src", import.meta.url).pathname;
const FORBIDDEN_IMPORTS = ["createServiceClient", "SUPABASE_SERVICE_ROLE_KEY", "supabase/server"];

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if ([".ts", ".tsx"].includes(extname(entry))) {
      files.push(full);
    }
  }
  return files;
}

let violations = 0;

for (const file of walk(SRC)) {
  const content = readFileSync(file, "utf-8");
  if (!content.includes('"use client"') && !content.includes("'use client'")) continue;
  for (const forbidden of FORBIDDEN_IMPORTS) {
    if (content.includes(forbidden)) {
      console.error(`[FAIL] Client file imports server-only resource "${forbidden}":\n  ${file}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\n${violations} violation(s) found. Build aborted.`);
  process.exit(1);
} else {
  console.log("Service-key guard: OK");
}
