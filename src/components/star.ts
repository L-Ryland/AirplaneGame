import {
  CircleGeometry,
  ExtrudeGeometry,
  Mesh,
  MeshStandardMaterial,
  Shape,
  Scene,
} from "three";

class Star extends Mesh {
  static #extrudeSettings = {
    steps: 1,
    depth: 0.5,
    bevelEnabled: false,
  };
  constructor(scene: Scene) {
    const shape = Star.#drawHedron();
    const geometry = new ExtrudeGeometry(shape, Star.#extrudeSettings);
    const material = new MeshStandardMaterial({ color: 0x0000ff });
    super(geometry, material);
    scene.add(this);
  }
  static #draw(innerRadius = 0.4, outerRadius = 0.8, points = 5) {
    const self = this;
    const shape = new Shape();
    const inc = Math.PI / points;
    shape.moveTo(outerRadius, 0);
    let inner = true;
    for (let theta = inc; theta < Math.PI * 2; theta += inc) {
      const radius = inner ? innerRadius : outerRadius;
      shape.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
      inner = !inner;
    }
    // return new ExtrudeGeometry(shape, this.extrudeSettings);
    return shape;
  }
  static #drawHedron(radius = 0.8, points = 6) {
    const shape = new Shape();
    // shape.moveTo(radius, 0);
    const inc = (Math.PI * 2) / points;
    for (let theta = 0; theta < Math.PI * 2; theta += inc) {
      shape.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
    }
    // return new ExtrudeGeometry(shape, extrudeSettings);
    return shape;
  }
  render() {
    this.rotateY(0.01);
    this.rotateX(-0.01);
    this.rotateZ(0.01);
  }
}

export default Star;
