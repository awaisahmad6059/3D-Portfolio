const RESET_EPOCH_MS = 1789038664 * 1000;
const wait = Math.max(0, RESET_EPOCH_MS - Date.now() + 15000);

if (wait > 0) {
  console.log(`waiting ${Math.round(wait / 1000)}s for GitHub quota reset...`);
  await new Promise((r) => setTimeout(r, wait));
}

console.log("quota should be reset — running snapshot sync...");
await import("./sync-snapshot.mjs");
