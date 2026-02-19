// This file exports functions for handling user input, such as keyboard and mouse events, to interact with the application.

const mouse = { x: -1000, y: -1000, active: false };
let idleTimer = null;
const ripples = [];
let clickCount = 0;

export function trackMouse(el) {
    el.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;

        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            mouse.active = false;
        }, 2000);
    });

    el.addEventListener('mouseleave', () => {
        mouse.active = false;
    });
}

export function getMouse() {
    return mouse;
}

export function handleKeyboardInput(event) {
    // Implement keyboard input handling logic here
}

export function handleMouseInput(event) {
    // Implement mouse input handling logic here
}

export function setupInputListeners() {
    window.addEventListener('keydown', handleKeyboardInput);
    window.addEventListener('mousemove', handleMouseInput);
}

export function trackClicks(el) {
    el.addEventListener('click', (e) => {
        clickCount++;
        ripples.push({
            x: e.clientX,
            y: e.clientY,
            radius: 0,
            strength: 1.0,
        });
    });

    // Also support touch
    el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        clickCount++;
        const touch = e.touches[0];
        ripples.push({
            x: touch.clientX,
            y: touch.clientY,
            radius: 0,
            strength: 1.0,
        });
    });
}

export function getRipples() {
    return ripples;
}

export function getClickCount() {
    return clickCount;
}