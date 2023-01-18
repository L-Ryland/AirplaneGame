import {
  IcosahedronGeometry,
  TextureLoader,
  ShaderMaterial,
  Mesh,
  ShaderChunk,
  Object3D,
} from "three";
import { noise } from "../libs/noise";
import { Tween } from "../libs/Toon3D.js";
import Obstacles from "./Obstacles";
import Logger from "~@/utils/logger";

class Explosion {
  static #vshader = `
#include <noise>

uniform float u_time;

varying float noise;

void main() {	
  float time = u_time;
  float displacement;
  float b;
  
  // add time to the noise parameters so it's animated
  noise = 10.0 *  -.10 * turbulence( .5 * normal + time );
  b = 5.0 * pnoise( 0.05 * position + vec3( 2.0 * time ), vec3( 100.0 ) );
  displacement = - 10. * noise + b;

  // move the position along the normal and transform it
  vec3 newPosition = position + normal * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
`;
  static #fshader = `
#define PI 3.141592653589
#define PI2 6.28318530718

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_opacity;
uniform sampler2D u_tex;

varying float noise;

//	<https://www.shadertoy.com/view/4dS3Wd>
//	By Morgan McGuire @morgan3d, http://graphicscodex.com

//https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js/

float random( vec3 scale, float seed ){
  return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
}

void main() {

  // get a random offset
  float r = .01 * random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );
  // lookup vertically in the texture, using noise and offset
  // to get the right RGB colour
  vec2 t_pos = vec2( 0, 1.3 * noise + r );
  vec4 color = texture2D( u_tex, t_pos );

  gl_FragColor = vec4( color.rgb, u_opacity );
}
`;
  #assetPath = "src/assets/";
  uniforms = {
    u_time: { value: 0.0 },
    u_mouse: { value: { x: 0.0, y: 0.0 } },
    u_opacity: { value: 0.6 },
    u_resolution: { value: { x: 0, y: 0 } },
    u_tex: {
      value: new TextureLoader().load(`${this.#assetPath}plane/explosion.png`),
    },
  };
  ball: Mesh;
  tweens: Tween[] = [];
  #active: boolean;
  obstacles: Obstacles;
  instance: Object3D;
  constructor(obstacles: Obstacles) {
  // constructor(parent: Object3D, obstacles: Obstacles) {
    const geometry = new IcosahedronGeometry(20, 4);

    // this.obstacles = obstacles;

    ShaderChunk.noise = noise;

    const material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: Explosion.#vshader,
      fragmentShader: Explosion.#fshader,
      transparent: true,
      opacity: 0.6,
    });

    this.ball = new Mesh(geometry, material);
    const scale = 0.05;
    const {ball, tweens} = this;
    ball.scale.set(scale, scale, scale);
    ball.name = "explosion";
    // parent.add(this.ball);
    this.instance = ball;
    tweens.push(
      new Tween(
        this.ball.scale,
        "x",
        0.2,
        5,
        () => this.onComplete(),
        "outQuad"
      )
    );
    this.#active = true;
  }

  onComplete() {
    const logger = new Logger(this.constructor.name);
    logger.log("onComplete");
    const ball = this.ball;
    const instance = this.instance;
    const geometry = this.ball.geometry;
    const material = this.ball.material as ShaderMaterial;
    const obstacles = this.obstacles;
    // ball.parent.remove(this.ball);
    instance.parent?.remove(instance);
    // ball.clear();
    this.tweens = [];
    this.#active = false;
    geometry.dispose();
    material.dispose();
    if (obstacles) obstacles.removeExplosion(this);
  }

  update(time: number) {
    if (!this.#active) return;
    const {u_time, u_opacity} = this.uniforms;
    const tweens = this.tweens;
    const material = this.ball.material as ShaderMaterial;
    const scale = this.ball.scale;

    u_time.value += time;
    const logger = new Logger(this.constructor.name);
    logger.log("time",u_time);
    u_opacity.value = material.opacity;

    if (tweens.length < 2) {
      const elapsedTime = this.uniforms.u_time.value - 1;

      if (elapsedTime > 0) {
        tweens.push(new Tween(material, "opacity", 0, 0.5));
      }
    }

    tweens.forEach((tween) => {
      tween.update(time);
    });

    scale.y = scale.z = scale.x;
  }
}

export { Explosion };
