import { Artboard, File } from "@rive-app/webgl-advanced";

import Game from "../Game";
import RiveStateMachineEntity from "../Rive/RiveStateMachineEntity";
import RiveAnimatorEntity from "../Rive/RiveAnimatorEntity";
import RiveEntity from "../Rive/RiveEntity";
import Debug from "../Systems/Debug";
import Input, {KeyCode } from "../Systems/Input";
import Scene from "../Core/Scene";
import ScriptableEntity from "../Core/ScriptableEntity";
import RiveLoader from "../Rive/RiveLoader";
import Tween, { LoopType } from "../Core/Tweens/Tween";
import Vector from "../Utils/Vector";
import { easing } from "../Core/Tweens/Easing";
import { b2Body, b2BodyType, b2FixtureDef } from "@box2d/core";
import Physics from "../Systems/Physics";
//================================ 
// !!HORRIBLE CODE!! !!MOSTLY FOR INTERNAL TESTING!!
// Various Samples showing different parts of the engine at work.
// For now they will mostly be no different than playing a standard .riv files.
// More to come.
//================================

async function main() {
    //Uncomment the sample you want.

    await physicsPlusRive();

    //physicsTest();
    //doubleSceneTest();
    //cityOrCountry();
    //pokeyPokey();
    //turtleScene();
    //bigRivFile();
    //scalingScene();
    //doubleSceneTest();
    //animationBlendingTestScene();
    //eventsTestScene();
    //fashionTestScene();
} 


async function physicsPlusRive() {
    await Game.initiate(1920, 1080);

    console.log("here?");
    let file: File = await RiveLoader.loadFile(new URL("../../rivs/fashion_app.riv", import.meta.url).href);

    const scene = new Scene("FashionTestScene");

    let bodies : b2Body[] = [];

    for (let i = 0; i < 3; i++) {
        let artboard: Artboard = file.artboardByIndex(0);
        let riveEntity: RiveStateMachineEntity = new RiveStateMachineEntity("Fashion", artboard, artboard.stateMachineByIndex(0));
        
        let x = Math.random() * (Game.resolution.x - 100) + 50;
        let y = Math.random() * (Game.resolution.y - 100) + 50;
        
        riveEntity.setPosition(new Vector(x, y));

        let addToPhysics : boolean = true;
        scene.add(riveEntity, addToPhysics); //TODO: Check why this works even if false lol

        riveEntity.addCollider(Physics.getBoxShape(riveEntity.width, riveEntity.height), 1, 0.3, .2);
        riveEntity.position = new Vector(Game.resolution.x / 2, Game.resolution.y / 2);
        riveEntity.physicsBody?.SetTransformXY(Physics.toPhysicsTransform(riveEntity.position).x, Physics.toPhysicsTransform(riveEntity.position).y, 0);
        riveEntity.physicsBody?.ApplyForceToCenter(new Vector(99000, 10000), true);
        riveEntity.physicsBody?.ApplyAngularImpulse(500 * Math.random(), true);
        if (riveEntity.physicsBody) bodies.push(riveEntity.physicsBody);
    }


    Game.addScene(scene); const scriptable = new ScriptableEntity("MouseControl");

    scriptable.setFixedUpdateFunction((fixedDeltaTime: number) => {
        if (Input.isMouseClicked) {
            for (let i = 0; i < bodies.length; i++) {
                let firstBody = bodies[i];
                if (!firstBody) continue;
                let x = Input.gameMouseX;
                let y = Input.gameMouseY;

                let pos = Physics.toPhysicsTransform(new Vector(x, y));

                let currentBodyPos = firstBody.GetPosition();

                let direction = new Vector(pos.x - currentBodyPos.x, pos.y - currentBodyPos.y);

                if (direction.lengthSquared() > 400) continue;

                let strength = 250;

                direction.x *= -strength;
                direction.y *= -strength;

                firstBody.ApplyLinearImpulse(direction, pos, true);
                firstBody.ApplyAngularImpulse(10000, true); 
            }

            return;
        }
        
        /*
        let x = Input.scaledMouseX;
        let y = Input.scaledMouseY;

        let pos = Physics.toPhysicsTransform(new Vector(x, y));

        if (firstBody && Input.isMouseDown) {
        let currentPos = firstBody.GetPosition();

        let direction = new Vector(pos.x - currentPos.x, pos.y - currentPos.y);

        direction.x *= 60;
        direction.y *= 60;
        
        firstBody.SetLinearVelocity(direction);
        firstBody.SetAwake(true);
        }*/
    });

    scene.add(scriptable);


}

