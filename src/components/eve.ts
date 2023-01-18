import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Clock,
  LoopOnce,
  // Mesh,
  Scene,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import Logger from "~@/utils/logger";
import { random } from "lodash";
import { LoadingBar } from "./LoadingBar";
import Component from "~@/utils/Component";

export class Eve extends Component {
  #logger: Logger;
  #assetPath = "src/assets/";
  #dracoLibPath =
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/";
  #clock: Clock;
  #mixer: AnimationMixer;
  #currAction: AnimationAction;
  #currIndex: number;
  #animations: AnimationClip[];
  constructor() {
    super();
    // this.#scene = scene;
    this.#logger = new Logger(import.meta.url);
    this.#clock = new Clock();
    // this.loadEve();
  }
  async loadEve(_scene: Scene) {
    const logger = this.#logger;
    const loader = new GLTFLoader().setPath(this.#assetPath);
    const dracoLoader = new DRACOLoader();
    const loadingBar = LoadingBar.instance;
    loadingBar.visible = true;
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.setDecoderPath(this.#dracoLibPath); // use a full url path
    loader.setDRACOLoader(dracoLoader);
    const { scene, animations } = await loader.loadAsync(
      "eve.glb",
      ({ loaded, total }) => {
        loadingBar.update(undefined, loaded, total);
      }
    );
    loadingBar.visible = false;
    _scene.add(scene);
    // this.#scene.add(scene)
    // this.instance = scene;
    this.#mixer = new AnimationMixer(scene);
    this.#animations = animations;
    this.animate();
  }
  update() {
    const delta = this.#clock.getDelta();
    this.#mixer?.update(delta);
  }
  animate() {
    let index: number,
      length = this.#animations.length;
    do {
      index = random(1, length);
    } while (this.#currIndex === index);
    this.action = index;
    // this.#logger.log("animations", this.#animations[this.#currIndex]);
    setTimeout(this.animate.bind(this), 3000);
  }
  set action(index: number) {
    const clip = this.#animations[index];
    if (clip) {
      const action = this.#mixer.clipAction(clip);
      action.clampWhenFinished = true;
      action.reset();
      if (clip.name === "death") {
        action.setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
        if (this.#currAction) this.#currAction.enabled = false;
      }
      action.play();
      if (this.#currAction) {
        this.#currAction.crossFadeTo(action, 0.5, true);
      }
      this.#currIndex = index;
      this.#currAction = action;
    }
  }
}
