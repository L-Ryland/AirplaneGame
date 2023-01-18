import { Group, Object3D, Scene, Vector3 } from "three";
import { fill, random, forEach, some, remove, last } from "lodash";
import GLTFComponent from "~@/utils/GLTFComponent";
import Logger from "~@/utils/logger";
import Game from "~@/Game";
import { Explosion } from "./Explosion";

export default class Obstacles extends GLTFComponent {
  #logger = new Logger(import.meta.url);
  #bomb: Object3D;
  #star: Object3D;
  #explosions: Explosion[] = [];
  #newInstance: Object3D
  
  constructor(game: Game) {
    super("");
    this.assetPath = `${this.assetPath}plane/`;
  }
  get position() {
    const tmpPos = new Vector3();
    const position = last(this.instance.children).getWorldPosition(tmpPos);
    return position;
  }
  async load(_scene: Scene) {
    const assetPath = this.assetPath;
    const star = new GLTFComponent("star.glb");
    const bomb = new GLTFComponent("bomb.glb");
    star.assetPath = assetPath;
    bomb.assetPath = assetPath;
    // await star.load(_scene);
    const bombMesh = await bomb.init();
    const {
      children: [starMesh],
    } = await star.init();
    bombMesh.name = "bomb";
    this.#bomb = bombMesh;
    // bombMesh.position.y = 7.5;
    // bombMesh.rotation.z = - Math.PI / 2;
    starMesh.name = "star";
    this.#star = starMesh;
    // const obstacle = this.initObstacle(bombMesh, starMesh);
    _scene.add(this.initObstacleGroup());
    this.instance = this.#newInstance;
    this.#newInstance = null;
    // _scene.add(obstacle)
  }
  initObstacle(bomb: Object3D, star: Object3D) {
    const group = fill(Array(7), bomb);
    const tmpIndex = random(group.length);
    group[tmpIndex] = star;
    const meshGroup = new Group();
    group.forEach((item, index) => {
      item.position.setY(index * 2.5);
      const cloned = item.clone();
      if (item.name === "bomb") {
        let bombIndex = index > tmpIndex ? index - 1 : index;
        if (bombIndex === 1 || bombIndex === 4) {
          cloned.rotateZ(-Math.PI / 2);
        }
        meshGroup.add(cloned);
      } else meshGroup.add(cloned);
    });
    return meshGroup;
  }

  initObstacleGroup(positionZ = 0) {
    const obstacleGroup = new Group();
    const offset = 30;
    const bomb = this.#bomb;
    const star = this.#star;
    forEach(Array(3), (element: Group, index) => {
      element = this.initObstacle(bomb, star);
      element.position.setZ((index + 0.5) * offset + positionZ);
      element.position.setY(random(true));
      // _scene.add(element);
      obstacleGroup.add(element);
    });
    this.#newInstance = obstacleGroup;
    // if (!this.instance) this.instance = this.#newInstance;
    return obstacleGroup;
  }

  checkPlane(planePosition: Vector3, game: Game) {
    const obstacles = this.instance.children;
    const logger = this.#logger;
    const time = this.clock.getElapsedTime();
    const checkCollision = (obstacle: Object3D) => {
      const relativePosZ = Math.abs(obstacle.position.z - planePosition.z);
      // plane has met a set of obstacles
      if (relativePosZ < 2) {
        some(obstacle.children, (item) => {
          const tmpPos = new Vector3();
          const worldPosition = item.getWorldPosition(tmpPos);
          const dist = tmpPos.distanceToSquared(planePosition);
          item.rotateY(0.1);
          if (dist > 2.5 * 2.5) return false;
          if (item.name === "star") {
            if (item.visible) {
              item.visible = false;
              game.incScores();
            }
            return true;
          } else {
            if (!item.getObjectByName("explosion")) {
              if (item.children[0].visible) {
                item.children[0].visible = false;
                const explosion = new Explosion(this);
                item.add(explosion.instance);
                this.#explosions.push(explosion);
                game.decLives();
              }
              return true;
            }
            forEach(this.#explosions, (explosion) => explosion.update(time));
          }
          return true;
        });
      }
    };
    forEach(obstacles, checkCollision);
    const relativePosZ = this.position.z - planePosition.z;
    if (relativePosZ < 0 && this.#newInstance) {
      this.instance = this.#newInstance;
      this.#newInstance = null;
    } else if (relativePosZ < 25 && !this.#newInstance) {
      logger.log("addObstacles");
      game.scene.add(this.initObstacleGroup(this.position.z));
    }
  }
  reset() {
    //todo
  }
  removeExplosion(explosion: Explosion) {
    const explosions = this.#explosions;
    if (!explosions) return;
    this.#explosions = remove(explosions, explosion);
  }
}
