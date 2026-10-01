import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { playPunchSound } from "./utils/punchSound";
import { setProgress } from "../Loading";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  const [, setChar] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (canvasDiv.current) {
      // Two Scene effects can overlap briefly (React StrictMode double-invoke
      // in dev, fast refresh during development). Disposing the previous
      // renderer synchronously avoids two canvases/timelines driving the same
      // character at once, which showed up as a doubled, distorted model.
      const prev = canvasDiv.current.querySelector("canvas");
      prev?.remove();
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.devicePixelRatio <= 1,
        powerPreference: "high-performance",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.domElement.id = "character-canvas";
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let characterObj: THREE.Object3D | null = null;
      let faceMeshes: THREE.Object3D[] = [];
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const baseExposure = renderer.toneMappingExposure;
      const hitState = { recoil: 0, shake: 0, flicker: 0 };

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (gltf) {
          const animations = setAnimations(gltf);
          hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
          mixer = animations.mixer;
          let character = gltf.scene;
          characterObj = character;
          setChar(character);
          scene.add(character);
          headBone =
            character.getObjectByName("spine.006") ||
            character.getObjectByName("spine006") ||
            null;
          screenLight = character.getObjectByName("screenlight") || null;
          character.traverse((child: any) => {
            if (
              child.isMesh &&
              /^(face|eyes|eye|head|1head|1face)/i.test(child.name || "")
            ) {
              faceMeshes.push(child);
            }
          });
          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
            }, 300);
          });
          window.addEventListener("resize", onResize);
        }
      });

      const onResize = () => handleResize(renderer, camera, canvasDiv, characterObj!);

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", onMouseMove, { passive: true });
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }

      const pointer = new THREE.Vector2();
      const headWorld = new THREE.Vector3();
      const facePos = new THREE.Vector3();
      const tmpVec = new THREE.Vector3();

      const isHeadHit = () => {
        if (!headBone || !characterObj) return false;
        camera.updateMatrixWorld();
        if (faceMeshes.length) {
          facePos.set(0, 0, 0);
          for (const m of faceMeshes) {
            facePos.add(m.getWorldPosition(tmpVec));
          }
          facePos.divideScalar(faceMeshes.length);
        } else {
          headBone.getWorldPosition(facePos);
          facePos.y += 0.55;
        }
        facePos.project(camera);
        if (facePos.z > 1) return false;
        const dFace = Math.hypot(pointer.x - facePos.x, pointer.y - facePos.y);
        if (dFace < 0.2) return true;
        headBone.getWorldPosition(headWorld);
        headWorld.project(camera);
        if (headWorld.z > 1) return false;
        return (
          Math.hypot(pointer.x - headWorld.x, pointer.y - headWorld.y) < 0.32
        );
      };

      const triggerHit = () => {
        headBone &&
          (headBone.rotation.x = Math.min(headBone.rotation.x + 0.4, 0.6));
        hitState.recoil = 0.42;
        hitState.shake = 0.07;
        hitState.flicker = 0.6;
        playPunchSound(1);
      };

      const onCanvasClick = (event: MouseEvent) => {
        if (!headBone) return;
        const rect = renderer.domElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        if (characterObj && isHeadHit()) {
          triggerHit();
        }
      };
      document.addEventListener("click", onCanvasClick, true);

      let canvasVisible = true;
      let lastRenderAt = 0;
      let dbgFreeze = false;
      (globalThis as any).__dbg = {
        get character() {
          return characterObj;
        },
        get headBone() {
          return headBone;
        },
        get faceMeshes() {
          return faceMeshes.map((m) => m.name);
        },
        get camera() {
          return camera;
        },
        get renderer() {
          return renderer;
        },
        proj: (names: string[]) => {
          const out: Record<string, any> = {};
          if (!characterObj) return { error: "no character" };
          camera.updateMatrixWorld();
          const rect = renderer.domElement.getBoundingClientRect();
          const w = rect.width;
          const h = rect.height;
          const v = new THREE.Vector3();
          const addCorner = (c: THREE.Vector3, box: any) => {
            v.copy(c).project(camera);
            const px = ((v.x + 1) / 2) * w;
            const py = ((1 - v.y) / 2) * h;
            if (px < box.minX) box.minX = px;
            if (px > box.maxX) box.maxX = px;
            if (py < box.minY) box.minY = py;
            if (py > box.maxY) box.maxY = py;
          };
          characterObj.traverse((o: any) => {
            if (!o.isMesh || !names.includes(o.name)) return;
            const b = new THREE.Box3().setFromObject(o);
            const box = { minX: 1e9, minY: 1e9, maxX: -1e9, maxY: -1e9 };
            addCorner(b.min, box);
            addCorner(b.max, box);
            addCorner(new THREE.Vector3(b.min.x, b.max.y, b.min.z), box);
            addCorner(new THREE.Vector3(b.max.x, b.max.y, b.min.z), box);
            addCorner(new THREE.Vector3(b.min.x, b.min.y, b.max.z), box);
            addCorner(new THREE.Vector3(b.max.x, b.min.y, b.max.z), box);
            out[o.name] = {
              minX: Math.round(box.minX),
              minY: Math.round(box.minY),
              maxX: Math.round(box.maxX),
              maxY: Math.round(box.maxY),
            };
          });
          return out;
        },
        tilt: (x: number) => {
          if (headBone) headBone.rotation.x = x;
        },
        freeze: (on: boolean) => {
          dbgFreeze = on;
          return dbgFreeze;
        },
        dump: () => {
          if (!characterObj) return { error: "no character" };
          const items: any[] = [];
          characterObj.traverse((o: any) => {
            if (!o.isMesh) return;
            const b = new THREE.Box3().setFromObject(o);
            const pos = new THREE.Vector3();
            o.getWorldPosition(pos);
            const mat = Array.isArray(o.material) ? o.material[0] : o.material;
            items.push({
              name: o.name,
              pos: pos.toArray().map((v: number) => +v.toFixed(3)),
              min: b.min.toArray().map((v: number) => +v.toFixed(3)),
              max: b.max.toArray().map((v: number) => +v.toFixed(3)),
              mat: mat ? mat.name : null,
              visible: o.visible,
              skinned: !!o.isSkinnedMesh,
            });
          });
          return items;
        },
      };
      let io: IntersectionObserver | undefined;
      if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (entries) => {
            canvasVisible =
              entries.some((e) => e.isIntersecting) && !document.hidden;
          },
          { threshold: 0 }
        );
        io.observe(renderer.domElement);
      }

      let rafId = 0;
      const render = () => {
        rafId = requestAnimationFrame(render);
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        if (headBone && !dbgFreeze) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
        }
        hitState.recoil = Math.max(0, hitState.recoil - delta * 2.8);
        hitState.shake = Math.max(0, hitState.shake - delta * 3.5);
        hitState.flicker = Math.max(0, hitState.flicker - delta * 4.5);
        if (!canvasVisible) {
          lastRenderAt = 0;
          return;
        }
        const now = performance.now();
        // 33ms floor caps rendering at ~30fps. The scene is a background
        // element, so 30fps looks identical here but frees a lot of GPU on
        // laptops that were rendering it at 90fps.
        if (now - lastRenderAt < 33) return;
        lastRenderAt = now;
        if (headBone) {
          light.setPointLight(screenLight);
        }
        if (hitState.recoil > 0.001 || hitState.shake > 0.001) {
          if (characterObj) {
            characterObj.position.z += hitState.recoil;
            const s = 1 - hitState.recoil * 0.22;
            characterObj.scale.setScalar(s);
          }
          if (hitState.shake > 0.001) {
            camera.position.x += (Math.random() - 0.5) * hitState.shake;
            camera.position.y += (Math.random() - 0.5) * hitState.shake;
          }
        } else {
          if (characterObj && characterObj.scale.x !== 1) {
            characterObj.position.z = 0;
            characterObj.scale.setScalar(1);
          }
        }
        renderer.toneMappingExposure =
          baseExposure * (1 - hitState.flicker * 0.5);
        renderer.render(scene, camera);
      };
      render();
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(debounce);
        progress.clear();
        io?.disconnect();
        scene.clear();
        renderer.dispose();
        renderer.forceContextLoss();
        window.removeEventListener("resize", onResize);
        if (canvasDiv.current?.contains(renderer.domElement)) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        document.removeEventListener("click", onCanvasClick, true);
        document.removeEventListener("mousemove", onMouseMove);
        if (landingDiv) {
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
