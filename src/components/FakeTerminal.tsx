import { useEffect, useRef, useState } from "react";
import { config } from "../config";
import { getRepos } from "./repoData";
import "./styles/FakeTerminal.css";

type Cmd = string;

const WELCOME =
  "awais@portfolio:~$ last login: today\nType 'help' to see available commands.";

const RESPONSES: Record<Cmd, () => string | Promise<string>> = {
  help: () => [
    "help           show this message",
    "whoami         about me",
    "skills         tech stack & tools",
    "projects       list my public repos",
    "contact        my contact details",
    "social         social profiles",
    "location       where i am",
    "clear          clear the terminal",
    "exit           close the terminal",
  ].join("\n"),
  whoami: () =>
    `${config.developer.fullName} - ${config.developer.title}\n${config.developer.description}`,
  skills: () =>
    [...config.skills.develop.tools, ...config.skills.design.tools].join(", "),
  projects: async () => {
    try {
      const repos = await getRepos();
      if (!repos.length) return "no public repositories found";
      return repos
        .map((p) => `- ${p.name} [${p.language || "repo"}]`)
        .join("\n");
    } catch {
      return "could not reach GitHub right now";
    }
  },
  contact: () =>
    `email: ${config.contact.email}\nlinkedin: ${config.contact.linkedin}`,
  social: () =>
    `github: ${config.contact.github}\nfacebook: ${config.contact.facebook}\ninstagram: ${config.contact.instagram}`,
  location: () => config.social.location,
  clear: () => "",
  exit: () => "",
};

const FakeTerminal = () => {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<string[]>([WELCOME]);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [lines, open]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const newLines = [...lines, `awais@portfolio:~$ ${raw}`];
    if (cmd === "clear") {
      setLines([WELCOME]);
      return;
    }
    if (cmd === "exit") {
      setOpen(false);
      setLines([WELCOME]);
      return;
    }
    const output = (RESPONSES[cmd] || (() => `command not found: ${cmd}. type 'help'`))();
    if (output instanceof Promise) {
      setLines((prev) => [...prev, `awais@portfolio:~$ ${raw}`]);
      output.then((text) => setLines((prev) => [...prev, text]));
      return;
    }
    setLines([...newLines, output]);
  };

  return (
    <>
      <button
        className="terminal-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open terminal"
      >
        <span className="terminal-fab-icon">{`>_`}</span>
      </button>
      {open && (
        <div className="terminal-window">
          <div className="terminal-head">
            <span className="terminal-title">awais@portfolio: ~</span>
            <button
              className="terminal-close"
              onClick={() => setOpen(false)}
              aria-label="Close terminal"
            >
              x
            </button>
          </div>
          <div className="terminal-body" ref={bodyRef}>
            {lines.map((line, i) => (
              <pre className="terminal-line-out" key={i}>
                {line}
              </pre>
            ))}
            <div className="terminal-inputline">
              <span className="terminal-prompt">awais@portfolio:~$&nbsp;</span>
              <input
                ref={inputRef}
                className="terminal-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    run(input);
                    setInput("");
                  }
                }}
                spellCheck={false}
              />
              <span className="terminal-line-caret">█</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FakeTerminal;