import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

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

  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const encryptedBlob = await decryptFile(
          "/models/character.enc",
          "Character3D#@"
        );
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;
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
                    if (mat) {
                      console.log(
                        "MESH", child.name,
                        "color", mat.color ? ('#'+mat.color.getHexString()) : "none",
                        "emissive", mat.emissive ? ('#'+mat.emissive.getHexString()) : "none",
                        "hasMap", !!mat.map,
                        "hasEmissiveMap", !!mat.emissiveMap
                      );
                    }
                  });
                }
              }
            });
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;
            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
