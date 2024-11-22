import Vec2D from "../../Utils/Vec2D";

export type InterpolationFunction<T> = (start: T, end: T, t: number) => T;

export class Interpolation {
    static GetInterpolationFunction<T>(startValue: T, endValue: T): InterpolationFunction<T> {
        if (typeof startValue === 'number' && typeof endValue === 'number') {
            return Interpolation.number as unknown as InterpolationFunction<T>;
        }
        
        if (startValue instanceof Vec2D && endValue instanceof Vec2D) {
            return Interpolation.vector2D as unknown as InterpolationFunction<T>;
        }
        
        if (Interpolation.isColor(startValue) && Interpolation.isColor(endValue)) {
            return Interpolation.color as unknown as InterpolationFunction<T>;
        }
        
        if (Interpolation.isInterpolableObject(startValue, endValue)) {
            return Interpolation.object as unknown as InterpolationFunction<T>;
        }
        
        throw new Error(`Unsupported tween type: ${typeof startValue}. Supported types are: number, Vec2D, Color, or object with numeric properties.`);
    }

    private static isColor(value: any): value is {r: number, g: number, b: number} {
        return typeof value === 'object' && 
               'r' in value && 
               'g' in value && 
               'b' in value;
    }

    private static isInterpolableObject(start: any, end: any): boolean {
        if (typeof start !== 'object' || typeof end !== 'object') return false;
        return Object.keys(start).some(key => 
            typeof start[key] === 'number' && 
            typeof end[key] === 'number'
        );
    }
    
    static number: InterpolationFunction<number> = (start, end, t) => {
        return start + (end - start) * t;
    };

    static vector2D: InterpolationFunction<Vec2D> = (start, end, t) => {
        return new Vec2D(
            start.x + (end.x - start.x) * t,
            start.y + (end.y - start.y) * t
        );
    };

    static color: InterpolationFunction<{r: number, g: number, b: number}> = (start, end, t) => ({
        r: Math.round(start.r + (end.r - start.r) * t),
        g: Math.round(start.g + (end.g - start.g) * t),
        b: Math.round(start.b + (end.b - start.b) * t)
    });

    static object: InterpolationFunction<{[key: string]: number}> = (start, end, t) => {
        const result: {[key: string]: number} = {};
        for (const key in start) {
            if (typeof start[key] === 'number' && typeof end[key] === 'number') {
                result[key] = start[key] + (end[key] - start[key]) * t;
            }
        }
        return result;
    };
}