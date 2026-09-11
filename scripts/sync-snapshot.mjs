import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const USER = "awaisahmad6059";
const OUT = fileURLToPath(new URL("../src/data/snapshot.json", import.meta.url));
const DELAY = 200;

const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": `snapshot-sync/${USER}`,
};
if (token) headers.Authorization = `Bearer ${token}`;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function gh(path) {
  const url = `https://api.github.com${path}`;
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, { headers });
    if (res.ok) return res.json();
    if (res.status === 403 || res.status === 429) return null;
    await delay(1200 * (i + 1));
  }
  return null;
}

function langsFromBytes(langBytes) {
  const total = Object.values(langBytes).reduce((a, b) => a + b, 0);
  if (total <= 0) return [];
  return Object.entries(langBytes)
    .map(([name, bytes]) => ({
      name,
      pct: Math.round((bytes / total) * 1000) / 10,
    }))
    .filter((l) => l.pct > 0)
    .sort((a, b) => b.pct - a.pct);
}

const list = (await gh(`/users/${USER}/repos?per_page=100&sort=updated`)) || [];
if (!Array.isArray(list)) {
  console.error("failed to fetch repo list via API (rate limited?)");
  process.exit(1);
}

const repos = [];
let langFailures = 0;
for (const r of list) {
  if (r.fork) continue;
  let languages = [];
  const bytes = await gh(`/repos/${USER}/${r.name}/languages`);
  if (bytes && typeof bytes === "object") {
    languages = langsFromBytes(bytes);
  } else {
    langFailures++;
  }

  repos.push({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description || "",
    homepage: r.homepage,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    topics: r.topics || [],
    pushedAt: r.pushed_at,
    htmlUrl: r.html_url,
    languages,
  });
  await delay(DELAY);
}

if (langFailures > 0) {
  console.error(
    `aborting: ${langFailures} language request(s) failed (rate limited?). ` +
      `Existing snapshot left untouched.`
  );
  process.exit(1);
}

repos.sort((a, b) => (b.pushedAt || "").localeCompare(a.pushedAt || ""));
await writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), repos }, null, 2));

console.log(`snapshot written: ${repos.length} repos -> ${OUT}`);
console.log(
  repos.map((r) => `${r.name} | home:${r.homepage || "-"} | langs:${r.languages.map((l) => `${l.name}=${l.pct}%`).join(",") || "-"}`).join("\n")
);