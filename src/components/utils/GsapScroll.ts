import * as THREE from "three";
import gsap from "gsap";

// Every scroll timeline this module creates is tracked so it can be torn down
// before being rebuilt. Without this, each rebuild added another full set of
// timelines driving the same character/camera, which double-applied the
// animation (broken shape + stutter) and multiplied scroll work.
// Each builder owns its timelines so rebuilding one does not tear down the
// other. setCharTimeline and setAllTimeline are always called as a pair, and
// previously every call added another full set driving the same
// character/camera, which double-applied the animation (broken shape +
// stutter) and multiplied scroll work.
let charTimelines: gsap.core.Timeline[] = [];
let charClears: Array<() => void> = [];
let pageTimelines: gsap.core.Timeline[] = [];

function killCharTimelines() {
  charClears.forEach((clear) => clear());
  charClears = [];
  charTimelines.forEach((tl) => {
    tl.scrollTrigger?.kill();
    tl.kill();
  });
  charTimelines = [];
}

function killPageTimelines() {
  pageTimelines.forEach((tl) => {
    tl.scrollTrigger?.kill();
    tl.kill();
  });
  pageTimelines = [];
}

export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera
) {
  killCharTimelines();
  let intensity: number = 0;
  const intensityTimer = setInterval(() => {
    intensity = Math.random();
  }, 200);
  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: ".landing-section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-section",
      start: "center 55%",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".whatIDO",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  charTimelines.push(tl1, tl2, tl3);
  charClears.push(() => clearInterval(intensityTimer));
  let screenLight: any, monitor: any;
  character?.children.forEach((object: any) => {
    if (object.name === "Plane004") {
      object.children.forEach((child: any) => {
        child.material.transparent = true;
        child.material.opacity = 0;
        if (child.material.name === "Material.027") {
          monitor = child;
          child.material.color.set("#FFFFFF");
        }
      });
    }
    if (object.name === "screenlight") {
      object.material.transparent = true;
      object.material.opacity = 0;
      object.material.emissive.set("#4ade80");
      const flicker = gsap.timeline({ repeat: -1, repeatRefresh: true }).to(
        object.material,
        {
          emissiveIntensity: () => intensity * 8,
          duration: () => Math.random() * 0.6,
          delay: () => Math.random() * 0.1,
        }
      );
      charTimelines.push(flicker);
      screenLight = object;
    }
  });
  let neckBone = character?.getObjectByName("spine005");
  if (window.innerWidth > 1024) {
    if (character) {
      tl1
        .fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
        .to(camera.position, { z: 22 }, 0)
        .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
        .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
        .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
        .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

      tl2
        .to(
          camera.position,
          { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" },
          0
        )
        .to(".about-section", { y: "30%", duration: 6 }, 0)
        .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
        .fromTo(
          ".character-model",
          { pointerEvents: "inherit" },
          { pointerEvents: "none", x: "-12%", delay: 2, duration: 5 },
          0
        )
        .to(character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0)
        .to(neckBone!.rotation, { x: 0.6, delay: 2, duration: 3 }, 0)
        .to(monitor.material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0)
        .to(screenLight.material, { opacity: 1, duration: 0.8, delay: 4.5 }, 0)
        .fromTo(
          ".what-box-in",
          { display: "none" },
          { display: "flex", duration: 0.1, delay: 6 },
          0
        )
        .fromTo(
          monitor.position,
          { y: -10, z: 2 },
          { y: 0, z: 0, delay: 1.5, duration: 3 },
          0
        )
        .fromTo(
          ".character-rim",
          { opacity: 1, scaleX: 1.4 },
          { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
          0.3
        );

      tl3
        .fromTo(
          ".character-model",
          { y: "0%" },
          { y: "-100%", duration: 4, ease: "none", delay: 1 },
          0
        )
        .fromTo(".whatIDO", { y: 0 }, { y: "15%", duration: 2 }, 0)
        .to(character.rotation, { x: -0.04, duration: 2, delay: 1 }, 0);
    }
  } else {
    if (character) {
      const tM2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".what-box-in",
          start: "top 70%",
          end: "bottom top",
        },
      });
      tM2.to(".what-box-in", { display: "flex", duration: 0.1, delay: 0 }, 0);
      charTimelines.push(tM2);
    }
  }
}

export function setAllTimeline() {
  killPageTimelines();
  const careerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".career-section",
      start: "top 50%",
      end: "bottom 30%",
      scrub: 1.5,
      invalidateOnRefresh: true,
    },
  });
  pageTimelines.push(careerTimeline);
  careerTimeline
    .fromTo(
      ".career-timeline",
      { maxHeight: "0%" },
      { maxHeight: "100%", duration: 1, ease: "none" },
      0
    )

    .fromTo(
      ".career-timeline",
      { opacity: 0 },
      { opacity: 1, duration: 0.2 },
      0
    )
    .fromTo(
      ".career-info-box",
      { opacity: 0 },
      { opacity: 1, stagger: 0.1, duration: 0.5 },
      0
    )
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      {
        animationIterationCount: "1",
        delay: 0.3,
        duration: 0.1,
      },
      0
    );

  if (window.innerWidth > 1024) {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: "20%", duration: 0.5, delay: 0.2 },
      0
    );
  } else {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: 0, duration: 0.5, delay: 0.2 },
      0
    );
  }
}
