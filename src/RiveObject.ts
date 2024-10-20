import Rive, {
    Artboard,
    File,
    LinearAnimationInstance
  } from "@rive-app/canvas-advanced";
import Game, { Loopable } from "./Game";


class RiveAnimation {
  private instance: LinearAnimationInstance;
  private _isPlaying: boolean = false;
  
  weight: number = 1;

  constructor(instance : LinearAnimationInstance) {
    this.instance = instance;
  }

  stop(): void {
    this._isPlaying = false;
    
    //Note: This doesn't seem to work with walk_cycle.riv
    //Ask Domenico why Walk starts at 2seconds
    this.instance.time = 0;
  }

  restart(): void {
    this._isPlaying = true;
      
    this.instance.time = 0;
  }

  pause(): void {
    this._isPlaying = false;
  }

  resume(): void {
    this._isPlaying = true;
  }

  advance(deltaTime : number): void {
      this.instance.advance(deltaTime);
  }

  scrub(time : number): void {
     this.instance.time = time;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }
}

export class RiveObject implements Loopable {
  static Type = {
    Static: 'STATIC',
    Animation: 'ANIMATION',
    StateMachine : 'STATE_MACHINE'
  } as const;

  enabled : boolean = false;

  artboard : Artboard;

  constructor(artboard : Artboard)
  {
    this.artboard = artboard;
  }

  Loop(time: number): void {
    
  }

    
}

export default RiveObject