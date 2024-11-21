import Rive, {
    RiveCanvas,
    WrappedRenderer,
    File,
    Artboard
} from "@rive-app/canvas-advanced";
  
import { Vec2D } from "./Vec2D"; 
import { Input, KeyCode } from "./Systems/Input";
import { Debug } from "./Systems/Debug";
import Scene from "./Scene";
import { UpdateFunction } from "./Interfaces";

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
  static CurrentScene : Scene;

  private static _hasInitiated : boolean = false;
  private static scenes: Map<string, Scene> = new Map();

  static AddScene(scene: Scene, current : boolean = false): void {
    Game.scenes.set(scene.Name, scene);
    scene.Init();
    if (current) Game.CurrentScene = scene;
  }

  static GetScene(name: string): Scene {
    return Game.scenes.get(name) as Scene;
  } 

  static SetCurrentScene(name: string): void {
    Game.CurrentScene = Game.GetScene(name);
  }

  static RemoveScene(name: string): void {
    Game.scenes.delete(name);
  }

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

    window.addEventListener('onvisibilitychange', Game.Destroy);

    Game.Renderer = Game.RiveInstance.makeRenderer(Game.Canvas);

    requestAnimationFrame(Game.Update);
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

  static PreLoop : UpdateFunction[] = [];

  static TimeScale = 1.0;

  private static elapsedTime : number = 0;

  private static Update(time : number) {
    Debug.Clear();

    let deltaTime = (time - Game.elapsedTime) / 1000;
    deltaTime *= Game.TimeScale;
    Game.elapsedTime = time;
  

    for (let callback of Game.PreLoop) callback(deltaTime, time);

    Debug.Update(deltaTime, time);

    if (Game.CurrentScene) Game.CurrentScene.Update(deltaTime, time);
    
    Game.Render(deltaTime);

    Game.RiveInstance.resolveAnimationFrame();

    requestAnimationFrame(Game.Update);

    Input.Clear();
  }

  private static Render(deltaTime : number) {
    Game.Renderer.clear();
    
    if (Game.CurrentScene) Game.CurrentScene.Render(Game.Renderer);
  }

  static Destroy(event : Event) {
    event.preventDefault();
    event.returnValue = true;
    
    window.alert("Being Destroyed");

    Game.CurrentScene.Destroy();
    Game.scenes.forEach(scene => scene.Destroy());
    Game.scenes.clear();
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