export default class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Basic operations
    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    multiply(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number): Vector {
        if (scalar === 0) throw new Error("Division by zero");
        return new Vector(this.x / scalar, this.y / scalar);
    }

    // Vector products
    dot(other: Vector): number {
        return this.x * other.x + this.y * other.y;
    }

    // 2D cross product returns a scalar representing the z component
    cross(other: Vector): number {
        return this.x * other.y - this.y * other.x;
    }

    // Vector operations
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lengthSquared(): number {  // Faster than length when just comparing distances
        return this.x * this.x + this.y * this.y;
    }

    normalize(): Vector {
        const len = this.length();
        if (len === 0) throw new Error("Cannot normalize zero vector");
        return this.divide(len);
    }

    // Returns angle between vectors in radians
    angleTo(other: Vector): number {
        return Math.acos(
            Math.min(1, Math.max(-1, this.dot(other) / (this.length() * other.length())))
        );
    }

    // Rotation
    rotate(angle: number, origin?: Vector): Vector {
        if (!origin) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return new Vector(
                this.x * cos - this.y * sin,
                this.x * sin + this.y * cos
            );
        }

        const translated = new Vector(this.x - origin.x, this.y - origin.y);
        const rotated = translated.rotate(angle);
        return new Vector(rotated.x + origin.x, rotated.y + origin.y);
    }

    // Swizzle operations
    get xx(): Vector {
        return new Vector(this.x, this.x);
    }

    get xy(): Vector {
        return new Vector(this.x, this.y);
    }

    get yx(): Vector {
        return new Vector(this.y, this.x);
    }

    get yy(): Vector {
        return new Vector(this.y, this.y);
    }

    // Utility methods
    distanceTo(other: Vector): number {
        return this.subtract(other).length();
    }

    distanceToSquared(other: Vector): number {  // Faster than distanceTo
        return this.subtract(other).lengthSquared();
    }

    // Returns perpendicular vector (rotated 90 degrees counterclockwise)
    perpendicular(): Vector {
        return new Vector(-this.y, this.x);
    }

    // Projects this vector onto other vector
    projectOnto(other: Vector): Vector {
        const dot = this.dot(other);
        const otherLengthSq = other.lengthSquared();
        if (otherLengthSq === 0) throw new Error("Cannot project onto zero vector");
        return other.multiply(dot / otherLengthSq);
    }

    // Static utility methods
    static degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    static radiansToDegrees(radians: number): number {
        return radians * (180 / Math.PI);
    }
}