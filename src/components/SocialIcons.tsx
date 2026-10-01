import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { useEffect } from "react";
import { config } from "../config";

const SocialIcons = () => {
  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;
    if (!social) return;

    const cleanups: Array<() => void> = [];

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement;
      if (!link) return;

      const rect = elem.getBoundingClientRect();
      let mouseX = rect.width / 2;
      let mouseY = rect.height / 2;
      let currentX = 0;
      let currentY = 0;
      let raf = 0;
      let running = false;

      // Only animate while the value is still settling. The old code kept
      // four requestAnimationFrame loops alive for the whole session, writing
      // two CSS variables per icon on every frame even when the pointer was
      // nowhere near them.
      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        if (
          Math.abs(mouseX - currentX) < 0.1 &&
          Math.abs(mouseY - currentY) < 0.1
        ) {
          currentX = mouseX;
          currentY = mouseY;
          running = false;
          return;
        }
        raf = requestAnimationFrame(updatePosition);
      };

      const start = () => {
        if (running) return;
        running = true;
        raf = requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
        start();
      };

      document.addEventListener("mousemove", onMouseMove);
      start();

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        document.removeEventListener("mousemove", onMouseMove);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a href={config.contact.github} target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
        </span>
        <span>
          <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn />
          </a>
        </span>
        <span>
          <a href={config.contact.facebook} target="_blank" rel="noopener noreferrer">
            <FaFacebookF />
          </a>
        </span>
        <span>
          <a href={config.contact.instagram} target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
        </span>
      </div>
    </div>
  );
};

export default SocialIcons;
