// ── Phone Break – Background Service Worker ──

const DEFAULT_SETTINGS = {
  enabled: true,
  trackedSites: [
    { pattern: "youtube.com", label: "YouTube", timeLimitMinutes: 30 },
    { pattern: "twitter.com", label: "Twitter / X", timeLimitMinutes: 20 },
    { pattern: "x.com", label: "Twitter / X", timeLimitMinutes: 20 },
    { pattern: "reddit.com", label: "Reddit", timeLimitMinutes: 25 },
    { pattern: "instagram.com", label: "Instagram", timeLimitMinutes: 20 },
    { pattern: "tiktok.com", label: "TikTok", timeLimitMinutes: 15 },
    { pattern: "facebook.com", label: "Facebook", timeLimitMinutes: 30 }
  ],
  breakDurationSeconds: 30,
  globalEnabled: true
};

// ── Helpers ──

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function matchesSite(url, pattern) {
  try {
    const hostname = new URL(url).hostname;
    return hostname === pattern || hostname.endsWith("." + pattern);
  } catch {
    return false;
  }
}

async function getSettings() {
  const data = await chrome.storage.local.get("settings");
  return data.settings || { ...DEFAULT_SETTINGS };
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
}

async function getTodayStats() {
  const key = "stats_" + todayKey();
  const data = await chrome.storage.local.get(key);
  return data[key] || {};
}

async function saveTodayStats(stats) {
  const key = "stats_" + todayKey();
  await chrome.storage.local.set({ [key]: stats });
}

async function getAllStats() {
  const all = await chrome.storage.local.get(null);
  const stats = {};
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith("stats_")) {
      stats[key.replace("stats_", "")] = value;
    }
  }
  return stats;
}

function initSiteStats() {
  return { totalSeconds: 0, bypasses: 0, bypassSeconds: 0, overlayActive: false, lastBypassTime: 0 };
}

// ── Time tracking heartbeat ──

let activeTabId = null;
let activeTabUrl = null;
let tickInterval = null;

function startTicking() {
  if (tickInterval) return;
  tickInterval = setInterval(tick, 1000);
}

function stopTicking() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

async function tick() {
  if (!activeTabUrl) return;

  const settings = await getSettings();
  if (!settings.enabled || !settings.globalEnabled) return;

  const matchedSite = settings.trackedSites.find(s => matchesSite(activeTabUrl, s.pattern));
  if (!matchedSite) return;

  const stats = await getTodayStats();
  const siteKey = matchedSite.pattern;

  if (!stats[siteKey]) {
    stats[siteKey] = initSiteStats();
  }

  // Don't count time while overlay is active (user isn't actually using the site)
  if (stats[siteKey].overlayActive) {
    await saveTodayStats(stats);
    return;
  }

  stats[siteKey].totalSeconds += 1;

  // Track bypass time (time spent after any bypass)
  if (stats[siteKey].bypasses > 0) {
    stats[siteKey].bypassSeconds = (stats[siteKey].bypassSeconds || 0) + 1;
  }

  // Check if time limit just exceeded
  const limitSec = (matchedSite.timeLimitMinutes || 0) * 60;
  if (limitSec > 0 && stats[siteKey].totalSeconds >= limitSec && !stats[siteKey].overlayActive) {
    // Only show overlay if they haven't bypassed in the last 60 seconds
    // (prevents rapid re-triggering after bypass)
    const now = Date.now();
    const timeSinceBypass = now - (stats[siteKey].lastBypassTime || 0);
    if (timeSinceBypass > 60000) {
      stats[siteKey].overlayActive = true;
      try {
        await chrome.tabs.sendMessage(activeTabId, {
          action: "showOverlay",
          reason: "timeLimit",
          site: matchedSite,
          stats: stats[siteKey],
          breakDuration: settings.breakDurationSeconds
        });
      } catch (e) { /* tab may not have content script */ }
    }
  }

  await saveTodayStats(stats);
}

// ── Tab tracking ──

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  activeTabId = activeInfo.tabId;
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    activeTabUrl = tab.url || null;
    await handleTabChange(tab);
  } catch { }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    activeTabUrl = changeInfo.url;
    await handleTabChange(tab);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    activeTabUrl = null;
    stopTicking();
    return;
  }
  try {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) {
      activeTabId = tab.id;
      activeTabUrl = tab.url;
      await handleTabChange(tab);
    }
  } catch { }
});

async function handleTabChange(tab) {
  if (!tab || !tab.url) { stopTicking(); return; }

  const settings = await getSettings();
  if (!settings.enabled || !settings.globalEnabled) { stopTicking(); return; }

  const matchedSite = settings.trackedSites.find(s => matchesSite(tab.url, s.pattern));
  if (!matchedSite) { stopTicking(); return; }

  // Start tracking time
  startTicking();

  // Only show overlay if the time limit is already exceeded
  const stats = await getTodayStats();
  const siteKey = matchedSite.pattern;
  const siteStats = stats[siteKey] || initSiteStats();
  const limitSec = (matchedSite.timeLimitMinutes || 0) * 60;

  // No time limit set, or under the limit → just track, don't block
  if (limitSec <= 0 || siteStats.totalSeconds < limitSec) {
    return;
  }

  // Time limit exceeded — but check if they recently bypassed
  const now = Date.now();
  const timeSinceBypass = now - (siteStats.lastBypassTime || 0);
  if (timeSinceBypass < 60000) {
    // Bypassed less than 60 seconds ago, don't re-show
    return;
  }

  // Show the overlay
  if (!stats[siteKey]) stats[siteKey] = initSiteStats();
  stats[siteKey].overlayActive = true;
  await saveTodayStats(stats);

  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: "showOverlay",
      reason: "timeLimit",
      site: matchedSite,
      stats: siteStats,
      breakDuration: settings.breakDurationSeconds
    });
  } catch { }
}

// ── Message handling ──

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "bypass") {
    handleBypass(msg.sitePattern).then(sendResponse);
    return true;
  }
  if (msg.action === "getSettings") {
    getSettings().then(sendResponse);
    return true;
  }
  if (msg.action === "saveSettings") {
    saveSettings(msg.settings).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.action === "getTodayStats") {
    getTodayStats().then(sendResponse);
    return true;
  }
  if (msg.action === "getAllStats") {
    getAllStats().then(sendResponse);
    return true;
  }
  if (msg.action === "resetStats") {
    const key = "stats_" + todayKey();
    chrome.storage.local.remove(key).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.action === "closedOverlay") {
    if (sender.tab) {
      chrome.tabs.update(sender.tab.id, { url: "https://www.google.com" });
    }
    sendResponse({ ok: true });
    return true;
  }
});

async function handleBypass(sitePattern) {
  const stats = await getTodayStats();
  if (!stats[sitePattern]) {
    stats[sitePattern] = initSiteStats();
  }
  stats[sitePattern].bypasses += 1;
  stats[sitePattern].overlayActive = false;
  stats[sitePattern].lastBypassTime = Date.now();
  await saveTodayStats(stats);
  return { ok: true, bypasses: stats[sitePattern].bypasses };
}

// ── Init ──

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get("settings");
  if (!existing.settings) {
    await saveSettings({ ...DEFAULT_SETTINGS });
  }
});

chrome.alarms.create("keepAlive", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(() => { /* keep-alive */ });
