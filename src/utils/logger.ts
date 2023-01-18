// @ts-ignore
import { parse } from "path";

export default class Logger {
  #fileName: string
  constructor(path?: string) {
    this.#fileName = parse(path).name || path;
  }
  log(...args: any[]) {
    console.log(`[${this.#fileName}]`, ...args);
  }
  error(...args: any[]) {
    console.error(`[${this.#fileName}]`, ...args);
  }
  warn(...args: any[]) {
    console.warn(`[${this.#fileName}]`, ...args);
  }
}
