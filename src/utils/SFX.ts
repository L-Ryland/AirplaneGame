import { keys } from "lodash";
import { AudioListener, Camera, PositionalAudio, Audio, AudioLoader } from "three";
import Logger from "./logger";
interface SoundConfig {
  loop?: boolean;
  volume?: number;
}
export default class SFX {
  static #sfxTool: SFX;
  #logger = new Logger(SFX.name);
  #listener: AudioListener;
  #sounds: Record<string, Audio | PositionalAudio>;
  #assetPath: string;
  constructor(camera: Camera, assetPath: string) {
    if (SFX.#sfxTool) {
      this.#logger.log("SFX is already initialized");
      return;
    }
    const listener = new AudioListener();
    camera.add(listener);
    this.#listener = listener;
    this.#assetPath = assetPath;
    this.#sounds = {};
    SFX.#sfxTool = this;
  }
  async load(name: string, {loop = false, volume = 0.5}: SoundConfig, obj?: Object) {
    this.#logger.log("assetPath", this.#assetPath)
    const listener = this.#listener;
    const sound = obj ? new PositionalAudio(listener) : new Audio(listener);
    this.#sounds[name] = sound;
    const audioLoader = new AudioLoader();
    const audioBuffer = await audioLoader.setPath(this.#assetPath).loadAsync(`${name}.mp3`);
    sound.setBuffer(audioBuffer).setLoop(loop).setVolume(volume);
  }
  setSoundConfig(name: string, {loop, volume}: SoundConfig) {
    const sound = this.#sounds[name];
    if (volume !== undefined) sound.setVolume(volume);
    if (loop !== undefined) sound.setLoop(loop);
  }
  play(name: string) {
    const sound = this.#sounds[name];
    if (!sound || sound.isPlaying) return;
    sound.play();
  }
  stop(name: string) {
    const sound = this.#sounds[name];
    if (sound && sound.isPlaying) sound.stop() 
  }
  pause(name: string) {
    const sound = this.#sounds[name];
    if (sound && sound.isPlaying) sound.pause() 
  }
  stopAll() {
    keys(this.#sounds).map(name => this.stop(name));
  }
}