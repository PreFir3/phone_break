// ── Phone Break – Dashboard Script ──

document.addEventListener("DOMContentLoaded", async () => {
  const dateRange = document.getElementById("dateRange");

  dateRange.addEventListener("change", () => loadDashboard());

  await loadDashboard();
});

async function loadDashboard() {
  const range = document.getElementById("dateRange").value;
  const settings = await sendMsg({ action: "getSettings" });
  const allStats = await sendMsg({ action: "getAllStats" });

  // Filter by date range
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  let filteredDates = Object.keys(allStats);
  if (range === "today") filteredDates = filteredDates.filter(d => d === today);
  else if (range === "week") filteredDates = filteredDates.filter(d => d >= weekAgo);

  // Aggregate data
  const aggregated = {}; // pattern -> { totalSeconds, bypasses, bypassSeconds }
  let totalTime = 0;
  let totalBypasses = 0;
  let totalBypassTime = 0;
  let sitesTracked = new Set();

  for (const date of filteredDates) {
    const dayStats = allStats[date];
    for (const [pattern, data] of Object.entries(dayStats)) {
      if (!aggregated[pattern]) {
        aggregated[pattern] = { totalSeconds: 0, bypasses: 0, bypassSeconds: 0, days: [] };
      }
      aggregated[pattern].totalSeconds += data.totalSeconds || 0;
      aggregated[pattern].bypasses += data.bypasses || 0;
      aggregated[pattern].bypassSeconds += data.bypassSeconds || 0;
      aggregated[pattern].days.push({ date, ...data });

      totalTime += data.totalSeconds || 0;
      totalBypasses += data.bypasses || 0;
      totalBypassTime += data.bypassSeconds || 0;
      sitesTracked.add(pattern);
    }
  }

  // Render summary
  const summaryGrid = document.getElementById("summaryGrid");
  summaryGrid.innerHTML = `
    <div class="summary-card">
      <div class="summary-card-icon">⏱️</div>
      <div class="summary-card-value purple">${formatTime(totalTime)}</div>
      <div class="summary-card-label">Total Time Tracked</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-icon">🔓</div>
      <div class="summary-card-value pink">${totalBypasses}</div>
      <div class="summary-card-label">Total Bypasses</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-icon">⏳</div>
      <div class="summary-card-value blue">${formatTime(totalBypassTime)}</div>
      <div class="summary-card-label">Time After Bypass</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-icon">🌐</div>
      <div class="summary-card-value green">${sitesTracked.size}</div>
      <div class="summary-card-label">Sites Tracked</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-icon">📅</div>
      <div class="summary-card-value yellow">${filteredDates.length}</div>
      <div class="summary-card-label">Days Active</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-icon">📊</div>
      <div class="summary-card-value red">${totalBypasses > 0 ? Math.round((totalBypassTime / Math.max(totalTime, 1)) * 100) : 0}%</div>
      <div class="summary-card-label">Bypass Time Ratio</div>
    </div>
  `;

  // Render site breakdown
  const sitesGrid = document.getElementById("sitesGrid");
  const entries = Object.entries(aggregated).sort((a, b) => b[1].totalSeconds - a[1].totalSeconds);

  if (!entries.length) {
    sitesGrid.innerHTML = `
      <div class="empty-dash" style="grid-column: 1 / -1;">
        <div class="emoji">📊</div>
        <p>No data for this period yet. Start browsing!</p>
      </div>`;
  } else {
    sitesGrid.innerHTML = entries.map(([pattern, data]) => {
      const site = (settings.trackedSites || []).find(s => s.pattern === pattern);
      const label = site ? site.label : pattern;
      const limitSec = site ? (site.timeLimitMinutes || 0) * 60 : 0;

      // For multi-day, multiply limit by number of filtered days
      const effectiveLimit = limitSec * Math.max(filteredDates.length, 1);
      const pct = effectiveLimit > 0 ? Math.min(100, (data.totalSeconds / effectiveLimit) * 100) : 0;

      let badgeClass = "badge-ok";
      let badgeText = "Under limit";
      if (pct >= 100) { badgeClass = "badge-danger"; badgeText = "Over limit"; }
      else if (pct >= 75) { badgeClass = "badge-warning"; badgeText = "Near limit"; }
      else if (effectiveLimit === 0) { badgeClass = "badge-ok"; badgeText = "No limit"; }

      let barClass = "bar-purple";
      if (pct >= 100) barClass = "bar-red";
      else if (pct >= 75) barClass = "bar-yellow";
      else if (pct > 0) barClass = "bar-green";

      return `
        <div class="site-card">
          <div class="site-card-header">
            <span class="site-card-name">${escHTML(label)}</span>
            <span class="site-card-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="site-card-metrics">
            <div class="site-metric">
              <div class="site-metric-value">${formatTime(data.totalSeconds)}</div>
              <div class="site-metric-label">Total Time</div>
            </div>
            <div class="site-metric">
              <div class="site-metric-value">${data.bypasses}</div>
              <div class="site-metric-label">Bypasses</div>
            </div>
            <div class="site-metric">
              <div class="site-metric-value">${formatTime(data.bypassSeconds)}</div>
              <div class="site-metric-label">After Bypass</div>
            </div>
          </div>
          ${effectiveLimit > 0 ? `
            <div class="site-bar">
              <div class="site-bar-fill ${barClass}" style="width:${pct}%"></div>
            </div>
          ` : ""}
        </div>
      `;
    }).join("");
  }

  // Render bypass table
  const bypassBody = document.getElementById("bypassBody");
  const bypassRows = [];

  for (const date of filteredDates.sort().reverse()) {
    const dayStats = allStats[date];
    for (const [pattern, data] of Object.entries(dayStats)) {
      if ((data.bypasses || 0) > 0) {
        const site = (settings.trackedSites || []).find(s => s.pattern === pattern);
        const label = site ? site.label : pattern;
        bypassRows.push({ label, date, bypasses: data.bypasses, bypassSeconds: data.bypassSeconds || 0, totalSeconds: data.totalSeconds || 0 });
      }
    }
  }

  if (!bypassRows.length) {
    bypassBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);">No bypasses recorded 🎉</td></tr>`;
  } else {
    bypassBody.innerHTML = bypassRows.map(row => `
      <tr>
        <td>${escHTML(row.label)}</td>
        <td>${row.date}</td>
        <td><span class="bypass-count">${row.bypasses}</span></td>
        <td>${formatTime(row.bypassSeconds)}</td>
        <td>${formatTime(row.totalSeconds)}</td>
      </tr>
    `).join("");
  }
}

// ── Utilities ──

function sendMsg(msg) {
  return chrome.runtime.sendMessage(msg);
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return "0s";
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
