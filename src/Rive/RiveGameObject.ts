import Rive, {
    Artboard,
    Fit,
    Alignment,
    AABB,
    WrappedRenderer
  } from "@rive-app/canvas-advanced";
import Game from "../Game";
import { Vec2D } from "../Utils/Vec2D";
import { GameObject } from "../GameObject";
import { Debug } from "../Systems/Debug";

export class RiveGameObject extends GameObject {
    //====
  // Remember: Y positive is DOWN, Y negative is UP
  // Remember: [0,0] is top left unless you change it in Rive, which you shouldn't
  //=====
  public readonly artboard : Artboard;

  frameOrigin : boolean = false;
  fit : Fit = Game.RiveInstance.Fit.contain;
  alignment : Alignment = Game.RiveInstance.Alignment.topLeft;
  get frame() : AABB { 
    let aabb =  this.artboard.bounds; 

    aabb.minX += this.position.x;
    aabb.maxX += this.position.x;
    aabb.minY += this.position.y;
    aabb.maxY += this.position.y;

    aabb.minX *= this.scale.x * Game.ResScale.x;
    aabb.maxX *= this.scale.x * Game.ResScale.x;
    aabb.minY *= this.scale.y * Game.ResScale.y;
    aabb.maxY *= this.scale.y * Game.ResScale.y;
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

export default RiveGameObject