import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cursor = cursorRef.current!;
    const trail = trailRef.current!;
    let lastSpawn = 0;
    let rafId = 0;
    let pending = false;
    let lastX = 0;
    let lastY = 0;

    // quickSetter writes the transform directly, so there is no tween
    // allocation on every frame (that was what made the cursor feel slow).
    const setX = gsap.quickSetter(cursor, "x", "px");
    const setY = gsap.quickSetter(cursor, "y", "px");

    const paint = () => {
      pending = false;
      setX(lastX);
      setY(lastY);
    };

    // One listener drives both the 1:1 cursor position and the trail. There
    // used to be two mousemove listeners here plus a requestAnimationFrame
    // loop that ran forever updating a value nothing read, which burned CPU
    // the whole time the page was open.
    const onMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(paint);
      }
      const now = performance.now();
      if (now - lastSpawn > 34 && window.innerWidth > 768) {
        lastSpawn = now;
        const dot = document.createElement("span");
        dot.className = "cursor-dot";
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
        trail.appendChild(dot);
        setTimeout(() => dot.remove(), 500);
      }
    };
    document.addEventListener("mousemove", onMouseMove, { passive: true });

    document.querySelectorAll("[data-cursor]").forEach((item) => {
      const element = item as HTMLElement;
      element.addEventListener("mouseover", (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");

          gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      });
      element.addEventListener("mouseout", () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <>
      <div className="cursor-trail" ref={trailRef} aria-hidden="true" />
      <div className="cursor-main" ref={cursorRef} />
    </>
  );
};

export default Cursor;