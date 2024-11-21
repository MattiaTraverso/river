import Game from "../Game";
import RiveGameObject from "../Rive/RiveGameObject";

//TODO: keyboard events are not well thought out.
export class Input {
    static MouseX: number = 0;
    static MouseY: number = 0;
    static CanvasMouseX: number = 0;
    static CanvasMouseY: number = 0;
    
    static IsMouseDown: boolean = false;
    static IsMouseClicked: boolean = false;
    static IsMouseUp: boolean = false;
    static HasMouseMoved: boolean = false;

    private static Canvas: HTMLCanvasElement;

    private static keysDown: Set<number> = new Set();
    private static keysPressed: Set<number> = new Set();
    private static keysReleased: Set<number> = new Set();
  
    static Initiate(canvas: HTMLCanvasElement): void {
        this.Canvas = canvas;

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
        this.IsMouseDown = true;
        this.IsMouseClicked = true;
        this.HasMouseMoved = false;
        this.updateCoordinates(event);
    }
  
    private static handleEnd = (event: MouseEvent | TouchEvent): void => {
        this.IsMouseDown = false;
        this.IsMouseUp = true;
        this.updateCoordinates(event);
        if (!this.HasMouseMoved) {
            this.handleClick(event);
        }
    }
  
    private static handleMouseMove = (event: MouseEvent): void => {
        this.HasMouseMoved = true;
        this.updateCoordinates(event);
    }
  
    private static handleTouchMove = (event: TouchEvent): void => {
        this.HasMouseMoved = true;
        this.updateCoordinates(event);
    }
  
    private static handleClick(event: MouseEvent | TouchEvent): void {
        //console.log('Click or tap detected', event);
        // Your click/tap logic here
    }
  
    private static updateCoordinates(event: MouseEvent | TouchEvent): void {
        if (event instanceof MouseEvent) {
            this.MouseX = event.clientX;
            this.MouseY = event.clientY;
        } else if (event instanceof TouchEvent && event.touches.length > 0) {
            this.MouseX = event.touches[0].clientX;
            this.MouseY = event.touches[0].clientY;
        }
        this.UpdateCanvasCoords();
    }
  
    private static UpdateCanvasCoords(): void {
        const rect = this.Canvas.getBoundingClientRect();
        this.CanvasMouseX = this.MouseX - rect.left;
        this.CanvasMouseY = this.MouseY - rect.top;
    }
  
    static Clear(): void {
        this.IsMouseClicked = false;
        this.IsMouseUp = false;
        this.HasMouseMoved = false;
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

    static IsKeyDown(keyCode: KeyCode): boolean {
        return this.keysPressed.has(keyCode);
    }

    static IsKeyUp(keyCode: KeyCode): boolean {
        return this.keysReleased.has(keyCode);
    }

    static IsKey(keyCode: KeyCode): boolean {
        return this.keysDown.has(keyCode);
    }

    static MouseToArtboardSpace(riveRenderer : RiveGameObject) : {x : number, y : number} {
        let fwdMatrix = Game.RiveInstance.computeAlignment(
          riveRenderer.fit,
          riveRenderer.alignment,
          riveRenderer.frame,
          riveRenderer.artboard.bounds
        );
      
        let inverseViewMatrix = new Game.RiveInstance.Mat2D();
      
        let x = 0;
        let y = 0;
        // Invert the view matrix in order to go from cursor to artboard space.
        if (fwdMatrix.invert(inverseViewMatrix)) {
          x =
            inverseViewMatrix.xx * this.CanvasMouseX +
            inverseViewMatrix.yx * this.CanvasMouseY +
            inverseViewMatrix.tx;
          y =
            inverseViewMatrix.xy * this.CanvasMouseX +
            inverseViewMatrix.yy * this.CanvasMouseY +
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