import { Game } from "./Game";
import { RiveSMRenderer } from "./RiveStateMachine";
import { Artboard, File } from "@rive-app/canvas-advanced";
import { RiveAnimatorRenderer } from "./RiveAnimator";
import RiveRenderer from "./RiveRenderer";
import { Vec2D } from "./Vec2D";
import {Tween, Easing} from "@tweenjs/tween.js";
import { Debug } from "./Debug";
import { Input, KeyCode } from "./Input";
import { FPSChart } from "../FPSChart";


async function main()
{
    Game.PreLoop.push((deltaTime : number) => {
        if (Input.IsKeyDown(KeyCode.C))
        {
            Debug.ToggleCrosshair();
        }
    });

    CityOrCountry(); 
} 

//SUPER LOW FRAMERATE. Probaly lots of nested artboards
async function CityOrCountry() {
    await Game.Initiate(960, 456);

    let file : File = await Game.LoadFile("cityorcountry.riv");

    let ro : RiveSMRenderer = Game.Add(new RiveSMRenderer(file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0))) as RiveSMRenderer;

    Debug.LogUnpackedRiveFile(file);

    Game.PreLoop.push(() => {
        //isClickedR fire
        //isHovered R bool
        //isClicked L fire
        //isHovered L bool
        if (Input.IsKeyDown(KeyCode.A)) ro.inputs[1].smiInput.asBool().value = !(ro.inputs[1].smiInput.asBool().value as boolean) ;
        if (Input.IsKeyDown(KeyCode.S)) ro.inputs[3].smiInput.asBool().value = !(ro.inputs[1].smiInput.asBool().value as boolean) ;
        if (Input.IsKeyDown(KeyCode.D)) ro.inputs[0].smiInput.asTrigger().fire();
        if (Input.IsKeyDown(KeyCode.F)) ro.inputs[2].smiInput.asTrigger().fire();


    })
    
}

//SUPER LOW FRAMERATE. Probaly lots of nested artboards
async function ENI_Step3() {
    await Game.Initiate(500, 500);

    let file : File = await Game.LoadFile("eni_pitch_step_3.riv");

    Game.Add(new RiveSMRenderer(file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0)));
}

async function pokeypokey() {
    await Game.Initiate(1080, 1350);

    let file : File = await Game.LoadFile("test/pokey_pokey.riv");

    Game.Add(new RiveSMRenderer(file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0)));

    Debug.LogUnpackedRiveFile(file);
}

async function turtleScene() {
    await Game.Initiate(1600, 1200);

    let file : File = await Game.LoadFile("test/angry_turtle.riv");

    let ro : RiveSMRenderer = new RiveSMRenderer(file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));

    Game.Add(ro);
}

async function bigRivFile () {
    await Game.Initiate(1280, 720);

    let file : File = await Game.LoadFile("test/shroom_gloom_game.riv");

    let ro : RiveSMRenderer = new RiveSMRenderer(file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));
   
    Game.Add(ro);
}

async function scalingScene() {

    await Game.Initiate(400, 400);

    let file : File = await Game.LoadFile("test/scaling.riv");

    let ro = Game.Add(new RiveRenderer(file.artboardByIndex(2)));

    return;

    //tween example:
    const tween = new Tween(ro.position)
    .to(new Vec2D(100, 100), 2500)
    .easing(Easing.Bounce.InOut)
    .start();

    Game.PreLoop.push((deltaTime : number, time:number)=> {
        tween.update(time);
    })
}

async function basketBallTestScene(){
    await Game.Initiate(1280, 720);

    let basket : File = await Game.LoadFile("test/basketball.riv");
    let basketRiveObject : RiveAnimatorRenderer = new RiveAnimatorRenderer(basket.artboardByIndex(0));
    basketRiveObject.add(basketRiveObject.artboard.animationByIndex(0));

    basketRiveObject.position.x = Game.TargetResolution.x * .5 - basketRiveObject.width * .5;
    basketRiveObject.position.y = Game.TargetResolution.y * .5 - basketRiveObject.height * .5;

    Game.Add(basketRiveObject);
}

async function animationBlendingTestScene() {
    await Game.Initiate(1280, 720);

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

    characterRive.position.x = Game.TargetResolution.x * .5 - characterRive.width * .5;
    characterRive.position.y = Game.TargetResolution.y * .5 - characterRive.height * .5;

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

//TODO: Check why this isn't centered
async function eventsTestScene() {
    await Game.Initiate(1000, 1000);

    let events : File = await Game.LoadFile("test/events.riv");
    
    let artboard : Artboard = events.artboardByIndex(0);

    let riveObject : RiveSMRenderer = new RiveSMRenderer(artboard, artboard.stateMachineByIndex(0));

    riveObject.position.x = Game.Canvas.width * .5 - riveObject.width * .5;
    riveObject.position.y = Game.Canvas.height * .5 - riveObject.height * .5;

    Game.Add(riveObject);

    Game.TimeScale = .1;

    riveObject.addRiveEventListener((event) => {
        console.log(event.name);
        console.log(event?.properties);
    });
}

async function fashionTestScene() {
    await Game.Initiate(1280, 720);

    let file : File = await Game.LoadFile("test/fashion_app.riv");

    let artboard : Artboard = file.artboardByIndex(0);
    let ro : RiveSMRenderer = new RiveSMRenderer(artboard, artboard.stateMachineByIndex(0));

    for (let i = 0; i < 1; i++)
    {
        let x = i % 8;
        let y = Math.floor(i / 8);

        artboard = file.artboardByIndex(0);
        ro = new RiveSMRenderer(artboard, artboard.stateMachineByIndex(0));

        ro.position.x = x * 250;
        ro.position.y =  y * 400;
        Game.Add(ro);

        continue;

        //rotation test
        if (i == 1)
        {
            ro.position.x += 100;
            ro.position.y += 200;
            ro.artboard.transformComponent("Root").rotation = 1;
        }

        if (i == 0)
        {
            ro.position.x += 200;
            ro.position.y += 200;
            Game.PreLoop.push((deltaTime : number) => {
                ro.artboard.transformComponent("Root").rotation += deltaTime;
            });
            
        }
    }

   
}

main();