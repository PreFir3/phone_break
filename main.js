import { setupCanvas, getCtx, getSize } from './src/canvas/setupCanvas.js';
import { startLoop } from './src/canvas/loop.js';
import { trackClicks, getRipples, getClickCount } from './src/input/input.js';
import { lerp, randomInt } from './src/utils/math.js';

// ── Initialise canvas ──
const canvas = document.getElementById('matrix-bg');
setupCanvas(canvas);
const ctx = getCtx();

// ── Track clicks ──
trackClicks(canvas);

// ── Character set ──
const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]|/\\@#$%&*+=';
const FONT_SIZE = 16;

// ── Columns state ──
let columns = [];
let columnCount = 0;

function initColumns() {
    const { w } = getSize();
    columnCount = Math.ceil(w / FONT_SIZE);
    columns = Array.from({ length: columnCount }, () => ({
        y: Math.random() * -100,
        speed: 0.4 + Math.random() * 0.6,
        chars: [],
        trailLen: randomInt(8, 28),
        nextSwap: 0,
    }));
}
initColumns();

window.addEventListener('resize', () => {
    setupCanvas(canvas);
    initColumns();
});

// ── Ripple settings ──
const RIPPLE_SPEED = 400;     // pixels per second
const RIPPLE_WIDTH = 120;     // thickness of the ring
const RIPPLE_MAX = 800;       // max radius before ripple dies
const RIPPLE_STRENGTH = 1.0;

// ── Draw one frame ──
function render(dt) {
    const { w, h } = getSize();
    const ripples = getRipples();

    // Update click counter display
    const counterEl = document.getElementById('click-counter');
    if (counterEl) counterEl.textContent = getClickCount();

    // Fade previous frame
    ctx.fillStyle = 'rgba(10, 10, 10, 0.12)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;

    // Update ripples
    for (let r = ripples.length - 1; r >= 0; r--) {
        ripples[r].radius += RIPPLE_SPEED * (dt / 1000);
        ripples[r].strength = 1 - (ripples[r].radius / RIPPLE_MAX);
        if (ripples[r].radius > RIPPLE_MAX) {
            ripples.splice(r, 1);
        }
    }

    for (let i = 0; i < columnCount; i++) {
        const col = columns[i];
        const x = i * FONT_SIZE;

        // ── Calculate ripple influence on this column ──
        let rippleInfluence = 0;
        let speedBoost = 0;

        for (const ripple of ripples) {
            const dx = x - ripple.x;
            const dy = (col.y * FONT_SIZE) - ripple.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Is this column within the ripple ring?
            const ringDist = Math.abs(dist - ripple.radius);
            if (ringDist < RIPPLE_WIDTH && ripple.strength > 0) {
                const ringInfluence = (1 - ringDist / RIPPLE_WIDTH) * ripple.strength;
                rippleInfluence = Math.max(rippleInfluence, ringInfluence);
                speedBoost += ringInfluence * 3;
            }
        }

        // Speed
        const speed = col.speed + speedBoost;

        // Advance drop
        col.y += speed * (dt / 16);

        // Random character swap (idle shimmer)
        col.nextSwap -= dt;
        if (col.nextSwap <= 0) {
            col.nextSwap = randomInt(80, 400);
            if (col.chars.length > 0) {
                const swapIdx = randomInt(0, col.chars.length - 1);
                col.chars[swapIdx] = CHARS[randomInt(0, CHARS.length - 1)];
            }
        }

        // New leading character
        const headChar = CHARS[randomInt(0, CHARS.length - 1)];
        col.chars.push(headChar);

        // Trim trail
        if (col.chars.length > col.trailLen) {
            col.chars.shift();
        }

        // ── Draw trail ──
        for (let j = 0; j < col.chars.length; j++) {
            const rowY = Math.floor(col.y) - (col.chars.length - 1 - j);
            const py = rowY * FONT_SIZE;

            if (py < -FONT_SIZE || py > h + FONT_SIZE) continue;

            const t = j / (col.chars.length - 1 || 1);

            // Check per-character ripple influence
            let charRipple = 0;
            for (const ripple of ripples) {
                const dx = x - ripple.x;
                const dy = py - ripple.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const ringDist = Math.abs(dist - ripple.radius);
                if (ringDist < RIPPLE_WIDTH && ripple.strength > 0) {
                    charRipple = Math.max(charRipple, (1 - ringDist / RIPPLE_WIDTH) * ripple.strength);
                }
            }

            if (j === col.chars.length - 1) {
                // Head: bright white-green
                ctx.fillStyle = `rgba(200, 255, 200, 0.9)`;
                ctx.shadowColor = '#00ff41';
                ctx.shadowBlur = 8;
            } else {
                const alpha = lerp(0.05, 0.7, t);
                const green = Math.floor(lerp(80, 255, t));

                // Brighten characters hit by ripple
                if (charRipple > 0.1) {
                    const boostedAlpha = Math.min(1, alpha + charRipple * 0.6);
                    const brightness = Math.floor(lerp(0, 200, charRipple));
                    ctx.fillStyle = `rgba(${brightness}, 255, ${brightness}, ${boostedAlpha})`;
                    ctx.shadowColor = '#00ff41';
                    ctx.shadowBlur = charRipple * 15;
                } else {
                    ctx.fillStyle = `rgba(0, ${green}, 0, ${alpha})`;
                    ctx.shadowBlur = 0;
                }
            }

            // Scramble characters hit by ripple
            let ch = col.chars[j];
            if (charRipple > 0.2 && Math.random() < charRipple * 0.7) {
                ch = CHARS[randomInt(0, CHARS.length - 1)];
            }

            ctx.fillText(ch, x, py);
        }

        ctx.shadowBlur = 0;

        // Reset column when off screen
        const rows = Math.ceil(h / FONT_SIZE);
        if (col.y - col.trailLen > rows) {
            col.y = Math.random() * -20;
            col.speed = 0.4 + Math.random() * 0.6;
            col.chars = [];
            col.trailLen = randomInt(8, 28);
        }
    }

    // ── Draw ripple rings (subtle visual) ──
    for (const ripple of ripples) {
        if (ripple.strength > 0) {
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 65, ${ripple.strength * 0.15})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

// ── Start loop ──
startLoop(render);