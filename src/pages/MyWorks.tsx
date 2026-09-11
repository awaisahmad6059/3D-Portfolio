import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cursor from "../components/Cursor";
import RepoCard from "../components/RepoCard";
import {
  getRepos,
  hydrateLanguages,
  refreshUntilFresh,
  Repo,
} from "../components/repoData";
import "./MyWorks.css";

const SUBTITLES = [
  "a collection of my public GitHub repositories",
  "built & shipped in public",
  "from idea to production",
  "apps, games & everything in between",
];

const MyWorks = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [subIndex, setSubIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setSubIndex((i) => (i + 1) % SUBTITLES.length),
      3000
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let active = true;
    let stopRefresh: (() => void) | undefined;
    getRepos()
      .then((all) => {
        if (!active) return;
        setRepos(all);
        hydrateLanguages(all, (next) => {
          if (active) setRepos(next);
        });
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));

    // Live refresh: instant paint from cache, then silently swap in fresh
    // GitHub data on every visit. Never errors — falls back to seed/cache.
    stopRefresh = refreshUntilFresh((next) => {
      if (!active) return;
      setRepos(next);
      hydrateLanguages(next, (later) => setRepos(later));
    });

    return () => {
      active = false;
      stopRefresh?.();
    };
  }, []);

  const retry = () => {
    setError(false);
    setLoading(true);
    getRepos(true)
      .then((all) => {
        setRepos(all);
        hydrateLanguages(all, (next) => setRepos(next));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(retry, 30000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <div className="myworks-page">
      <Cursor />
      <div className="myworks-header">
        <Link to="/" className="back-button" data-cursor="disable" data-decrypt>
          &larr; Back to Home
        </Link>
        <h1 className="glitch-text">
          All <span>Works</span>
        </h1>
        <p key={subIndex} className="myworks-subtitle">
          {SUBTITLES[subIndex]}
        </p>
      </div>

      {loading ? (
        <p className="myworks-status">fetching repositories...</p>
      ) : error ? (
        <p className="myworks-status">
          could not load repos from GitHub.
          <button className="myworks-retry" onClick={retry} data-cursor="disable">
            try again
          </button>
        </p>
      ) : (
        <div className="myworks-grid">
          {repos.map((repo, index) => (
            <div className="myworks-card" key={repo.id}>
              <RepoCard repo={repo} index={index} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWorks;