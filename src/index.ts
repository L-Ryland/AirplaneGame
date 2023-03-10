import Logger from "~@/utils/logger.js";
import {
  WebGLRenderer,
  PMREMGenerator,
  HalfFloatType,
} from "three";
import $ from "jquery";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Game from "./Game";
const logger = new Logger(import.meta.url);
// const rootElement = document.getElementById("app");
const rootElement = $("#app");
// initialize renderer
const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

// initialize game
const game = new Game(renderer);
const { camera, scene } = game;

// finishing
rootElement.replaceWith(renderer.domElement);
// logger.log("rootElement", rootElement, window, document);
// initialize control
const controls = new OrbitControls(camera, renderer.domElement);
// controls.update()
$("#playBtn").on("click", function () {
  // this.style.display = "none";
  // logger.log("this", this, $(this))
  $(this).removeClass("block").addClass("hidden");
  $("#instructions").addClass("hidden");
  $("#gameover").addClass("hidden");
  game.startGame();
})

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
