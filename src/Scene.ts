import {Scene as BaseScene} from "three";
export default class Scene {
  static #scene: BaseScene;
  static get instance() {
    if (!this.#scene) {
      this.#scene = new Scene();
      dff
    }
  }
}