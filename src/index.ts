import Logger from "~@/utils/logger.js";
import {
  PerspectiveCamera,
  Scene,
  Color,
  WebGLRenderer,
  HemisphereLight,
  DirectionalLight,
} from "three";
import Box from "./components/box";
import Circle from "./components/circle";
import Star from "./components/star";
import { Eve } from "./components/eve";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Game from "./Game";
const logger = new Logger(import.meta.url);
const rootElement = document.getElementById("app");
const game = new Game();
const { camera, scene } = game;

// initialize renderer
const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
// finishing
rootElement.replaceWith(renderer.domElement);
logger.log("rootElement", rootElement, window, document);
// initialize control
const controls = new OrbitControls(camera, renderer.domElement);
// controls.update()
const button = document.getElementById("playBtn");
button.addEventListener("click", function() {
  this.style.display = "none";
  game.startGame();
});
game.render();
function loopMethod() {
  game.loop();
  renderer.render(scene, camera);
  // box.render()
  // circle.render();
  // star.render();
  // eve.loop();
}
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
resize();
renderer.setAnimationLoop(loopMethod);
window.addEventListener("resize", resize);
