import "./styles/Work.css";
import RepoCard from "./RepoCard";
import {
  getRepos,
  hydrateLanguages,
  refreshUntilFresh,
  Repo,
} from "./repoData";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let stopRefresh: (() => void) | undefined;
    getRepos()
      .then((all) => {
        if (!active) return;
        const featured = all.slice(0, 6);
        setRepos(featured);
        hydrateLanguages(featured, (next) => {
          if (active) setRepos(next);
        });
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 1600);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));

    // Live refresh: instant paint from cache, then silently swap in fresh
    // GitHub data on every visit. Never errors — falls back to seed/cache.
    stopRefresh = refreshUntilFresh((next) => {
      if (!active) return;
      const live = next.slice(0, 6);
      setRepos(live);
      hydrateLanguages(live, (later) => setRepos(later));
    });

    return () => {
      active = false;
      stopRefresh?.();
    };
  }, []);

  useEffect(() => {
    if (repos.length === 0 || window.innerWidth <= 768) return;

    let translateX: number = 0;

    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      if (box.length === 0) return;
      const rectLeft = document
        .querySelector(".work-container")!
        .getBoundingClientRect().left;
      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
      let padding: number =
        parseInt(window.getComputedStyle(box[0]).padding) / 2;
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
    }

    setTranslateX();

    let timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        id: "work",
        invalidateOnRefresh: true,
      },
    });

    timeline.to(".work-flex", {
      x: -translateX,
      ease: "none",
    });

    ScrollTrigger.refresh();

    return () => {
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, [repos.length, error]);

  const retry = () => {
    setError(false);
    setLoading(true);
    getRepos(true)
      .then((all) => {
        const featured = all.slice(0, 6);
        setRepos(featured);
        hydrateLanguages(featured, (next) => setRepos(next));
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
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        {loading ? (
          <p className="work-status">fetching repositories...</p>
        ) : error ? (
          <p className="work-status">
            could not load repos.
            <button className="work-retry" onClick={retry} data-cursor="disable">
              try again
            </button>
          </p>
        ) : (
          <div className="work-flex">
            {repos.map((repo, index) => (
              <div className="work-box" key={repo.id}>
                <RepoCard repo={repo} index={index} />
              </div>
            ))}
            <div className="work-box work-box-cta">
              <div className="see-all-works">
                <h3>Want to see more?</h3>
                <p>Explore all of my public repositories on GitHub</p>
                <Link
                  to="/myworks"
                  className="see-all-btn"
                  data-cursor="disable"
                  data-decrypt
                >
                  See All Works &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Work;