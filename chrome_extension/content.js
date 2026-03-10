/* ── Phone Break – Content Script ── */

(() => {
  let overlayEl = null;
  let countdownTimer = null;
  let bypassed = false;

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "showOverlay") {
      if (bypassed) { sendResponse({ ok: true, skipped: true }); return; }
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

    const { reason, site, stats, breakDuration } = data;
    const isTimeLimit = reason === "timeLimit";

    overlayEl = document.createElement("div");
    overlayEl.id = "phone-break-overlay";

    const totalTime = formatTime(stats.totalSeconds || 0);
    const bypassCount = stats.bypasses || 0;
    const bypassTime = formatTime(stats.bypassSeconds || 0);
    const limitMin = site.timeLimitMinutes || "∞";

    overlayEl.innerHTML = `
      <div class="pb-overlay-backdrop">
        <div class="pb-container">
          <!-- Floating particles -->
          <div class="pb-particles">
            ${Array.from({length: 20}, (_, i) => `<div class="pb-particle pb-particle-${i % 5}"></div>`).join("")}
          </div>

          <!-- Main content -->
          <div class="pb-content">
            <div class="pb-icon-wrap">
              <div class="pb-phone-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="16" y="4" width="32" height="56" rx="6" stroke="currentColor" stroke-width="3"/>
                  <line x1="16" y1="14" x2="48" y2="14" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="48" x2="48" y2="48" stroke="currentColor" stroke-width="2"/>
                  <circle cx="32" cy="54" r="3" fill="currentColor"/>
                  <line x1="20" y1="26" x2="44" y2="40" stroke="#ff6b6b" stroke-width="3" stroke-linecap="round"/>
                  <line x1="44" y1="26" x2="20" y2="40" stroke="#ff6b6b" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="pb-pulse-ring"></div>
              <div class="pb-pulse-ring pb-pulse-ring-2"></div>
            </div>

            <h1 class="pb-title">
              ${isTimeLimit ? "⏰ Time's Up!" : "📱 Phone Break!"}
            </h1>

            <p class="pb-subtitle">
              ${isTimeLimit
                ? `You've spent <strong>${totalTime}</strong> on <strong>${site.label}</strong> today — that's over your <strong>${limitMin} min</strong> limit.`
                : `You're visiting <strong>${site.label}</strong>. How about a quick break?`
              }
            </p>

            <!-- Stats cards -->
            <div class="pb-stats-row">
              <div class="pb-stat-card">
                <div class="pb-stat-value">${totalTime}</div>
                <div class="pb-stat-label">Time Today</div>
              </div>
              <div class="pb-stat-card">
                <div class="pb-stat-value">${bypassCount}</div>
                <div class="pb-stat-label">Bypasses</div>
              </div>
              <div class="pb-stat-card">
                <div class="pb-stat-value">${bypassTime}</div>
                <div class="pb-stat-label">Bypass Time</div>
              </div>
            </div>

            <!-- Breathing exercise -->
            <div class="pb-breathe-section">
              <p class="pb-breathe-label">Take a deep breath...</p>
              <div class="pb-breathe-circle">
                <div class="pb-breathe-dot"></div>
              </div>
            </div>

            <!-- Countdown -->
            <div class="pb-countdown-section">
              <div class="pb-countdown-bar-bg">
                <div class="pb-countdown-bar-fill" id="pb-countdown-fill"></div>
              </div>
              <p class="pb-countdown-text" id="pb-countdown-text">Bypass available in <span id="pb-countdown-num">${breakDuration}</span>s</p>
            </div>

            <!-- Buttons -->
            <div class="pb-buttons">
              <button class="pb-btn pb-btn-leave" id="pb-btn-leave">
                🚪 Leave Site
              </button>
              <button class="pb-btn pb-btn-bypass" id="pb-btn-bypass" disabled>
                ⏳ Wait...
              </button>
            </div>

            <p class="pb-footer-note">
              ${isTimeLimit ? "Consider coming back tomorrow with fresh eyes! 🌟" : "Your future self will thank you! 🙏"}
            </p>
          </div>
        </div>
      </div>
    `;

    document.documentElement.appendChild(overlayEl);

    // Countdown logic
    let remaining = breakDuration;
    const fill = overlayEl.querySelector("#pb-countdown-fill");
    const numEl = overlayEl.querySelector("#pb-countdown-num");
    const textEl = overlayEl.querySelector("#pb-countdown-text");
    const bypassBtn = overlayEl.querySelector("#pb-btn-bypass");
    const leaveBtn = overlayEl.querySelector("#pb-btn-leave");

    countdownTimer = setInterval(() => {
      remaining--;
      if (numEl) numEl.textContent = remaining;
      if (fill) fill.style.width = `${((breakDuration - remaining) / breakDuration) * 100}%`;

      if (remaining <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        if (textEl) textEl.textContent = "You can now continue — but be mindful! 🧘";
        if (bypassBtn) {
          bypassBtn.disabled = false;
          bypassBtn.textContent = "🔓 Continue Anyway";
          bypassBtn.classList.add("pb-btn-bypass-ready");
        }
      }
    }, 1000);

    // Button handlers
    bypassBtn.addEventListener("click", () => {
      bypassed = true;
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
      overlayEl.classList.add("pb-overlay-exiting");
      setTimeout(() => {
        overlayEl?.remove();
        overlayEl = null;
      }, 400);
    }
  }
})();
