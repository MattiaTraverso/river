import { AABB } from "@rive-app/webgl-advanced";
import Game from "../game";
import RiveEntity from "../rive/riveEntity";
import RiveLoader from "../rive/riveLoader";
import Vector from "../utils/vector";

//TODO: keyboard events are kind of garbage
export default class Input {
    static windowMouseX: number = 0;
    static windowMouseY: number = 0;
    static gameMouseX: number = 0;
    static gameMouseY: number = 0;

    
    static isMouseDown: boolean = false;
    static isMouseClicked: boolean = false;
    static isMouseUp: boolean = false;
    static hasMouseMoved: boolean = false;

    private static gameCanvas: OffscreenCanvas;
    private static finalCanvas: HTMLCanvasElement;

    private static keysDown: Set<number> = new Set();
    private static keysPressed: Set<number> = new Set();
    private static keysReleased: Set<number> = new Set();
  
    static init(gameCanvas: OffscreenCanvas, finalCanvas: HTMLCanvasElement): void {
        this.gameCanvas = gameCanvas;
        this.finalCanvas = finalCanvas;

        // Mouse events
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
        
        // Touch events
        window.addEventListener('touchstart', this.onMouseDown as EventListener);
        window.addEventListener('touchend', this.onMouseUp as EventListener);
        window.addEventListener('touchmove', this.onTouchMove as EventListener);
    
        // Prevent default touch behavior
        window.addEventListener('touchstart', this.preventDefault as EventListener, { passive: false });
        window.addEventListener('touchmove', this.preventDefault as EventListener, { passive: false });

        // Keyboard events
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    /**
     * At the end of the frame, clear the input state.
     */
    static clear(): void {
        this.isMouseClicked = false;
        this.isMouseUp = false;
        this.hasMouseMoved = false;
        this.keysPressed.clear();
        this.keysReleased.clear();
    }
  
    private static onMouseDown = (event: MouseEvent | TouchEvent): void => {
        this.isMouseDown = true;
        this.hasMouseMoved = false;
        this.updateCoordinates(event);
        event.preventDefault();
    }
  
    private static onMouseUp = (event: MouseEvent | TouchEvent): void => {
        this.isMouseDown = false;
        this.isMouseUp = true;
        this.updateCoordinates(event);
        if (!this.hasMouseMoved) {
            this.onClick(event);
        }
        event.preventDefault();
    }
  
    private static onMouseMove = (event: MouseEvent): void => {
        this.hasMouseMoved = true;
        this.updateCoordinates(event);
        event.preventDefault();
    }
  
    private static onTouchMove = (event: TouchEvent): void => {
        this.hasMouseMoved = true;
        this.updateCoordinates(event);
        event.preventDefault();
    }
  
    private static onClick(event: MouseEvent | TouchEvent): void {
        this.isMouseClicked = true;
        event.preventDefault();
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
    
        //need to convert from window transform to game canvas transform

        let rect = this.finalCanvas.getBoundingClientRect();

        this.gameMouseX = (this.windowMouseX - rect.left) * Game.resolution.x / rect.width;
        this.gameMouseY = (this.windowMouseY - rect.top) * Game.resolution.y / rect.height;
    }
  
    private static preventDefault(event: Event): void {
        event.preventDefault();
    }

    private static onKeyDown = (event: KeyboardEvent): void => {
        const keyCode = event.keyCode;
        if (!this.keysDown.has(keyCode)) {
            this.keysPressed.add(keyCode);
        }

        this.keysDown.add(keyCode);
    }

    private static onKeyUp = (event: KeyboardEvent): void => {
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
        /*
        In new version of Rive, it needs a fifth parameter which is the scaleFactor. The TS definition says it's optional, but it's not.
        */
        let fwdMatrix = RiveLoader.rive.computeAlignment(
          riveRenderer.fit,
          riveRenderer.alignment,
          riveRenderer.frame,
          riveRenderer.artboard.bounds
        );
      
        let inverseViewMatrix = new RiveLoader.rive.Mat2D();
      
        let x = 0;
        let y = 0;
        // Invert the view matrix in order to go from cursor to artboard space.
        if (fwdMatrix.invert(inverseViewMatrix)) {
          x =
            inverseViewMatrix.xx * this.gameMouseX +
            inverseViewMatrix.yx * this.gameMouseY +
            inverseViewMatrix.tx;
          y =
            inverseViewMatrix.xy * this.gameMouseX +
            inverseViewMatrix.yy * this.gameMouseY +
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