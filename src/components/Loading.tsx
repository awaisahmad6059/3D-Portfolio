import { useEffect, useRef, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";

import Marquee from "react-fast-marquee";

const BOOT_LINES = [
  "> initializing core modules...",
  "> loading assets & textures...",
  "> decrypting access key...",
  "> establishing secure connection...",
];

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading, setLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [bootCount, setBootCount] = useState(0);
  const percentRef = useRef(percent);

  useEffect(() => {
    percentRef.current = percent;
  });

  useEffect(() => {
    // Safety net: never let the loader get stuck — force complete after 12s
    const t = setTimeout(() => {
      if (percentRef.current < 100) setLoading(100);
    }, 12000);
    return () => clearTimeout(t);
  }, [setLoading]);

  useEffect(() => {
    if (percent > 25) setBootCount((c) => Math.max(c, 1));
    if (percent > 45) setBootCount((c) => Math.max(c, 2));
    if (percent > 65) setBootCount((c) => Math.max(c, 3));
    if (percent > 85) setBootCount((c) => Math.max(c, 4));
  }, [percent]);

  if (percent >= 100) {
    setTimeout(() => {
      setLoaded(true);
      setTimeout(() => {
        setIsLoaded(true);
      }, 1000);
    }, 600);
  }

  useEffect(() => {
    import("./utils/initialFX").then((module) => {
      if (isLoaded) {
        setClicked(true);
        setTimeout(() => {
          if (module.initialFX) {
            module.initialFX();
          }
          setIsLoading(false);
        }, 900);
      }
    });
  }, [isLoaded]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title">
          Awais Ahmad
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen">
        <div className="boot-box">
          {BOOT_LINES.slice(0, bootCount).map((line) => (
            <div className="boot-line" key={line}>
              <span>{line}</span>
              <span className="boot-cursor">█</span>
            </div>
          ))}
          {bootCount >= BOOT_LINES.length && (
            <div className="boot-line boot-ok">
              <span>&gt; access granted. press ENTER to continue</span>
            </div>
          )}
        </div>
        <div className="loading-marquee">
          <Marquee>
            <span>&nbsp; Mobile App Developer &nbsp;</span> <span>&nbsp; Full Stack Developer &nbsp;</span>
            <span>&nbsp; Mobile App Developer &nbsp;</span> <span>&nbsp; Full Stack Developer &nbsp;</span>
          </Marquee>
        </div>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

export const setProgress = (setLoading: (value: number) => void) => {
  const steps = [10, 15, 30, 45, 60, 75, 90, 99];
  const delays = [600, 900, 1200, 1400, 1400, 1400, 1400, 1400];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let acc = 0;
  steps.forEach((val, i) => {
    acc += delays[i];
    timers.push(setTimeout(() => setLoading(val), acc));
  });

  function clear() {
    timers.forEach((t) => clearTimeout(t));
  }

  function loaded(): Promise<number> {
    return new Promise<number>((resolve) => {
      let p = 99;
      const iv = setInterval(() => {
        p = Math.min(100, p + 1);
        setLoading(p);
        if (p >= 100) {
          clearInterval(iv);
          resolve(p);
        }
      }, 40);
    });
  }

  return { loaded, percent: 99, clear };
};
