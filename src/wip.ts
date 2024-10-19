import Rive, {
    Artboard,
    SMIInput,
    WrappedRenderer,
    RiveCanvas,
    File,
    RiveEventCustomProperties,
    LinearAnimation,
    LinearAnimationInstance,
    StateMachine,
    StateMachineInstance,
    OpenUrlEvent,
    RiveEvent,
  } from "@rive-app/canvas-advanced";

let canvas : HTMLCanvasElement;
let rive : RiveCanvas;
let renderer : WrappedRenderer;

let loadedFiles : File[] = [];

async function initiate(): Promise<RiveCanvas> {
  const instance = await Rive({
    locateFile: (_: string) => "https://unpkg.com/@rive-app/canvas-advanced@2.21.6/rive.wasm"
  });

  rive = instance;
  canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  renderer = rive.makeRenderer(canvas);

  return rive;
}

//#region  Rive Files

interface RiveFile {
  name: string;
  artboards: Artboard[];
}

function logUnpackedRiveFile(file: RiveFile): void {
  let log: string = file.name;

  for (let artboard of file.artboards) {
    log += `\n Artboard: ${artboard.name}`;

    log += `\n     ${artboard.stateMachineCount()} State Machines`;
    for (let i = 0; i < artboard.stateMachineCount(); i++) {
      let sm : StateMachine = artboard.stateMachineByIndex(i);
      
      log += `\n ----SM: ${sm.name}`;

      let sm_instance = new rive.StateMachineInstance(sm, artboard);

      for (let i = 0; i < sm_instance.inputCount(); i++) {
        let smi : SMIInput = sm_instance.input(i);

        log += `\n -------SMI: ${smi.name} | ${smi.type} | ${smi.value}`;
      }

      sm_instance.delete();
      
    }

    log += `\n     ${artboard.animationCount()} Animations`;
    for (let i = 0; i < artboard.animationCount(); i++) {
      log += `\n ----AN: ${artboard.animationByIndex(i).name}`;
    }

    
  }

  console.log(log);
}

async function loadFile(url: string): Promise<RiveFile> {
  const bytes = await (await fetch(new Request(url))).arrayBuffer();
  
  // import File as a named import from the Rive dependency
  const file = (await rive.load(new Uint8Array(bytes))) as File;
  
  // Extract the file name from the URL
  const name = url.split('/').pop()?.split('?')[0] || 'unknown';
  
  // Get all artboards
  const artboards: Artboard[] = [];
  const artboardCount = file.artboardCount();

  for (let i = 0; i < artboardCount; i++) {
    artboards.push(file.artboardByIndex(i));
  }
  
  // Create and return our custom RiveFileData object
  return {
    name,
    artboards
  };
}
  
//#endregion


//#region Loop

let elapsed : number = 0;
let deltaTime : number = 0;

let animations : LinearAnimationInstance[] = [];
let artboards : Artboard[] = [];
let stateMachines : StateMachineInstance[] = [];

interface LoopCallBack {
  () : void
}

let loopCallbacks : LoopCallBack[] = [];

function loop(time : number) : void {
  deltaTime = (time - elapsed) / 1000;

  console.log(deltaTime);
  
  elapsed = time;

  for (let stateMachine of stateMachines)
  {
    stateMachine.advance(deltaTime);
  }

  for (let animation of animations){
    animation.advance(deltaTime);
    animation.apply(1);
  }

  for (let artboard of artboards){
    artboard.advance(deltaTime);
  }

  for (let loopCallBack of loopCallbacks)
    loopCallBack();

  render(time);
  
  rive.resolveAnimationFrame();

  //queueRect(0, 0, canvas.width, canvas.height, "yellow");

  executeDrawings(canvas);

  requestAnimationFrame(loop);
}



function render(time:Number): void {
  renderer.clear();

  renderer.save();

  let d : Dimensions = readValues();

  
  for (let artboard of artboards)
  {
    //console.log(artboard.bounds.maxX);

    let bounds = artboard.bounds;

    
    /*
    bounds.minX = d.bx;
    bounds.minY = d.by;
    bounds.maxX = d.bw;
    bounds.maxY = d.bh;*/

    //console.log(bounds.minX - artboard.bounds.minX, bounds.maxX - artboard.bounds.maxX, bounds.minY - artboard.bounds.minY, bounds.maxY - artboard.bounds.maxY);

    
    d.w = canvas.width; d.h = canvas.height;
    
    let mousePos = getMousePosition(canvas);

    queueRect(d.x, d.y, d.w, d.h, "yellow");
    
    //mousePos.x -= d.w * .5;     mousePos.y -= d.h * .5;
    //d.x = mousePos.x;  d.y = mousePos.y; queueRect(d.x, d.y, d.w, d.h, "yellow");
    
    renderer.align(
      rive.Fit.contain,
      rive.Alignment.center,
      {	
        minX: d.x, // mousePos.x, //0,	
        minY: d.y, //mousePos.y, //0,
        maxX: d.w, //mousePos.x + d.w, //canvas.width, //d.x + d.w
        maxY: d.h //mousePos.y + d.h //canvas.height // d.y + d.h
      },
      bounds,
    );

    artboard.draw(renderer);
  }
  
  
  renderer.restore();
}

