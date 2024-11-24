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

import Entity from "./entity";
import { UpdateFunction } from "../utils/interfaces";

export default class ScriptableEntity extends Entity {

    private _script : UpdateFunction = (deltaTime: number) => {};
    private _fixedUpdateScript : UpdateFunction = (fixedDeltaTime: number) => {};

    public setScriptFunction(fn: UpdateFunction) {
        this._script = fn;
    }

    public setFixedUpdateFunction(fn: UpdateFunction) {
        this._fixedUpdateScript = fn;
    }
    
    override update(deltaTime: number): void {
        this._script(deltaTime);
    }

    override fixedUpdate(fixedDeltaTime: number): void {
        this._fixedUpdateScript(fixedDeltaTime);
    }

    override destroy(): void {
        
    }
}