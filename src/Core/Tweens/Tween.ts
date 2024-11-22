import GameObject from "../GameObject";
import Vec2D from "../../Utils/Vec2D";
import { TEasing, easing } from "./Easing";
import { InterpolationFunction, Interpolation } from "./Interpolation";

export enum LoopType {
    Restart,
    PingPong,
    Increment
}

export default class Tween<T> extends GameObject {
    private context: any;
    private propertyKey: string;

    private autoPlay: boolean = false;

    //===== Tween Properties =====
    private easingFunction: TEasing = easing.linear;
    private interpolationFunction: InterpolationFunction<T>;

    private startValue: T;
    private endValue: T;

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
    //==== CREATION =========
    //========================

    constructor(target: any, propertyKey: string, endValue: T, duration: number) {
        super("Tween");
        
        this.context = target;
        this.propertyKey = propertyKey;
        
        this.startValue = target[propertyKey] as T;
        this.endValue = endValue;
        this.duration = duration;
        
        // Get the appropriate interpolation function
        this.interpolationFunction = Interpolation.GetInterpolationFunction(this.startValue, this.endValue);
    }

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

    update(deltaTime: number): void {
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
                        this.startValue = this.endValue;
                        this.endValue = this.interpolationFunction(this.startValue, this.endValue, 2);
                        break;
                }
            } else {
                this.context[this.propertyKey] = this.endValue;
                this.isComplete = true;
                this.onUpdateCallback?.(this.endValue);
                this.onCompleteCallback?.();
                return;
            }
        }

        let t = this.elapsedTime / this.duration;
        if (this.isReverse) {
            t = 1 - t;
        }
        const easedT = this.easingFunction(t);
        const currentValue = this.interpolationFunction(this.startValue, this.endValue, easedT);

        console.log(this.context);
        this.context[this.propertyKey] = currentValue;
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
        this.context[this.propertyKey] = this.startValue;
    }
}