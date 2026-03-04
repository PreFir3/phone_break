import SwiftUI

struct BreathCircle: View {
    var progress: CGFloat // 0 = small, 1 = large
    var ambient: Bool = false

    private let minRadius: CGFloat = 40
    private let maxRadius: CGFloat = 140

    private var radius: CGFloat {
        ambient ? minRadius : minRadius + (maxRadius - minRadius) * progress
    }

    var body: some View {
        ZStack {
            // Outer glow
            Circle()
                .fill(
                    RadialGradient(
                        gradient: Gradient(colors: [
                            Theme.foreground.opacity(ambient ? 0.03 : 0.06),
                            Color.clear
                        ]),
                        center: .center,
                        startRadius: radius * 0.5,
                        endRadius: radius * 1.8
                    )
                )
                .frame(width: radius * 3, height: radius * 3)

            // Main circle
            Circle()
                .fill(Theme.foreground.opacity(ambient ? 0.05 : 0.10))
                .frame(width: radius * 2, height: radius * 2)

            // Inner bright core
            Circle()
                .fill(Theme.foreground.opacity(ambient ? 0.03 : 0.08))
                .frame(width: radius * 1.2, height: radius * 1.2)
        }
        .animation(ambient ? .easeInOut(duration: 3) : Theme.breathSpring, value: progress)
    }
}

#Preview {
    ZStack {
        Theme.background.ignoresSafeArea()
        BreathCircle(progress: 0.5)
    }
}
