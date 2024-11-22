/**
* A ScriptableEntity is useful to script some gameplay to test things out.
* 
* Usage:
* ```typescript
* const scriptableEntity = new ScriptableEntity("anyname");
* scriptableEntity.setScriptFunction((deltaTime: number) => {
*   console.log("Hello, world! This frame took " + deltaTime + "ms to process.");
* });
* 
* scene.Add(scriptableEntity);
* 
* et voila
* ```
**/

import Entity from "./Entity";
import { UpdateFunction } from "../Utils/Interfaces";

export default class ScriptableEntity extends Entity {

    private _script : UpdateFunction = (deltaTime: number) => {};

    public setScriptFunction(fn: UpdateFunction) {
        this._script = fn;
    }
    
    override update(deltaTime: number): void {
        this._script(deltaTime);
    }

    override destroy(): void {
        
    }
}