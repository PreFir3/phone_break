import SwiftUI

struct CompleteView: View {
    let text: String
    let totalSessions: Int
    let onFadeOut: () -> Void

    @State private var appeared = false
    @State private var showSub = false

    private var subText: String {
        totalSessions > 1
            ? "You've paused \(totalSessions) times now. Each one counted."
            : "Your first pause. That's something."
    }

    var body: some View {
        VStack(spacing: Theme.spacingM) {
            Spacer()

            Text(text)
                .font(Theme.titleFont)
                .foregroundColor(Theme.foreground)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.spacingL)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 10)

            Text(subText)
                .font(Theme.caption)
                .foregroundColor(Theme.dim)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.spacingL)
                .opacity(showSub ? 1 : 0)
                .offset(y: showSub ? 0 : 6)

            Spacer()

            GentleButton(title: "close", action: onFadeOut)
                .opacity(showSub ? 1 : 0)
                .animation(Theme.gentleSpring.delay(0.3), value: showSub)

            Spacer()
        }
        .animation(Theme.slowSpring, value: appeared)
        .animation(Theme.slowSpring, value: showSub)
        .onAppear {
            appeared = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                showSub = true
            }
            // Auto-fade after 5 seconds if user doesn't tap close
            DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
                onFadeOut()
            }
        }
    }
}

#Preview {
    ZStack {
        Theme.background.ignoresSafeArea()
        CompleteView(text: "You chose presence over noise.", totalSessions: 3, onFadeOut: {})
    }
}
