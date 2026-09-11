import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let hover = false;
    const cursor = cursorRef.current!;
    const trail = trailRef.current!;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };
    let lastSpawn = 0;

    document.addEventListener("mousemove", (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      const now = Date.now();
      if (now - lastSpawn > 18 && window.innerWidth > 768) {
        lastSpawn = now;
        const dot = document.createElement("span");
        dot.className = "cursor-dot";
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
        trail.appendChild(dot);
        setTimeout(() => dot.remove(), 500);
      }
    });
    requestAnimationFrame(function loop() {
      if (!hover) {
        const delay = 6;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        gsap.to(cursor, { x: cursorPos.x, y: cursorPos.y, duration: 0.1 });
      }
      requestAnimationFrame(loop);
    });
    document.querySelectorAll("[data-cursor]").forEach((item) => {
      const element = item as HTMLElement;
      element.addEventListener("mouseover", (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");

          gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      });
      element.addEventListener("mouseout", () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
      });
    });
  }, []);

  return (
    <>
      <div className="cursor-trail" ref={trailRef} aria-hidden="true" />
      <div className="cursor-main" ref={cursorRef} />
    </>
  );
};

export default Cursor;