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
import Vec2D from "../Utils/Vec2D";
import Entity from "../Core/Entity";

export class RiveEntity extends Entity {
    //====
  // Remember: Y positive is DOWN, Y negative is UP
  // Remember: [0,0] is top left unless you change it in Rive, which you shouldn't
  //=====
  public readonly artboard : Artboard;

  frameOrigin : boolean = false;
  fit : Fit = Game.rive.Fit.contain;
  alignment : Alignment = Game.rive.Alignment.topLeft;
  get frame() : AABB { 
    let aabb =  this.artboard.bounds; 

    aabb.minX += this.position.x;
    aabb.maxX += this.position.x;
    aabb.minY += this.position.y;
    aabb.maxY += this.position.y;

    aabb.minX *= this.scale.x * Game.resScale.x;
    aabb.maxX *= this.scale.x * Game.resScale.x;
    aabb.minY *= this.scale.y * Game.resScale.y;
    aabb.maxY *= this.scale.y * Game.resScale.y;
    return aabb;
  }
  get width() : number {
    return this.artboard.bounds.maxX - this.artboard.bounds.minX;
  }
  get height() : number {
    return this.artboard.bounds.maxY - this.artboard.bounds.minY;
  }
  position : Vec2D = new Vec2D(0,0);
  scale : Vec2D = new Vec2D(1, 1);

  constructor(name: string, artboard : Artboard) {
    super(name);
    this.artboard = artboard;
    this.artboard.frameOrigin = this.frameOrigin;
  }

  update(deltaTime: number): void {
    if (this.enabled) {
      this.artboard.advance(deltaTime);
    }
  }

  render(renderer: WrappedRenderer): void {
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
    
  destroy(): void {
    //no need to destroy artboards in Rive's WASM.
  }
}

export default RiveEntity