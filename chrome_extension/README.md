# Phone Break – Chrome Extension 📱

A mindful browsing Chrome extension that helps you take breaks from distracting websites.

## Features

- **🌐 URL-based triggers** – Configure which sites trigger the overlay (YouTube, Reddit, Twitter, etc.)
- **📱 Full-page overlay** – Beautiful animated overlay covers the entire page with a breathing exercise
- **⏱️ Time limits** – Set per-site daily time limits; overlay triggers automatically when exceeded
- **🔓 Bypass tracking** – After a cooldown, users can bypass the overlay; all bypasses are tracked
- **📊 Stats dashboard** – See time spent, bypass count, and bypass time per site
- **📅 Historical data** – View today, this week, or all-time statistics
- **⚙️ Configurable** – Adjust break duration, add/remove sites, set time limits

## Installation

1. **Generate icons** (optional, extension works without custom icons):
   - Open `generate_icons.html` in a browser, download the PNGs, and place them in `icons/`
   - OR if you have Node.js + `canvas` package: `npm install canvas && node create_icons.js`
   - OR just create simple 16x16, 48x48, and 128x128 PNG files named `icon16.png`, `icon48.png`, `icon128.png` in the `icons/` folder

2. **Load in Chrome**:
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select this `chrome_extension` folder

3. **Configure**:
   - Click the extension icon in the toolbar
   - Add/remove tracked sites in the **Sites** tab
   - Set time limits per site
   - Adjust break duration in **Settings**
   - View stats in the **Stats** tab or open the **Full Dashboard**

## How It Works

1. When you visit a tracked site, a full-page overlay appears encouraging you to take a break
2. A breathing exercise plays while a countdown timer runs
3. After the cooldown (default 30s), a "Continue Anyway" button becomes available
4. If you bypass, the bypass is recorded along with how much time you spend after
5. If you set a time limit and exceed it, the overlay re-appears
6. The "Leave Site" button redirects you to Google

## File Structure

```
chrome_extension/
├── manifest.json        # Extension manifest
├── background.js        # Service worker (time tracking, URL monitoring)
├── content.js           # Content script (overlay injection)
├── content.css          # Overlay styles
├── popup.html/js/css    # Extension popup (settings, sites, quick stats)
├── dashboard.html/js/css # Full analytics dashboard
└── icons/               # Extension icons
```

## Tips

- Set realistic time limits – start generous and tighten over time
- The bypass count is a great awareness tool – just seeing the number helps!
- Check the dashboard weekly to see your trends
- The breathing exercise during the cooldown is actually good for you 🧘
