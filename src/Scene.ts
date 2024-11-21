import { WrappedRenderer } from "@rive-app/canvas-advanced";
import RiveRenderer from "./Rive/RiveRenderer";

export default class Scene {
  protected riveObjects: RiveRenderer[] = [];
  private initialized: boolean = false;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public get Name(): string {
    return this.name;
  }

  Init(): void {
    this.initialized = true;
  }

  Add(object: RiveRenderer): RiveRenderer {
    this.riveObjects.push(object);
    return object;
  }

  Remove(object: RiveRenderer): void {
    const index = this.riveObjects.indexOf(object);
    if (index >= 0) {
      object.destroy();
      this.riveObjects.splice(index, 1);
    }
  }

  Update(deltaTime: number, time: number): void {
    // Update game logic
    for (let riveRenderer of this.riveObjects) {
      if (riveRenderer.enabled) {
        riveRenderer.advance(deltaTime);
      }
    }
  }

  Destroy(): void {
    while (this.riveObjects.length > 0) {
      const object = this.riveObjects[0];
      this.Remove(object);
    }
    this.initialized = false;
  }

  Render(renderer: WrappedRenderer): void {
    for (let riveRenderer of this.riveObjects) {
      if (!riveRenderer.enabled) continue;

      renderer.save();
      renderer.align(
        riveRenderer.fit,
        riveRenderer.alignment,
        riveRenderer.frame,
        riveRenderer.artboard.bounds
      );
      riveRenderer.artboard.draw(renderer);
      renderer.restore();
    }
  }
}