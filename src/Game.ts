import Rive, {
    RiveCanvas,
    WrappedRenderer,
    File,
    Artboard
} from "@rive-app/canvas-advanced";

import RiveRenderer from "./RiveRenderer";
import { Vec2D } from "./Utils"; 
import { Input } from "./Input";
import { Debug } from "./Debug";

export interface LoopCallback {
   (deltaTime : number, time : number) : void 
}

export class Game{
  static TargetResolution : Vec2D = new Vec2D(1280, 720);
  static RiveInstance: RiveCanvas;
  static Canvas : HTMLCanvasElement;
  static Renderer : WrappedRenderer;

  private static _hasInitiated : boolean = false;

  public static async Initiate(): Promise<void> {
    if (Game._hasInitiated) {
      throw console.error("Has already been initiated");
    }
    Game._hasInitiated = true

    Game.RiveInstance = await Rive({
      locateFile: (_: string) => "https://unpkg.com/@rive-app/canvas-advanced@2.21.6/rive.wasm"
    });
  
    Game.Canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    Input.Initiate(Game.Canvas);
    Debug.Initiate();
  
    window.addEventListener('resize', Game.ResizeCanvas);
    Game.ResizeCanvas();

    Game.Renderer = Game.RiveInstance.makeRenderer(Game.Canvas);

    requestAnimationFrame(Game.Loop);
  }

  private static ResizeCanvas() : void{
    Game.Canvas.width = window.innerWidth;
    Game.Canvas.height = window.innerHeight;

    return;

    //For now skipping this as it takes some time

    const aspectRatio = Game.TargetResolution.x / Game.TargetResolution.y;

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
    Game.Canvas.width = newWidth;
    Game.Canvas.height = newHeight;
  }

  private static riveObjects : RiveRenderer[] = [];
  
  private static elapsedTime : number = 0;

  static Add(object : RiveRenderer) {
    Game.riveObjects.push(object);
  }

  static PreLoop : LoopCallback[] = [];
  static PostLoop : LoopCallback[] = []

  static TimeScale = 1.0;

  private static Loop(time : number) {
    Debug.Clear();

    let deltaTime = (time - Game.elapsedTime) / 1000;
    deltaTime *= Game.TimeScale;

    let fps = 1 / deltaTime;
    Debug.Add(Math.trunc(fps*100)/100 + " fps");

    Game.elapsedTime = time;

    for (let callback of Game.PreLoop) callback(deltaTime, time);

    for (let riveRenderer of Game.riveObjects)
    {
      if (riveRenderer.enabled)
        riveRenderer.advance(deltaTime);
    }
    
    Game.Render(deltaTime);

    Game.DebugRender(deltaTime);
    
    Game.RiveInstance.resolveAnimationFrame();

    requestAnimationFrame(Game.Loop);

    Input.Clear();
  }

  private static Render(deltaTime : number) {
    Game.Renderer.clear();

    for (let riveRenderer of Game.riveObjects)
    {
      Game.Renderer.save();

      Game.Renderer.translate(riveRenderer.position.x, riveRenderer.position.y);

      Game.Renderer.align(
        riveRenderer.fit,
        riveRenderer.alignment,
        {	
          minX: 0,	
          minY: 0,
          maxX: Game.Canvas.width,
          maxY: Game.Canvas.height
        },
        riveRenderer.bounds
      );

      riveRenderer.artboard.draw(Game.Renderer);

      Game.Renderer.restore();
    }
  }

  private static DebugRender(deltaTime : number) {

  }


  static async LoadFile(url: string): Promise<File> {
    const bytes = await (await fetch(new Request(url))).arrayBuffer();
    
    // import File as a named import from the Rive dependency
    const file = (await Game.RiveInstance.load(new Uint8Array(bytes))) as File;
    
    // Extract the file name from the URL
    const name = url.split('/').pop()?.split('?')[0] || 'unknown';
    
    return file;
  }
}

export default Game;