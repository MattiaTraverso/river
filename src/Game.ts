import { WrappedRenderer } from "@rive-app/canvas-advanced";

import Vector from "./Utils/Vector"; 
import Input from "./Systems/Input";
import Debug from "./Systems/Debug";
import Scene from "./Core/Scene";
import { Destroyable } from "./Utils/Interfaces";
import Physics from "./Systems/Physics";
import { b2World } from "@box2d/core";
import RiveLoader from "./Rive/RiveLoader";


const CANVAS_ID = 'gameCanvas';

export default class Game {

  //================================
  //==== GLOBAL STATIC VARIABLES ====
  //================================

  static resolution : Vector = new Vector(400, 400);
  
  //The canvas that Rive uses to draw on, with a fixed resolution
  private static gameCanvas : OffscreenCanvas;
  //The canvas that we actually display on, with a variable resolution
  private static finalCanvas : HTMLCanvasElement;

  
  
  
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
    
    await RiveLoader.loadRive();

    Game._hasInitiated = true
  
    Game.resolution = new Vector(width, height);
    Game.gameCanvas = new OffscreenCanvas(width, height);
    Game.renderer = RiveLoader.rive.makeRenderer(Game.gameCanvas);

    Game.finalCanvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;

    Input.init(Game.gameCanvas, Game.finalCanvas);
    Debug.init(Game.gameCanvas, Game.finalCanvas);
  
    window.addEventListener('resize', Game.onResizeWindow);
    Game.onResizeWindow();

    //TODO: figure out what's the best event for this?
    window.addEventListener('onvisibilitychange', Game.destroy);

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

    RiveLoader.rive.resolveAnimationFrame();

    Game.debugRender();

    Game.finalRenderPass();

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

  private static render() {
    Game.renderer.clear();
    
    for (const scene of Game.scenes.values()) {
      if (scene.enabled) scene.render(Game.renderer);
    }
  }

  //HACK! TODO: REMOVE!
  private static debugRender() {
    for (const scene of Game.scenes.values()) {
      if (scene.enabled) scene.debugRender(Game.gameCanvas);
    }
  }

  private static finalRenderPass() {
    // Draw offscreen canvas to main canvas
    const finalContext = Game.finalCanvas.getContext('2d') as CanvasRenderingContext2D; // Access underlying 2D context
    if (!finalContext) throw new Error("No 2D context found");

    finalContext.clearRect(0, 0, Game.finalCanvas.width, Game.finalCanvas.height);
    finalContext.drawImage(Game.gameCanvas, 0, 0, Game.finalCanvas.width, Game.finalCanvas.height);
  }


  private static onResizeWindow() : void {
    const aspectRatio = Game.resolution.x / Game.resolution.y;

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
    Game.finalCanvas.width = newWidth;
    Game.finalCanvas.height = newHeight;
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