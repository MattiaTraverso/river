import { StateMachine } from "@rive-app/canvas-advanced";
import { SMIInput } from "@rive-app/canvas-advanced";
import { Artboard, File } from "@rive-app/canvas-advanced";
import { Game } from "../Game";
import { Input } from "./Input";

export class Debug {
    private static Box : HTMLElement;

    static Initiate() {
        Debug.Box = document.getElementById('debug-content') as HTMLElement;
    }

    static Clear() {
        this.Box.innerHTML = "";
    }

    static Add(text : string) {
        Debug.Box.innerHTML += "<br>" + text;
    }

    static Update(deltaTime : number, time : number) {
      Performance.Update(deltaTime);
      this.UpdateDebugInfo();
    } 

    static UpdateDebugInfo(): void {
        Debug.Clear();
        Debug.Add(`Current Scene: ${Game.CurrentScene?.Name}`);
        Debug.Add(`Canvas Mouse: [${Input.CanvasMouseX},${Input.CanvasMouseY}]`);
        Debug.Add(`<br>Target Res: [${Game.TargetResolution.x}, ${Game.TargetResolution.y}]`);
        Debug.Add(`Canvas: [${Game.Canvas.width},${Game.Canvas.height}] -> [${Game.ResScale.x}x, ${Game.ResScale.y}x]`);
        Debug.Add(`Average FPS: ${Performance.AverageFPS}`);
    }

    static LogUnpackedRiveFile(file: File): void {
        let log: string = ""
    
        for (let i = 0; i < file.artboardCount(); i++) {
          let artboard : Artboard = file.artboardByIndex(i);
      
          log += `\n Artboard: ${artboard.name}`;
      
          log += `\n     ${artboard.stateMachineCount()} State Machines`;
          for (let i = 0; i < artboard.stateMachineCount(); i++) {
            let sm : StateMachine = artboard.stateMachineByIndex(i);
            
            log += `\n ----SM: ${sm.name}`;
      
            let sm_instance = new Game.RiveInstance.StateMachineInstance(sm, artboard);
      
            for (let i = 0; i < sm_instance.inputCount(); i++) {
              let smi : SMIInput = sm_instance.input(i);
      
              log += `\n -------SMI: ${smi.name} | ${smi.type} | ${smi.value}`;
            }
      
            sm_instance.delete();
            
          }
      
          log += `\n     ${artboard.animationCount()} Animations`;
          for (let i = 0; i < artboard.animationCount(); i++) {
            log += `\n ----AN: ${artboard.animationByIndex(i).name}`;
          }
      
          
        }
      
        console.log(log);
      }

      private static crosshair : HTMLElement | null = null;

      static ToggleCrosshair() {
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

class Performance {
    private static FPSArray: number[] = [];

    static Update(deltaTime: number) {
        // Calculate delta time and FPS
        let fps = 1 / deltaTime;

        // Update FPS tracking
        Performance.FPSArray.push(fps);
        if (Performance.FPSArray.length > 100) {
            Performance.FPSArray = Performance.FPSArray.slice(1);
        }
    }

    static get AverageFPS(): number {
        let sum = 0;
        for (let n of Performance.FPSArray) sum += n;
        return Math.trunc(sum / Performance.FPSArray.length);
    }
}