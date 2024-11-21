import { WrappedRenderer } from "@rive-app/canvas-advanced";
import { Destroyable } from "./Utils/Interfaces";

export class GameObject implements Destroyable {
    enabled: boolean = true;
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    update(deltaTime: number): void {

    }

    destroy(): void {
        //useful when dealing with RIVE's WASM. It's C++ so it needs cleanup
    }

    // Optional render method
    render?(renderer: WrappedRenderer): void;
}

export default GameObject;