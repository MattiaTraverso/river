import { SMIInput } from "@rive-app/canvas-advanced";

/**
 * Wrapper class for Rive's SMIInput.
 * Provides a clearer classification of input types and type-safe interactions,
 * replacing magic numbers with meaningful enums and adding runtime type checks.
 */
export class RiveSMInput {
  //todo: make it private
    //private readonly 
    smiInput: SMIInput;
    
    static readonly InputType = {
      Boolean: 'BOOLEAN',
      Number: 'NUMBER',
      Trigger: 'TRIGGER'
    } as const;
  
    readonly name : string;
    readonly inputType: typeof RiveSMInput.InputType[keyof typeof RiveSMInput.InputType];
  
    constructor(smiInput: SMIInput) {
      this.smiInput = smiInput;

      this.name = smiInput.name;
      this.inputType = this.determineInputType(smiInput.type);
    }
  
    private determineInputType(type: number): typeof RiveSMInput.InputType[keyof typeof RiveSMInput.InputType] {
      switch (type) {
        case 56:
          return RiveSMInput.InputType.Number;
        case 58:
          return RiveSMInput.InputType.Trigger;
        case 59:
          return RiveSMInput.InputType.Boolean;
        default:
          throw new Error(`SMIInput ${this.smiInput.name}: type could not be identified`);
      }
    }
  
    get value(): boolean | number | undefined {
      return this.smiInput.value;
    }
  
    set value(val: boolean | number | undefined) {
      if (this.inputType === RiveSMInput.InputType.Trigger) {
        throw new Error(`SMIInput ${this.smiInput.name}: Cannot set value for a Trigger input`);
      }
      if (this.inputType === RiveSMInput.InputType.Boolean && typeof val !== 'boolean') {
        throw new Error(`SMIInput ${this.smiInput.name}: Expected boolean value for Boolean input`);
      }
      if (this.inputType === RiveSMInput.InputType.Number && typeof val !== 'number') {
        throw new Error(`SMIInput ${this.smiInput.name}: Expected number value for Number input`);
      }
      this.smiInput.value = val;
    }
  
    fire(): void {
      if (this.inputType !== RiveSMInput.InputType.Trigger) {
        throw new Error(`SMIInput ${this.smiInput.name}: Tried to fire a non-trigger SMIInput`);
      }
      this.smiInput.fire();
    }
  }

export default RiveSMInput;