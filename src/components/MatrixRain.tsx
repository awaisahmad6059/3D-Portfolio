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

    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01$#@%&*";

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
      if (document.hidden) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }
      for (let i = 0; i < drops.length; i++) {
        for (let k = 0; k < 7; k++) {
          const y = (drops[i] - k) * fontSize;
          if (y < 0 || y > canvas.height) continue;
          const alpha = k === 0 ? 1 : Math.max(0, 0.9 - k * 0.15);
          ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
          if (k === 0 && Math.random() > 0.985) {
            ctx.fillStyle = "rgba(220, 252, 231, 0.95)";
          }
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(char, i * fontSize, y);
        }
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrame = requestAnimationFrame(draw);
    };
    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
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