async function physicsTest() {

    await Game.initiate(400, 400);

    const scene = new Scene("Box2DTest");
    Game.addScene(scene);
    /*
    TEST CREATE 30 BOXES
    */
    const boxShape = Physics.getBoxShape(50, 50);
    const fixtureDef : b2FixtureDef = {
        shape: boxShape,
        density: 1,
        friction: 0.3,
    };


    // Create 30 random boxes
    for(let i = 0; i < 30; i++) {
        const body = scene.world.CreateBody(Physics.dynamicBodyDef);
        
        // Random position within game resolution
        const x = Math.random() * Game.resolution.x;
        const y = Math.random() * Game.resolution.y;
        
        const physicsPos = Physics.toPhysicsTransform(new Vector(x, y));
        body.SetTransformXY(physicsPos.x, physicsPos.y, 0);
        
        body.CreateFixture(fixtureDef);
    }

    const scriptable = new ScriptableEntity("MouseControl");

    scriptable.setFixedUpdateFunction((fixedDeltaTime: number) => {
            let firstBody = scene.world.GetBodyList();

            let x = Input.gameMouseX;
            let y = Input.gameMouseY;

            let pos = Physics.toPhysicsTransform(new Vector(x, y));

            if (firstBody && Input.isMouseDown) {
            let currentPos = firstBody.GetPosition();

            let direction = new Vector(pos.x - currentPos.x, pos.y - currentPos.y);

            direction.x *= 60;
            direction.y *= 60;
            firstBody.SetLinearVelocity(direction);
            firstBody.SetAwake(true);
        }
    });

    scene.add(scriptable);
}

/**
 *  Simple test scene showing that by pressing "1" you can toggle different scenes with their own states and updates.
 */
async function doubleSceneTest() {
    await Game.initiate(1600, 1200);
    
    const file: File = await RiveLoader.loadFile(new URL("../../rivs/angry_turtle.riv", import.meta.url).href);

    const ro1: RiveStateMachineEntity = new RiveStateMachineEntity("Turtle1", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));
    const ro2: RiveStateMachineEntity = new RiveStateMachineEntity("Turtle2", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));
    
    const scene1 = new Scene("Turtle1");
    scene1.add(ro1);
    Game.addScene(scene1);

    const scene2 = new Scene("Turtle2");
    scene2.add(ro2);
    scene2.enabled = false;
    Game.addScene(scene2);

    window.addEventListener('keydown', (event) => {
        if (event.key === '1') {
            scene1.enabled = !scene1.enabled;
            scene2.enabled = !scene2.enabled;
        }
    });
}

/**
 * Simple test scene showing using the Input class to control a Rive state machine.
 */
async function cityOrCountry() {
    await Game.initiate(960, 456);

    const file: File = await RiveLoader.loadFile(new URL("../../rivs/cityorcountry.riv", import.meta.url).href);

    const scene = new Scene("CityOrCountry");
    let riveEntity: RiveStateMachineEntity = new RiveStateMachineEntity("CityOrCountry", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));
    scene.add(riveEntity);
    Game.addScene(scene);

    RiveLoader.logUnpackedRiveFile(file);

    const inputHandler = new ScriptableEntity("CityOrCountryInputs");
    inputHandler.setScriptFunction(() => {
        //isClickedR fire
        //isHovered R bool
        //isClicked L fire
        //isHovered L bool
        if (Input.isKeyDown(KeyCode.A)) riveEntity.inputs[1].smiInput.asBool().value = !(riveEntity.inputs[1].smiInput.asBool().value as boolean);
        if (Input.isKeyDown(KeyCode.S)) riveEntity.inputs[3].smiInput.asBool().value = !(riveEntity.inputs[1].smiInput.asBool().value as boolean);
        if (Input.isKeyDown(KeyCode.D)) riveEntity.inputs[0].smiInput.asTrigger().fire();
        if (Input.isKeyDown(KeyCode.F)) riveEntity.inputs[2].smiInput.asTrigger().fire();
    });
    scene.add(inputHandler);
}

