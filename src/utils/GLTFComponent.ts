import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Component from "./Mesh";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Clock,
  Object3D,
  Scene,
  Vector3,
} from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { LoadingBar } from "~@/components/LoadingBar";
import Logger from "./logger";

export default class GLTFComponent extends Component {
  #fileName: string;
  #assetPath = "src/assets/";
  #dracoLibPath =
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/";
  #clock = new Clock();
  #mixer: AnimationMixer;
  #currAction: AnimationAction;
  #currIndex: number;
  #animations: AnimationClip[];
  constructor(fileName?: string) {
    super();
    this.#fileName = fileName || this.constructor.name;
  }
  get assetPath() {
    return this.#assetPath;
  }
  set assetPath(value: string) {
    this.#assetPath = value;
  }
  get clock() {
    return this.#clock;
  }
  get position() {
    const tmpPos = new Vector3();
    const worldPosition = this.instance.getWorldPosition(tmpPos);
    return worldPosition;
  }
  async load(_scene: Scene) {
    const mesh = await this.init();
    _scene.add(mesh);
    this.animate();
  }
  async init() {
    const loader = new GLTFLoader().setPath(this.#assetPath);
    const dracoLoader = new DRACOLoader();
    const loadingBar = LoadingBar.instance;
    loadingBar.visible = true;
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.setDecoderPath(this.#dracoLibPath);
    loader.setDRACOLoader(dracoLoader);
    const { scene, animations } = await loader.loadAsync(
      this.#fileName,
      ({ loaded, total }) => loadingBar.update(this.#fileName, loaded, total)
    );
    loadingBar.visible = false;
    this.instance = scene;
    this.#mixer = new AnimationMixer(scene);
    this.#animations = animations;
    return scene;
  }
  update(time?: number) {
    const delta = this.#clock.getDelta();
    this.#mixer.update(delta);
  }
  animate() {}
}
