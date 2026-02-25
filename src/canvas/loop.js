let lastTime = 0;
let renderFn = null;

// reading
function frame(time) {
    const dt = time - lastTime || 16;
    lastTime = time;

    if (renderFn) {
        renderFn(dt);
    }

    requestAnimationFrame(frame);
}

export function startLoop(fn) {
    renderFn = fn;
    requestAnimationFrame(frame);
}