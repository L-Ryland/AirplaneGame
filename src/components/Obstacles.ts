import { Group, Object3D, Scene, Vector3 } from "three";
import { fill, random, forEach, some } from "lodash";
import GLTFComponent from "~@/utils/GLTFComponent";
import Logger from "~@/utils/logger";
import Game from "~@/Game";

export default class Obstacles extends GLTFComponent{
  #logger = new Logger(import.meta.url);
  constructor(game: Game) { 
    super("");
    this.assetPath = `${this.assetPath}plane/`;
  }
  async load(_scene: Scene) {
    const assetPath = this.assetPath;
    const star = new GLTFComponent("star.glb");
    const bomb = new GLTFComponent("bomb.glb");
    star.assetPath = assetPath;
    bomb.assetPath = assetPath;
    // await star.load(_scene);
    const {children: [bombMesh]} = await bomb.init();
    const {children: [starMesh]} = await star.init();
    bombMesh.name = "bomb";
    // bombMesh.position.y = 7.5;
    // bombMesh.rotation.z = - Math.PI / 2;
    starMesh.name = "star";
    // const obstacle = this.initObstacle(bombMesh, starMesh);
    const offset = 30;
    const obstacleGroup = new Group();
    forEach(Array(10), (element: Group, index) => {
      element = this.initObstacle(bombMesh, starMesh);
      element.position.setZ((index + 0.5) * offset);
      element.position.setY(random(true));
      // _scene.add(element);
      obstacleGroup.add(element);
    });
    this.instance = obstacleGroup;
    _scene.add(obstacleGroup);
    // _scene.add(obstacle)
  }
  initObstacle(bomb: Object3D, star: Object3D) {
    const group = fill(Array(7), bomb);
    const tmpIndex = random(group.length);
    group[tmpIndex] = star;
    const meshGroup = new Group();
    group.forEach((item, index) => {
      item.position.setY(index * 1.5);
      const cloned = item.clone();
      if (item.name === "bomb") {
        let bombIndex = index > tmpIndex ? index - 1 : index;
        if (bombIndex === 1 || bombIndex === 4) {
          cloned.rotateZ(- Math.PI / 2);
        }
        meshGroup.add(cloned);
      } else meshGroup.add(cloned);
    });
    return meshGroup;
  }
  
  checkPlane(planePosition:  Vector3){
    const obstacles = this.instance.children;
    const logger = this.#logger;
    const checkCollision = (obstacle: Object3D) => {
      const relativePosZ = Math.abs(obstacle.position.z - planePosition.z);
      // plane has met a set of obstacles
      if (relativePosZ < 2) {
        logger.log("cross", obstacle)
        forEach(obstacle.children, item => {
          const tmpPos = new Vector3();
          const worldPosition = item.getWorldPosition(tmpPos);
          const dist = tmpPos.distanceToSquared(planePosition);
          if (item.name === "star") {
            item.rotateY(0.1);
            logger.log("worldPosition", worldPosition);
            logger.log("dist", dist);
            if (dist < 2.5 * 2.5) item.visible = false;
          }
        })
      }
    }
    forEach(obstacles, checkCollision)
  }
}