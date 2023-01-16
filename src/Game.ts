import {
  CubeTextureLoader,
  Object3D,
  PerspectiveCamera,
  Scene,
  HemisphereLight,
  DirectionalLight,
  Clock,
  Vector3,
} from "three";
import { map, startsWith } from "lodash";
import Box from "./components/box";
import Component from "./utils/Mesh";
import { Eve } from "./components/eve";
import Logger from "./utils/logger";
import Plane from "./components/Plane";
import Obstacles from "./components/Obstacles";

export default class Game {
  #started = false;
  #scene: Scene;
  #camera: PerspectiveCamera;
  #cameraController = new Object3D();
  #cameraTarget = new Vector3(0, 0, 6);
  #clock = new Clock();
  #assetPath = "src/assets";
  #instances: Component[] = [];
  #logger = new Logger(import.meta.url);
  #plane: Plane;
  #obstacles: Obstacles
  constructor() {
    // setInterval(() => {
    //   this.#logger.log("cameraController", this.#cameraController);
    // }, 3000);
  }
  get camera(): PerspectiveCamera {
    const camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(-4.37, 0, -4.75);
    camera.lookAt(0, 3.5, 6);
    this.#camera = camera;
    return camera;
  }
  get scene() {
    const scene = new Scene();
    const { ambient, light, background } = this;
    scene.background = background;
    const cameraController = this.#cameraController;
    cameraController.add(this.#camera);
    scene.add(cameraController);
    scene.add(ambient);
    scene.add(light);
    this.#scene = scene;
    return scene;
  }
  get ambient() {
    return new HemisphereLight(0xffffff, 0xbbbbff, 0.3);
  }
  get light() {
    const light = new DirectionalLight();
    light.position.set(0.2, 1, 1);
    return light;
  }
  get background() {
    const bgDir = `${this.#assetPath}/plane/paintedsky/`;
    return new CubeTextureLoader()
      .setPath(bgDir)
      .load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);
  }
  get objects() {
    return map(this.#instances, (item) => item.instance);
  }
  updateCamera() {
    const camera = this.#camera;
    const cameraTarget = this.#cameraTarget;
    const cameraController = this.#cameraController;
    const plane = this.#plane.instance;
    cameraController.position.copy(plane.position);
    // cameraController.position.y = 3;
    cameraTarget.copy(plane.position);
    cameraTarget.z += 6;
    // camera.position.copy(cameraController.position)
    // camera.position.z += 6
    // camera.position.copy(cameraTarget)
    camera.lookAt(cameraTarget);
  }
  async render() {
    // const box = new Box();
    // if (box.isObject3D) {
    //   this.#instances.push(box);
    //   this.#scene.add(box);
    // }
    // const eve = new Eve();
    // await eve.loadEve(this.#scene);
    const plane = new Plane();
    this.#plane = plane;
    await plane.load(this.#scene);
    const obstacles = new Obstacles(this);
    this.#obstacles = obstacles;
    await obstacles.load(this.#scene);
    // if (eve.isObject3D) this.#instances.push(eve);
    const dispatchEvent = (event: UIEvent) => {
      const type = event.type;
      if (startsWith(type, "key")) {
        const { code } = event as KeyboardEvent;
        this.#logger.log("code", code)
        if (code !== "Space") return;
        if (type === "keydown") this.accelerate();
        if (type === "keyup") this.decelerate();
      } else {
        if (type === "mousedown" || type === "touchstart") this.accelerate();
        if (type === "mouseup" || type === "touchend") this.decelerate();
      }
    };
    window.addEventListener("keydown", dispatchEvent);
    window.addEventListener("keyup", dispatchEvent);
    // window.addEventListener("mousedown", dispatchEvent);
    // window.addEventListener("mouseup", dispatchEvent);
    // window.addEventListener("touchstart", dispatchEvent);
    // window.addEventListener("touchend", dispatchEvent);
  }
  loop() {
    const logger = this.#logger;
    const time = this.#clock.getElapsedTime();
    const plane = this.#plane;
    const obstacles = this.#obstacles;
    if (!this.#started) plane.beforeStart(time);
    else {
      plane.started(time);
      obstacles.checkPlane(plane.instance.position);
      this.updateCamera();
    }
  }
  startGame() {
    this.#started = true;
  }
  accelerate() {
    this.#logger.log("accelerate");
    const plane = this.#plane;
    plane.velocity.y += 0.1;
  }
  decelerate() {
    this.#logger.log("decelerate");
    const plane = this.#plane;
    plane.velocity.y = 0;
    plane.velocity.y -= 0.1;
  }
}
