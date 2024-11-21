/**
 * A Scene is a container for RiveRenderer objects, which are the main "GameObjects" in the River engine.
 * 
 * Scenes allow you to organize your game into distinct sections like levels, menus, or game states.
 * The Game class maintains a current scene which it updates and renders each frame.
 * 
 * Usage:
 * ```typescript
 * // Create scenes for different game states
 * const gameplayScene = new Scene("gameplay");
 * const pauseScene = new Scene("pause");
 * 
 * // Add RiveRenderer objects to scenes
 * gameplayScene.Add(playerCharacter);
 * gameplayScene.Add(enemies);
 * pauseScene.Add(pauseMenu);
 * 
 * // Switch between scenes
 * Game.AddScene(gameplayScene);
 * // Later...
 * Game.SetCurrentScene(pauseScene);
 * ```
 * 
 * Each scene manages the lifecycle of its RiveRenderer objects:
 * - Adding/removing objects
 * - Updating objects each frame
 * - Rendering objects in order
 * - Cleaning up objects when destroyed
 */
import { WrappedRenderer } from "@rive-app/canvas-advanced";
import GameObject from "./GameObject";

export default class Scene {
  enabled: boolean = true;

  protected gameObjects: GameObject[] = [];
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

  Add(object: GameObject): GameObject {
    this.gameObjects.push(object);
    return object;
  }

  Remove(object: GameObject): void {
    const index = this.gameObjects.indexOf(object);
    if (index >= 0) {
      object.destroy();
      this.gameObjects.splice(index, 1);
    }
  }

  Update(deltaTime: number, time: number): void {
    // Update game logic
    for (let gameObject of this.gameObjects) {
      if (gameObject.enabled) {
        gameObject.update(deltaTime);
      }
    }
  }

  Destroy(): void {
    while (this.gameObjects.length > 0) {
      const object = this.gameObjects[0];
      this.Remove(object);
    }
    this.initialized = false;
  }

  Render(renderer: WrappedRenderer): void {
    for (let gameObject of this.gameObjects) {
      if (!gameObject.render || !gameObject.enabled) continue;

      gameObject.render(renderer);
    }
  }
}