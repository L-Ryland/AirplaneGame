import { BoxGeometry, MeshStandardMaterial, Scene, WebGLRenderer } from "three";
import Component from "~@/utils/Mesh";
import Logger from "~@/utils/logger";

class Box extends Component {
  constructor() {
    const logger = new Logger(import.meta.url);
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial({ color: 0xff0000 });
    super({geometry, material});
  }
  update() {
    super.update();
    const box = this.instance;
    box.rotateY(0.01);
    box.rotateX(-0.01);
    box.rotateZ(0.01);
  }
}

export default Box;
