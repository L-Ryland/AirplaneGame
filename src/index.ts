import Logger from "~@/utils/logger.js";
import {
  WebGLRenderer,
  PMREMGenerator,
  HalfFloatType,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import Game from "./Game";
const logger = new Logger(import.meta.url);
const rootElement = document.getElementById("app");
// initialize renderer
const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

// initialize game
const game = new Game(renderer);
const { camera, scene } = game;
const assetPath = "src/assets/";

// loading environment
// await setEnvironment(renderer);
// finishing
rootElement.replaceWith(renderer.domElement);
// logger.log("rootElement", rootElement, window, document);
// initialize control
const controls = new OrbitControls(camera, renderer.domElement);
// controls.update()
const button = document.getElementById("playBtn");
button.addEventListener("click", function () {
  this.style.display = "none";
  game.startGame();
});
// game.render();
async function setEnvironment(renderer: WebGLRenderer) {
  const loader = new RGBELoader().setDataType(HalfFloatType).setPath(assetPath);
  if (!renderer) return;
  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const texture = await loader.loadAsync("hdr/venice_sunset_1k.hdr");
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  pmremGenerator.dispose();
  scene.environment = envMap;
}
function loopMethod() {
  game.loop();
  renderer.render(scene, camera);
}
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
resize();
renderer.setAnimationLoop(loopMethod);
window.addEventListener("resize", resize);
