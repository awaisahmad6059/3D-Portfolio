export interface RepoLang {
  name: string;
  pct: number;
}

export interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  pushedAt: string;
  htmlUrl: string;
  languages: RepoLang[];
}

import snapshot from "../data/snapshot.json";

const SEED_REPOS = (snapshot as { repos: Repo[] }).repos ?? [];

export const GITHUB_USER = "awaisahmad6059";

const LIST_KEY = "github-repos-v1";
const LANGS_KEY = "github-repos-langs-v1";
const LIST_TTL = 6 * 60 * 60 * 1000;
const LANGS_TTL = 24 * 60 * 60 * 1000;

let inflight: Promise<Repo[]> | null = null;
let usedSeed = false;

export const isSeedUsed = () => usedSeed;

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

const token = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
if (token) headers.Authorization = `Bearer ${token}`;

const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5",
  Dart: "#00B4AB",
  Kotlin: "#A97BFF",
  JavaScript: "#F1E05A",
  TypeScript: "#3178C6",
  HTML: "#E34C26",
  CSS: "#663399",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Ruby: "#701516",
  Swift: "#F05138",
  PHP: "#4F5D95",
  Shell: "#89E051",
  Makefile: "#427819",
  "Jupyter Notebook": "#DA5B0B",
};

export const langColor = (lang: string | null) =>
  (lang && LANG_COLORS[lang]) || "#4ade80";

export const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

interface ListCache {
  ts: number;
  repos: Repo[];
}

interface LangsCache {
  ts: number;
  data: Record<string, Record<string, number>>;
}

function readList(): ListCache | null {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListCache;
    if (!parsed || !Array.isArray(parsed.repos)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeList(entry: ListCache) {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(entry));
  } catch {
    /* ignore quota errors */
  }
}

function readLangs(): LangsCache | null {
  try {
    const raw = localStorage.getItem(LANGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LangsCache;
    if (!parsed || typeof parsed.data !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLangs(entry: LangsCache) {
  try {
    localStorage.setItem(LANGS_KEY, JSON.stringify(entry));
  } catch {
    /* ignore quota errors */
  }
}

interface RawRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  pushed_at: string;
  html_url: string;
  fork: boolean;
}

function langsFromBytes(langBytes: Record<string, number>): RepoLang[] {
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

function toRepo(r: RawRepo, langBytes: Record<string, number>): Repo {
  return {
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
    languages: langsFromBytes(langBytes),
  };
}

function buildRepos(
  list: RawRepo[],
  bytesByRepo: Record<string, Record<string, number>>
): Repo[] {
  return list
    .filter((r) => !r.fork)
    .sort(
      (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    )
    .map((r) => toRepo(r, bytesByRepo[r.full_name] || {}));
}

async function fetchLanguages(
  repo: string
): Promise<{ ok: boolean; bytes: Record<string, number> }> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${repo}/languages`,
      { headers }
    );
    if (!res.ok) return { ok: false, bytes: {} };
    const bytes = (await res.json()) as Record<string, number>;
    return { ok: true, bytes };
  } catch {
    return { ok: false, bytes: {} };
  }
}

function getLangCache(): {
  fresh: boolean;
  data: Record<string, Record<string, number>>;
} {
  const cached = readLangs();
  if (cached && Date.now() - cached.ts < LANGS_TTL) {
    return { fresh: true, data: cached.data };
  }
  return { fresh: false, data: cached ? cached.data : {} };
}

/**
 * List fetch, cache-first:
 * - valid local cache (<= 6h) => 0 network requests
 * - network failure / rate limit => falls back to stale cache if any
 * - success => writes fresh cache
 */
export const getRepos = async (force = false): Promise<Repo[]> => {
  if (inflight && !force) return inflight;

  if (!force) {
    const cached = readList();
    if (cached && Date.now() - cached.ts < LIST_TTL) return cached.repos;
  }

  inflight = (async () => {
    const cached = readList();
    const stale = cached && cached.repos.length > 0 ? cached.repos : null;

    const failWithSeed = (): Repo[] => {
      usedSeed = true;
      return SEED_REPOS;
    };

    let listRes: Response;
    try {
      listRes = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
        { headers }
      );
    } catch {
      if (stale) return stale;
      return failWithSeed();
    }
    if (!listRes.ok) {
      if (stale) return stale;
      return failWithSeed();
    }
    const list = (await listRes.json()) as RawRepo[];

    usedSeed = false;
    const { data: bytesByRepo } = getLangCache();
    const repos = buildRepos(list, bytesByRepo);
    writeList({ ts: Date.now(), repos });
    return repos;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
};

/**
 * Fills language % for repos missing it, progressively — never blocks rendering.
 * Once a repo's languages are recorded (even if empty), it is skipped until the
 * cache TTL expires so the API quota is not wasted on repeated page loads.
 */
export const hydrateLanguages = async (
  repos: Repo[],
  onUpdate: (repos: Repo[]) => void
) => {
  const { fresh, data } = getLangCache();
  const bytesByRepo = { ...data };
  const missing = repos.filter((r) => {
    if (r.languages.length > 0) return false;
    if (fresh && bytesByRepo[r.fullName] !== undefined) return false;
    return true;
  });
  if (missing.length === 0) return;

  let current = [...repos];
  let idx = 0;
  const workers = Array.from(
    { length: Math.min(3, missing.length) },
    async () => {
      while (idx < missing.length) {
        const repo = missing[idx++];
        const { ok, bytes } = await fetchLanguages(repo.name);
        if (ok) {
          bytesByRepo[repo.fullName] = bytes;
          if (Object.keys(bytes).length > 0) {
            current = current.map((r) =>
              r.fullName === repo.fullName
                ? { ...r, languages: langsFromBytes(bytes) }
                : r
            );
            onUpdate(current);
          }
        }
        await new Promise((r) => setTimeout(r, 120));
      }
    }
  );
  await Promise.all(workers);

  writeLangs({ ts: Date.now(), data: bytesByRepo });
};

/**
 * Polls until the GitHub API returns live data (recovery from rate limits /
 * offline). Stops automatically once live data arrives. Exponential backoff
 * (20s → 5min) so a down API is never spammed.
 */
export const refreshUntilFresh = (cb: (repos: Repo[]) => void) => {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let delay = 20000;

  const tick = async () => {
    if (stopped) return;
    try {
      const repos = await getRepos(true);
      if (!usedSeed) {
        cb(repos);
        return;
      }
    } catch {
      /* keep polling */
    }
    timer = setTimeout(tick, delay);
    delay = Math.min(delay * 2, 300000);
  };

  tick();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
};