import { StateMachine } from "./StateMachine";

export interface Destroyable
{
    destroy() : void
}

export interface Advanceable
{
    advance(deltaTime : number) : void
}

export interface Renderable
{
    
}

export interface UpdateFunction {
    (deltaTime : number, time : number) : void
}

export interface ConditionFunction {
    (): boolean
}