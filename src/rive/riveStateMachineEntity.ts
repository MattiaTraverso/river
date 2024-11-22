import { Artboard, StateMachineInstance, SMIInput, OpenUrlEvent, RiveEvent, StateMachine } from "@rive-app/webgl-advanced";

import RiveSMInput from "./Parts/riveSMInput";
import RiveEntity from "./riveEntity";
import Game from "../game";
import Input from "../systems/input";
import RiveLoader from "./riveLoader";

type RiveEventCallback = (event: RiveEvent) => void;
type OpenUrlEventCallback = (event: OpenUrlEvent) => void;

enum RiveEventType {
  General = 128,
  OpenURL = 131,
  Audio = 132
}

export class RiveStateMachineEntity extends RiveEntity {
  private smInstance: StateMachineInstance;
  readonly inputs: RiveSMInput[] = [];
  private _reportedEvents: (OpenUrlEvent | RiveEvent)[] = [];
  private _changedStates: string[] = [];
  private generalEventListeners: RiveEventCallback[] = [];
  private openUrlEventListeners: OpenUrlEventCallback[] = [];

  constructor(name: string, artboard: Artboard, stateMachine: StateMachine) {
    super(name, artboard);
    this.smInstance = new RiveLoader.rive.StateMachineInstance(stateMachine, artboard);
    for (let i = 0; i < this.smInstance.inputCount(); i++) {
      let input: SMIInput = this.smInstance.input(i);
      this.inputs.push(new RiveSMInput(input));
    }
  }

  override update(deltaTime: number): void {
    this._reportedEvents = [];
    this._changedStates = [];

    let mouseCoords = Input.mouseToArtboardSpace(this);

    //TODO: This is super slow. Only call this shit if within bounding box?
    if (Input.isMouseClicked) this.smInstance.pointerDown(mouseCoords.x, mouseCoords.y);
    if (Input.isMouseUp) this.smInstance.pointerUp(mouseCoords.x, mouseCoords.y);
    if (Input.hasMouseMoved) this.smInstance.pointerMove(mouseCoords.x, mouseCoords.y);
  
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

    super.update(deltaTime);
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

  override destroy(): void {
    this.smInstance.delete();
  }
}

export default RiveStateMachineEntity;