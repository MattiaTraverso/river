import Game from "../Game";
import Vector from "../Utils/Vector";

export enum PositionMode {
    Coordinates,
    Percentage
}

export default class Position {
    private mode: PositionMode;
    private rawX: number;
    private rawY: number;

    constructor(x: number = 0, y: number = 0, mode: PositionMode = PositionMode.Coordinates) {
        this.mode = mode;
        if (mode === PositionMode.Percentage) {
            if (x < 0 || x > 100 || y < 0 || y > 100) {
                throw new Error("Percentage values must be between 0 and 100");
            }
        }
        this.rawX = x;
        this.rawY = y;
    }

    // Getters still dynamically calculate for percentage mode
    get x(): number {
        if (this.mode === PositionMode.Coordinates) {
            return this.rawX;
        } else {
            return (this.rawX / 100) * Game.targetRes.x;
        }
    }

    get y(): number {
        if (this.mode === PositionMode.Coordinates) {
            return this.rawY;
        } else {
            return (this.rawY / 100) * Game.targetRes.y;
        }
    }

    // Explicit setters for raw coordinates
    public setRawX(value: number): void {
        if (this.mode !== PositionMode.Coordinates) {
            throw new Error("Cannot set raw coordinates when in percentage mode");
        }
        this.rawX = value;
    }

    public setRawY(value: number): void {
        if (this.mode !== PositionMode.Coordinates) {
            throw new Error("Cannot set raw coordinates when in percentage mode");
        }
        this.rawY = value;
    }

    public setRaw(x: number, y: number): void {
        if (this.mode !== PositionMode.Coordinates) {
            throw new Error("Cannot set raw coordinates when in percentage mode");
        }
        this.rawX = x;
        this.rawY = y;
    }

    // Explicit setters for percentages
    public setPercentageX(percent: number): void {
        if (this.mode !== PositionMode.Percentage) {
            throw new Error("Cannot set percentages when in coordinate mode");
        }
        if (percent < 0 || percent > 100) {
            throw new Error("Percentage must be between 0 and 100");
        }
        this.rawX = percent;
    }

    public setPercentageY(percent: number): void {
        if (this.mode !== PositionMode.Percentage) {
            throw new Error("Cannot set percentages when in coordinate mode");
        }
        if (percent < 0 || percent > 100) {
            throw new Error("Percentage must be between 0 and 100");
        }
        this.rawY = percent;
    }

    public setPercentage(xPercent: number, yPercent: number): void {
        if (this.mode !== PositionMode.Percentage) {
            throw new Error("Cannot set percentages when in coordinate mode");
        }
        if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) {
            throw new Error("Percentages must be between 0 and 100");
        }
        this.rawX = xPercent;
        this.rawY = yPercent;
    }

    public setMode(mode: PositionMode): void {
        if (this.mode === mode) return;
        
        if (mode === PositionMode.Percentage) {
            const newX = (this.rawX / Game.targetRes.x) * 100;
            const newY = (this.rawY / Game.targetRes.y) * 100;
            if (newX < 0 || newX > 100 || newY < 0 || newY > 100) {
                throw new Error("Converting to percentage would result in values outside 0-100 range");
            }
            this.rawX = newX;
            this.rawY = newY;
        } else {
            this.rawX = (this.rawX / 100) * Game.targetRes.x;
            this.rawY = (this.rawY / 100) * Game.targetRes.y;
        }
        this.mode = mode;
    }

    public getMode(): PositionMode {
        return this.mode;
    }

    // Convert to Vec2D (will give actual coordinates regardless of mode)
    public toVec2D(): Vector {
        return new Vector(this.x, this.y);
    }

    // Static creation methods
    public static fromVec2D(vec: Vector, mode: PositionMode = PositionMode.Coordinates): Position {
        return new Position(vec.x, vec.y, mode);
    }

    public static fromPercentages(xPercent: number, yPercent: number): Position {
        return new Position(xPercent, yPercent, PositionMode.Percentage);
    }

    public static fromCoordinates(x: number, y: number): Position {
        return new Position(x, y, PositionMode.Coordinates);
    }
}