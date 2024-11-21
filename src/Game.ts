import Rive, {
    RiveCanvas,
    WrappedRenderer,
    File,
    Artboard
} from "@rive-app/canvas-advanced";

import RiveRenderer from "./Rive/RiveRenderer";
import { Vec2D } from "./Vec2D"; 
import { Input, KeyCode } from "./Input";
import { Debug } from "./Debug";

export interface LoopCallback {
   (deltaTime : number, time : number) : void 
}

export class Game{
  static TargetResolution : Vec2D = new Vec2D(400, 400);
  static get ResScale() : Vec2D {
    return new Vec2D(Game.Canvas.width / Game.TargetResolution.x, Game.Canvas.height / Game.TargetResolution.y);
  }
  
  static RiveInstance: RiveCanvas;

  //====
  // Remember: Y positive is DOWN, Y negative is UP
  // Remember: [0,0] is top left
  //=====
  static Canvas : HTMLCanvasElement;
  static Renderer : WrappedRenderer;

  private static _hasInitiated : boolean = false;

  public static async Initiate(width : number, height : number): Promise<void> {
    if (Game._hasInitiated) {
      throw console.error("Has already been initiated");
    }
    Game._hasInitiated = true


    Game.RiveInstance = await Rive({
      locateFile: (_: string) => "https://unpkg.com/@rive-app/canvas-advanced@2.21.6/rive.wasm"
    });
  
    Game.TargetResolution = new Vec2D(width, height);

    Game.Canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    Input.Initiate(Game.Canvas);
    Debug.Initiate();
  
    window.addEventListener('resize', Game.ResizeCanvas);
    Game.ResizeCanvas();

    window.addEventListener('visibilitychange', Game.Destroy);

    Game.Renderer = Game.RiveInstance.makeRenderer(Game.Canvas);

    requestAnimationFrame(Game.Loop);
  }

  private static ResizeCanvas() : void {
    const aspectRatio = Game.TargetResolution.x / Game.TargetResolution.y;

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

  static Add(object : RiveRenderer) : RiveRenderer {
    Game.riveObjects.push(object);
    return object;
  }

  static Remove(object: RiveRenderer) {
    const index = Game.riveObjects.indexOf(object);
    Game.RemoveAtIndex(index);
  }

  static RemoveAtIndex(index : number) {
    if (index >= 0) {
      Game.riveObjects[index].destroy();
      Game.riveObjects = Game.riveObjects.splice(index, 1);
    }
  }

  static Destroy(event : Event) {
    event.preventDefault();
    event.returnValue = true;
    
    window.alert("Being Destroyed");

    while (Game.riveObjects.length > 0)
      Game.RemoveAtIndex(0);
  }

  static PreLoop : LoopCallback[] = [];
  static PostLoop : LoopCallback[] = []

  static TimeScale = 1.0;

  static FPSArray : number[] = [];

  private static Loop(time : number) {
    Debug.Clear();

    Debug.Add(`Canvas Mouse: [${Input.CanvasMouseX},${Input.CanvasMouseY}]`);

    Debug.Add(`<br>Target Res: [${Game.TargetResolution.x}, ${Game.TargetResolution.y}]`);
    Debug.Add(`Canvas: [${Game.Canvas.width},${Game.Canvas.height}] -> [${Game.ResScale.x}x, ${Game.ResScale.y}x]`);
   

    let deltaTime = (time - Game.elapsedTime) / 1000;
    deltaTime *= Game.TimeScale;

    if (Game.riveObjects.length > 0) {
      let artboard : Artboard = Game.riveObjects[0].artboard;

      let movement = deltaTime * 200;

      if (Input.IsKeyDown(KeyCode.A))
        artboard.frameOrigin = !artboard.frameOrigin;
      if (Input.IsKey(KeyCode.LeftArrow))
        Game.riveObjects[0].position.x -= movement;
      if (Input.IsKey(KeyCode.RightArrow))
        Game.riveObjects[0].position.x += movement;
      if (Input.IsKey(KeyCode.UpArrow)) {
        Game.riveObjects[0].position.y -= movement;
      }
      if (Input.IsKey(KeyCode.DownArrow)) {
        Game.riveObjects[0].position.y += movement;
      }
      
      Debug.Add(`<br>Artboard Bounds: [${Game.riveObjects[0].artboard.bounds.minX},${Game.riveObjects[0].artboard.bounds.minY},${Game.riveObjects[0].artboard.bounds.maxX},${Game.riveObjects[0].artboard.bounds.maxY},${artboard.frameOrigin}]`)
      Debug.Add(`Artboard Size: [${Math.abs(Game.riveObjects[0].artboard.bounds.maxX - Game.riveObjects[0].artboard.bounds.minX)},${Math.abs(Game.riveObjects[0].artboard.bounds.maxY - Game.riveObjects[0].artboard.bounds.minY)}]`);

      Debug.Add(`<br>RiveObj Bounds: [${Game.riveObjects[0].frame.minX},${Game.riveObjects[0].frame.minY},${Game.riveObjects[0].frame.maxX},${Game.riveObjects[0].frame.maxY},${artboard.frameOrigin}]`)
      Debug.Add(`RiveObj Size: [${Math.abs(Game.riveObjects[0].frame.maxX - Game.riveObjects[0].frame.minX)},${Math.abs(Game.riveObjects[0].frame.maxY - Game.riveObjects[0].frame.minY)}]`);
      Debug.Add(`Position: [${Game.riveObjects[0].position.x}, ${Game.riveObjects[0].position.y}]`)
    }

    let fps = 1 / deltaTime;


    //Calculate average FPS
    //TODO: This should go somewhere else.
    Game.FPSArray.push(fps);
    if (Game.FPSArray.length > 100) Game.FPSArray = Game.FPSArray.slice(1);
    let sum = 0; for (let n of Game.FPSArray) sum+=n;
    Debug.Add(`Average FPS: ${Math.trunc(sum / Game.FPSArray.length)}`);

    //Debug.Add(Math.trunc(fps*100)/100 + " fps");

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

      Game.Renderer.align(
        riveRenderer.fit,
        riveRenderer.alignment,
        riveRenderer.frame,
        riveRenderer.artboard.bounds
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