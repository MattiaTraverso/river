import Rive, {
    Artboard,
    Fit,
    Alignment
  } from "@rive-app/canvas-advanced";
import Game, { Loopable } from "./Game";


export class RiveRenderer {
  public readonly artboard : Artboard;

  fit : Fit = Game.RiveInstance.Fit.contain;
  alignment : Alignment = Game.RiveInstance.Alignment.bottomLeft;

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