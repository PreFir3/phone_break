import SwiftUI

struct ReflectView: View {
    let text: String
    let onComplete: () -> Void

    @State private var appeared = false
    @State private var showSub = false

    var body: some View {
        VStack(spacing: Theme.spacingM) {
            Spacer()

            Text(text)
                .font(Theme.bodyFont)
                .foregroundColor(Theme.foreground)
                .multilineTextAlignment(.center)
                .lineSpacing(6)
                .padding(.horizontal, Theme.spacingL)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 10)

            Text("sit with that for a moment.")
                .font(Theme.caption)
                .foregroundColor(Theme.dim)
                .opacity(showSub ? 1 : 0)
                .offset(y: showSub ? 0 : 6)

            Spacer()
            Spacer()
        }
        .animation(Theme.slowSpring, value: appeared)
        .animation(Theme.slowSpring, value: showSub)
        .onAppear {
            appeared = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                showSub = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) {
                onComplete()
            }
        }
    }
}

#Preview {
    ZStack {
        Theme.background.ignoresSafeArea()
        ReflectView(text: "Boredom is uncomfortable. You just sat with it for a moment.", onComplete: {})
    }
}
