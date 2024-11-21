import { Game } from "./Game";
import { RiveSMRenderer } from "./Rive/RiveStateMachine";
import { Artboard, File } from "@rive-app/canvas-advanced";
import { RiveAnimatorRenderer } from "./Rive/RiveAnimator";
import RiveGameObject from "./Rive/RiveGameObject";
import { Vec2D } from "./Utils/Vec2D";
import { Debug } from "./Systems/Debug";
import { Input, KeyCode } from "./Systems/Input";
import { FPSChart } from "./WIP/FPSChart";
import Scene from "./Scene";

async function main()
{
    Game.PreLoop.push((deltaTime : number) => {
        if (Input.IsKeyDown(KeyCode.C))
        {
            Debug.ToggleCrosshair();
        }
    });

   doubleSceneTest();
} 

async function doubleSceneTest() {
    await Game.Initiate(1600, 1200);
    
    const file : File = await Game.LoadFile(new URL("../rivs/angry_turtle.riv", import.meta.url).href);

    const ro1 : RiveSMRenderer = new RiveSMRenderer("Turtle1", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));
    const ro2 : RiveSMRenderer = new RiveSMRenderer("Turtle2", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));
    
    const scene1 = new Scene("Turtle1");
    scene1.Add(ro1);
    Game.AddScene(scene1, true);

    const scene2 = new Scene("Turtle2");
    scene2.Add(ro2);
    Game.AddScene(scene2, true);

    window.addEventListener('keydown', (event) => {
        if (event.key === '1') Game.SetCurrentScene("Turtle1");
        if (event.key === '2') Game.SetCurrentScene("Turtle2");
    });
}
//SUPER LOW FRAMERATE. Probaly lots of nested artboards
async function CityOrCountry() {
    await Game.Initiate(960, 456);

    const file : File = await Game.LoadFile(new URL("../rivs/cityorcountry.riv", import.meta.url).href);

    const scene = new Scene("CityOrCountry");
    let ro : RiveSMRenderer = new RiveSMRenderer("CityOrCountry", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));
    scene.Add(ro);
    Game.AddScene(scene);

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

    console.log(new URL("../rivs/eni_pitch_step_3.riv", import.meta.url).href);
    let file : File = await Game.LoadFile(new URL("../rivs/eni_pitch_step_3.riv", import.meta.url).href);

    const scene = new Scene("ENI_Step3");
    scene.Add(new RiveSMRenderer("ENI_Step3", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0)));
    Game.AddScene(scene);
}

async function pokeypokey() {
    await Game.Initiate(1080, 1350);

    let file : File = await Game.LoadFile(new URL("../rivs/pokey_pokey.riv", import.meta.url).href);

    const scene = new Scene("PokeyPokey");
    scene.Add(new RiveSMRenderer("PokeyPokey", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0)));
    Game.AddScene(scene);

    Debug.LogUnpackedRiveFile(file);
}

async function turtleScene(skipGameInitialization: boolean = false) {
    if (!skipGameInitialization) await Game.Initiate(1600, 1200);

    console.log(new URL("../rivs/angry_turtle.riv", import.meta.url).href);
    let file : File = await Game.LoadFile(new URL("../rivs/angry_turtle.riv", import.meta.url).href);

    let ro : RiveSMRenderer = new RiveSMRenderer("Turtle", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));

    const scene = new Scene("Turtle");
    scene.Add(ro);
    Game.AddScene(scene, true);
}

async function bigRivFile () {
    await Game.Initiate(1280, 720);

    let file : File = await Game.LoadFile(new URL("../rivs/shroom_gloom_game.riv", import.meta.url).href);

    let ro : RiveSMRenderer = new RiveSMRenderer("ShroomGloom", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));
   
    const scene = new Scene("BigRivFile");
    scene.Add(ro);
    Game.AddScene(scene);
}

async function scalingScene() {

    await Game.Initiate(400, 400);

    let file : File = await Game.LoadFile(new URL("../rivs/scaling-test.riv", import.meta.url).href);

    const scene = new Scene("ScalingScene");
    const ro = new RiveGameObject("ScalingTest", file.artboardByIndex(2));       
    scene.Add(ro);
    Game.AddScene(scene, true);

    return;

    /*
    //tween example:
    const tween = new Tween(ro.position)
    .to(new Vec2D(100, 100), 2500)
    .easing(Easing.Bounce.InOut)
    .start();

    Game.PreLoop.push((deltaTime : number, time:number)=> {
        tween.update(time);
    })
    */
}

async function basketBallTestScene(skipGameInitialization: boolean = false){
    if (!skipGameInitialization) await Game.Initiate(1280, 720);

    let basket : File = await Game.LoadFile(new URL("../rivs/basketball.riv", import.meta.url).href);
    let basketRiveObject : RiveAnimatorRenderer = new RiveAnimatorRenderer("Basketball", basket.artboardByIndex(0));
    basketRiveObject.add(basketRiveObject.artboard.animationByIndex(0));

    basketRiveObject.position.x = Game.TargetResolution.x * .5 - basketRiveObject.width * .5;
    basketRiveObject.position.y = Game.TargetResolution.y * .5 - basketRiveObject.height * .5;

    const scene = new Scene("BasketBallTestScene");
    scene.Add(basketRiveObject);
    Game.AddScene(scene);
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

    let character : File = await Game.LoadFile(new URL("../rivs/walk_cycle.riv", import.meta.url).href);
    let characterRive : RiveAnimatorRenderer = new RiveAnimatorRenderer("WalkCycle", character.artboardByIndex(0));

    characterRive.position.x = Game.TargetResolution.x * .5 - characterRive.width * .5;
    characterRive.position.y = Game.TargetResolution.y * .5 - characterRive.height * .5;

    //characterRive.addByName("Walk");
    //characterRive.addByName("Stop");

    console.log(`Added: ${characterRive.addByName("Walk")}`);
    console.log(`Added: ${characterRive.addByName("Stop")}`);

    const scene = new Scene("AnimationBlendingTestScene");
    scene.Add(characterRive);
    Game.AddScene(scene);

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

    let events : File = await Game.LoadFile(new URL("../rivs/events-test.riv", import.meta.url).href);
    
    let artboard : Artboard = events.artboardByIndex(0);

    let riveObject : RiveSMRenderer = new RiveSMRenderer("EventsTest", artboard, artboard.stateMachineByIndex(0));

    riveObject.position.x = Game.Canvas.width * .5 - riveObject.width * .5;
    riveObject.position.y = Game.Canvas.height * .5 - riveObject.height * .5;

    const scene = new Scene("EventsTestScene");
    scene.Add(riveObject);
    Game.AddScene(scene);

    Game.TimeScale = .1;

    riveObject.addRiveEventListener((event) => {
        console.log(event.name);
        console.log(event?.properties);
    });
}

async function fashionTestScene() {
    await Game.Initiate(1280, 720);

    let file : File = await Game.LoadFile(new URL("../rivs/fashion_app.riv", import.meta.url).href);

    let artboard : Artboard = file.artboardByIndex(0);
    let ro : RiveSMRenderer = new RiveSMRenderer("Fashion", artboard, artboard.stateMachineByIndex(0));

    const scene = new Scene("FashionTestScene");
    scene.Add(ro);
    Game.AddScene(scene);

    for (let i = 0; i < 1; i++)
    {
        let x = i % 8;
        let y = Math.floor(i / 8);

        artboard = file.artboardByIndex(0);
        ro = new RiveSMRenderer("Fashion" + i, artboard, artboard.stateMachineByIndex(0));

        ro.position.x = x * 250;
        ro.position.y =  y * 400;
        scene.Add(ro);

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