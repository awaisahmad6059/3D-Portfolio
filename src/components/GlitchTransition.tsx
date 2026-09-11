import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./GlitchTransition.css";

const GlitchTransition = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const flash = useCallback(() => {
    const el = overlayRef.current;
    if (!el) return;
    el.classList.remove("active");
    void el.offsetWidth;
    el.classList.add("active");
  }, []);

  // Route change -> glitch
  useEffect(() => {
    flash();
  }, [location.pathname, flash]);

  return (
    <div
      className="glitch-flash"
      ref={overlayRef}
      aria-hidden="true"
    />
  );
};

export default GlitchTransition;