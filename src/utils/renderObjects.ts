import Component from "./Component";

export const renderObjects = (mesh: Component) => {
  if (mesh.update) mesh.update();
}