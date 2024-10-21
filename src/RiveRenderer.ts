import Rive, {
    Artboard,
    Fit,
    Alignment,
    AABB
  } from "@rive-app/canvas-advanced";
import Game from "./Game";
import { Vec2D } from "./Utils";

export class RiveRenderer {
  public readonly artboard : Artboard;

  fit : Fit = Game.RiveInstance.Fit.contain;
  alignment : Alignment = Game.RiveInstance.Alignment.bottomLeft;
  get bounds() : AABB { return this.artboard.bounds; }
  position : Vec2D = new Vec2D(0,0);


  constructor(artboard : Artboard)
  {
    this.artboard = artboard;
  }

  enabled : boolean = true;

  advance (deltaTime : number){
    this.artboard.advance(deltaTime);
  }
    
}

export default RiveRenderer