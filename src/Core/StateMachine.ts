/**
 * A flexible state machine implementation for managing game states and transitions.
 * 
 * Usage:
 * ```typescript
 * // 1. Create a state machine instance with a context (usually 'this' from your class)
 * const stateMachine = new StateMachine<'IDLE' | 'WALK' | 'RUN', MyGameClass>(this);
 * 
 * // 2. Define states with their update functions and optional enter/exit handlers
 * stateMachine.State('IDLE', this.idleUpdate)
 *   .withEnter(this.onEnterIdle)    // Optional
 *   .withExit(this.onExitIdle)      // Optional
 *   .transitionsTo('WALK', () => this.isMoving); // MANDATORY!
 * 
 * NOTE: First registered state becomes the initial state!
 * 
 * // 3. Add more states and transitions (transitions are checked in order)
 * stateMachine.State('WALK', this.walkUpdate)
 *   .transitionsTo('IDLE', () => !this.isMoving)
 *   .transitionsTo('RUN', () => this.isRunning);
 * 
 * NOTE: Transitions are processed in order, so have your highest priority transitions first!!
 * 
 * // 4. Update the state machine in your game loop
 * stateMachine.Update(deltaTime);
 * ```
 * 
 * Neat Features:
 * - Debug visualization support via Mermaid diagrams (call DebugRenderStateTransitionsAsMermaidGraph() to get a string)
 */
import { ConditionFunction, UpdateFunction } from "../Utils/Interfaces";

interface StateDefinition<TState extends string> {
    update: UpdateFunction;
    onEnter?: (previousState: TState | null) => void;
    onExit?: (nextState: TState) => void;
}

export default class StateMachine<TState extends string, TContext = any> {
    private states = new Map<TState, StateDefinition<TState>>();
    private transitions = new Map<TState, Map<TState, ConditionFunction>>();
    private context: TContext;

    private _currentState: TState | null = null;
    private _previousState: TState | null = null;

    //getters:
    get CurrentState() : TState | null { return this._currentState; }
    get PreviousState() : TState | null { return this._previousState; }

    constructor(context: TContext) {
        this.context = context;
    }

    State(name: TState, update: UpdateFunction) {
        const stateDef: StateDefinition<TState> = {
            update: update.bind(this.context)
        };
    
        this.registerState(name, stateDef);
        
        const builder = {
            withEnter: (onEnter: (previousState: TState | null) => void) => {
                stateDef.onEnter = onEnter.bind(this.context);
                return builder;
            },
            withExit: (onExit: (nextState: TState) => void) => {
                stateDef.onExit = onExit.bind(this.context);
                return builder;
            },
            transitionsTo: (nextState: TState, condition: ConditionFunction) => {
                this.registerTransition(name, nextState, condition);
                return builder;
            },
            debugPrint: () => {
                console.log(this.states.get(name));
                console.log(this.transitions.get(name));
                return builder;
            }
        };
    
        return builder;
    }

    private registerState(name: TState, def: StateDefinition<TState>) {
        if (this.states.has(name)) {
            throw new Error(`State ${name} already registered`);
        }

        console.log('State registered', name);
        this.states.set(name, def);

        //if this is the first state, set it
        if (this.states.size === 1) {
            this.setState(name);
        }
    }

    private registerTransition(from: TState, to: TState, condition: ConditionFunction) {
        if (from === to) {
            throw new Error('Cannot transition to the same state');
        }
        if (!this.states.has(from)) {
            throw new Error(`Cannot transition from state "${from}" as it is not registered`);
        }
        
        console.log('Transition registered', from, '->', to);
        if (!this.transitions.has(from)) {
            this.transitions.set(from, new Map());
        }
        this.transitions.get(from)!.set(to, condition);
    }

    private setState(newState: TState): void {
        console.log('Trying to set state to', newState);
        if (!this.states.has(newState)) {
            throw new Error(`State ${newState} not found`);
        };

        if (this._currentState) {
            const currentDef = this.states.get(this._currentState);
            currentDef?.onExit?.call(this.context, newState);
        }

        this._previousState = this._currentState;
        this._currentState = newState;

        const newDef = this.states.get(newState);
        newDef?.onEnter?.call(this.context, this._previousState);
    }

    //If you're using this, you're probably doing something wrong!
    public ForceState(newState: TState): void {
        if (!this.states.has(newState)) {
            throw new Error(`Cannot force transition to non-existent state: ${newState}`);
        }
        this.setState(newState);
    }

    Update(deltaTime: number, time: number): void {
        if (!this._currentState) return;

        const stateTransitions = this.transitions.get(this._currentState);
        if (stateTransitions) {
            for (const [nextState, condition] of stateTransitions) {
                if (condition.call(this.context)) {
                    this.setState(nextState);
                    break;
                }
            }
        }

        const currentDef = this.states.get(this._currentState);
        currentDef?.update.call(this.context, deltaTime);
    }

    DebugRenderStateTransitionsAsMermaidGraph(): string {
        let str: string = "```mermaid\nstateDiagram-v2\n";
        
        // Add all states
        for (const stateName of this.states.keys()) {
            const escapedName = stateName.includes(' ') ? `"${stateName}"` : stateName;
            str += `    state ${escapedName}\n`;
        }
        
        // Add all transitions
        for (const [fromState, transitions] of this.transitions.entries()) {
            for (const [toState, condition] of transitions) {
                const escapedFrom = fromState.includes(' ') ? `"${fromState}"` : fromState;
                const escapedTo = toState.includes(' ') ? `"${toState}"` : toState;
                // Get the condition function's source code and clean it up
                const conditionStr = condition.toString()
                    .replace(/[\n\r]/g, ' ')  // Remove newlines
                    .replace(/\s+/g, ' ')     // Normalize spaces
                    .replace(/^.*=>/, '')     // Remove arrow function syntax
                    .trim();
                str += `    ${escapedFrom} --> ${escapedTo}: ${conditionStr}\n`;
            }
        }

        str += "```";
        return str;
    }
}