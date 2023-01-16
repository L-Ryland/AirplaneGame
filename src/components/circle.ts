import { CircleGeometry, Mesh, MeshStandardMaterial, Scene } from "three";

class Circle extends Mesh {
  constructor(scene: Scene) {
    const geometry = new CircleGeometry(1, 32, 0, 2 * Math.PI);
    const material = new MeshStandardMaterial({ color: 0x00ff00 });
    super(geometry, material);
    scene.add(this);
  }
  render() {
    this.rotateY(0.01);
    this.rotateX(-0.01);
    this.rotateZ(0.01);
  }
}

export default Circle;
