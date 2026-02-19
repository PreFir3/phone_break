let canvas, ctx, w, h;

export function setupCanvas(el) {
    canvas = el;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
}

function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
}

export function getCtx() {
    return ctx;
}

export function getSize() {
    return { w, h };
}