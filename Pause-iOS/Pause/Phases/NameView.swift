import SwiftUI

struct NameView: View {
    let onReasonChosen: (Reason) -> Void

    @State private var appeared = false

    var body: some View {
        VStack(spacing: Theme.spacingL) {
            Spacer()

            Text("Why did you reach for it?")
                .font(Theme.bodyFont)
                .foregroundColor(Theme.foreground)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 10)

            VStack(spacing: Theme.spacingS) {
                ForEach(Array(Reason.allCases.enumerated()), id: \.element.id) { index, reason in
                    ReasonButton(reason: reason) {
                        onReasonChosen(reason)
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 12)
                    .animation(
                        Theme.gentleSpring.delay(0.15 + Double(index) * 0.1),
                        value: appeared
                    )
                }
            }
            .padding(.horizontal, Theme.spacingM)

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
        NameView(onReasonChosen: { _ in })
    }
}
