import Component from "./Mesh";

export const renderObjects = (mesh: Component) => {
  if (mesh.update) mesh.update();
}