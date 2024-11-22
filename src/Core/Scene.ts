/**
 * A Scene is a container for GameObjects.
 * 
 * Scenes allow you to organize your game into distinct sections like levels, menus, or game states.
 * 
 * Why have Scene? Imagine having a Pause Scene and a Gameplay Scene. 
 * 
 * You could then easily switch between them, freezing one or the other and mantaining all the objects and states in them.
 * 
 * Usage:
 * ```typescript
 * // Create scenes for different game states
 * const gameplayScene = new Scene("gameplay");
 * const pauseScene = new Scene("pause");
 * 
 * // Add GameObjects objects to scenes
 * gameplayScene.Add(playerCharacter);
 * gameplayScene.Add(enemies);
 * pauseScene.Add(pauseMenu);
 * 
 * // Add Scenes to Game;
 * Game.AddScene(gameplayScene);
 * Game.AddScene(pauseScene);
 * 
 * // Switch between scenes
 * gameplayScene.enabled = false;
 * pauseScene.enabled = true;
 * ```
 * 
 * Each scene manages the lifecycle of its GameObjects:
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

  init(): void {
    this.initialized = true;
  }

  add(object: GameObject): GameObject {
    this.gameObjects.push(object);
    return object;
  }

  remove(object: GameObject): void {
    const index = this.gameObjects.indexOf(object);
    if (index >= 0) {
      object.destroy();
      this.gameObjects.splice(index, 1);
    }
  }

  update(deltaTime: number, time: number): void {
    // Update game logic
    for (let gameObject of this.gameObjects) {
      if (gameObject.enabled) {
        gameObject.update(deltaTime);
      }
    }
  }

  destroy(): void {
    while (this.gameObjects.length > 0) {
      const object = this.gameObjects[0];
      this.remove(object);
    }
    this.initialized = false;
  }

  render(renderer: WrappedRenderer): void {
    for (let gameObject of this.gameObjects) {
      if (!gameObject.render || !gameObject.enabled) continue;

      gameObject.render(renderer);
    }
  }
}