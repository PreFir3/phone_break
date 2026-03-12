// ── Phone Break – Popup Script ──

document.addEventListener("DOMContentLoaded", async () => {
  // Tab switching
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(tc => tc.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
      if (tab.dataset.tab === "stats") loadStats();
      if (tab.dataset.tab === "settings") loadSettingsTab();
    });
  });

  const settings = await sendMsg({ action: "getSettings" });

  // Global toggle
  const globalToggle = document.getElementById("globalToggle");
  globalToggle.checked = settings.globalEnabled !== false;
  globalToggle.addEventListener("change", async () => {
    const s = await sendMsg({ action: "getSettings" });
    s.globalEnabled = globalToggle.checked;
    await sendMsg({ action: "saveSettings", settings: s });
  });

  // ── Sites Tab ──
  const siteList = document.getElementById("siteList");
  const addSiteBtn = document.getElementById("addSiteBtn");
  const addForm = document.getElementById("addForm");
  const saveSiteBtn = document.getElementById("saveSiteBtn");

  addSiteBtn.addEventListener("click", () => addForm.classList.toggle("hidden"));

  saveSiteBtn.addEventListener("click", async () => {
    const pattern = document.getElementById("newPattern").value.trim().toLowerCase();
    const label = document.getElementById("newLabel").value.trim() || pattern;
    const limit = parseInt(document.getElementById("newLimit").value) || 0;
    if (!pattern) return;

    const s = await sendMsg({ action: "getSettings" });
    s.trackedSites.push({ pattern, label, timeLimitMinutes: limit });
    await sendMsg({ action: "saveSettings", settings: s });

    document.getElementById("newPattern").value = "";
    document.getElementById("newLabel").value = "";
    document.getElementById("newLimit").value = "";
    addForm.classList.add("hidden");
    renderSites(s.trackedSites);
  });

  function renderSites(sites) {
    if (!sites.length) {
      siteList.innerHTML = `
        <div class="empty-state">
          <div class="emoji">🌐</div>
          <p>No tracked sites yet</p>
        </div>`;
      return;
    }

    siteList.innerHTML = sites.map((site, i) => `
      <div class="site-item" data-index="${i}">
        <div class="site-info">
          <div class="site-name">${escHTML(site.label)}</div>
          <div class="site-pattern">${escHTML(site.pattern)}</div>
        </div>
        <div class="site-actions">
          <div class="site-limit-edit">
            <input type="number" class="site-limit-input" data-index="${i}"
              value="${site.timeLimitMinutes || 0}" min="0" max="999" title="Time limit in minutes (0 = no limit)">
            <span class="site-limit-unit">min</span>
          </div>
          <button class="site-remove" data-index="${i}" title="Remove">✕</button>
        </div>
      </div>
    `).join("");

    // Inline time limit editing
    siteList.querySelectorAll(".site-limit-input").forEach(input => {
      let debounce = null;
      input.addEventListener("input", () => {
        clearTimeout(debounce);
        debounce = setTimeout(async () => {
          const idx = parseInt(input.dataset.index);
          const val = parseInt(input.value) || 0;
          const s = await sendMsg({ action: "getSettings" });
          if (s.trackedSites[idx]) {
            s.trackedSites[idx].timeLimitMinutes = val;
            await sendMsg({ action: "saveSettings", settings: s });
          }
        }, 400);
      });
    });

    // Remove handlers
    siteList.querySelectorAll(".site-remove").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = parseInt(btn.dataset.index);
        const s = await sendMsg({ action: "getSettings" });
        s.trackedSites.splice(idx, 1);
        await sendMsg({ action: "saveSettings", settings: s });
        renderSites(s.trackedSites);
      });
    });
  }

  renderSites(settings.trackedSites || []);

  // ── Stats Tab ──
  async function loadStats() {
    const stats = await sendMsg({ action: "getTodayStats" });
    const settings = await sendMsg({ action: "getSettings" });
    const statsList = document.getElementById("statsList");
    const entries = Object.entries(stats);

    if (!entries.length) {
      statsList.innerHTML = `
        <div class="empty-state">
          <div class="emoji">📊</div>
          <p>No activity today</p>
        </div>`;
      return;
    }

    statsList.innerHTML = entries.map(([pattern, data]) => {
      const site = settings.trackedSites.find(s => s.pattern === pattern);
      const label = site ? site.label : pattern;
      const limitSec = site ? (site.timeLimitMinutes || 0) * 60 : 0;
      const pct = limitSec > 0 ? Math.min(100, (data.totalSeconds / limitSec) * 100) : 0;
      const barClass = pct >= 100 ? "bar-over" : pct >= 75 ? "bar-warn" : "";

      return `
        <div class="stats-item">
          <div class="stats-item-header">
            <span class="stats-site-name">${escHTML(label)}</span>
            ${data.bypasses > 0
              ? `<span class="stats-bypass-badge">${data.bypasses} bypass${data.bypasses > 1 ? "es" : ""}</span>`
              : ""}
          </div>
          <div class="stats-row">
            <div class="stats-metric">
              <div class="stats-metric-value">${formatTime(data.totalSeconds || 0)}</div>
              <div class="stats-metric-label">Time</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-value">${formatTime(data.bypassSeconds || 0)}</div>
              <div class="stats-metric-label">After bypass</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-value">${limitSec > 0 ? Math.round(pct) + "%" : "—"}</div>
              <div class="stats-metric-label">Limit</div>
            </div>
          </div>
          ${limitSec > 0 ? `
            <div class="stats-bar">
              <div class="stats-bar-fill ${barClass}" style="width:${pct}%"></div>
            </div>` : ""}
        </div>`;
    }).join("");
  }

  document.getElementById("resetStatsBtn").addEventListener("click", async () => {
    await sendMsg({ action: "resetStats" });
    loadStats();
  });

  document.getElementById("openDashboardBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
  });

  // ── Settings Tab ──
  async function loadSettingsTab() {
    const s = await sendMsg({ action: "getSettings" });
    document.getElementById("breakDuration").value = s.breakDurationSeconds || 30;
    document.getElementById("enabledToggle").checked = s.enabled !== false;
  }

  document.getElementById("saveSettingsBtn").addEventListener("click", async () => {
    const s = await sendMsg({ action: "getSettings" });
    s.breakDurationSeconds = parseInt(document.getElementById("breakDuration").value) || 30;
    s.enabled = document.getElementById("enabledToggle").checked;
    await sendMsg({ action: "saveSettings", settings: s });
    const btn = document.getElementById("saveSettingsBtn");
    btn.textContent = "✓ Saved";
    setTimeout(() => { btn.textContent = "Save Settings"; }, 1200);
  });

  loadSettingsTab();
});

// ── Utilities ──
function sendMsg(msg) { return chrome.runtime.sendMessage(msg); }

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function escHTML(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}