/**
 * Just Running a standard .riv file.
 * I run it to see if everything still works.
 */
async function pokeyPokey() {
    await Game.initiate(1080, 1350);

    let file: File = await RiveLoader.loadFile(new URL("../../rivs/pokey_pokey.riv", import.meta.url).href);

    const scene = new Scene("PokeyPokey");
    scene.add(new RiveStateMachineEntity("PokeyPokey", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0)));
    Game.addScene(scene);

    RiveLoader.logUnpackedRiveFile(file);
}

/**
 * Just Running a standard .riv file.
 * I run it to see if everything still works.
 */
async function turtleScene(skipGameInitialization: boolean = false) {
    if (!skipGameInitialization) await Game.initiate(1600, 1200);

    console.log(new URL("../../rivs/angry_turtle.riv", import.meta.url).href);
    let file: File = await RiveLoader.loadFile(new URL("../../rivs/angry_turtle.riv", import.meta.url).href);

    let riveEntity: RiveStateMachineEntity = new RiveStateMachineEntity("Turtle", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));

    const scene = new Scene("Turtle");
    scene.add(riveEntity);
    Game.addScene(scene);

    const crosshairToggler = new ScriptableEntity("CrosshairToggler");
    crosshairToggler.setScriptFunction((deltaTime: number) => {
        if (Input.isKeyDown(KeyCode.C)) {
            Debug.toggleCrosshair();
        }
    });
    scene.add(crosshairToggler);
}

/**
 * Just Running a standard .riv file.
 * I run it to see if everything still works.
 */
async function bigRivFile() {
    await Game.initiate(1280, 720);

    let file: File = await RiveLoader.loadFile(new URL("../../rivs/shroom_gloom_game.riv", import.meta.url).href);

    let riveEntity: RiveStateMachineEntity = new RiveStateMachineEntity("ShroomGloom", file.artboardByIndex(0), file.artboardByIndex(0).stateMachineByIndex(0));
   
    const scene = new Scene("BigRivFile");
    scene.add(riveEntity);
    Game.addScene(scene);
}

/**
 * Simple scene to test whether browser scaling and dynamic positioning works
 */ 
async function scalingScene() {

    await Game.initiate(400, 400);

    let file: File = await RiveLoader.loadFile(new URL("../../rivs/scaling-test.riv", import.meta.url).href);

    const scene = new Scene("ScalingScene");
    const riveEntity = new RiveEntity("ScalingTest", file.artboardByIndex(2));       
    scene.add(riveEntity);
    Game.addScene(scene);

    return;

    /*
    //tween example:
    const tween = new Tween(riveEntity.position)
    .to(new Vec2D(100, 100), 2500)
    .easing(Easing.Bounce.InOut)
    .start();

    const tweenUpdater = new ScriptableEntity("TweenUpdater");
    tweenUpdater.setUpdateFunction((deltaTime: number, time: number) => {
        tween.update(time);
    });
    scene.Add(tweenUpdater);
    */
}

/**
 * Simple test showing Tweens in action
 */
async function basketBallTestScene(skipGameInitialization: boolean = false) {
    if (!skipGameInitialization) await Game.initiate(1280, 720);

    console.log(new URL("../../rivs/basketball.riv", import.meta.url).href);

    let basket: File = await RiveLoader.loadFile(new URL("../../rivs/basketball.riv", import.meta.url).href);
    let basketRiveEntity: RiveAnimatorEntity = new RiveAnimatorEntity("Basketball", basket.artboardByIndex(0));
    basketRiveEntity.add(basketRiveEntity.artboard.animationByIndex(0));

    basketRiveEntity.position.x = Game.resolution.x * .5 - basketRiveEntity.width * .5;
    basketRiveEntity.position.y = Game.resolution.y * .5 - basketRiveEntity.height * .5;

    const scene = new Scene("BasketBallTestScene");
    scene.add(basketRiveEntity);
    Game.addScene(scene);

    //testing tweens:
    let tween: Tween<Vector> = Tween.toProperty(
        (value: Vector) => basketRiveEntity.position = value,
        () => basketRiveEntity.position,
        new Vector(200, 100),
        .5
    )
        .auto(false)
        .easing(easing.outCubic)
        .setLoops(-1)
        .setLoopType(LoopType.Restart)
        .onUpdate((value: Vector) => {
            //console.log(basketRiveEntity.position);
        });

    scene.add(tween);

    let scriptable: ScriptableEntity = new ScriptableEntity("TweenUpdater");
    scriptable.setScriptFunction((deltaTime: number) => {
        if (Input.isKeyDown(KeyCode.Space)) {
            if (!tween.isPlaying) tween.play();
            else tween.reset();
        }
    });
    scene.add(scriptable);
}

