export function add(a, b) {
    return a + b;
}

export function subtract(a, b) {
    return a - b;
}

export function multiply(a, b) {
    return a * b;
}

export function divide(a, b) {
    if (b === 0) {
        throw new Error("Cannot divide by zero");
    }
    return a / b;
}

export function square(a) {
    return a * a;
}

export function squareRoot(a) {
    if (a < 0) {
        throw new Error("Cannot take the square root of a negative number");
    }
    return Math.sqrt(a);
}

/**
 * Linear interpolation between a and b by t (0–1).
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Random integer between min and max (inclusive).
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp value between min and max.
 */
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

/**
 * Map a value from one range to another.
 */
export function mapRange(val, inMin, inMax, outMin, outMax) {
    return ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

// reading