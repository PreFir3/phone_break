# AI Collaboration Record

## Project
- Repo: reusable-studio-engine
- Deployed link: https://github.com/PreFir3/reusable-studio-enginereusable-studio-engine
- Date started: February 19, 2026

## My constraints (before any AI)
- Intent (1 sentence): To create a filler UI for my new studio engine
- Constraints (3): Do not make it look boring, add color but not too much, add animations.
- Tension (1): Want it to be smooth and sci-fi
- Taste vow (1): Will not feel generic

---

## Entry Log

### Entry 01 — February 19, 2026
**My next move (write before AI):**
- I want to create a sci-fi hacking filler UI for this project

**Files touched:**
- input.js
- index.html
- style.css
- math.js

**Copilot prompt (paste exact prompt):**
- I want to build a placeholder for what my final project will be. It has to have some element of motion, I am thinking of making some sci-fi code looking background and the letters jumble and move upon your cursor moving. If the cursor does not move then the letters will have some changing animation like in the gifs and movies.

**Copilot output (summarize in 3–6 bullets):**
- Gave me a basic Chinese-looking website, not super sci-fi
- I then gave it a prompt to fix it and the theme became more hacker looking
- The UI was interactable

**My translation (what changed and why):**
- The UI became old looking and was unimpressive, then after the second prompt it became a very nice placeholder UI.

**Signal / Noise:**
- Signal: The UI was pretty clean
- Noise: The animation was shaky and it had a bit too much going on in the background.

**Next right action (one sentence):**
- Make smoother animations.

---

### Entry 02 — February 23, 2026
**My next move (write before AI):**
- Set up the full file structure so the project is organized before building more features

**Files touched:**
- Created: src/canvas/setupCanvas.js, src/canvas/loop.js, src/input/input.js, src/utils/math.js
- Created: docs/SYSTEM_CHARTER.md, docs/ROADMAP.md, docs/PROMPTS.md
- Created: process/changelog.md, assets/, process/screenshots/

**Copilot prompt (paste exact prompt):**
- Make me this file structure in VS code (with attached screenshot of directory tree)

**Copilot output (summarize in 3–6 bullets):**
- Provided the full directory tree matching my screenshot
- Gave me terminal commands to create all folders and empty files
- Organized source code into canvas/, input/, and utils/ subfolders
- Included docs and process folders for documentation

**My translation (what changed and why):**
- The project went from a flat mess of files to a clean modular structure. This makes it easier to find things and scale later.

**Signal / Noise:**
- Signal: The folder structure matched exactly what I wanted and was easy to set up
- Noise: None — straightforward scaffolding task

**Next right action (one sentence):**
- Fill the empty source files with actual code for the matrix background.

---

### Entry 03 — February 23, 2026
**My next move (write before AI):**
- Get the actual matrix rain code working across the modular file structure

**Files touched:**
- index.html, style.css, main.js
- src/canvas/setupCanvas.js, src/canvas/loop.js
- src/input/input.js, src/utils/math.js

**Copilot prompt (paste exact prompt):**
- can you code that for me?

**Copilot output (summarize in 3–6 bullets):**
- Built a full Matrix-style rain animation using canvas
- Added Japanese katakana, numbers, and symbols as the character set
- Created a glitch CSS effect on the title with red/cyan color shifts
- Characters randomly swap while idle for a shimmer effect
- Mouse movement speeds up nearby columns and scrambles characters
- Modularized code across setupCanvas.js, loop.js, input.js, and math.js

**My translation (what changed and why):**
- The project went from empty files to a fully working sci-fi placeholder. The modular imports worked cleanly. Had to use Live Server instead of opening the file directly because ES modules need HTTP.

**Signal / Noise:**
- Signal: The full animation system worked out of the box with clean module separation
- Noise: The glitch effect on the title was too flashy and the color shifting felt distracting

**Next right action (one sentence):**
- Fix the Live Server issue where it shows a file listing instead of the page.

---

### Entry 04 — February 23, 2026
**My next move (write before AI):**
- Fix the Live Server showing a file directory instead of loading index.html directly

**Files touched:**
- No code files changed — VS Code settings adjustment

**Copilot prompt (paste exact prompt):**
- wow that looks great, only question. When I first go in it just has a ~ and then makes me click on a file image then when I click that file it takes me to the page, any ideas on fixes?

**Copilot output (summarize in 3–6 bullets):**
- Identified the issue as Live Server serving from the wrong root directory
- Suggested opening the inner folder directly in VS Code
- Provided a VS Code settings option to set liveServer.settings.root
- Also suggested flattening the nested folder structure as a long-term fix

**My translation (what changed and why):**
- Opened the correct inner folder in VS Code so Live Server finds index.html at the root. Simple config fix, no code changes needed.

**Signal / Noise:**
- Signal: Correctly diagnosed the nested folder problem immediately
- Noise: None — all three suggested fixes were valid

**Next right action (one sentence):**
- Clean up the header and add a real click interaction since mouse tracking isn't working.

---

### Entry 05 — February 23, 2026
**My next move (write before AI):**
- Make the header more professional, remove the color-shifting glitch, and add a click-based interaction

**Files touched:**
- index.html, style.css, main.js, src/input/input.js

**Copilot prompt (paste exact prompt):**
- I need for the project though one element of user interaction and the mouse movement doesn't work, any ideas. Also keep the current letters and style of those but change the main header and font to be more professional and remove the moving color.

**Copilot output (summarize in 3–6 bullets):**
- Swapped the header font to Inter (Google Fonts) — clean white text with subtle green glow
- Removed the glitch CSS animation and red/cyan color shifts entirely
- Added a click-to-ripple interaction: clicking sends an expanding ring that scrambles letters
- Added a click counter display ("DISRUPTIONS: 0")
- Added touch support for mobile devices
- Updated the subtitle to guide users: "CLICK ANYWHERE TO INTERACT"

**My translation (what changed and why):**
- The page now feels polished instead of chaotic. The header reads as professional while the background stays sci-fi. The ripple click gives a satisfying interaction that's easy to demonstrate. Removed mouse tracking code since it wasn't functioning.

**Signal / Noise:**
- Signal: The ripple mechanic is visually impressive and works as a clear user interaction element
- Noise: None — the changes were exactly what I asked for

**Next right action (one sentence):**
- Create the AI Collaboration Record documentation to track the build process.

---

### Entry 06 — February 23, 2026
**My next move (write before AI):**
- Create the AI_COLLABORATION_RECORD.md and understand what each field means

**Files touched:**
- docs/AI_COLLABORATION_RECORD.md

**Copilot prompt (paste exact prompt):**
- make this file /docs/AI_COLLABORATION_RECORD.md (with template), then asked: what is the tension and taste vow

**Copilot output (summarize in 3–6 bullets):**
- Created the markdown file with the full template structure
- Explained that "tension" is the core tradeoff you're navigating (e.g., complex background vs. clean UI)
- Explained that "taste vow" is a single aesthetic promise you won't break
- Provided example tensions and taste vows for reference
- Suggested project-specific examples based on the work done so far

**My translation (what changed and why):**
- Filled in the constraints section with my own words. The tension and taste vow helped me articulate what I actually care about in this project — smooth sci-fi feel without looking generic. This doc now serves as a full record of every AI interaction during the build.

**Signal / Noise:**
- Signal: The explanations were clear and the examples helped me write my own
- Noise: None — documentation task was straightforward

**Next right action (one sentence):**
- Polish the final site, push to GitHub, and submit the deployed link for review.