import Rive, { RiveCanvas, WrappedRenderer, File, Artboard } from "@rive-app/canvas-advanced";

import Vector from "./Utils/Vector"; 
import Input from "./Systems/Input";
import Debug from "./Systems/Debug";
import Scene from "./Core/Scene";
import { Destroyable } from "./Utils/Interfaces";
import Physics from "./Systems/Physics";
import { b2World } from "@box2d/core";

//Local WASM loads faster. Remote WASM might be updated if I'm lazy.
const USE_LOCAL_WASM: boolean = true;
const LOCAL_WASM_URL = new URL("../export/rive.wasm", import.meta.url).toString();
const VERSION = '2.21.6'; //LAST IS 2.23.10
const REMOTE_WASM_URL = `https://unpkg.com/@rive-app/canvas-advanced@${VERSION}/rive.wasm`;

export default class Game {

  //================================
  //==== GLOBAL STATIC VARIABLES ====
  //================================

  static targetRes : Vector = new Vector(400, 400);
  static rive: RiveCanvas;
  
  private static canvas : HTMLCanvasElement;
  private static renderer : WrappedRenderer;


  //================================
  //======== INITIALIZATION ========
  //================================

  private static _hasInitiated : boolean = false;
  static get isInitiated() : boolean {
    return Game._hasInitiated;
  }

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
  
    Game.targetRes = new Vector(width, height);

    Game.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    Input.init(Game.canvas);
    Debug.init(Game.canvas);
  
    window.addEventListener('resize', Game.onResizeCanvas);
    Game.onResizeCanvas();

    //TODO: figure out what's the best event for this?
    window.addEventListener('onvisibilitychange', Game.destroy);

    Game.renderer = Game.rive.makeRenderer(Game.canvas);

    requestAnimationFrame(Game.update);
  }

  //================================
  //========== UPDATE ==============
  //================================

  private static readonly MAX_DELTA_TIME = 1/10;
  private static readonly FIXED_TIME_STEP = 1/30; // 60 Hz
  private static readonly MAX_STEPS = 5;

  static timeScale = 1.0;

  private static elapsedTime : number = -1;

  private static update(time : number) {
    // Handle first frame with lag spike
    if (Game.elapsedTime === -1) {
      Game.elapsedTime = time;
      requestAnimationFrame(Game.update);
      return;
  }

    let deltaTime = (time - Game.elapsedTime) / 1000;
    deltaTime *= Game.timeScale;
    deltaTime = Math.min(deltaTime, Game.MAX_DELTA_TIME);

    Game.elapsedTime = time;

    Debug.update(deltaTime);
    
    Game.fixedUpdateAccumulator += deltaTime;

    let steps = 0;
    while (Game.fixedUpdateAccumulator >= Game.FIXED_TIME_STEP && steps < Game.MAX_STEPS) {
      Game.fixedUpdateAccumulator -= Game.FIXED_TIME_STEP;
      Game.fixedUpdate(Game.FIXED_TIME_STEP);
      steps++;
    }

    Game.interpolationAlpha = Game.fixedUpdateAccumulator / Game.FIXED_TIME_STEP;

    for (const scene of Game.scenes.values()) {
      if (scene.enabled) scene.update(deltaTime);
    }

    Game.render();

    Game.rive.resolveAnimationFrame();

    Game.debugRender();

    Input.clear();

    requestAnimationFrame(Game.update);
  }

  private static fixedUpdateAccumulator : number = 0;
  private static interpolationAlpha : number = 0;

  private static fixedUpdate(fixedDeltaTime : number) {
    for (const scene of Game.scenes.values()) {
      if (scene.enabled) scene.fixedUpdate(fixedDeltaTime);
    }
  }

  //================================
  //=========== RENDER =============
  //================================

  /**
   * Note: when position entities, we use the Target Resolution you define in Game.init
   * However, since this runs on the web, the canvas might have a different resolution.
   * This is where resolutionScale comes in.
   * 
   * We pass it to the renderer so that when we render, we scale the AABB accordingly.
   */

  static get resolutionScale() : Vector {
    return new Vector(Game.canvas.width / Game.targetRes.x, Game.canvas.height / Game.targetRes.y);
  }

  private static render() {
    Game.renderer.clear();
    
    for (const scene of Game.scenes.values()) {
      if (scene.enabled) scene.render(Game.renderer, Game.resolutionScale);
    }
  }

  //HACK! TODO: REMOVE!
  private static debugRender() {
    for (const scene of Game.scenes.values()) {
      if (scene.enabled) scene.debugRender(Game.canvas, Game.resolutionScale);
    }
  }


  private static onResizeCanvas() : void {
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


  
  //================================
  //========== SCENES ==============
  //================================

  private static scenes: Map<string, Scene> = new Map();

  static addScene(scene: Scene): void {
    Game.scenes.set(scene.name, scene);
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