//#endregion


function resizeCanvas() : void {
  console.log("Resizing to", canvas.width, canvas.height);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

async function main() : Promise<void> {
  await initiate();


  //#region  examples
  //How to write this all in one go with an array and map?


  //let car : RiveFile = await loadFile("clean_the_car.riv");
  //let centaur : RiveFile = await loadFile("centaur.riv");

/*
  //basket test
  //This .riv only has one animation, no state machine.
  //We add the animation and let it be updated.
  
  async function basketTest() : void {
    let basket : RiveFile = await loadFile("basketball.riv");
    artboards.push(basket.artboards[0]);
    animations.push(new rive.LinearAnimationInstance(basket.artboards[0].animationByName('idle'), basket.artboards[0]));
  }
  
  basketTest();
*/

/*
  //walk cycle .riv test
  //This .riv has a state machine with three inputs. Wave / Stop are booleans Input. 
  //Stop transitions the Walk animation to the Stop, and Wave the Stop to the Wave (Could be better)
  //Blink is instead a trigger Input that applies an animation layer on top
  let walk : RiveFile = await loadFile("walk_cycle.riv");

  artboards.push(walk.artboards[0]);


  //Uncomment this line to just play an animation
  //animations.push(new rive.LinearAnimationInstance(artboards[0].animationByName("Walk"), artboards[0]));


  //otherwise, use the statemachine to play the animation.
  // it's either or! Statemachine basically do for you the work you could do by hand with animation weights.
  
  stateMachines.push(new rive.StateMachineInstance(artboards[0].stateMachineByIndex(0), artboards[0]));

  let blink = stateMachines[0].input(2).asTrigger();
  let stop = stateMachines[0].input(1).asBool();


  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      blink.fire();
    }
  });
  
  canvas.addEventListener('click', (event: MouseEvent) => {
    stop.value = true;
  });
  */

  /*
  let characterFile : RiveFile = await loadFile("ch.riv");


  let char : number = 0;
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      char++; if (char > 1) char = 0;

      artboards.pop();

      //not animated character
      artboards.push(characterFile.artboards[char])

      console.log("Bounds", artboards[0].bounds);

      stateMachines.pop();

      stateMachines.push(new rive.StateMachineInstance(characterFile.artboards[0].stateMachineByIndex(0), characterFile.artboards[char]));
    }
  });

  logUnpackedRiveFile(characterFile);
  */

  /*
  let events : RiveFile = await loadFile("events.riv");

  artboards.push(events.artboards[0]);

  stateMachines.push(new rive.StateMachineInstance(events.artboards[0].stateMachineByIndex(0), events.artboards[0]));



  loopCallbacks.push(() => {
    for (let stateMachine of stateMachines)
      {
        for (let i = 0; i < stateMachine.reportedEventCount(); i++)
        {
          let event : OpenUrlEvent | RiveEvent | undefined = stateMachine.reportedEventAt(i);
          
          if (event === undefined) {
            console.log("Wtf. Event is undefined")
            continue;
          }
    
          console.log("Event: ", event.name);
    
          if (event.delay)
          {
            console.log("---Delay of ", event.delay);
          }
    
          if (event as OpenUrlEvent)
          {
            console.log("---URL: ", (event as OpenUrlEvent).url, " Target:", (event as OpenUrlEvent).target);
          }
    
          if (event.type)
          {
            console.log("---Type:", event.type);
          }
    
          if (event.properties)
          {
            let properties : RiveEventCustomProperties = event.properties;
    
            for (const key in properties) {
              if (properties.hasOwnProperty(key)) {
                  const value = properties[key];
                  const type = typeof value;
                  console.log(`-----$${key}: ${value} (Type: ${type})`);
              }
            }
          }
          
          //[Log] Event:  – "URL TYPE" (index.cfee688b.js, line 659)
          //[Log] ---Delay of  – 0.01400265097618103 (index.cfee688b.js, line 660)
          //[Log] ---Type: – 131 (index.cfee688b.js, line 661)
         // [Log] ---Properties: (index.cfee688b.js, line 664)
         // [Log] -----NUMBER: 0 (index.cfee688b.js, line 665)
         // [Log] -----BOOLEAN: false (index.cfee688b.js, line 665)
         // [Log] -----STRING: awdawdwa (index.cfee688b.js, line 665)
          //[Log] Event:  – "GENERAL TYPE" (index.cfee688b.js, line 659)
         // [Log] ---Delay of  – 0.014002561569213867 (index.cfee688b.js, line 660)
         // [Log] ---Type: – 128 (index.cfee688b.js, line 661)
         // [Log] ---Properties: (index.cfee688b.js, line 664)
          //[Log] -----NUMBER: 25 (index.cfee688b.js, line 665)
         // [Log] -----BOOLEAN: false (index.cfee688b.js, line 665)
         // [Log] -----STRING: Bella pe te! (index.cfee688b.js, line 665)
         // [Log] -----NUMBER AGAIN: 0 (index.cfee688b.js, line 665)
        }
      }
    }
  );
*/

//#endregion

  let fashion : RiveFile = await loadFile("fashion_app.riv");

  logUnpackedRiveFile(fashion);

  artboards.push(fashion.artboards[0]);

  stateMachines.push(new rive.StateMachineInstance(artboards[0].stateMachineByIndex(0), artboards[0]));

  requestAnimationFrame(loop);
}

type Dimensions = {
  x: number;
  y: number;
  w: number;
  h: number;
  bx: number;
  by: number;
  bw: number;
  bh: number;
};

function readValues(): Dimensions {
  const x = (document.getElementById('x') as HTMLInputElement).valueAsNumber;
  const y = (document.getElementById('y') as HTMLInputElement).valueAsNumber;
  const w = (document.getElementById('w') as HTMLInputElement).valueAsNumber;
  const h = (document.getElementById('h') as HTMLInputElement).valueAsNumber;
  const bx = (document.getElementById('bx') as HTMLInputElement).valueAsNumber;
  const by = (document.getElementById('by') as HTMLInputElement).valueAsNumber;
  const bw = (document.getElementById('bw') as HTMLInputElement).valueAsNumber;
  const bh = (document.getElementById('bh') as HTMLInputElement).valueAsNumber;

  return { x, y, w, h, bx, by, bw, bh };
}

// Define a type for our drawing operation
type DrawOperation = {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
};

// Create a queue to store drawing operations
let drawQueue: DrawOperation[] = [];

function queueRect(x: number, y: number, width: number, height: number, color: string) {
    drawQueue.push({ x, y, width, height, color });
}

function executeDrawings(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.lineWidth = 10;
        drawQueue.forEach(op => {
            ctx.strokeStyle = op.color;
            ctx.strokeRect(op.x, op.y, op.width, op.height);
        });
        // Clear the queue after drawing
        drawQueue = [];
    }
}

