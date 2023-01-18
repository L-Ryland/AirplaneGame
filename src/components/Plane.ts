import { Scene, Vector3 } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { isNaN } from "lodash";
import GLTFComponent from "~@/utils/GLTFComponent";
import Component from "~@/utils/Mesh";
import Logger from "~@/utils/logger";
import Game from "~@/Game";

export default class Plane extends GLTFComponent {
  #velocity = new Vector3(0, 0, 0);
  #Game = null;
  #tmpPos = new Vector3();
  get position(){
    const plane = this.instance;
    plane.getWorldPosition(this.#tmpPos)
    return this.#tmpPos;
  }
  constructor(game: Game) {
    super("microplane.glb");
    this.assetPath = `${this.assetPath}plane/`;
    this.#Game = game;
    setInterval(() => {
      if (this.instance)
        this.logger.log("plane position", this.instance.position);
    }, 3000);
  }
  set velocity(value) {
    this.refreshVelocity(value);
    this.#velocity = value;
  }
  get velocity() {
    const velocity = this.#velocity;
    this.refreshVelocity(velocity);
    return velocity;
  }
  refreshVelocity(value: Vector3) {
    const { x, y, z } = value;
    const instance = this.instance;
    // if (!isNaN(x)) instance.translateX(x);
    instance.translateZ(z);
    instance.translateY(y);
  }
  async load(_scene: Scene) {
    await super.load(_scene);
    // this.instance.position.y = 10;
  }
  // animate() {
  //   const delta = this.clock.getDelta();
  // }
  update(time: number) {
    const instance = this.instance;
    if (!instance) return;
    const propeller = instance.getObjectByName("propeller");
    propeller.rotateZ(0.1);
    instance.rotation.set(0, 0, Math.sin(time * 3) * 0.2, "XYZ");
    // instance.translateY(0.01)
    // instance.translateZ(0.01)
    // instance.position.y = Math.cos(time) * 1.5;
    // this.velocity;
  }
  beforeStart() {
    const instance = this.instance;
    const time = this.clock.getElapsedTime();
    if (!instance) return;
    this.update(time);
    instance.position.setY(3.5 + Math.cos(time) * 1.5);
  }
  started() {
    const plane = this.instance;
    const time = this.clock.getElapsedTime();
    if (!plane) return;
    // if(!spaceKey){
    //   this.velocity.y = -0.01;
    // }else{
    //   this.velocity.y = +0.01;
    // }
    // this.velocity.z = 0.01;
    // const {x, y, z} = this.velocity;
    // if (x) instance.translateX(x);
    // if (y) instance.translateY(y);
    // if (z) instance.translateZ(z);
    // this.velocity.z = 0.0005;
    // this.velocity.y -= 0.0005;
    this.update(time);
  }

  reset(){
    const plane = this.instance;
    plane.position.set(0,10,0);
    this.velocity.set(0,0,0.1);
    
  }
  accelerate() {
    // this.#logger.log("accelerate");
    this.velocity.y += 0.001;
  }
  decelerate() {
    // this.#logger.log("decelerate");
    // plane.velocity.y = 0;
    this.velocity.y -= 0.001;
  }
}
