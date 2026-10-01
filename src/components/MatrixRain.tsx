import { useEffect, useRef } from "react";

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
    let fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    // Precompute the trail colours once instead of building a fresh
    // `rgba(...)` string for every one of the ~900 glyphs drawn per frame.
    const trailStyles = Array.from({ length: 7 }, (_, k) =>
      `rgba(74, 222, 128, ${k === 0 ? 1 : Math.max(0, 0.9 - k * 0.15)})`
    );
    const headStyle = "rgba(220, 252, 231, 0.95)";

    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01$#@%&*";

    // Stop drawing entirely while the canvas is scrolled out of view. It used
    // to keep its full-screen animation running for the whole session.
    let visible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      fontSize = window.innerWidth > 768 ? 15 : 12;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }).map(
        () => Math.floor(Math.random() * -60)
      );
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      animationFrame = requestAnimationFrame(draw);
      if (document.hidden || !visible) return;
      for (let i = 0; i < drops.length; i++) {
        for (let k = 0; k < 7; k++) {
          const y = (drops[i] - k) * fontSize;
          if (y < 0 || y > canvas.height) continue;
          ctx.fillStyle =
            k === 0 && Math.random() > 0.985 ? headStyle : trailStyles[k];
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(char, i * fontSize, y);
        }
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain"
      aria-hidden="true"
    />
  );
};

export default MatrixRain;