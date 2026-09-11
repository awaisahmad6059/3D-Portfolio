import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import Lenis from "lenis";
import { useTheme } from "../context/ThemeContext";
import { useSound } from "../context/SoundContext";
import { FiVolume2, FiVolumeX, FiRadio } from "react-icons/fi";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollTrigger);
export let lenis: Lenis | null = null;

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMute, ambient, toggleAmbient } = useSound();
  useEffect(() => {
    // Initialize Lenis smooth scroll
    lenis = new Lenis({
      duration: 1.7,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.7,
      touchMultiplier: 2,
      infinite: false,
    });

    // Start paused
    lenis.stop();

    // Handle smooth scroll animation frame
    function raf(time: number) {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Handle navigation links
    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) {
          e.preventDefault();
          let elem = e.currentTarget as HTMLAnchorElement;
          let section = elem.getAttribute("data-href");
          if (section && lenis) {
            const target = document.querySelector(section) as HTMLElement;
            if (target) {
              lenis.scrollTo(target, {
                offset: 0,
                duration: 1.5,
              });
            }
          }
        }
      });
    });

    // Handle resize
    window.addEventListener("resize", () => {
      lenis?.resize();
    });

    return () => {
      lenis?.destroy();
    };
  }, []);
  return (
    <>
      <div className="header">
        <div className="navbar-controls">
          <button
            className="theme-toggle"
            onClick={toggleMute}
            aria-label={muted ? "Enable sound" : "Mute sound"}
            data-cursor="disable"
          >
            {muted ? (
              <FiVolumeX className="theme-icon" />
            ) : (
              <FiVolume2 className="theme-icon" />
            )}
          </button>
          <button
            className="navbar-title theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            data-cursor="disable"
          >
          {theme === "dark" ? (
            <svg
              className="theme-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="4.2" />
              <line x1="12" y1="2" x2="12" y2="4.5" />
              <line x1="12" y1="19.5" x2="12" y2="22" />
              <line x1="2" y1="12" x2="4.5" y2="12" />
              <line x1="19.5" y1="12" x2="22" y2="12" />
              <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" />
              <line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
              <line x1="4.6" y1="19.4" x2="6.4" y2="17.6" />
              <line x1="17.6" y1="6.4" x2="19.4" y2="4.6" />
            </svg>
          ) : (
            <svg
              className="theme-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
            </svg>
          )}
        </button>
          <button
            className={`theme-toggle ${ambient ? "ambient-active" : ""}`}
            onClick={toggleAmbient}
            aria-label={ambient ? "Disable ambient hum" : "Enable ambient hum"}
            data-cursor="disable"
          >
            <FiRadio className="theme-icon" />
          </button>
        </div>
        <a
          href="mailto:awaisahmad6059@gmail.com"
          className="navbar-connect"
          data-cursor="disable"
          data-decrypt
        >
          awaisahmad6059@gmail.com
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
