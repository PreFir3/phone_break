import SwiftUI

// MARK: - App Phase

enum AppPhase: Equatable {
    case arrive
    case breathe
    case name
    case reflect(text: String)
    case complete(text: String)
    case patterns
    case fadingOut
}

// MARK: - Content View

struct ContentView: View {
    @StateObject private var breathManager = BreathManager()
    @StateObject private var patternStore = PatternStore()

    @State private var phase: AppPhase = .arrive
    @State private var screenOpacity: Double = 1.0
    @State private var showPatternsLink = true

    var body: some View {
        ZStack {
            // Background
            Theme.background.ignoresSafeArea()

            // Ambient circle (visible on non-breathe phases)
            if phase != .breathe {
                BreathCircle(progress: 0.2, ambient: true)
                    .transition(.opacity)
            }

            // Phase content
            Group {
                switch phase {
                case .arrive:
                    ArriveView {
                        withAnimation(Theme.gentleSpring) {
                            phase = .breathe
                        }
                    }

                case .breathe:
                    BreatheView(breathManager: breathManager) {
                        withAnimation(Theme.gentleSpring) {
                            phase = .name
                        }
                    }

                case .name:
                    NameView { reason in
                        patternStore.record(reason)
                        let text = Reflections.reflection(for: reason)
                        withAnimation(Theme.gentleSpring) {
                            phase = .reflect(text: text)
                        }
                    }

                case .reflect(let text):
                    ReflectView(text: text) {
                        let compText = Reflections.completion()
                        withAnimation(Theme.gentleSpring) {
                            phase = .complete(text: compText)
                        }
                    }

                case .complete(let text):
                    CompleteView(
                        text: text,
                        totalSessions: patternStore.totalSessions
                    ) {
                        fadeOutAndReset()
                    }

                case .patterns:
                    PatternsView(store: patternStore) {
                        withAnimation(Theme.gentleSpring) {
                            phase = .arrive
                            showPatternsLink = true
                        }
                    }

                case .fadingOut:
                    EmptyView()
                }
            }
            .transition(.asymmetric(
                insertion: .opacity.combined(with: .offset(y: 8)),
                removal: .opacity
            ))

            // Patterns link (bottom-right)
            if showPatternsLink && phase == .arrive {
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        TextButton(title: "patterns") {
                            withAnimation(Theme.gentleSpring) {
                                phase = .patterns
                                showPatternsLink = false
                            }
                        }
                        .padding(Theme.spacingM)
                    }
                }
            }
        }
        .opacity(screenOpacity)
    }

    private func fadeOutAndReset() {
        withAnimation(.easeIn(duration: 2.0)) {
            screenOpacity = 0
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.2) {
            phase = .arrive
            showPatternsLink = true
            withAnimation(.easeOut(duration: 0.6)) {
                screenOpacity = 1
            }
        }
    }
}

#Preview {
    ContentView()
}
