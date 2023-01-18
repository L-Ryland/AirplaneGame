import { Mesh as BaseMesh, Object3D, Scene } from "three";
import Logger from "./logger";

interface MeshConfig {
  geometry?: ConstructorParameters<typeof BaseMesh>["0"];
  material?: ConstructorParameters<typeof BaseMesh>["1"]
}
export default class Component {
  #instance: Object3D;
  #logger: Logger;
  constructor(config?: MeshConfig) {
    this.#logger = new Logger(this.constructor.name);
    if (config) {
      const {geometry, material} = config;
      this.instance = new BaseMesh(geometry, material);
    }
    // this.#instance = this;
  }
  update(time?: number) { }
  get logger() {
    return this.#logger;
  }
  get instance() {
    return this.#instance;
  }
  set instance(obj: Object3D) {
    this.#instance = obj;
  }
}