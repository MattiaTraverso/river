/**
 * A Scene is a container for Entities.
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
 * // Add Entity objects to scenes
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
 * Each scene manages the lifecycle of its Entities:
 * - Adding/removing objects
 * - Updating objects each frame
 * - Rendering objects in order
 * - Cleaning up objects when destroyed
 */
import { WrappedRenderer } from "@rive-app/canvas-advanced";
import Entity from "./Entity";

export default class Scene {
  enabled: boolean = true;

  protected entities: Entity[] = [];
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

  add(object: Entity): Entity {
    this.entities.push(object);
    return object;
  }

  remove(object: Entity): void {
    const index = this.entities.indexOf(object);
    if (index >= 0) {
      object.destroy();
      this.entities.splice(index, 1);
    }
  }

  update(deltaTime: number, time: number): void {
    // Update game logic
    for (let entity of this.entities) {
      if (entity.enabled) {
        entity.update(deltaTime);
      }
    }
  }

  fixedUpdate(fixedDeltaTime: number): void {

  }

  destroy(): void {
    while (this.entities.length > 0) {
      const object = this.entities[0];
      this.remove(object);
    }
    this.initialized = false;
  }

  render(renderer: WrappedRenderer): void {
    for (let entity of this.entities) {
      if (!entity.render || !entity.enabled) continue;

      entity.render(renderer);
    }
  }
}