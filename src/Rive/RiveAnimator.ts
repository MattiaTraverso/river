import { Artboard, LinearAnimation, LinearAnimationInstance } from "@rive-app/canvas-advanced";
import RiveRenderer from "./RiveRenderer";
import { RiveAnimation } from "./RiveAnimation";
import Game from "../Game";

export class RiveAnimatorRenderer extends RiveRenderer {
  private animations: Map<string, RiveAnimation> = new Map();

  constructor(artboard: Artboard) {
    super(artboard);
  }

  add(linearAnimation: LinearAnimation): string {
    const instance = new Game.RiveInstance.LinearAnimationInstance(linearAnimation, this.artboard);

    const riveAnimation = new RiveAnimation(instance);
    this.animations.set(linearAnimation.name, riveAnimation);

    return linearAnimation.name;
  }

  addByName( animationName : string) : string {
    const animation = this.artboard.animationByName(animationName);

    if (!animation) {
        console.error(`Animation ${animationName} not found in artboard ${this.artboard.name}`);
    }

    console.log(`Found ${animation.name}`);

    this.add(animation);

    return animation.name;
  }

  addByIndex( index : number) : string {
    const animation = this.artboard.animationByIndex(0);

    if (!animation) {
        console.error(`Animation ${index} not found in artboard ${this.artboard.name}`);
    }

    this.add(animation);

    return animation.name;
  }

  remove(name: string): void {
    this.animations.get(name)?.destroy();
    this.animations.delete(name);
  }
  
  getWeight(name: string): number | undefined {
    return this.animations.get(name)?.weight;
  }

  setWeight(name: string, weight: number): void {
    const animation = this.animations.get(name);

    if (animation) {
      animation.weight = weight;
    }
  }

  advance(deltaTime: number): void {
    for (const animation of this.animations.values()) {
      animation.advance(deltaTime);
    }

    super.advance(deltaTime);
  }

  // Method to get all animation names
  getAnimationNames(): string[] {
    return Array.from(this.animations.keys());
  }
  
  destroy(): void {
    let anims : MapIterator<RiveAnimation> = this.animations.values();

    for (let anim in anims)
    {
      console.log(typeof(anim));;
    }
    //how to iterate and get all RiveAnimations?
  }
}