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
import { WrappedRenderer } from "@rive-app/webgl-advanced";
import Entity from "./entity";
import { b2Vec2, b2StepConfig, b2World, b2BodyType } from "@box2d/core";
import Physics from "../systems/physics";
import Game from "../game";
import Vector from "../utils/vector";
import Input from "../systems/input";
import RiveEntity from "../rive/riveEntity";

export default class Scene {
  readonly name: string;

  enabled: boolean = true;

  constructor(name: string) {
    this.name = name;
    this.world = Physics.getWorld();
  }

  //================================
  //========== ENTITIES ===========
  //================================

  protected entities: Entity[] = [];

  add(entity: Entity, addToPhysicsWorld: boolean = true): Entity {
    this.entities.push(entity);

    if (addToPhysicsWorld) {
      let body = this.world.CreateBody(Physics.dynamicBodyDef);
      entity.initPhysics(body);
    }

    return entity;
  }

  remove(object: Entity): void {
    const index = this.entities.indexOf(object);
    if (index >= 0) {
      object.destroy();
      this.entities.splice(index, 1);
    }
  }


  destroy(): void {
    while (this.entities.length > 0) {
      const object = this.entities[0];
      this.remove(object);
    }
  }

  //================================
  //========== UPDATE ==============
  //================================

  update(deltaTime: number): void {
    // Update game logic
    for (let entity of this.entities) {
      if (entity.enabled) {
        entity.update(deltaTime);
      }
    }
  }

  readonly world : b2World;

  fixedUpdate(fixedDeltaTime: number): void {
    for (let entity of this.entities) {
      if (entity.enabled) {
        entity.fixedUpdate(fixedDeltaTime);
      }
    }

    this.world.Step(fixedDeltaTime, Physics.stepConfig);
  }


  //================================
  //========== RENDER ==============
  //================================

  render(renderer: WrappedRenderer): void {
    for (let entity of this.entities) {
      if (!entity.render || !entity.enabled) continue;

      entity.render(renderer);
    }
  }

  public shouldDebugRender : boolean = false;
  debugRender(debugCanvas: OffscreenCanvas): void {  
    if (!this.shouldDebugRender) return;

    const ctx = debugCanvas.getContext('2d');
    if (!ctx) return;

    //draw text in the top right saying number of bodies:   
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`Bodies: ${this.world.GetBodyCount()}`, debugCanvas.width - 10, 10);

    let id : number = 0;
    for (let body = this.world.GetBodyList(); body; body = body.GetNext()) { 
    //for (let entity of this.entities) { 
      //let body = entity.physicsBody;

      if (!body) continue;

      if (body.GetType() === b2BodyType.b2_staticBody) continue;

      let pos = Physics.toPixelTransform(body.GetPosition() as b2Vec2);

      let x = pos.x;
      let y = pos.y;

      let angle = body.GetAngle();

      // Generate consistent color based on id
      const r = Math.sin(id * 0.3) * 127 + 128;
      const g = Math.sin(id * 0.3 + 2) * 127 + 128;
      const b = Math.sin(id * 0.3 + 4) * 127 + 128;
      ctx.fillStyle = `rgba(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)},0.5)`; // Added 0.5 alpha

      const WIDTH = 400;
      const HEIGHT = 300;

      //const WIDTH = (entity as RiveEntity).width;
      //const HEIGHT = (entity as RiveEntity).height;

      // Save context state
      ctx.save();
      
      // Translate to box center and rotate
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Draw rotated box
      ctx.fillRect(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
      // Restore context state
      ctx.restore();

      // Draw coordinates and rotation text
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `x: ${pos.x.toFixed(1)}, y: ${pos.y.toFixed(1)}, θ: ${(angle * 180 / Math.PI).toFixed(1)}°`, 
        x + 5, 
        y - 10
      );
      id++;
    }
  }



}