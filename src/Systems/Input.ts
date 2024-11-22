import { AABB } from "@rive-app/canvas-advanced";
import Game from "../Game";
import RiveEntity from "../Rive/RiveEntity";

//TODO: keyboard events are not well thought out.
export default class Input {
    static windowMouseX: number = 0;
    static windowMouseY: number = 0;
    static canvasMouseX: number = 0;
    static canvasMouseY: number = 0;
    static get scaledMouseX() : number {
        return this.canvasMouseX / Game.resolutionScale.x;
    }
    static get scaledMouseY() : number {
        return this.canvasMouseY / Game.resolutionScale.y;
    }   
    
    static isMouseDown: boolean = false;
    static isMouseClicked: boolean = false;
    static isMouseUp: boolean = false;
    static hasMouseMoved: boolean = false;

    private static canvas: HTMLCanvasElement;

    private static keysDown: Set<number> = new Set();
    private static keysPressed: Set<number> = new Set();
    private static keysReleased: Set<number> = new Set();
  
    static init(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;

        // Mouse events
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleStart);
        window.addEventListener('mouseup', this.handleEnd);
        
        // Touch events
        window.addEventListener('touchstart', this.handleStart as EventListener);
        window.addEventListener('touchend', this.handleEnd as EventListener);
        window.addEventListener('touchmove', this.handleTouchMove as EventListener);
    
