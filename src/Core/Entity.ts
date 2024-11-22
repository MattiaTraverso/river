/**
 * An Entity is the base building block for all game entities.
 * 
 * Entities are the core elements that make up your game - players, enemies, UI elements, etc.
 * Each Entity can be enabled/disabled, updated each frame, and optionally rendered.
 * 
 * Currently the structure favors inheritance over composition (see how Entities include render()), which isn't great, but it works for now.
 * 
 * TODO: onEnable, onDisable, possibly some sort of component system?
 * Usage:
 * ```typescript
 * // Create a custom game entity by extending Entity
 * class Player extends Entity {
 *   private speed = 100;
 *   private position = {x: 0, y: 0};
 * 
 *   constructor() {
 *     super("player");
 *   }
 * 
 *   update(deltaTime: number) {
 *     // Update player position
 *     this.position.x += this.speed * deltaTime;
 *   }
 * 
 *   render(renderer: WrappedRenderer) {
 *     // Draw the player here. If you're using rive files, you'll want to use the RiveEntity class or one of its children.
 *   }
 * 
 *   destroy() {
 *     // Clean up any WASM resources
 *     super.destroy();
 *   }
 * }
 * 
 * // Add to a scene
 * const player = new Player();
 * scene.add(player);
 * 
 * // Enable/disable as needed
 * player.enabled = false; // Temporarily disable updates/rendering
 * ```
 */
import { WrappedRenderer } from "@rive-app/canvas-advanced";
import { Destroyable } from "../Utils/Interfaces";
import { b2Body, b2BodyDef, b2Shape } from "@box2d/core";
import Vector from "../Utils/Vector";
import { PhysicsState } from "../Systems/Physics";

export default class Entity implements Destroyable {
    enabled: boolean = true;
    name: string;

    constructor(name: string,) {
        this.name = name;
    }

    update(deltaTime: number): void {
        /*
        if (this.physicsBody) {
            this.physicsBody.position = this.physicState.position;
            this.physicsBody.angle = this.physicState.rotation;
        }*/
    }

    destroy(): void {
        //useful when dealing with RIVE's WASM. It's C++ so it needs cleanup
    }

    // Optional render method
    render?(renderer: WrappedRenderer, resolutionScale: Vector): void;

    //================================
    //========== PHYSICS =============
    //================================
    
    protected physicsBody?: b2Body;
    protected physicState?: PhysicsState;

    public initPhysics(body: b2Body): void {
        if (this.physicsBody) throw new Error("Physics already initialized");

        this.physicsBody = body;
    }

    public addCollider(shape: b2Shape, density: number = 1): void {
        if (!this.physicsBody) throw new Error("Physics not initialized");

        this.physicsBody.CreateFixture({ shape, density });
    }

}