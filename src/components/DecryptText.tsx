import {
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

const SCRAMBLE_CHARS = "01$#@%&*<>/\\|";

const DecryptText = ({ children }: PropsWithChildren) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const originalHTML = node.innerHTML;
    const target = node.textContent ?? "";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !revealed) {
            observer.disconnect();
            const start = Date.now();
            const duration = 850;
            const tick = setInterval(() => {
              const progress = Math.min(1, (Date.now() - start) / duration);
              const resolved = Math.floor(progress * target.length);
              let out = "";
              for (let i = 0; i < target.length; i++) {
                const ch = target[i];
                if (ch === " ") out += " ";
                else if (i < resolved) out += ch;
                else
                  out +=
                    SCRAMBLE_CHARS[
                      Math.floor(Math.random() * SCRAMBLE_CHARS.length)
                    ];
              }
              node.textContent = out;
              if (progress >= 1) {
                clearInterval(tick);
                node.innerHTML = originalHTML;
                setRevealed(true);
              }
            }, 30);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed]);

  return (
    <span className="decrypt-text" ref={ref}>
      {children}
    </span>
  );
};

export default DecryptText;