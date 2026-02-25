# Pause.

A small digital tool that interrupts the habit of compulsive phone use.

## What It Does

When you feel the reflexive urge to pick up your phone and scroll, you open **Pause.** instead. It guides you through three slow breaths, then asks one gentle question: *"What were you looking for?"* You choose from six honest options — boredom, anxiety, loneliness, habit, avoidance, or genuine curiosity. The tool reflects your answer back without judgment and logs it privately in your browser. Over time, your patterns become visible to you — not as surveillance, but as self-knowledge.

## The Flow

The tool moves through five phases:

1. **Arrive** — "You picked up your phone. That's okay."
2. **Breathe** — Three guided breath cycles (4s in, 2s hold, 5s out). A soft circle on the canvas breathes with you.
3. **Name** — Six buttons. You name why you reached for your phone.
4. **Reflect** — A warm, non-judgmental reflection of what you named.
5. **Complete** — A warm closing moment that acknowledges what you just did, then lets you go.

A small **"patterns"** link in the corner lets you view your history — a simple tally of what you've named, stored locally in `localStorage`. You can clear it any time.

## Design Principles

- No shame, no streaks, no gamification
- All data stays in localStorage — nothing transmitted
- Has a clear ending — not an endless loop
- Moves at the speed of breath

## Running It

```bash
# Option 1: open the file directly
open index.html

# Option 2: use any local server (e.g. VS Code Live Server, or:)
npx serve .
```

No build step. No dependencies. No accounts. No data leaves your browser.

## Built On

The [Reusable Studio Engine](./docs/SYSTEM_CHARTER.md) — using its canvas module (`setupCanvas`, `loop`), math utilities (`lerp`), and modular structure.

## Philosophy

See the full [Tool Intent Statement](./docs/TOOL_INTENT_STATEMENT.md) for the behavioral thesis, dignity clause, and refusal clause.

**This tool believes that awareness precedes change.** It does not block, restrict, or punish. It believes most compulsive digital behavior is unconscious — and that naming *why* you reached for your phone is enough to break the automaticity.

---

*Interfaces are rituals. Rituals shape behavior. Behavior shapes identity. Design carefully.*