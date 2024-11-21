import Rive, { RiveCanvas, WrappedRenderer, File, Artboard } from "@rive-app/canvas-advanced";

import Vec2D from "./Utils/Vec2D"; 
import Input from "./Systems/Input";
import Debug from "./Systems/Debug";
import Scene from "./Scene";

//Local WASM loads faster. Remote WASM might be updated if I'm lazy.
const USE_LOCAL_WASM: boolean = true;
const LOCAL_WASM_URL = new URL("../export/rive.wasm", import.meta.url).toString();
const REMOTE_WASM_URL = "https://unpkg.com/@rive-app/canvas-advanced@2.21.6/rive.wasm";

export class Game {

  //================================
  //==== GLOBAL STATIC VARIABLES ====
  //================================

  static TargetResolution : Vec2D = new Vec2D(400, 400);
  static RiveInstance: RiveCanvas;
  static Canvas : HTMLCanvasElement;
  static Renderer : WrappedRenderer;


  //================================
  //======== INITIALIZATION ========
  //================================

  private static _hasInitiated : boolean = false;

  public static async Initiate(width : number, height : number): Promise<void> {
    if (Game._hasInitiated) {
      throw console.error("Has already been initiated");
    }
    Game._hasInitiated = true

    Game.RiveInstance = await Rive({
      locateFile: (_: string) => USE_LOCAL_WASM ? 
        LOCAL_WASM_URL
       : REMOTE_WASM_URL
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

  //================================
  //========== UPDATE ==============
  //================================

  static TimeScale = 1.0;

  static #elapsedTime : number = 0;

  private static Update(time : number) {
    let deltaTime = (time - Game.#elapsedTime) / 1000;
    deltaTime *= Game.TimeScale;
    Game.#elapsedTime = time;

    Debug.Update(deltaTime, time);
    
    for (const scene of Game.#scenes.values()) {
      if (scene.enabled) scene.Update(deltaTime, time);
    }

    Game.Render(deltaTime);

    Game.RiveInstance.resolveAnimationFrame();

    requestAnimationFrame(Game.Update);

    Input.Clear();
  }

  //================================
  //=========== RENDER =============
  //================================

  private static Render(deltaTime : number) {
    Game.Renderer.clear();
    
    for (const scene of Game.#scenes.values()) {
      if (scene.enabled) scene.Render(Game.Renderer);
    }
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


  static get ResScale() : Vec2D {
    return new Vec2D(Game.Canvas.width / Game.TargetResolution.x, Game.Canvas.height / Game.TargetResolution.y);
  }

  
  //================================
  //========== SCENES ==============
  //================================

  static #scenes: Map<string, Scene> = new Map();

  static AddScene(scene: Scene): void {
    Game.#scenes.set(scene.Name, scene);
    scene.Init();
  }

  static GetScene(name: string): Scene {
    return Game.#scenes.get(name) as Scene;
  } 

  static RemoveScene(name: string): void {
    Game.#scenes.delete(name);
  }


  //================================
  //========== DESTRUCT ============
  //================================

  static Destroy(event : Event) {
    event.preventDefault();
    event.returnValue = true;
    
    window.alert("Being Destroyed");

    for (const scene of Game.#scenes.values()) {  
      scene.Destroy();
    }
    Game.#scenes.clear();
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