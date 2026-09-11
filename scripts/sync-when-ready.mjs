import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function quotaState() {
  try {
    const rl = await (await fetch("https://api.github.com/rate_limit")).json();
    const core = rl?.resources?.core;
    return { remaining: core?.remaining ?? 0, reset: (core?.reset ?? 0) * 1000 };
  } catch {
    return { remaining: 0, reset: Date.now() + 30000 };
  }
}

async function waitForQuota(minRemaining) {
  while (true) {
    const { remaining, reset } = await quotaState();
    if (remaining >= minRemaining) {
      console.log(`[sync] quota ready (${remaining} remaining) — proceeding`);
      return;
    }
    const wait = Math.max(10000, reset - Date.now() + 10000);
    console.log(
      `[sync] quota ${remaining}/${minRemaining} needed — sleeping ${Math.round(
        wait / 1000
      )}s until ${new Date(reset).toLocaleTimeString()}`
    );
    await sleep(wait);
  }
}

const NEEDED = 55; // 1 (list) + ~47 (languages) + buffer for retries

console.log("[sync] waiting for GitHub quota window...");
await waitForQuota(NEEDED);

let ok = false;
for (let attempt = 1; attempt <= 4; attempt++) {
  console.log(`[sync] sync attempt ${attempt}`);
  try {
    execSync("node scripts/sync-snapshot.mjs", { cwd: ROOT, stdio: "inherit" });
    ok = true;
    break;
  } catch {
    console.log("[sync] attempt failed (quota race?) — backing off 60s");
    await sleep(60000);
    await waitForQuota(NEEDED);
  }
}

if (!ok) {
  console.error("[sync] FAILED after retries — keeping existing snapshot");
  process.exit(1);
}

console.log("[sync] snapshot complete — building...");
execSync("npm run build", { cwd: ROOT, stdio: "inherit" });
console.log("[sync] DONE — dist ready to deploy");