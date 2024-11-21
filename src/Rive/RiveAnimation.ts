import { LinearAnimationInstance } from "@rive-app/canvas-advanced";
import { Destroyable } from "../Utils/Interfaces";

export class RiveAnimation implements Destroyable {
  private instance: LinearAnimationInstance;
  
  name: string;
  weight: number = 1;

  constructor(linearAnimationInstance: LinearAnimationInstance) {
    this.name = linearAnimationInstance.name;
    this.instance = linearAnimationInstance;
  }

  advance(deltaTime: number): void {
    this.instance.advance(deltaTime);
    this.instance.apply(this.weight);
  }

  apply(): void {
    this.instance.apply(this.weight);
  }

  get time(): number {
    return this.instance.time;
  }

  set time(value: number) {
    this.instance.time = value;
  }

  get duration(): number {
    return this.instance.duration;
  }

  destroy(): void {
    this.instance.delete();
  }
}