/**
 * Simple scene showing direct control over animation blends.
 */
async function animationBlendingTestScene() {
    await Game.initiate(1280, 720);

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

    let character: File = await RiveLoader.loadFile(new URL("../../rivs/walk_cycle.riv", import.meta.url).href);
    let characterRive: RiveAnimatorEntity = new RiveAnimatorEntity("WalkCycle", character.artboardByIndex(0));

    characterRive.position.x = Game.resolution.x * .5 - characterRive.width * .5;
    characterRive.position.y = Game.resolution.y * .5 - characterRive.height * .5;

    //characterRive.addByName("Walk");
    //characterRive.addByName("Stop");

    console.log(`Added: ${characterRive.addByName("Walk")}`);
    console.log(`Added: ${characterRive.addByName("Stop")}`);

    const scene = new Scene("AnimationBlendingTestScene");
    scene.add(characterRive);
    Game.addScene(scene);

    const slider1 = document.getElementById('slider1') as HTMLInputElement;
    const slider2 = document.getElementById('slider2') as HTMLInputElement; 

    const weightUpdater = new ScriptableEntity("WeightUpdater");
    weightUpdater.setScriptFunction(() => {
        const weight1 = parseFloat(slider1.value);
        const weight2 = parseFloat(slider2.value);

        characterRive.setWeight("Stop", weight1);
        characterRive.setWeight("Walk", weight2);
    });
    scene.add(weightUpdater);
}

/**
 * Simple scene showing how to capture Rive Events.
 */
async function eventsTestScene() {
    await Game.initiate(1000, 1000);

    let events: File = await RiveLoader.loadFile(new URL("../../rivs/events-test.riv", import.meta.url).href);
    
    let artboard: Artboard = events.artboardByIndex(0);

    let riveEntity: RiveStateMachineEntity = new RiveStateMachineEntity("EventsTest", artboard, artboard.stateMachineByIndex(0));

    riveEntity.position.x = Game.resolution.x * .5 - riveEntity.width * .5;
    riveEntity.position.y = Game.resolution.y * .5 - riveEntity.height * .5;

    const scene = new Scene("EventsTestScene");
    scene.add(riveEntity);
    Game.addScene(scene);

    Game.timeScale = .1;

    riveEntity.addRiveEventListener((event) => {
        console.log(event.name);
        console.log(event?.properties);
    });
}

/**
 * Simple scene I use to test performance. TODO: Implement batch rendering!
 */
async function fashionTestScene() {
    await Game.initiate(1280, 720);

    let file: File = await RiveLoader.loadFile(new URL("../../rivs/fashion_app.riv", import.meta.url).href);

    let artboard: Artboard = file.artboardByIndex(0);
    let riveEntity: RiveStateMachineEntity = new RiveStateMachineEntity("Fashion", artboard, artboard.stateMachineByIndex(0));

    const scene = new Scene("FashionTestScene");
    scene.add(riveEntity);
    Game.addScene(scene);

    for (let i = 0; i < 8; i++) {
        let x = i % 8;
        let y = Math.floor(i / 8);

        artboard = file.artboardByIndex(0);
        riveEntity = new RiveStateMachineEntity("Fashion" + i, artboard, artboard.stateMachineByIndex(0));

        riveEntity.position.x = x * 250;
        riveEntity.position.y = y * 400;
        scene.add(riveEntity);

        continue;

        //rotation test
        if (i == 1) {
            riveEntity.position.x += 100;
            riveEntity.position.y += 200;
            riveEntity.artboard.transformComponent("Root").rotation = 1;
        }

        if (i == 0) {
            riveEntity.position.x += 200;
            riveEntity.position.y += 200;
            const rotator = new ScriptableEntity("Rotator");
            rotator.setScriptFunction((deltaTime: number) => {
                riveEntity.artboard.transformComponent("Root").rotation += deltaTime;
            });
            scene.add(rotator);
        }
    }
}

main();