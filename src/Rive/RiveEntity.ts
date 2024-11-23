/**
 * RiveEntity is the base class for rendering Rive artboards in your game.
 * 
 * This class handles the core functionality of displaying a Rive artboard, but does not handle animations.
 * For animation control, use one of the child classes:
 * - RiveAnimator: For manual control over animations
 * - RiveStateMachine: For letting Rive's state machine control animations
 * 
 * @example
 * ```typescript
 * // Load a Rive file
 * const file = await RiveLoader.loadFile("path/to/file.riv");
 * 
 * // Create a RiveEntity with an artboard
 * const riveEntity = new RiveEntity("myRiveObject", file.artboardByIndex(0));
 * 
 * // Position and scale the object
 * riveEntity.position = new Vec2D(100, 100);
 * riveEntity.scale = new Vec2D(0.5, 0.5);
 * 
 * // Add to a scene
 * scene.add(riveEntity);
 * ```
 * 
 * Important Notes:
 * - The coordinate system has [0,0] at top-left with Y positive going DOWN
 * - The artboard's origin should be kept at default in Rive
 */
import { Artboard, Fit, Alignment, AABB, WrappedRenderer } from "@rive-app/canvas-advanced";

import Game from "../Game";
import Vector from "../Utils/Vector";
import Entity from "../Core/Entity";
import Physics from "../Systems/Physics";
import { b2Vec2 } from "@box2d/core";
import Input from "../Systems/Input";
import RiveLoader from "./RiveLoader";
export class RiveEntity extends Entity {
    //====
  // Remember: Y positive is DOWN, Y negative is UP
  // Remember: [0,0] is top left unless you change it in Rive, which you shouldn't
  //=====
  public readonly artboard : Artboard;

  frameOrigin : boolean = false;
  fit : Fit = RiveLoader.rive.Fit.contain;
  alignment : Alignment = RiveLoader.rive.Alignment.topLeft;
  get frame() : AABB { 
    let aabb =  this.artboard.bounds; 

    aabb.minX += this.position.x;
    aabb.maxX += this.position.x;
    aabb.minY += this.position.y;
    aabb.maxY += this.position.y;

    aabb.minX *= this.scale.x;
    aabb.maxX *= this.scale.x;
    aabb.minY *= this.scale.y;
    aabb.maxY *= this.scale.y;
    return aabb;
  }
  get width() : number {
    return (this.artboard.bounds.maxX - this.artboard.bounds.minX) * this.scale.x;
  }
  get height() : number {
    return (this.artboard.bounds.maxY - this.artboard.bounds.minY) * this.scale.y;
  }

  constructor(name: string, artboard : Artboard) {
    super(name);
    this.artboard = artboard;
    this.artboard.frameOrigin = this.frameOrigin;
  }

  override update(deltaTime: number): void {
    if (this.enabled) {
      this.artboard.advance(deltaTime);
    }
  }


  override fixedUpdate(fixedDeltaTime: number): void {
    if (this.physicsBody) {
      this.artboard.transformComponent("Root").rotation = this.physicsBody.GetAngle();  
         
      let targetPos = Physics.toPixelTransform(this.physicsBody.GetPosition() as b2Vec2);
      this.position.x = targetPos.x - this.width / this.scale.x / 2;
      this.position.y = targetPos.y - this.height / this.scale.y / 2;
    }
  }

  override render(renderer: WrappedRenderer): void {
    if (!this.enabled) return;

    renderer.save();
    renderer.align(
      this.fit,
      this.alignment,
      this.frame,
      this.artboard.bounds
    );

    this.artboard.draw(renderer);

    renderer.restore();
  }
    
  override destroy(): void {
    //no need to destroy artboards in Rive's WASM.
  }


  setPosition(position: Vector): void {
    this.position = position;
    if (this.physicsBody) {
        this.physicsBody.SetTransformXY(Physics.toPhysicsTransform(this.position).x, Physics.toPhysicsTransform(this.position).y, 0);
    }
}
}



export default RiveEntity