import "./styles/About.css";
import { config } from "../config";
import DecryptText from "./DecryptText";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title glitch-text">
          <DecryptText>{config.about.title}</DecryptText>
        </h3>
        <p className="para">
          {config.about.description}
        </p>
      </div>
    </div>
  );
};

export default About;
