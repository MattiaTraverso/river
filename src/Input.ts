import Game from "./Game";
import RiveRenderer from "./RiveRenderer";

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
      console.log('Click or tap detected', event);
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
    }
  
    private static preventDefault(event: Event): void {
      event.preventDefault();
    }

    static MouseToArtboardSpace(riveRenderer : RiveRenderer) : {x : number, y : number} {
        //todo: not working if the canvas isn't full sized
        let fwdMatrix = Game.RiveInstance.computeAlignment(
            riveRenderer.fit,
            riveRenderer.alignment,
           {
            minX : 0,
            minY : 0,
            maxX : this.Canvas.width,
            maxY: this.Canvas.height
           },
        riveRenderer.bounds
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