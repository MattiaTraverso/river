import Entity from "../Entity";
import Vector from "../../Utils/Vector";
import { TEasing, easing } from "./Easing";
import { InterpolationFunction, Interpolation } from "./Interpolation";

export enum LoopType {
    Restart,
    PingPong,
    Increment
}

export default class Tween<T> extends Entity {
    private _getter: () => T;
    private _setter: (value: T) => void;

    private autoPlay: boolean = false;

    //===== Tween Properties =====
    private easingFunction: TEasing = easing.linear;
    private interpolationFunction: InterpolationFunction<T>;

    private from: T;
    private to: T;

    private duration: number = 0;
    private loopCount: number = 1;
    private loopType: LoopType = LoopType.PingPong;

    //===== Tween State =====
    private elapsedTime: number = 0;
    private currentLoop: number = 1;
    private isReverse: boolean = false;

    private hasStarted: boolean = false;
    private isComplete: boolean = false;
    
    //===== Tween Callbacks =====
    private onCompleteCallback?: () => void;
    private onUpdateCallback?: (value: T) => void;
    private onStartCallback?: () => void;

    //===== Getters =====
    public get isPlaying(): boolean {
        return this.hasStarted && !this.isComplete;
    }

    //========================
    //==== FACTORY ==========
    //========================

    private static createAccessors<T>(target: any, propertyKey: string): {
        getter: () => T,
        setter: (value: T) => void
    } {
        return {
            getter: () => target[propertyKey] as T,
            setter: (value: T) => target[propertyKey] = value
        };
    }

    private constructor(
        getter: () => T,
        setter: (value: T) => void,
        to: T,
        duration: number
    ) {
        super("Tween");
        
        this._getter = getter;
        this._setter = setter;
        
        this.from = this._getter();
        this.to = to;
        this.duration = duration;
        
        this.interpolationFunction = Interpolation.getInterpolationFunction(this.from, this.to);
    }

    public static to<T>(target: any, propertyKey: string, to: T, duration: number): Tween<T> {
        const { getter, setter } = Tween.createAccessors<T>(target, propertyKey);
        return new Tween(getter, setter, to, duration);
    }

    public static toProperty<T>(
        setter: (value: T) => void,
        getter: () => T,
        to: T,
        duration: number
    ): Tween<T> {
        return new Tween(getter, setter, to, duration);
    }

    //========================
    //==== CONFIGURATION ====
    //========================

    public easing(easingFunction: TEasing) {
        this.easingFunction = easingFunction;
        return this;
    }

    public onComplete(callback: () => void) {
        this.onCompleteCallback = callback;
        return this;
    }

    public onUpdate(callback: (value: T) => void) {
        this.onUpdateCallback = callback;
        return this;
    }

    public onStart(callback: () => void) {
        this.onStartCallback = callback;
        return this;
    }

    public auto(autoPlay: boolean) {
        this.autoPlay = autoPlay;
        return this;
    }

    public setLoopType(type: LoopType) {
        this.loopType = type;
        return this;
    }

    public setLoops(count: number) {
        this.loopCount = count;
        return this;
    }

    //========================
    //==== LIFECYCLE =======
    //========================

    override update(deltaTime: number): void {
        if (this.isComplete || (!this.autoPlay && !this.hasStarted)) return;

        if (!this.hasStarted) {
            this.hasStarted = true;
            this.onStartCallback?.();
        }

        this.elapsedTime += deltaTime;
        
        if (this.elapsedTime >= this.duration) {
            if (this.loopCount === -1 || this.currentLoop < this.loopCount) {
                this.elapsedTime = 0;
                this.currentLoop++;

                switch (this.loopType) {
                    case LoopType.PingPong:
                        this.isReverse = !this.isReverse;
                        break;
                    case LoopType.Increment:
                        this.from = this.to;
                        this.to = this.interpolationFunction(this.from, this.to, 2);
                        break;
                }
            } else {
                this._setter(this.to);
                this.isComplete = true;
                this.onUpdateCallback?.(this.to);
                this.onCompleteCallback?.();
                return;
            }
        }

        let t = this.elapsedTime / this.duration;
        if (this.isReverse) {
            t = 1 - t;
        }
        const easedT = this.easingFunction(t);
        const currentValue = this.interpolationFunction(this.from, this.to, easedT);

        this._setter(currentValue);
        this.onUpdateCallback?.(currentValue);
    }

    public isFinished(): boolean {
        return this.isComplete;
    }

    public play(): Tween<T> {
        this.hasStarted = true;
        return this;
    }

    public reset(): void {
        this.elapsedTime = 0;
        this.isComplete = false;
        this.hasStarted = false;
        this.currentLoop = 1;
        this.isReverse = false;
        this._setter(this.from);
    }
}