import { File } from "@rive-app/canvas-advanced";
import Game from "../Game";
import { Artboard, StateMachine, StateMachineInstance, SMIInput } from "@rive-app/canvas-advanced";

export default class RiveLoader {
    static async loadFile(url: string): Promise<File> {
        if (!Game.rive) {
            throw new Error("RiveInstance not initialized");
        }

        const bytes = await (await fetch(new Request(url))).arrayBuffer();
        const file = (await Game.rive.load(new Uint8Array(bytes))) as File;
        return file;
    }

    static logUnpackedRiveFile(file: File): void {
        let log: string = ""
    
        for (let i = 0; i < file.artboardCount(); i++) {
          let artboard : Artboard = file.artboardByIndex(i);
      
          log += `\n Artboard: ${artboard.name}`;
      
          log += `\n     ${artboard.stateMachineCount()} State Machines`;
          for (let i = 0; i < artboard.stateMachineCount(); i++) {
            let sm : StateMachine = artboard.stateMachineByIndex(i);
            
            log += `\n ----SM: ${sm.name}`;
      
            let sm_instance = new Game.rive.StateMachineInstance(sm, artboard);
      
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
}
