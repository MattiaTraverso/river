import Rive, { RiveCanvas, WrappedRenderer, File, Artboard } from "@rive-app/canvas-advanced";

import Vec2D from "./Utils/Vec2D"; 
import Input from "./Systems/Input";
import Debug from "./Systems/Debug";
import Scene from "./Core/Scene";
import { Destroyable } from "./Utils/Interfaces";

//Local WASM loads faster. Remote WASM might be updated if I'm lazy.
const USE_LOCAL_WASM: boolean = true;
const LOCAL_WASM_URL = new URL("../export/rive.wasm", import.meta.url).toString();
const REMOTE_WASM_URL = "https://unpkg.com/@rive-app/canvas-advanced@2.21.6/rive.wasm";

export default class Game {

  //================================
  //==== GLOBAL STATIC VARIABLES ====
  //================================

  static targetRes : Vec2D = new Vec2D(400, 400);
  static rive: RiveCanvas;
  static canvas : HTMLCanvasElement;
  static renderer : WrappedRenderer;


  //================================
  //======== INITIALIZATION ========
  //================================

  private static _hasInitiated : boolean = false;

  public static async initiate(width : number, height : number): Promise<void> {
    if (Game._hasInitiated) {
      throw console.error("Has already been initiated");
    }
    Game._hasInitiated = true

    Game.rive = await Rive({
      locateFile: (_: string) => USE_LOCAL_WASM ? 
        LOCAL_WASM_URL
       : REMOTE_WASM_URL
    });
  
    Game.targetRes = new Vec2D(width, height);

    Game.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    Input.initiate(Game.canvas);
    Debug.initiate();
  
    window.addEventListener('resize', Game.resizeCanvas);
    Game.resizeCanvas();

    //TODO: figure out what's the best event for this?
    window.addEventListener('onvisibilitychange', Game.destroy);

    Game.renderer = Game.rive.makeRenderer(Game.canvas);

    requestAnimationFrame(Game.update);
  }

  //================================
  //========== UPDATE ==============
  //================================

  private static readonly MAX_DELTA_TIME = 1/10;
  private static readonly FIXED_TIME_STEP = 1/60; // 60 Hz
  private static readonly MAX_STEPS = 5;

  static timeScale = 1.0;

  private static elapsedTime : number = -1;

  private static update(time : number) {
    // Handle first frame with lag spike?
    if (Game.elapsedTime === -1) {
      Game.elapsedTime = time;
      requestAnimationFrame(Game.update);
      return;
  }

    let deltaTime = (time - Game.elapsedTime) / 1000;
    deltaTime *= Game.timeScale;
    deltaTime = Math.min(deltaTime, Game.MAX_DELTA_TIME);

    Game.elapsedTime = time;

    Debug.update(deltaTime, time);
    
    console.log("UPDATE: " + deltaTime);

    Game.fixedUpdateAccumulator += deltaTime;

    let steps = 0;
    while (Game.fixedUpdateAccumulator >= Game.FIXED_TIME_STEP && steps < Game.MAX_STEPS) {
      Game.fixedUpdateAccumulator -= Game.FIXED_TIME_STEP;
      Game.fixedUpdate(Game.FIXED_TIME_STEP);
      steps++;
    }

    Game.interpolationAlpha = Game.fixedUpdateAccumulator / Game.FIXED_TIME_STEP;

    for (const scene of Game.scenes.values()) {
      if (scene.enabled) scene.update(deltaTime, time);
    }

    Game.render(deltaTime);

    Game.rive.resolveAnimationFrame();

    requestAnimationFrame(Game.update);

    Input.clear();
  }

  private static fixedUpdateAccumulator : number = 0;
  private static interpolationAlpha : number = 0;

  private static fixedUpdate(fixedDeltaTime : number) {
    console.log("FIXED UPDATE: " + fixedDeltaTime);

    for (const scene of Game.scenes.values()) {
      if (scene.enabled) scene.fixedUpdate(fixedDeltaTime);
    }
  }

  //================================
  //=========== RENDER =============
  //================================

  private static render(deltaTime : number) {
    Game.renderer.clear();
    
    for (const scene of Game.scenes.values()) {
      if (scene.enabled) scene.render(Game.renderer);
    }
  }

  private static resizeCanvas() : void {
    const aspectRatio = Game.targetRes.x / Game.targetRes.y;

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
    Game.canvas.width = newWidth;
    Game.canvas.height = newHeight;
  }


  static get resScale() : Vec2D {
    return new Vec2D(Game.canvas.width / Game.targetRes.x, Game.canvas.height / Game.targetRes.y);
  }

  
  //================================
  //========== SCENES ==============
  //================================

  private static scenes: Map<string, Scene> = new Map();

  static addScene(scene: Scene): void {
    Game.scenes.set(scene.Name, scene);
    scene.init();
  }

  static getScene(name: string): Scene {
    return Game.scenes.get(name) as Scene;
  } 

  static removeScene(name: string): void {
    Game.scenes.delete(name);
  }


  //================================
  //========== DESTRUCT ============
  //================================

  static destroy(event : Event) {
    event.preventDefault();
    event.returnValue = true;
    
    window.alert("Being Destroyed");

    for (const scene of Game.scenes.values()) {  
      scene.destroy();
    }
    Game.scenes.clear();
  }
}