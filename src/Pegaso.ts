import { Game } from "./Game";
import { RiveSMRenderer } from "./RiveStateMachine";
import { Artboard, File } from "@rive-app/canvas-advanced";
import { RiveAnimatorRenderer } from "./RiveAnimator";
import RiveRenderer from "./RiveRenderer";


//Todo:
//Proper scaling logic for objects, canvas, game.
//Pointer down, up, move, events.
//better logic for sm like animator?
async function main()
{
    await Game.Initiate();

    
} 


async function basketBallTestScene(){
    let basket : File = await Game.LoadFile("test/basketball.riv");
    let basketRiveObject : RiveAnimatorRenderer = new RiveAnimatorRenderer(basket.artboardByIndex(0));
    basketRiveObject.add(basketRiveObject.artboard.animationByIndex(0));
    Game.Add(basketRiveObject);
}

async function animationBlendingTestScene() {
    let html = ` 
    <style>
         #slider-container {
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 1000;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            font-family: sans-serif;
            font-size: 12px;
        }
        #slider-container label {
            display: block;
            margin-bottom: 5px;
        }
        #slider-container input {
            width: 200px;
        }
    </style>
    <div id="slider-container">
        <label for="slider1">Stop:</label>
        <input type="range" id="slider1" min="0" max="1" step="0.01" value="0.0">
        <label for="slider2">Walk:</label>
        <input type="range" id="slider2" min="0" max="1" step="0.01" value="1.0">
    </div>`;

    // Create a new div element
    const newDiv = document.createElement('div');

    // Set the innerHTML of the new div to our HTML string
    newDiv.innerHTML = html;

    // Append the new div to the body
    document.body.appendChild(newDiv);

    let character : File = await Game.LoadFile("test/walk_cycle.riv");
    let characterRive : RiveAnimatorRenderer = new RiveAnimatorRenderer(character.artboardByIndex(0));

    //characterRive.addByName("Walk");
    //characterRive.addByName("Stop");

    console.log(`Added: ${characterRive.addByName("Walk")}`);
    console.log(`Added: ${characterRive.addByName("Stop")}`);

    Game.Add(characterRive);

    const slider1 = document.getElementById('slider1') as HTMLInputElement;
    const slider2 = document.getElementById('slider2') as HTMLInputElement; 

    Game.PreLoop.push(() => {
        const weight1 = parseFloat(slider1.value);
        const weight2 = parseFloat(slider2.value);

        characterRive.setWeight("Stop", weight1);
        characterRive.setWeight("Walk", weight2);
    });
}

async function eventsTestScene() {
    let events : File = await Game.LoadFile("test/events.riv");
    
    let artboard : Artboard = events.artboardByIndex(0);

    let riveObject : RiveSMRenderer = new RiveSMRenderer(artboard, artboard.stateMachineByIndex(0));

    Game.Add(riveObject);

    Game.TimeScale = .1;

    riveObject.addRiveEventListener((event) => {
        console.log(event.name);
        console.log(event?.properties);
    });
}


main();
