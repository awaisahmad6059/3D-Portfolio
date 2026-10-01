import { PropsWithChildren, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import TechStackNew from "./TechStackNew";
import CallToAction from "./CallToAction";
import CrtOverlay from "./CrtOverlay";
import FakeTerminal from "./FakeTerminal";
import SystemClock from "./SystemClock";
import GlitchTransition from "./GlitchTransition";
import LinkDecrypt from "./LinkDecrypt";
import setSplitText from "./utils/splitText";

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );
  const [isMobile] = useState<boolean>(window.innerWidth <= 768);

  useEffect(() => {
    // Debounced: re-splitting every paragraph on each resize event was a
    // major source of scroll/resize stutter.
    let timer: ReturnType<typeof setTimeout>;
    const runSplit = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setSplitText(), 200);
    };
    const resizeHandler = () => {
      runSplit();
      setIsDesktopView(window.innerWidth > 1024);
    };
    runSplit();
    window.addEventListener("resize", resizeHandler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resizeHandler);
    };
  }, [isDesktopView]);

  return (
    <div className="container-main">
      <CrtOverlay />
      <LinkDecrypt />
      <Cursor />
      <SystemClock />
      <GlitchTransition />
      <Navbar />
      <SocialIcons />
      {isDesktopView && !isMobile && children}
      <div className="container-main">
        <Landing />
        <About />
        <WhatIDo />
        <Career />
        <Work />
        <TechStackNew />
        <CallToAction />
        <Contact />
      </div>
      <FakeTerminal />
    </div>
  );
};

export default MainContainer;
