import {
  Artboard,
  StateMachineInstance,
  SMIInput,
  OpenUrlEvent,
  RiveEvent,
  StateMachine
} from "@rive-app/canvas-advanced";
import { RiveSMInput } from "./RiveSMInput";
import RiveRenderer from "./RiveRenderer";
import Game from "./Game";
import { Input } from "./Input";

type RiveEventCallback = (event: RiveEvent) => void;
type OpenUrlEventCallback = (event: OpenUrlEvent) => void;

enum RiveEventType {
  General = 128,
  OpenURL = 131,
  Audio = 132
}

export class RiveSMRenderer extends RiveRenderer {
  private smInstance: StateMachineInstance;
  readonly inputs: RiveSMInput[] = [];
  private _reportedEvents: (OpenUrlEvent | RiveEvent)[] = [];
  private _changedStates: string[] = [];
  private generalEventListeners: RiveEventCallback[] = [];
  private openUrlEventListeners: OpenUrlEventCallback[] = [];

  constructor(artboard: Artboard, stateMachine: StateMachine) {
    super(artboard);
    this.smInstance = new Game.RiveInstance.StateMachineInstance(stateMachine, artboard);
    for (let i = 0; i < this.smInstance.inputCount(); i++) {
      let input: SMIInput = this.smInstance.input(i);
      this.inputs.push(new RiveSMInput(input));
    }
  }

  advance(deltaTime: number): void {
    this._reportedEvents = [];
    this._changedStates = [];

    let mouseCoords = Input.MouseToArtboardSpace(this);

    //TODO: This is super slow. Only call this shit if within bounding box?
    if (Input.IsMouseClicked) this.smInstance.pointerDown(mouseCoords.x, mouseCoords.y);
    if (Input.IsMouseUp) this.smInstance.pointerUp(mouseCoords.x, mouseCoords.y);
    if (Input.HasMouseMoved) this.smInstance.pointerMove(mouseCoords.x, mouseCoords.y);
    
    this.smInstance.advance(deltaTime);

    const reportedEventCount = this.smInstance.reportedEventCount();
    for (let i = 0; i < reportedEventCount; i++) {
      const event = this.smInstance.reportedEventAt(i);
      if (event) {
        this._reportedEvents.push(event);
        this.handleEvent(event);
      }
    }

    const stateChangedCount = this.smInstance.stateChangedCount();
    for (let i = 0; i < stateChangedCount; i++) {
      const stateName = this.smInstance.stateChangedNameByIndex(i);
      if (stateName) {
        this._changedStates.push(stateName);
      }
    }

    super.advance(deltaTime);
  }

  get reportedEvents(): ReadonlyArray<OpenUrlEvent | RiveEvent> {
    return this._reportedEvents;
  }

  get changedStates(): ReadonlyArray<string> {
    return this._changedStates;
  }

  addRiveEventListener(callback: RiveEventCallback): void {
    this.generalEventListeners.push(callback);
  }

  addOpenUrlEventListener(callback: OpenUrlEventCallback): void {
    this.openUrlEventListeners.push(callback);
  }

  removeRiveEventListener(callback: RiveEventCallback): void {
    const index = this.generalEventListeners.indexOf(callback);
    if (index !== -1) {
      this.generalEventListeners.splice(index, 1);
    }
  }

  removeOpenUrlEventListener(callback: OpenUrlEventCallback): void {
    const index = this.openUrlEventListeners.indexOf(callback);
    if (index !== -1) {
      this.openUrlEventListeners.splice(index, 1);
    }
  }

  private handleEvent(event: RiveEvent | OpenUrlEvent): void {
    if (event.type === RiveEventType.OpenURL) {
      this.openUrlEventListeners.forEach(callback => callback(event as OpenUrlEvent));
    } else {
      this.generalEventListeners.forEach(callback => callback(event as RiveEvent));
    }
  }

  destroy(): void {
    this.smInstance.delete();
  }
}