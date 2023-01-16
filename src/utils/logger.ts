// @ts-ignore
import { parse } from "path";

export default class Logger {
  #fileName: string
  constructor(path = import.meta.url) {
    this.#fileName = parse(path).name || path;
  }
  log(...args: any[]) {
    console.log(`[${this.#fileName}]`, ...args);
  }
  error(...args: any[]) {
    console.error(`[${this.#fileName}]`, ...args);
  }
}
