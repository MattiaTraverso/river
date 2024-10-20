import Rive, {
    RiveCanvas,
    WrappedRenderer,
    File,
    Artboard
} from "@rive-app/canvas-advanced";

import RiveObject from "./RiveObject";
import { Vec2D } from "./Utils"; 


export interface Loopable {
   Loop(time : number) : void 
}

export class Game{
  static TargetResolution : Vec2D = new Vec2D(1280, 720);
  static RiveInstance: RiveCanvas;
  static Canvas : HTMLCanvasElement;
  static Renderer : WrappedRenderer;

  private static _hasInitiated : boolean = false;

  public static async Initiate(): Promise<void> {
    if (this._hasInitiated) {
      throw console.error("Has already been initiated");
    }
    this._hasInitiated = true

    this.RiveInstance = await Rive({
      locateFile: (_: string) => "https://unpkg.com/@rive-app/canvas-advanced@2.21.6/rive.wasm"
    });
  
    this.Canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  
    window.addEventListener('resize', this.ResizeCanvas);
    this.Renderer = this.RiveInstance.makeRenderer(this.Canvas);

    requestAnimationFrame(this.Loop);
  }

  private static ResizeCanvas() : void{
    const aspectRatio = this.TargetResolution.x / this.TargetResolution.y;

    console.log("Aspect Ratio:", aspectRatio);
    
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;

    if (newWidth / newHeight > aspectRatio) {
        // Window is wider than canvas aspect ratio
        newWidth = Math.floor(newHeight * aspectRatio);
    } else {
        // Window is taller than canvas aspect ratio
        newHeight = Math.floor(newWidth / aspectRatio);
    }

    // Update canvas dimensions
    this.Canvas.width = newWidth;
    this.Canvas.height = newHeight;
  }

  private static _riveObjects : RiveObject[] = [];
  
  private static Loop(time : number) {
    /*
    for (let stateMachine of stateMachines)
    {
      stateMachine.advance(deltaTime);
    }
  
    for (let animation of animations){
      animation.advance(deltaTime);
      animation.apply(1);
    }
  
    for (let artboard of artboards){
      artboard.advance(deltaTime);
     //debug_string.innerHTML += `<br> ${artboard.bounds.maxY - artboard.bounds.minY}`;
    }
     */
  
    for (let loopCallBack of loopCallbacks)
      loopCallBack();
  
    this.Render(time);

    this.DebugRender(time);
    
    this.RiveInstance.resolveAnimationFrame();

    requestAnimationFrame(this.Loop);
  }

  private static Render(time : number) {

  }

  private static DebugRender(time : number) {

  }


  static async LoadFile(url: string): Promise<File> {
    const bytes = await (await fetch(new Request(url))).arrayBuffer();
    
    // import File as a named import from the Rive dependency
    const file = (await this.RiveInstance.load(new Uint8Array(bytes))) as File;
    
    // Extract the file name from the URL
    const name = url.split('/').pop()?.split('?')[0] || 'unknown';
    
    return file;
  }
}

export default Game;