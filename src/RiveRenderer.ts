import Rive, {
    Artboard,
    Fit,
    Alignment,
    AABB
  } from "@rive-app/canvas-advanced";
import Game from "./Game";


export class RiveRenderer {
  public readonly artboard : Artboard;

  fit : Fit = Game.RiveInstance.Fit.contain;
  alignment : Alignment = Game.RiveInstance.Alignment.bottomLeft;
  get bounds() : AABB { return this.artboard.bounds; }

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