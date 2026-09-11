import { FormEvent, useEffect, useState } from "react";
import { config } from "../config";
import "./AccessGate.css";

const AccessGate = () => {
  const [phase, setPhase] = useState<"open" | "granted" | "done">("open");

  useEffect(() => {
    if (phase === "granted") {
      const t = setTimeout(() => setPhase("done"), 1150);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (phase === "done") return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPhase("granted");
  };

  return (
    <div
      className={`access-gate ${phase === "granted" && "access-granted"}`}
      data-cursor="disable"
    >
      {phase === "open" ? (
        <form className="access-form" onSubmit={handleSubmit}>
          <div className="access-label">
            <span className="access-lock">▮</span> SYSTEM PROTECTED — ENTER
            ACCESS CODE
          </div>
          <div className="access-row">
            <span className="access-prompt">&gt;</span>
            <input
              className="access-input"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              placeholder="type anything & press ENTER"
              aria-label="Access code"
            />
            <span className="access-caret">█</span>
          </div>
        </form>
      ) : (
        <div className="access-granted-msg">
          <span className="access-granted-text">ACCESS GRANTED</span>
          <span className="access-granted-sub">
            &gt; welcome, {config.developer.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default AccessGate;