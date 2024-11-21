export class Vec2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Basic operations
    add(other: Vec2D): Vec2D {
        return new Vec2D(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vec2D): Vec2D {
        return new Vec2D(this.x - other.x, this.y - other.y);
    }

    multiply(scalar: number): Vec2D {
        return new Vec2D(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number): Vec2D {
        if (scalar === 0) throw new Error("Division by zero");
        return new Vec2D(this.x / scalar, this.y / scalar);
    }

    // Vector products
    dot(other: Vec2D): number {
        return this.x * other.x + this.y * other.y;
    }

    // 2D cross product returns a scalar representing the z component
    cross(other: Vec2D): number {
        return this.x * other.y - this.y * other.x;
    }

    // Vector operations
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lengthSquared(): number {  // Faster than length when just comparing distances
        return this.x * this.x + this.y * this.y;
    }

    normalize(): Vec2D {
        const len = this.length();
        if (len === 0) throw new Error("Cannot normalize zero vector");
        return this.divide(len);
    }

    // Returns angle between vectors in radians
    angleTo(other: Vec2D): number {
        return Math.acos(
            Math.min(1, Math.max(-1, this.dot(other) / (this.length() * other.length())))
        );
    }

    // Rotation
    rotate(angle: number, origin?: Vec2D): Vec2D {
        if (!origin) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return new Vec2D(
                this.x * cos - this.y * sin,
                this.x * sin + this.y * cos
            );
        }

        const translated = new Vec2D(this.x - origin.x, this.y - origin.y);
        const rotated = translated.rotate(angle);
        return new Vec2D(rotated.x + origin.x, rotated.y + origin.y);
    }

    // Swizzle operations
    get xx(): Vec2D {
        return new Vec2D(this.x, this.x);
    }

    get xy(): Vec2D {
        return new Vec2D(this.x, this.y);
    }

    get yx(): Vec2D {
        return new Vec2D(this.y, this.x);
    }

    get yy(): Vec2D {
        return new Vec2D(this.y, this.y);
    }

    // Utility methods
    distanceTo(other: Vec2D): number {
        return this.subtract(other).length();
    }

    distanceToSquared(other: Vec2D): number {  // Faster than distanceTo
        return this.subtract(other).lengthSquared();
    }

    // Returns perpendicular vector (rotated 90 degrees counterclockwise)
    perpendicular(): Vec2D {
        return new Vec2D(-this.y, this.x);
    }

    // Projects this vector onto other vector
    projectOnto(other: Vec2D): Vec2D {
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