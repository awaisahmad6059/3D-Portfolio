import { useEffect, useState } from "react";

const TerminalTypewriter = ({
  text,
  typingSpeed = 90,
  deletingSpeed = 35,
  holdTime = 3200,
}: {
  text: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  holdTime?: number;
}) => {
  const [display, setDisplay] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && display.length < text.length) {
      timeout = setTimeout(
        () => setDisplay(text.slice(0, display.length + 1)),
        typingSpeed
      );
    } else if (!deleting && display.length === text.length) {
      timeout = setTimeout(() => setDeleting(true), holdTime);
    } else if (deleting && display.length > 0) {
      timeout = setTimeout(
        () => setDisplay(text.slice(0, display.length - 1)),
        deletingSpeed
      );
    } else if (deleting && display.length === 0) {
      timeout = setTimeout(() => setDeleting(false), 400);
    }
    return () => clearTimeout(timeout);
  }, [display, deleting, text, typingSpeed, deletingSpeed, holdTime]);

  return (
    <>
      {display}
      <span className="terminal-cursor" aria-hidden="true" />
    </>
  );
};

export default TerminalTypewriter;