import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { config } from "../config";
import MatrixRain from "./MatrixRain";
import TerminalTypewriter from "./TerminalTypewriter";

const Landing = ({ children }: PropsWithChildren) => {
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";
  const fullName = config.developer.fullName.toUpperCase();

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <MatrixRain />
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {firstName.toUpperCase()}
              {" "}
              <br />
              {lastName && <span>{lastName.toUpperCase()}</span>}
            </h1>
            <div className="terminal-line" data-cursor="disable">
              <span className="terminal-prompt">&gt;</span>
              <TerminalTypewriter
                text={`im ${fullName} – Mobile App Developer`}
              />
            </div>
          </div>
          <div className="landing-info">
            <h3>A</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">Mobile App</div>
            </h2>
            <h2>
              <div className="landing-h2-info">&amp; Full Stack Developer</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;