// Global variables to store the current mouse position
let mouseX: number = 0;
let mouseY: number = 0;

// Function to update the global mouse position
function updateMousePosition(event: MouseEvent) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

// Add a single event listener to the window
window.addEventListener('mousemove', updateMousePosition);

window.addEventListener("click", function (e) {
  let mouseCoords = mouseToArtboardSpace(artboards[0]);
  stateMachines[0].pointerDown(mouseCoords.x, mouseCoords.y);
});

// Function to get the current mouse position relative to a canvas
function getMousePosition(canvas: HTMLCanvasElement): { x: number, y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
        x: mouseX - rect.left,
        y: mouseY - rect.top
    };
}

function mouseToArtboardSpace(artboard : Artboard) : {x : number, y : number} {
  let mousePos = getMousePosition(canvas);

  let fwdMatrix = rive.computeAlignment(
    rive.Fit.contain,
    rive.Alignment.bottomCenter,
    {
      minX: 0,
      minY: 0,
      maxX: canvas.width,
      maxY: canvas.height
    },
    artboard.bounds
  );

  let inverseViewMatrix = new rive.Mat2D();

  let x = 0;
  let y = 0;
  // Invert the view matrix in order to go from cursor to artboard space.
  if (fwdMatrix.invert(inverseViewMatrix)) {
    x =
      inverseViewMatrix.xx * mousePos.x +
      inverseViewMatrix.yx * mousePos.y +
      inverseViewMatrix.tx;
    y =
      inverseViewMatrix.xy * mousePos.x +
      inverseViewMatrix.yy * mousePos.y +
      inverseViewMatrix.ty;
  }

  return {x, y};
}

main();