/**
* A ScriptableObject is useful to script some gameplay to test things out.
* 
* Usage:
* ```typescript
* const scriptableObject = new ScriptableObject("anyname");
* scriptableObject.setUpdateFunction((deltaTime: number) => {
*   console.log("Hello, world! This frame took " + deltaTime + "ms to process.");
* });
* 
* scene.Add(scriptableObject);
* 
* et voila
* ```
**/

import GameObject from "./GameObject";
import { UpdateFunction } from "../Utils/Interfaces";

export class ScriptableObject extends GameObject{

    private _updateFN : UpdateFunction = (deltaTime: number) => {};

    public setUpdateFunction(fn: UpdateFunction) {
        this._updateFN = fn;
    }
    
    update(deltaTime: number): void {
        this._updateFN(deltaTime);
    }

    destroy(): void {
        
    }
}

export default ScriptableObject;