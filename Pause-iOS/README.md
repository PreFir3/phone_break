// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXGroup section */
		ROOT = {
			isa = PBXGroup;
			children = (
				PAUSE_GROUP,
			);
			sourceTree = "<group>";
		};
		PAUSE_GROUP = {
			isa = PBXGroup;
			children = (
			);
			path = Pause;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

	};
	rootObject = ROOT;
}

# Pause. — iOS App (v1)

A SwiftUI breathing interruption tool that helps break compulsive phone checking.

## Setup

1. Open **Xcode** → File → New → Project → **App**
2. Name it `Pause`, set interface to **SwiftUI**, language **Swift**
3. Replace the generated files with the ones in this `Pause/` folder
4. Build & run on a real device or simulator

## File Structure

```
Pause/
├── PauseApp.swift              # App entry point
├── ContentView.swift           # Phase router + transitions
├── Theme.swift                 # Colors, fonts, spacing, animation curves
├── Reflections.swift           # Copy text for reflections + completions
├── Components/
│   ├── BreathCircle.swift      # Animated glowing breath circle
│   └── Buttons.swift           # GentleButton, TextButton, ReasonButton
├── Phases/
│   ├── ArriveView.swift        # "You picked up your phone."
│   ├── BreatheView.swift       # 3 guided breath cycles
│   ├── NameView.swift          # Reason selection
│   ├── ReflectView.swift       # Non-judgmental reflection
│   ├── CompleteView.swift      # Completion + auto-fade
│   └── PatternsView.swift      # Usage pattern history
└── Managers/
    ├── BreathManager.swift     # Breath cycle timing (60fps)
    └── PatternStore.swift      # UserDefaults persistence
```

## Flow

Arrive → Breathe (3 cycles) → Name → Reflect → Complete → Auto-fade out

## v2 Roadmap

- [ ] Shortcuts automation setup walkthrough
- [ ] Live Activities timer in Dynamic Island
- [ ] Deep-link back to original app after timer selection
- [ ] Screen Time API integration (shields + auto-lock)

## Design

- Soft warm tones on near-black background
- Serif typography, spacious layout
- Spring animations throughout
- No gamification, no shame, no streaks
