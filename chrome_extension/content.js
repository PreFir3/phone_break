/* ── Phone Break – Content Script ── */

(() => {
  let overlayEl = null;
  let countdownTimer = null;
  let breatheTimer = null;

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "showOverlay") {
      showOverlay(msg);
      sendResponse({ ok: true });
    }
    if (msg.action === "hideOverlay") {
      hideOverlay();
      sendResponse({ ok: true });
    }
  });

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  // Box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold = 16s cycle
  const BREATHE_PHASES = [
    { label: "Breathe in", duration: 4000, scale: 1.6, opacity: 1 },
    { label: "Hold", duration: 4000, scale: 1.6, opacity: 0.85 },
    { label: "Breathe out", duration: 4000, scale: 0.6, opacity: 0.4 },
    { label: "Hold", duration: 4000, scale: 0.6, opacity: 0.35 },
  ];

  function startBreathing(dotEl, labelEl, ringEl) {
    let phase = 0;

    function runPhase() {
      const p = BREATHE_PHASES[phase];
      if (labelEl) labelEl.textContent = p.label;
      if (dotEl) {
        dotEl.style.transition = `transform ${p.duration}ms ease-in-out, opacity ${p.duration}ms ease-in-out, box-shadow ${p.duration}ms ease-in-out`;
        dotEl.style.transform = `scale(${p.scale})`;
        dotEl.style.opacity = p.opacity;
        dotEl.style.boxShadow = p.scale > 1
          ? `0 0 ${40 * p.opacity}px rgba(232, 197, 145, ${0.3 * p.opacity}), 0 0 ${80 * p.opacity}px rgba(232, 197, 145, ${0.1 * p.opacity})`
          : `0 0 10px rgba(232, 197, 145, 0.1)`;
      }
      if (ringEl) {
        ringEl.style.transition = `transform ${p.duration}ms ease-in-out, opacity ${p.duration}ms ease-in-out`;
        ringEl.style.transform = `scale(${0.7 + (p.scale - 0.6) * 0.3})`;
        ringEl.style.opacity = p.opacity * 0.4;
      }
      phase = (phase + 1) % BREATHE_PHASES.length;
      breatheTimer = setTimeout(runPhase, p.duration);
    }

    runPhase();
  }

  function showOverlay(data) {
    if (overlayEl) hideOverlay();

    const { site, stats, breakDuration } = data;
    const totalTime = formatTime(stats.totalSeconds || 0);
    const limitMin = site.timeLimitMinutes || 0;

    overlayEl = document.createElement("div");
    overlayEl.id = "phone-break-overlay";

    overlayEl.innerHTML = `
      <div class="pb-backdrop">
        <div class="pb-center">

          <!-- Breathing circle -->
          <div class="pb-breathe-area">
            <div class="pb-breathe-ring" id="pb-ring"></div>
            <div class="pb-breathe-dot" id="pb-dot"></div>
          </div>

          <p class="pb-breathe-label" id="pb-breathe-label">Breathe in</p>

          <!-- Message -->
          <p class="pb-message">
            ${limitMin > 0
              ? `${totalTime} on ${site.label} — over your ${limitMin}m limit`
              : `Take a break from ${site.label}`
            }
          </p>

          <!-- Countdown bar -->
          <div class="pb-progress">
            <div class="pb-progress-fill" id="pb-bar"></div>
          </div>
          <p class="pb-countdown-text" id="pb-countdown-text">${breakDuration}s</p>

          <!-- Buttons -->
          <div class="pb-actions">
            <button class="pb-btn pb-btn-go" id="pb-bypass" disabled>Wait</button>
          </div>

          <button class="pb-link" id="pb-leave">Go somewhere else</button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(overlayEl);

    // Start box breathing
    const dot = overlayEl.querySelector("#pb-dot");
    const label = overlayEl.querySelector("#pb-breathe-label");
    const ring = overlayEl.querySelector("#pb-ring");
    startBreathing(dot, label, ring);

    // Countdown
    let remaining = breakDuration;
    const bar = overlayEl.querySelector("#pb-bar");
    const countText = overlayEl.querySelector("#pb-countdown-text");
    const bypassBtn = overlayEl.querySelector("#pb-bypass");
    const leaveBtn = overlayEl.querySelector("#pb-leave");

    countdownTimer = setInterval(() => {
      remaining--;
      if (bar) bar.style.width = `${((breakDuration - remaining) / breakDuration) * 100}%`;
      if (countText) countText.textContent = remaining > 0 ? `${remaining}s` : "";

      if (remaining <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        if (countText) countText.textContent = "Ready when you are";
        if (bypassBtn) {
          bypassBtn.disabled = false;
          bypassBtn.textContent = "Continue";
          bypassBtn.classList.add("pb-btn-active");
        }
      }
    }, 1000);

    bypassBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "bypass", sitePattern: site.pattern });
      hideOverlay();
    });

    leaveBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "closedOverlay", sitePattern: site.pattern });
      hideOverlay();
    });
  }

  function hideOverlay() {
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    if (breatheTimer) { clearTimeout(breatheTimer); breatheTimer = null; }
    if (overlayEl) {
      overlayEl.classList.add("pb-exiting");
      setTimeout(() => {
        overlayEl?.remove();
        overlayEl = null;
      }, 350);
    }
  }
})();
