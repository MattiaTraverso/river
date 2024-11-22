import { StateMachine } from "@rive-app/canvas-advanced";
import { SMIInput } from "@rive-app/canvas-advanced";
import { Artboard, File } from "@rive-app/canvas-advanced";
import { Game } from "../Game";
import { Input } from "./Input";

/**
 * Needs refactoring.
 */
export class Debug {
    private static Box : HTMLElement;

    static initiate() {
        Debug.Box = document.getElementById('debug-content') as HTMLElement;
    }

    static clear() {
        this.Box.innerHTML = "";
    }

    static add(text : string) {
        Debug.Box.innerHTML += "<br>" + text;
    }

    static update(deltaTime : number, time : number) {
      Performance.update(deltaTime);
      this.updateDebugInfo();
    } 

    static updateDebugInfo(): void {
        Debug.clear();
        Debug.add(`Canvas Mouse: [${Input.canvasMouseX},${Input.canvasMouseY}]`);
        Debug.add(`<br>Target Res: [${Game.targetRes.x}, ${Game.targetRes.y}]`);
        Debug.add(`Canvas: [${Game.canvas.width},${Game.canvas.height}] -> [${Game.resScale.x}x, ${Game.resScale.y}x]`);
        Debug.add(`Average FPS: ${Performance.averageFPS}`);
    }

    private static crosshair : HTMLElement | null = null;

    static toggleCrosshair() {
      if (this.crosshair !== null){
      this.crosshair.remove();
      this.crosshair = null;
      return;
      }

      let html = `
      <style>
          .crosshair-h, .crosshair-v {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: black;
          z-index: 9999;
          }
          .crosshair-h {
          width: 100%;
          height: 2px;
          }
          .crosshair-v {
          width: 2px;
          height: 100%;
          }
      </style>
        <div class="canvas-container">
          <div class="crosshair-h"></div>
          <div class="crosshair-v"></div>
        </div>

      `;

      // Create a new div element
      this.crosshair = document.createElement('div');

      // Set the innerHTML of the new div to our HTML string
      this.crosshair.innerHTML = html;

      // Append the new div to the body
      document.body.appendChild(this.crosshair);
    }
}

export default Debug;

/*
* Crappy AI generated stuff I need to change
*/
class Performance {
    private static FPSArray: number[] = [];

    static update(deltaTime: number) {
        // Calculate delta time and FPS
        let fps = 1 / deltaTime;

        // Update FPS tracking
        Performance.FPSArray.push(fps);
        if (Performance.FPSArray.length > 100) {
            Performance.FPSArray = Performance.FPSArray.slice(1);
        }
    }

    static get averageFPS(): number {
        let sum = 0;
        for (let n of Performance.FPSArray) sum += n;
        return Math.trunc(sum / Performance.FPSArray.length);
    }
}