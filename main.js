// ─── Pause. ─── A breathing interruption tool ───

// ─── Canvas setup (self-contained) ───
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── Utility ───
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ─── Reasons ───
const REASONS = [
  { id: 'relax', label: 'to relax' },
  { id: 'escape', label: 'to break from reality' },
  { id: 'boredom', label: 'bored' },
  { id: 'habit', label: 'habit' }
];

const REFLECTIONS = {
  relax: [
    "You wanted to unwind. That's a real need.",
    "Rest is important — your phone just isn't always where you'll find it.",
    "Wanting to relax is valid. You already started by pausing here."
  ],
  escape: [
    "Sometimes reality is heavy. You don't have to carry it all at once.",
    "Wanting a break doesn't make you weak. You just took a real one.",
    "You paused instead of numbing. That matters."
  ],
  boredom: [
    "Boredom is uncomfortable. You just sat with it for a moment.",
    "Not every empty minute needs filling. You proved that just now.",
    "Your mind wanted stimulation. You gave it stillness instead."
  ],
  habit: [
    "Muscle memory brought you here. Awareness brought you to this moment.",
    "The loop is strong. But you just interrupted it.",
    "You noticed the pattern. That's the hardest step."
  ]
};

const COMPLETIONS = [
  "You did something small and real just now.",
  "That took less than a minute. And it was enough.",
  "You chose presence over noise.",
  "This moment was yours. Not your phone's."
];

// ─── State ───
let currentPhase = 'arrive';
let breathCycle = 0;
const TOTAL_BREATHS = 3;
let circleRadius = 30;
let targetRadius = 30;
let breathPhase = 'in';
let breathTimer = 0;
let lastTime = 0;
let appOpacity = 1;
let isFadingOut = false;

const BREATH_IN = 4;
const BREATH_HOLD = 2;
const BREATH_OUT = 5;

// ─── Phase management ───
function showPhase(name) {
  document.querySelectorAll('.phase').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('phase-' + name);
  if (el) {
    el.classList.add('active');
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
  }
  currentPhase = name;
}

// ─── Circle drawing ───
function drawCircle(r, alpha) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(r, 0), 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(212, 207, 196, ' + alpha + ')';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(r + 4, 0), 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(212, 207, 196, ' + (alpha * 0.4) + ')';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ─── Main render loop ───
function tick(ts) {
  if (!lastTime) lastTime = ts;
  const dt = (ts - lastTime) / 1000;
  lastTime = ts;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Handle fade-out for auto-close
  if (isFadingOut) {
    appOpacity -= dt * 0.4; // fade over ~2.5s
    if (appOpacity <= 0) {
      appOpacity = 0;
      isFadingOut = false;
      // Reset to arrive for next time
      showPhase('arrive');
      document.getElementById('patterns-link').style.display = '';
      appOpacity = 1;
      document.getElementById('app').style.opacity = '1';
      document.body.style.opacity = '1';
    } else {
      document.getElementById('app').style.opacity = String(appOpacity);
      document.body.style.opacity = String(appOpacity);
    }
    // Draw shrinking circle during fade
    circleRadius = lerp(circleRadius, 0, 0.02);
    drawCircle(circleRadius, 0.1 * appOpacity);
    requestAnimationFrame(tick);
    return;
  }

  if (currentPhase === 'breathe') {
    breathTimer += dt;

    const label = document.getElementById('breath-label');
    const count = document.getElementById('breath-count');

    if (breathPhase === 'in') {
      targetRadius = 120;
      if (label) label.textContent = 'breathe in';
      if (breathTimer >= BREATH_IN) {
        breathPhase = 'hold';
        breathTimer = 0;
      }
    } else if (breathPhase === 'hold') {
      targetRadius = 120;
      if (label) label.textContent = 'hold';
      if (breathTimer >= BREATH_HOLD) {
        breathPhase = 'out';
        breathTimer = 0;
      }
    } else if (breathPhase === 'out') {
      targetRadius = 30;
      if (label) label.textContent = 'breathe out';
      if (breathTimer >= BREATH_OUT) {
        breathCycle++;
        if (count) count.textContent = breathCycle + ' of ' + TOTAL_BREATHS;
        if (breathCycle >= TOTAL_BREATHS) {
          breathPhase = 'done';
          setTimeout(function() { showPhase('name'); }, 600);
        } else {
          breathPhase = 'in';
          breathTimer = 0;
        }
      }
    }

    circleRadius = lerp(circleRadius, targetRadius, 0.03);
    drawCircle(circleRadius, 0.15);
  } else {
    // Ambient circle on all other phases
    const ambient = 30 + Math.sin(ts / 3000) * 8;
    drawCircle(ambient, 0.06);
  }

  requestAnimationFrame(tick);
}

