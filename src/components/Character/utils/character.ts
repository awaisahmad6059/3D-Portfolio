import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

const MODEL_URL = "/models/character.glb";
// Uncompressed copy. Only fetched if the Draco decoder fails to load, so the
// character stays visible even on a browser where the decoder cannot run.
const FALLBACK_MODEL_URL = "/models/character-fallback.glb";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const isPurpleish = (c: THREE.Color) => {
    if (!c) return false;
    const r = c.r, g = c.g, b = c.b;
    if (Math.max(r, g, b) < 0.02) return false;
    return r > g && b > g && (r + b) / (2 * g + 1e-6) > 1.3;
  };

  const enforceGreen = (material: any) => {
    if (!material) return;
    const green = new THREE.Color(0x4ade80);
    if (material.color && isPurpleish(material.color)) {
      material.color.copy(green);
    }
    if (material.emissive && isPurpleish(material.emissive)) {
      material.emissive.copy(green);
    }
  };

  // The model ships Draco-compressed (1.44 MB -> 0.73 MB). The compression is
  // lossless for the geometry; /public/draco holds the decoder that restores
  // it. Without the decoder the model would silently never appear.
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  dracoLoader.setDecoderConfig({ type: "wasm" });
  // One worker is plenty for a single one-off decode, and it keeps the thread
  // and memory footprint down on laptops.
  dracoLoader.setWorkerLimit(1);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  // Plain loader used only if the Draco path fails.
  const plainLoader = new GLTFLoader();

  const applyCharacter = async (gltf: GLTF) => {
    const character = gltf.scene;
    await renderer.compileAsync(character, camera, scene);
    character.traverse((child: any) => {
      if (child.isMesh) {
        const mesh = child as THREE.Mesh;
        child.castShadow = false;
        child.receiveShadow = false;
        mesh.frustumCulled = true;
        if (mesh.material) {
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          mats.forEach((mat: any) => {
            if (mat) (mat as THREE.ShaderMaterial).precision = "mediump";
            enforceGreen(mat);
          });
        }
      }
    });
    character.getObjectByName("footR")?.position.setY(3.36);
    character.getObjectByName("footL")?.position.setY(3.36);
    setCharTimeline(character, camera);
    setAllTimeline();
  };

  const loadCharacter = () => {
    return new Promise<GLTF | null>((resolve, reject) => {
      const onLoad = async (gltf: GLTF) => {
        await applyCharacter(gltf);
        dracoLoader.dispose();
        resolve(gltf);
      };

      // The plaintext model is served directly. Fetching an .enc copy and
      // decrypting it in the browser only delayed the load before it started.
      loader.load(MODEL_URL, onLoad, undefined, (error) => {
        console.warn(
          "[character] Draco decode unavailable, loading uncompressed model:",
          error
        );
        plainLoader.load(
          FALLBACK_MODEL_URL,
          onLoad,
          undefined,
          (fallbackError) => {
            console.error("Error loading GLTF model:", fallbackError);
            reject(fallbackError);
          }
        );
      });
    });
  };

  return { loadCharacter };
};

export default setCharacter;
