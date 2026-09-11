import { useEffect } from "react";

const SCRAMBLE_CHARS = "01$#@%&*<>/\\|<>{}[]";

const LinkDecrypt = () => {
  useEffect(() => {
    const active = new Set<HTMLElement>();

    const handler = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      const link = e.target.closest("a[data-decrypt]") as
        | HTMLAnchorElement
        | null;
      if (!link || active.has(link)) return;
      active.add(link);
      const original = link.textContent ?? "";
      const start = Date.now();
      const duration = 420;
      const tick = setInterval(() => {
        const progress = Math.min(1, (Date.now() - start) / duration);
        const resolved = Math.floor(progress * original.length);
        let out = "";
        for (let i = 0; i < original.length; i++) {
          const ch = original[i];
          if (ch === " " || ch === "→") out += ch;
          else if (i < resolved) out += ch;
          else
            out += SCRAMBLE_CHARS[
              Math.floor(Math.random() * SCRAMBLE_CHARS.length)
            ];
        }
        link.textContent = out;
        if (progress >= 1) {
          clearInterval(tick);
          link.textContent = original;
          setTimeout(() => active.delete(link), 50);
        }
      }, 30);
    };
    document.addEventListener("mouseover", handler);
    return () => document.removeEventListener("mouseover", handler);
  }, []);

  return null;
};

export default LinkDecrypt;