// ─── Storage ───
function saveReason(reasonId) {
  const data = JSON.parse(localStorage.getItem('pause_patterns') || '{}');
  data[reasonId] = (data[reasonId] || 0) + 1;
  localStorage.setItem('pause_patterns', JSON.stringify(data));
  const total = parseInt(localStorage.getItem('pause_total') || '0', 10);
  localStorage.setItem('pause_total', String(total + 1));
}

function getPatterns() {
  return JSON.parse(localStorage.getItem('pause_patterns') || '{}');
}

function getTotal() {
  return parseInt(localStorage.getItem('pause_total') || '0', 10);
}

function clearPatterns() {
  localStorage.removeItem('pause_patterns');
  localStorage.removeItem('pause_total');
}

// ─── Build reason buttons ───
function buildReasons() {
  const grid = document.getElementById('reason-grid');
  grid.innerHTML = '';
  REASONS.forEach(function(r) {
    const btn = document.createElement('button');
    btn.className = 'reason-btn';
    btn.textContent = r.label;
    btn.addEventListener('click', function() { onReasonChosen(r.id); });
    grid.appendChild(btn);
  });
}

// ─── Reason chosen → reflect → complete → auto-close ───
function onReasonChosen(reasonId) {
  saveReason(reasonId);

  const pool = REFLECTIONS[reasonId] || REFLECTIONS['habit'];
  const text = pool[Math.floor(Math.random() * pool.length)];

  document.getElementById('reflect-text').textContent = text;
  document.getElementById('reflect-sub').textContent = 'sit with that for a moment.';
  showPhase('reflect');

  // After reflection, show completion
  setTimeout(function() {
    const compText = COMPLETIONS[Math.floor(Math.random() * COMPLETIONS.length)];
    const total = getTotal();
    const sub = total > 1
      ? "You've paused " + total + " times now. Each one counted."
      : "Your first pause. That's something.";
    document.getElementById('complete-text').textContent = compText;
    document.getElementById('complete-sub').textContent = sub;
    showPhase('complete');

    // After completion, auto-fade and close
    setTimeout(function() {
      isFadingOut = true;
      appOpacity = 1;
    }, 4000);
  }, 4000);
}

// ─── Build patterns view ───
function buildPatterns() {
  const list = document.getElementById('pattern-list');
  const data = getPatterns();
  list.innerHTML = '';

  const reasonMap = {};
  REASONS.forEach(function(r) { reasonMap[r.id] = r.label; });

  const entries = Object.entries(data);
  if (entries.length === 0) {
    list.innerHTML = '<p class="soft-text dim">nothing yet.</p>';
    return;
  }

  entries.sort(function(a, b) { return b[1] - a[1]; });
  entries.forEach(function(entry) {
    const row = document.createElement('div');
    row.className = 'pattern-row';
    row.innerHTML = '<span>' + (reasonMap[entry[0]] || entry[0]) + '</span><span>' + entry[1] + '</span>';
    list.appendChild(row);
  });
}

// ─── Event listeners ───
document.getElementById('btn-begin').addEventListener('click', function() {
  breathCycle = 0;
  breathPhase = 'in';
  breathTimer = 0;
  circleRadius = 30;
  targetRadius = 30;
  lastTime = 0;
  document.getElementById('breath-count').textContent = '0 of ' + TOTAL_BREATHS;
  showPhase('breathe');
});

document.getElementById('btn-close').addEventListener('click', function() {
  isFadingOut = true;
  appOpacity = 1;
});

document.getElementById('btn-patterns').addEventListener('click', function() {
  buildPatterns();
  showPhase('patterns');
  document.getElementById('patterns-link').style.display = 'none';
});

document.getElementById('btn-back').addEventListener('click', function() {
  showPhase('arrive');
  document.getElementById('patterns-link').style.display = '';
});

document.getElementById('btn-clear').addEventListener('click', function() {
  clearPatterns();
  buildPatterns();
});

// ─── Init ───
buildReasons();
showPhase('arrive');
requestAnimationFrame(tick);