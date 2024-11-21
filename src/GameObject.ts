import { WrappedRenderer } from "@rive-app/canvas-advanced";

export abstract class GameObject {
    enabled: boolean = true;
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    // Lifecycle methods
    abstract update(deltaTime: number): void;
    abstract destroy(): void;

    // Optional render method
    render?(renderer: WrappedRenderer): void;
}