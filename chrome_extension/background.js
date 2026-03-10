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
  breakDurationSeconds: 30, // how long the overlay stays before bypass is offered
  globalEnabled: true
};

// ── Helpers ──

function todayKey() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
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
  // shape: { "youtube.com": { totalSeconds: 0, bypasses: 0, bypassSeconds: 0, lastTick: null, overlayShown: false } }
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
    stats[siteKey] = { totalSeconds: 0, bypasses: 0, bypassSeconds: 0, overlayActive: false };
  }

  stats[siteKey].totalSeconds += 1;

  // Check if time limit exceeded
  const limitSec = (matchedSite.timeLimitMinutes || 0) * 60;
  if (limitSec > 0 && stats[siteKey].totalSeconds >= limitSec && !stats[siteKey].overlayActive) {
    stats[siteKey].overlayActive = true;
    // Tell content script to show overlay (time limit reason)
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

  // Track bypass time
  if (stats[siteKey].overlayActive === false && stats[siteKey].bypasses > 0) {
    stats[siteKey].bypassSeconds = (stats[siteKey].bypassSeconds || 0) + 1;
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
  // Also fire overlay on page load complete for tracked sites
  if (tabId === activeTabId && changeInfo.status === "complete") {
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

  startTicking();

  // Check if overlay should be shown immediately (first visit or time limit already exceeded)
  const stats = await getTodayStats();
  const siteKey = matchedSite.pattern;
  const siteStats = stats[siteKey] || { totalSeconds: 0, bypasses: 0, bypassSeconds: 0, overlayActive: false };
  const limitSec = (matchedSite.timeLimitMinutes || 0) * 60;

  if (limitSec > 0 && siteStats.totalSeconds >= limitSec) {
    // Time limit already exceeded – show overlay
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "showOverlay",
        reason: "timeLimit",
        site: matchedSite,
        stats: siteStats,
        breakDuration: settings.breakDurationSeconds
      });
    } catch { }
  } else {
    // Show the initial "phone break" encouragement overlay on first visit
    // only if not already bypassed in this session
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "showOverlay",
        reason: "siteVisit",
        site: matchedSite,
        stats: siteStats,
        breakDuration: settings.breakDurationSeconds
      });
    } catch { }
  }
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
    // User chose to leave the site (not bypass)
    // Optionally navigate away
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
    stats[sitePattern] = { totalSeconds: 0, bypasses: 0, bypassSeconds: 0, overlayActive: false };
  }
  stats[sitePattern].bypasses += 1;
  stats[sitePattern].overlayActive = false;
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

// Keep service worker alive with alarm
chrome.alarms.create("keepAlive", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(() => { /* noop keep-alive */ });
