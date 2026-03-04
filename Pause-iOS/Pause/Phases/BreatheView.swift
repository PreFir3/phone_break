import SwiftUI

struct BreatheView: View {
    @ObservedObject var breathManager: BreathManager
    let onFinished: () -> Void

    @State private var appeared = false

    var body: some View {
        VStack(spacing: Theme.spacingL) {
            Spacer()

            ZStack {
                BreathCircle(progress: breathManager.progress)

                VStack(spacing: Theme.spacingS) {
                    Text(breathManager.step.rawValue)
                        .font(Theme.bodyFont)
                        .foregroundColor(Theme.foreground)
                        .animation(.easeInOut(duration: 0.4), value: breathManager.step)

                    Text("\(breathManager.cycle) of \(breathManager.totalCycles)")
                        .font(Theme.small)
                        .foregroundColor(Theme.dim)
                }
            }

            Spacer()
            Spacer()
        }
        .opacity(appeared ? 1 : 0)
        .animation(Theme.fadeIn, value: appeared)
        .onAppear {
            appeared = true
            breathManager.start()
        }
        .onDisappear {
            breathManager.stop()
        }
        .onChange(of: breathManager.isFinished) { _, finished in
            if finished {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                    onFinished()
                }
            }
        }
    }
}

#Preview {
    ZStack {
        Theme.background.ignoresSafeArea()
        BreatheView(breathManager: BreathManager(), onFinished: {})
    }
}
