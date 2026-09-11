import { useEffect, useState } from "react";
import { config } from "../config";
import "./styles/CallToAction.css";

const bootTime = Date.now();

const useUptime = () => {
  const [uptime, setUptime] = useState("00:00:00");
  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - bootTime) / 1000);
      const h = String(Math.floor(s / 3600)).padStart(2, "0");
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      const sec = String(s % 60).padStart(2, "0");
      setUptime(`${h}:${m}:${sec}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return uptime;
};

const useMem = () => {
  const [mem, setMem] = useState("2.4/8.0");
  useEffect(() => {
    const id = setInterval(() => {
      setMem(`${(1.6 + Math.random() * 2.4).toFixed(1)}/8.0`);
    }, 1600);
    return () => clearInterval(id);
  }, []);
  return mem;
};

const CallToAction = () => {
  const uptime = useUptime();
  const mem = useMem();

  return (
    <div className="cta-section">
      <div className="cta-buttons">
        <a
          href={config.contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-btn cta-btn-hire"
          data-cursor="disable"
          data-decrypt
        >
          Hire Me →
        </a>
      </div>
      <div className="sys-stats" data-cursor="disable">
        <span className="sys-chip">
          <i className="sys-dot" />
          STATUS: ONLINE
        </span>
        <span className="sys-chip">UPTIME: {uptime}</span>
        <span className="sys-chip">MEM: {mem} GB</span>
        <span className="sys-chip">NODE: v20.11</span>
        <span className="sys-chip">SHELL: zsh</span>
      </div>
    </div>
  );
};

export default CallToAction;