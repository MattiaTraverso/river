import Game from "../Game";
import Vector from "../Utils/Vector";
import { b2BodyDef, b2BodyType, b2PolygonShape, b2World, b2StepConfig, b2Vec2, b2FixtureDef, b2Body } from "@box2d/core";

export default class Physics {
    //================================
    //========== SETTINGS ===========
    //================================

    static readonly VELOCITY_ITERATIONS = 6;
    static readonly POSITION_ITERATIONS = 2;
    static readonly PIXELS_PER_METER = 30;

    static readonly Gravity = new Vector(0, 9.81);

    static getWorld(): b2World {
        if (!Game.isInitiated) throw new Error("Game not initialized");

        const world = b2World.Create(Physics.Gravity);

        const bottomWallShape = Physics.getBoxShape(Game.targetRes.x, 10);
        const topWallShape = Physics.getBoxShape(Game.targetRes.x, 10);
        const leftWallShape = Physics.getBoxShape(10, Game.targetRes.y);
        const rightWallShape = Physics.getBoxShape(10, Game.targetRes.y);

        const bottomWallBody = world.CreateBody(Physics.staticBodyDef);
        const topWallBody = world.CreateBody(Physics.staticBodyDef);
        const leftWallBody = world.CreateBody(Physics.staticBodyDef);
        const rightWallBody = world.CreateBody(Physics.staticBodyDef);

        bottomWallBody.CreateFixture({ shape: bottomWallShape , density: 0, friction: 0.3 });
        topWallBody.CreateFixture({ shape: topWallShape , density: 0, friction: 0.3 });
        leftWallBody.CreateFixture({ shape: leftWallShape , density: 0, friction: 0.3 });
        rightWallBody.CreateFixture({ shape: rightWallShape , density: 0, friction: 0.3 });    

        const bottomPos = Physics.toPhysicsTransform(new Vector(Game.targetRes.x / 2, Game.targetRes.y));
        bottomWallBody.SetTransformXY(bottomPos.x, bottomPos.y, 0);

        const topPos = Physics.toPhysicsTransform(new Vector(Game.targetRes.x / 2, 0));
        topWallBody.SetTransformXY(topPos.x, topPos.y, 0);

        const leftPos = Physics.toPhysicsTransform(new Vector(0, Game.targetRes.y / 2));
        leftWallBody.SetTransformXY(leftPos.x, leftPos.y, 0);

        const rightPos = Physics.toPhysicsTransform(new Vector(Game.targetRes.x, Game.targetRes.y / 2));
        rightWallBody.SetTransformXY(rightPos.x, rightPos.y, 0);

        return world;
    }

    //================================
    //========== CONVERSIONS =========
    //================================

    private static pixelToPhysicsScale(n : number) : number {
        return n / Physics.PIXELS_PER_METER;
    }

    private static physicsToPixelScale(n : number) : number {
        return n * Physics.PIXELS_PER_METER;
    }

    static toPhysicsTransform(v : Vector) : b2Vec2 {
        let x = Physics.pixelToPhysicsScale(v.x);

        // Box2D uses a different coordinate system
        let y = v.y; // Game.targetRes.y - v.y;
        
        y = Physics.pixelToPhysicsScale(v.y);
        
        return new b2Vec2(x, y);
    }

    static toPixelTransform(v : b2Vec2) : Vector {
        let x = Physics.physicsToPixelScale(v.x);

        let y = Physics.physicsToPixelScale(v.y);
        //y = Game.targetRes.y - y;

        return new Vector(x, y);
    }

    //================================
    //========== UTILS =============
    //================================

    static readonly stepConfig: b2StepConfig = {
        velocityIterations: Physics.VELOCITY_ITERATIONS,
        positionIterations: Physics.POSITION_ITERATIONS,
    };

    static get staticBodyDef(): b2BodyDef {
        return {
            type: b2BodyType.b2_staticBody
        };
    }

    static get dynamicBodyDef(): b2BodyDef {
        return {
            type: b2BodyType.b2_dynamicBody
        };
    }

    static get kinematicBodyDef(): b2BodyDef {
        return {
            type: b2BodyType.b2_kinematicBody
        };
    }


    //================================
    //========== COLLIDERS ===============
    //================================

    static readonly BOX_SIZE = 1;

    static getBoxShape(width: number = Physics.BOX_SIZE, height: number = Physics.BOX_SIZE): b2PolygonShape {
        if (!Game.isInitiated) throw new Error("Game not initialized");

        return new b2PolygonShape().SetAsBox(
            Physics.pixelToPhysicsScale(width) / 2,
            Physics.pixelToPhysicsScale(height) / 2
    );
}
}

export interface PhysicsState {
    position: Vector;
    rotation: number;
    previousPosition?: Vector;
    previousRotation?: number;
}