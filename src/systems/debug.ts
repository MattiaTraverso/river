import { StateMachine } from "@rive-app/webgl-advanced";
import { SMIInput } from "@rive-app/webgl-advanced";
import { Artboard, File } from "@rive-app/webgl-advanced";
import Game from "../game";
import Input, { KeyCode } from "./input";
import Vector from "../utils/vector";
/**
 * Needs refactoring.
 */
export class Debug {
    private static Box : HTMLElement;

    private static gameCanvas : OffscreenCanvas;
    private static finalCanvas : HTMLCanvasElement;

    static init(gameCanvas : OffscreenCanvas, finalCanvas : HTMLCanvasElement) {
        Debug.Box = document.getElementById('debug-content') as HTMLElement;
        Debug.gameCanvas = gameCanvas ;
        Debug.finalCanvas = finalCanvas;
    }

    static clear() {
        this.Box.innerHTML = "";
    }

    static add(text : string) {
        Debug.Box.innerHTML += "<br>" + text;
    }

    static update(deltaTime : number) {
      Performance.update(deltaTime);
      this.updateDebugInfo();

      if (Input.isKeyDown(KeyCode.D)) {
        let debugBoxContainer = document.getElementById('debug');
        if (debugBoxContainer) {
          debugBoxContainer.style.visibility = debugBoxContainer.style.visibility === 'hidden' ? 'visible' : 'hidden';
        }
      }

      if (Input.isKeyDown(KeyCode.L)) {
        Performance.downloadCSVOfFPSandMouse();
      }
    } 

    static updateDebugInfo(): void {
        Debug.clear();
        Debug.add(`Canvas Mouse: [${Input.gameMouseX},${Input.gameMouseY}]`);
        
        Debug.add(`Game Canvas: [${Debug.gameCanvas.width},${Debug.gameCanvas.height}]`);
        Debug.add(`Final Canvas: [${Debug.finalCanvas.width},${Debug.finalCanvas.height}]`);
        Debug.add(`Resolution Scale: [${Debug.finalCanvas.width / Debug.gameCanvas.width}x, ${Debug.finalCanvas.height / Debug.gameCanvas.height}x]`);
        Debug.add(`FPS: ${Performance.FPS}`);
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

    //we also need to keep track of Input.isMouseClicked, Input.isMouseUp, Input.hasMouseMoved to see if there's any correlation
    private static mouseClickedArray: boolean[] = [];
    private static mouseUpArray: boolean[] = [];
    private static hasMouseMovedArray: boolean[] = [];

    static update(deltaTime: number) {
        // Calculate delta time and FPS
        let fps = 1 / deltaTime;

        // Update FPS tracking
        Performance.FPSArray.push(fps);

        Performance.mouseClickedArray.push(Input.isMouseClicked);
        Performance.mouseUpArray.push(Input.isMouseUp);
        Performance.hasMouseMovedArray.push(Input.hasMouseMoved);

        if (Performance.FPSArray.length > 10000) {
            Performance.FPSArray = Performance.FPSArray.slice(-100);
            Performance.mouseClickedArray = Performance.mouseClickedArray.slice(-100);
            Performance.mouseUpArray = Performance.mouseUpArray.slice(-100);
            Performance.hasMouseMovedArray = Performance.hasMouseMovedArray.slice(-100);
        }
    }

    static get averageFPS(): number {
        const last100 = Performance.FPSArray.slice(-100);
        let sum = 0;
        for (let n of last100) sum += n;
        return Math.trunc(sum / last100.length);
    }

    static get FPS(): number {
        return Math.trunc(Performance.FPSArray[Performance.FPSArray.length - 1]);
    }

    static downloadCSVOfFPSandMouse(): void {
        // Create CSV header row
        let csv = "FPS,MouseClicked,MouseUp,MouseMoved\n";
        
        // Add each row of correlated data
        for (let i = 0; i < Performance.FPSArray.length; i++) {
            csv += `${Performance.FPSArray[i]},${Performance.mouseClickedArray[i]},${Performance.mouseUpArray[i]},${Performance.hasMouseMovedArray[i]}\n`;
        }

        let blob = new Blob([csv], { type: 'text/csv' });
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'fps_mouse_values.csv';
        a.click();
    }
}