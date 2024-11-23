import Rive, { File } from "@rive-app/canvas-advanced";
import Game from "../Game";
import { RiveCanvas as RiveInstance } from "@rive-app/canvas-advanced";
import { Artboard, StateMachine, StateMachineInstance, SMIInput } from "@rive-app/canvas-advanced";

//Local WASM loads faster. Remote WASM might be updated if I'm lazy.
const USE_LOCAL_WASM: boolean = true;
const LOCAL_WASM_URL = new URL("../../export/rive.wasm", import.meta.url).toString();
const VERSION = '2.21.6'; //LAST IS 2.23.10
const REMOTE_WASM_URL = `https://unpkg.com/@rive-app/canvas-advanced@${VERSION}/rive.wasm`;


export default class RiveLoader {
  static rive: RiveInstance;

  static async loadRive(): Promise<void> {
    RiveLoader.rive = await Rive({
      locateFile: (_: string) => USE_LOCAL_WASM ? 
        LOCAL_WASM_URL
       : REMOTE_WASM_URL
    })
  };

  static async loadFile(url: string): Promise<File> {
      if (!RiveLoader.rive) {
          throw new Error("RiveInstance not initialized");
      }

      const bytes = await (await fetch(new Request(url))).arrayBuffer();
      const file = (await RiveLoader.rive.load(new Uint8Array(bytes))) as File;
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
    
          let sm_instance = new RiveLoader.rive.StateMachineInstance(sm, artboard);
    
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
