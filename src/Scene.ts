import { StateMachine } from "./StateMachine";

type HackInteger = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export enum GameState {
    LOAD = "LOAD",
    PLAY = "PLAY", 
    DEBUG = "DEBUG"
}

export class GameScene {
    private loadProgress : HackInteger = 0;

    private stateMachine: StateMachine<GameState, GameScene> = new StateMachine(this);

    public DEBUG_MODE : boolean = false;

    constructor() {
        // Access stateMachine through 'this'
        console.log('Constructor');
       
        this.stateMachine.State(GameState.LOAD, this.LOAD_Update)
            .withEnter(this.LOAD_OnEnter)
            .withExit(this.LOAD_OnExit)
            .transitionsTo(GameState.PLAY, () => this.loadProgress >= 5)
            .transitionsTo(GameState.DEBUG, () => this.DEBUG_MODE);

        this.stateMachine.State(GameState.PLAY, this.PLAY_Update)
            .withEnter(this.PLAY_OnEnter)
            .withExit(this.PLAY_OnExit)
            .transitionsTo(GameState.LOAD, () => this.loadProgress <= 0)
            .transitionsTo(GameState.DEBUG, () => this.DEBUG_MODE);

        this.stateMachine.State(GameState.DEBUG, this.DEBUG_Update)
            .withEnter(this.DEBUG_OnEnter)
            .withExit(this.DEBUG_OnExit)
            .transitionsTo(GameState.LOAD, () => !this.DEBUG_MODE && this.stateMachine.PreviousState === GameState.LOAD)
            .transitionsTo(GameState.PLAY, () => !this.DEBUG_MODE && this.stateMachine.PreviousState === GameState.PLAY);
    }

    private LOAD_OnEnter(previousState: GameState | null) {
        console.log(`[${GameState.LOAD}] State entered, previous state:`, previousState);
    }

    private LOAD_Update(deltaTime: number) {
        console.log(`[${GameState.LOAD}] Updating state`);
        this.loadProgress += 1;
    }
    private LOAD_OnExit(nextState: string) {
        console.log(`[${GameState.LOAD}] State exited, next state:`, nextState);
    }

    private PLAY_OnEnter(previousState: GameState | null) {
        console.log(`[${GameState.PLAY}] State entered, previous state:`, previousState); 
    }

    private PLAY_Update(deltaTime: number) {
        console.log(`[${GameState.PLAY}] Updating state`);
        this.loadProgress -= 1;
    }

    private PLAY_OnExit(nextState: string) {
        console.log(`[${GameState.PLAY}] State exited, next state:`, nextState);
    }

    private DEBUG_OnEnter(previousState: GameState | null) {
        console.log(`[${GameState.DEBUG}] State entered, previous state:`, previousState);
    }   

    private DEBUG_Update(deltaTime: number) {
        console.log(`[${GameState.DEBUG}] Updating state`);
    }

    private DEBUG_OnExit(nextState: string) {
        console.log(`[${GameState.DEBUG}] State exited, next state:`, nextState);
    }

    public Update(deltaTime: number) {
        this.stateMachine.Update(deltaTime);
        console.log('Progress:', this.loadProgress)
    }
}

let scene : GameScene = new GameScene();

window.addEventListener('click', (e) => {
    scene.Update(0.1);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'd') {
        scene.DEBUG_MODE = !scene.DEBUG_MODE;
    }

    scene.Update(0.1);
});

(window as any).gameScene = scene;