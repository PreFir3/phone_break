import SwiftUI

struct ArriveView: View {
    let onBegin: () -> Void

    @State private var appeared = false

    var body: some View {
        VStack(spacing: Theme.spacingL) {
            Spacer()

            VStack(spacing: Theme.spacingS) {
                Text("You picked up your phone.")
                    .font(Theme.bodyFont)
                    .foregroundColor(Theme.foreground)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 10)

                Text("That's okay.")
                    .font(Theme.caption)
                    .foregroundColor(Theme.dim)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 10)
                    .animation(Theme.gentleSpring.delay(0.3), value: appeared)
            }

            GentleButton(title: "pause with me", action: onBegin)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 10)
                .animation(Theme.gentleSpring.delay(0.6), value: appeared)

            Spacer()
            Spacer()
        }
        .animation(Theme.gentleSpring, value: appeared)
        .onAppear { appeared = true }
    }
}

#Preview {
    ZStack {
        Theme.background.ignoresSafeArea()
        ArriveView(onBegin: {})
    }
}
