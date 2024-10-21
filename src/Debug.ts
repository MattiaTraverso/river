import { StateMachine } from "@rive-app/canvas-advanced";
import { SMIInput } from "@rive-app/canvas-advanced";
import { Artboard, File } from "@rive-app/canvas-advanced";
import Game from "./Game";

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
            }
            .crosshair-h {
            width: 100%;
            height: 1px;
            }
            .crosshair-v {
            width: 1px;
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