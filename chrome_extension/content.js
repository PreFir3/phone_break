/* ── Phone Break – Content Script ── */

(() => {
  let overlayEl = null;
  let countdownTimer = null;

  // Listen for messages from background
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
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function showOverlay(data) {
    if (overlayEl) hideOverlay();

    const { site, stats, breakDuration } = data;

    overlayEl = document.createElement("div");
    overlayEl.id = "phone-break-overlay";

    const totalTime = formatTime(stats.totalSeconds || 0);
    const bypassCount = stats.bypasses || 0;
    const bypassTime = formatTime(stats.bypassSeconds || 0);
    const limitMin = site.timeLimitMinutes || 0;

    overlayEl.innerHTML = `
      <div class="pb-backdrop">
        <!-- Subtle floating particles -->
        <div class="pb-particles">
          ${Array.from({length: 8}, (_, i) => `<div class="pb-particle pb-p${i % 4}"></div>`).join("")}
        </div>

        <div class="pb-layout">
          <!-- Left: Breathing circle -->
          <div class="pb-left">
            <div class="pb-breathe-wrap">
              <div class="pb-breathe-outer">
                <div class="pb-breathe-ring pb-ring-1"></div>
                <div class="pb-breathe-ring pb-ring-2"></div>
                <div class="pb-breathe-ring pb-ring-3"></div>
                <div class="pb-breathe-core">
                  <div class="pb-breathe-dot"></div>
                </div>
              </div>
              <p class="pb-breathe-text">Breathe</p>
            </div>
          </div>

          <!-- Right: Info -->
          <div class="pb-right">
            <h1 class="pb-title">Time's Up</h1>
            <p class="pb-subtitle">
              You've spent <strong>${totalTime}</strong> on <strong>${site.label}</strong> today
              ${limitMin > 0 ? `— over your <strong>${limitMin}m</strong> limit` : ""}.
            </p>

            <!-- Stats -->
            <div class="pb-stats">
              <div class="pb-stat">
                <span class="pb-stat-val">${totalTime}</span>
                <span class="pb-stat-lbl">Today</span>
              </div>
              <div class="pb-stat-divider"></div>
              <div class="pb-stat">
                <span class="pb-stat-val">${bypassCount}</span>
                <span class="pb-stat-lbl">Bypasses</span>
              </div>
              <div class="pb-stat-divider"></div>
              <div class="pb-stat">
                <span class="pb-stat-val">${bypassTime}</span>
                <span class="pb-stat-lbl">After bypass</span>
              </div>
            </div>

            <!-- Countdown -->
            <div class="pb-countdown">
              <div class="pb-bar-track">
                <div class="pb-bar-fill" id="pb-bar"></div>
              </div>
              <p class="pb-bar-text" id="pb-bar-text">Bypass in <span id="pb-secs">${breakDuration}</span>s</p>
            </div>

            <!-- Buttons -->
            <div class="pb-actions">
              <button class="pb-btn-primary" id="pb-leave">Leave Site</button>
              <button class="pb-btn-secondary" id="pb-bypass" disabled>Wait...</button>
            </div>

            <p class="pb-note">Your future self will thank you.</p>
          </div>
        </div>
      </div>
    `;

    document.documentElement.appendChild(overlayEl);

    // Countdown
    let remaining = breakDuration;
    const bar = overlayEl.querySelector("#pb-bar");
    const secs = overlayEl.querySelector("#pb-secs");
    const barText = overlayEl.querySelector("#pb-bar-text");
    const bypassBtn = overlayEl.querySelector("#pb-bypass");
    const leaveBtn = overlayEl.querySelector("#pb-leave");

    countdownTimer = setInterval(() => {
      remaining--;
      if (secs) secs.textContent = remaining;
      if (bar) bar.style.width = `${((breakDuration - remaining) / breakDuration) * 100}%`;

      if (remaining <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        if (barText) barText.textContent = "You may continue — be mindful.";
        if (bypassBtn) {
          bypassBtn.disabled = false;
          bypassBtn.textContent = "Continue Anyway";
          bypassBtn.classList.add("pb-btn-ready");
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
    if (overlayEl) {
      overlayEl.classList.add("pb-exiting");
      setTimeout(() => {
        overlayEl?.remove();
        overlayEl = null;
      }, 350);
    }
  }
})();