        // Prevent default touch behavior
        window.addEventListener('touchstart', this.preventDefault as EventListener, { passive: false });
        window.addEventListener('touchmove', this.preventDefault as EventListener, { passive: false });

        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }
  
    private static handleStart = (event: MouseEvent | TouchEvent): void => {
        this.isMouseDown = true;
        this.isMouseClicked = true;
        this.hasMouseMoved = false;
        this.updateCoordinates(event);
    }
  
    private static handleEnd = (event: MouseEvent | TouchEvent): void => {
        this.isMouseDown = false;
        this.isMouseUp = true;
        this.updateCoordinates(event);
        if (!this.hasMouseMoved) {
            this.handleClick(event);
        }
    }
  
    private static handleMouseMove = (event: MouseEvent): void => {
        this.hasMouseMoved = true;
        this.updateCoordinates(event);
    }
  
    private static handleTouchMove = (event: TouchEvent): void => {
        this.hasMouseMoved = true;
        this.updateCoordinates(event);
    }
  
    private static handleClick(event: MouseEvent | TouchEvent): void {
        //console.log('Click or tap detected', event);
        // Your click/tap logic here
    }
  
    private static updateCoordinates(event: MouseEvent | TouchEvent): void {
        if (event instanceof MouseEvent) {
            this.windowMouseX = event.clientX;
            this.windowMouseY = event.clientY;
        } else if (event instanceof TouchEvent && event.touches.length > 0) {
            this.windowMouseX = event.touches[0].clientX;
            this.windowMouseY = event.touches[0].clientY;
        }
        this.updateCanvasCoords();
    }
  
    private static updateCanvasCoords(): void {
        const rect = this.canvas.getBoundingClientRect();
        this.canvasMouseX = this.windowMouseX - rect.left;
        this.canvasMouseY = this.windowMouseY - rect.top;
    }
  
    static clear(): void {
        this.isMouseClicked = false;
        this.isMouseUp = false;
        this.hasMouseMoved = false;
        this.keysDown.clear();
        this.keysPressed.clear();
        this.keysReleased.clear();
    }
  
    private static preventDefault(event: Event): void {
        event.preventDefault();
    }

    private static handleKeyDown = (event: KeyboardEvent): void => {
        const keyCode = event.keyCode;
        if (!this.keysDown.has(keyCode)) {
            this.keysPressed.add(keyCode);
        }

        this.keysDown.add(keyCode);
    }

    private static handleKeyUp = (event: KeyboardEvent): void => {
        const keyCode = event.keyCode;
        this.keysDown.delete(keyCode);
        this.keysPressed.delete(keyCode);
        this.keysReleased.add(keyCode);
    }

    static isKeyDown(keyCode: KeyCode): boolean {
        return this.keysPressed.has(keyCode);
    }

    static isKeyUp(keyCode: KeyCode): boolean {
        return this.keysReleased.has(keyCode);
    }

    static isKey(keyCode: KeyCode): boolean {
        return this.keysDown.has(keyCode);
    }

    static mouseToArtboardSpace(riveRenderer : RiveEntity) : {x : number, y : number} {
        let scaledFrame : AABB = riveRenderer.frame;
        scaledFrame.minX *= Game.resolutionScale.x;
        scaledFrame.minY *= Game.resolutionScale.y;
        scaledFrame.maxX *= Game.resolutionScale.x;
        scaledFrame.maxY *= Game.resolutionScale.y;
        
        let fwdMatrix = Game.rive.computeAlignment(
          riveRenderer.fit,
          riveRenderer.alignment,
          scaledFrame,
          riveRenderer.artboard.bounds
        );
      
        let inverseViewMatrix = new Game.rive.Mat2D();
      
        let x = 0;
        let y = 0;
        // Invert the view matrix in order to go from cursor to artboard space.
        if (fwdMatrix.invert(inverseViewMatrix)) {
          x =
            inverseViewMatrix.xx * this.canvasMouseX +
            inverseViewMatrix.yx * this.canvasMouseY +
            inverseViewMatrix.tx;
          y =
            inverseViewMatrix.xy * this.canvasMouseX +
            inverseViewMatrix.yy * this.canvasMouseY +
            inverseViewMatrix.ty;
        }

        return {x, y};
      }
      
  }

  export enum KeyCode {
    // Special Keys
    Backspace = 8,
    Tab = 9,
    Enter = 13,
    Shift = 16,
    Ctrl = 17,
    Alt = 18,
    PauseBreak = 19,
    CapsLock = 20,
    Escape = 27,
    Space = 32,
    PageUp = 33,
    PageDown = 34,
    End = 35,
    Home = 36,
    LeftArrow = 37,
    UpArrow = 38,
    RightArrow = 39,
    DownArrow = 40,
    Insert = 45,
    Delete = 46,

    // Numbers
    Zero = 48,
    One = 49,
    Two = 50,
    Three = 51,
    Four = 52,
    Five = 53,
    Six = 54,
    Seven = 55,
    Eight = 56,
    Nine = 57,

    // Letters
    A = 65,
    B = 66,
    C = 67,
    D = 68,
    E = 69,
    F = 70,
    G = 71,
    H = 72,
    I = 73,
    J = 74,
    K = 75,
    L = 76,
    M = 77,
    N = 78,
    O = 79,
    P = 80,
    Q = 81,
    R = 82,
    S = 83,
    T = 84,
    U = 85,
    V = 86,
    W = 87,
    X = 88,
    Y = 89,
    Z = 90,

    // Windows Keys
    LeftWindowKey = 91,
    RightWindowKey = 92,

    // Numpad
    Numpad0 = 96,
    Numpad1 = 97,
    Numpad2 = 98,
    Numpad3 = 99,
    Numpad4 = 100,
    Numpad5 = 101,
    Numpad6 = 102,
    Numpad7 = 103,
    Numpad8 = 104,
    Numpad9 = 105,
    Multiply = 106,
    Add = 107,
    Subtract = 109,
    DecimalPoint = 110,
    Divide = 111,

    // Function Keys
    F1 = 112,
    F2 = 113,
    F3 = 114,
    F4 = 115,
    F5 = 116,
    F6 = 117,
    F7 = 118,
    F8 = 119,
    F9 = 120,
    F10 = 121,
    F11 = 122,
    F12 = 123,

    // Locks
    NumLock = 144,
    ScrollLock = 145,

    // Punctuation and Symbols
    SemiColon = 186,
    EqualSign = 187,
    Comma = 188,
    Dash = 189,
    Period = 190,
    ForwardSlash = 191,
    GraveAccent = 192,
    OpenBracket = 219,
    BackSlash = 220,
    CloseBracket = 221,
    SingleQuote = 222
}