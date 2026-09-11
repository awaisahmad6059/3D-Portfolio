import { useEffect, useState } from "react";
import "./SystemClock.css";

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Karachi",
});

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Karachi",
});

const SystemClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sys-clock" data-cursor="disable">
      <span className="sys-clock-label">SYSTEM CLOCK</span>
      <span className="sys-clock-time">
        {TIME_FMT.format(now)} <span className="sys-clock-tz">PKT</span>
      </span>
      <span className="sys-clock-date">{DATE_FMT.format(now)}</span>
    </div>
  );
};

export default SystemClock;