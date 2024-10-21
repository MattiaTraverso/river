import Rive, {
    Artboard,
    Fit,
    Alignment,
    AABB
  } from "@rive-app/canvas-advanced";
import Game from "./Game";
import { Vec2D } from "./Utils";
import { Destroyable } from "./Destroyable";
import { Debug } from "./Debug";

export class RiveRenderer implements Destroyable {
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
  position : Vec2D = new Vec2D(0,0);
  scale : Vec2D = new Vec2D(.5, .5);


  constructor(artboard : Artboard)
  {
    this.artboard = artboard;
    this.artboard.frameOrigin = this.frameOrigin;
  }

  enabled : boolean = true;

  advance (deltaTime : number){
    this.artboard.advance(deltaTime);
  }
    
  destroy(): void {
    //what to do, what to do
  }
}

export default RiveRenderer