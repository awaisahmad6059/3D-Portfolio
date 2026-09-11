import { useState } from "react";
import type { CSSProperties } from "react";
import { FiStar, FiGitBranch } from "react-icons/fi";
import "./styles/RepoCard.css";
import { Repo, langColor, formatDate } from "./repoData";

const mshot = (homepage: string) =>
  `https://s.wordpress.com/mshots/v1/${encodeURIComponent(homepage)}?w=1200`;

const RepoCard = ({ repo, index }: { repo: Repo; index: number }) => {
  const [imgError, setImgError] = useState(false);
  const showShot = repo.homepage !== null && !imgError;

  const langs =
    repo.languages.length > 0
      ? repo.languages.slice(0, 3)
      : repo.language
        ? [{ name: repo.language, pct: 100 }]
        : [];

  const chips =
    repo.topics.length > 0
      ? repo.topics.slice(0, 5)
      : repo.languages.slice(0, 4).map((l) => l.name);

  return (
    <div className="repo-card" data-cursor="disable">
      <div className="repo-cover">
        {showShot ? (
          <img
            className="repo-cover-img"
            src={mshot(repo.homepage as string)}
            alt={repo.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="repo-terminal"
            style={{ "--lang": langColor(repo.language) } as CSSProperties}
          >
            <div className="repo-terminal-head">
              <span className="t-dot t-dot-r"></span>
              <span className="t-dot t-dot-y"></span>
              <span className="t-dot t-dot-g"></span>
              <span className="t-title">~/{repo.name}</span>
            </div>
            <div className="repo-terminal-body">
              <pre>
                <span className="t-prompt">&gt;</span> git clone{" "}
                {repo.fullName}.git
              </pre>
              <pre>
                <span className="t-prompt">&gt;</span> language:{" "}
                {repo.language || "n/a"}
              </pre>
              <pre>
                <span className="t-prompt">&gt;</span> updated:{" "}
                {formatDate(repo.pushedAt)}
              </pre>
              <pre>
                <span className="t-prompt">&gt;</span>{" "}
                <span className="t-caret">_</span>
              </pre>
            </div>
            <div className="repo-terminal-bar">
              {langs.length > 0 ? (
                langs.map((l) => (
                  <span
                    key={l.name}
                    style={{
                      width: `${l.pct}%`,
                      background: langColor(l.name),
                    }}
                  ></span>
                ))
              ) : (
                <span style={{ width: "100%", background: "#4ade80" }}></span>
              )}
            </div>
          </div>
        )}
        <div className="repo-number">{String(index + 1).padStart(2, "0")}</div>
      </div>

      <div className="repo-info">
        <div className="repo-top">
          <h3>{repo.name}</h3>
          <div className="repo-meta">
            <span title="Stars">
              <FiStar /> {repo.stars}
            </span>
            <span title="Forks">
              <FiGitBranch /> {repo.forks}
            </span>
          </div>
        </div>

        <p className="repo-desc">
          {repo.description || "Public repository on GitHub."}
        </p>

        {langs.length > 0 && (
          <div className="repo-langbar">
            {langs.map((l) => (
              <span
                key={l.name}
                style={{ width: `${l.pct}%`, background: langColor(l.name) }}
                title={`${l.name} ${l.pct}%`}
              ></span>
            ))}
            <span className="repo-langbar-labels">
              {langs.map((l) => (
                <span key={l.name}>
                  <i style={{ background: langColor(l.name) }}></i>
                  {l.name} {l.pct}%
                </span>
              ))}
            </span>
          </div>
        )}

        {chips.length > 0 && (
          <div className="repo-chips">
            {chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        )}

        <div className="repo-btns">
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="repo-btn"
            data-cursor="disable"
          >
            GitHub
          </a>
          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noreferrer"
              className="repo-btn repo-btn-demo"
              data-cursor="disable"
            >
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepoCard;