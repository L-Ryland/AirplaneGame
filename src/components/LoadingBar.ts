import $ from "jquery";
class LoadingBar {
  static #loadingBar: LoadingBar;
  #domElement: JQuery<HTMLDivElement>;
  #progressBar: JQuery<HTMLDivElement>;
  assets: {
    [key: string]: {
      loaded: number;
      total: number;
    };
  };
  constructor() {
    this.#init();

    // function onprogress(delta){
    // 	const progress = delta*100;
    // 	loader.progressBar.style.width = `${progress}%`;
    // }
  }
  #init() {
    const loadingBar = $(`<div></div`).css({
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "#000",
      opacity: 0.7,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1111,
    }) as JQuery<HTMLDivElement>;
    const barBase = $(`<div></div>`).css({
      backgroundColor: "#aaa",
      width: "50%",
      minWidth: 250,
      borderRadius: 10,
      height: 15,
    });
    const bar = $(`<div></div>`).css({
      backgroundColor: "#22a",
      width: "50%",
      borderRadius: 10,
      height: "100%",
    }) as JQuery<HTMLDivElement>
    // const bar = document.createElement("div");
    // bar.style.background = "#22a";
    // bar.style.width = "50%";
    // bar.style.borderRadius = "10px";
    // bar.style.height = "100%";
    // bar.style.width = "0";
    // barBase.appendChild(bar);
    bar.appendTo(barBase);
    barBase.appendTo(loadingBar);
    this.#progressBar = bar;
    this.#domElement = loadingBar;
    // document.body.appendChild(this.#domElement);
    loadingBar.appendTo("body");
  }
  static get instance() {
    if (!this.#loadingBar) {
      this.#loadingBar = new LoadingBar();
      this.#loadingBar.visible = false;
    }
    return this.#loadingBar;
  }
  set progress(delta: number) {
    const percent = delta * 100;
    // this.#progressBar.style.width = `${percent}%`;
    this.#progressBar.css("width", `${percent}%`);
  }

  set visible(value: boolean) {
    if (value) {
      this.#domElement.css({display: "flex"});
    } else {
      this.#domElement.css({display: "none"});
    }
  }

  update(assetName: string, loaded: number, total: number) {
    if (this.assets === undefined) this.assets = {};

    if (this.assets[assetName] === undefined) {
      this.assets[assetName] = { loaded, total };
    } else {
      this.assets[assetName].loaded = loaded;
      this.assets[assetName].total = total;
    }

    let ploaded = 0,
      ptotal = 0;
    Object.values(this.assets).forEach((asset) => {
      ploaded += asset.loaded;
      ptotal += asset.total;
    });

    this.progress = ploaded / ptotal;
  }
}

export { LoadingBar };
