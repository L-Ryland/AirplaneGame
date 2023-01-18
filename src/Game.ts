import {
  CubeTextureLoader,
  Object3D,
  PerspectiveCamera,
  Scene,
  HemisphereLight,
  DirectionalLight,
  Clock,
  Vector3,
  UnsignedByteType,
  WebGLRenderer,
  HalfFloatType,
  PMREMGenerator,
} from "three";
import $ from "jquery";
import { map, startsWith, toSafeInteger, toString } from "lodash";
import Box from "./components/box";
import Component from "./utils/Mesh";
import { Eve } from "./components/eve";
import Logger from "./utils/logger";
import Plane from "./components/Plane";
import Obstacles from "./components/Obstacles";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

export default class Game {
  #started = false;
  #renderer: WebGLRenderer;
  #scene: Scene;
  #camera: PerspectiveCamera;
  #cameraController = new Object3D();
  #cameraTarget = new Vector3(0, 0, 6);
  #clock = new Clock();
  #assetPath = "src/assets";
  #instances: Component[] = [];
  #logger = new Logger(import.meta.url);
  #plane: Plane;
  #obstacles: Obstacles;
  #spaceKey: boolean = false;
  #loading: boolean = true;
  #lives: 3;
  #scores: 0;
  constructor(renderer: WebGLRenderer) {
    // setInterval(() => {
    //   this.#logger.log("cameraController", this.#cameraController);
    // }, 3000);
    this.#renderer = renderer;
    this.loadCamera();
    this.setEnvironment(renderer);
    this.loadScene();
    this.render();
  }
  get camera(): PerspectiveCamera {
    return this.#camera;
  }
  get scene() {
    return this.#scene;
  }
  get #ambient() {
    const ambient = new HemisphereLight(0xffffff, 0xbbbbff, 1);
    ambient.position.set(0.5, 1, 0.25);
    return ambient;
  }
  get #light() {
    const light = new DirectionalLight();
    light.position.set(0.2, 1, 1);
    return light;
  }
  get #background() {
    const bgDir = `${this.#assetPath}/plane/paintedsky/`;
    const cubeTextureLoader = new CubeTextureLoader()
      .setPath(bgDir)
      .load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);
    return cubeTextureLoader;
  }
  get objects() {
    return map(this.#instances, (item) => item.instance);
  }
  async setEnvironment(renderer: WebGLRenderer) {
    const loader = new RGBELoader()
      .setDataType(HalfFloatType)
      .setPath(this.#assetPath);
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();


    const texture = await loader.loadAsync("hdr/venice_sunset_1k.hdr");
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    pmremGenerator.dispose();

    this.scene.environment = envMap;
  }
  loadScene() {
    const scene = new Scene();
    scene.background = this.#background;
    const cameraController = this.#cameraController;
    cameraController.add(this.#camera);
    scene.add(cameraController);
    scene.add(this.#ambient);
    scene.add(this.#light);
    this.#scene = scene;
  }
  loadCamera() {
    const camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(-4.37, 3, -4.75);
    camera.lookAt(0, 3.5, 6);
    this.#camera = camera;
  }
  updateCamera() {
    const camera = this.#camera;
    const cameraTarget = this.#cameraTarget;
    const cameraController = this.#cameraController;
    const plane = this.#plane;
    cameraController.position.copy(plane.position);
    // cameraController.position.y = 0;
    // cameraTarget.y = 0;
    cameraController.position.y = 7;
    cameraTarget.copy(plane.position);
    cameraTarget.z += 6;
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
    const plane = new Plane(this);
    await plane.load(this.#scene);
    this.#plane = plane;
    const obstacles = new Obstacles(this);
    await obstacles.load(this.#scene);
    this.#obstacles = obstacles;
    this.bindEvent();
    this.reset();
    this.#loading = false;
    // if (eve.isObject3D) this.#instances.push(eve);
  }
  loop() {
    if (this.#loading) return;
    this.updateInfo();
    const logger = this.#logger;
    const plane = this.#plane;
    const obstacles = this.#obstacles;
    if (!this.#started) plane.beforeStart();
    else {
      if (this.#spaceKey) {
        plane.accelerate();
      } else {
        plane.decelerate();
      }
      plane.started();
      obstacles.checkPlane(plane.instance.position, this);
      this.updateCamera();
    }
  }
  bindEvent() {
    const dispatchEvent = (event: UIEvent) => {
      const type = event.type;
      if (startsWith(type, "key")) {
        const { code } = event as KeyboardEvent;
        this.#logger.log("code", code);
        if (code !== "Space") return;
        if (type === "keydown") this.#spaceKey = true;
        if (type === "keyup") this.#spaceKey = false;
      } else {
        if (type === "mousedown" || type === "touchstart")
          this.#spaceKey = true;
        if (type === "mouseup" || type === "touchend") this.#spaceKey = false;
      }
    };
    window.addEventListener("keydown", dispatchEvent);
    window.addEventListener("keyup", dispatchEvent);
    window.addEventListener("mousedown", dispatchEvent);
    window.addEventListener("mouseup", dispatchEvent);
    window.addEventListener("touchstart", dispatchEvent);
    window.addEventListener("touchend", dispatchEvent);
  }
  startGame() {
    this.#plane.reset();
    this.#obstacles.reset();
    this.#started = true;
  }
  gameOver() {
    this.#logger.log("game is over")
  }
  updateInfo() {
    const lives = this.#lives;
    const scores = this.#scores;
    $("#life").text((_, text) => {
      // if (text !== lives) return lives
      return toSafeInteger(text) === lives ? undefined : lives;
    });
    $("#score").text((_, text) => toSafeInteger(text) === scores ? undefined : scores)
  }
  reset() {
    this.#lives = 3;
    this.#scores = 0;
  }
  decLives() {
    this.#lives--;
  }
  incScores() {
    this.#scores++;
  }
}
