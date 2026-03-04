import SwiftUI

struct PatternsView: View {
    @ObservedObject var store: PatternStore
    let onBack: () -> Void

    @State private var appeared = false

    var sortedPatterns: [(String, Int)] {
        store.patterns.sorted { $0.value > $1.value }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingL) {
            Spacer()

            Text("Your patterns")
                .font(Theme.bodyFont)
                .foregroundColor(Theme.foreground)
                .padding(.horizontal, Theme.spacingL)

            if sortedPatterns.isEmpty {
                Text("nothing yet.")
                    .font(Theme.caption)
                    .foregroundColor(Theme.dim)
                    .padding(.horizontal, Theme.spacingL)
            } else {
                VStack(spacing: 0) {
                    ForEach(sortedPatterns, id: \.0) { reason, count in
                        HStack {
                            Text(reason)
                                .font(Theme.caption)
                                .foregroundColor(Theme.foreground.opacity(0.7))
                            Spacer()
                            Text("\(count)")
                                .font(Theme.caption)
                                .foregroundColor(Theme.dim)
                        }
                        .padding(.horizontal, Theme.spacingL)
                        .padding(.vertical, Theme.spacingS)

                        Divider()
                            .background(Theme.foreground.opacity(0.06))
                    }
                }
            }

            HStack(spacing: Theme.spacingM) {
                TextButton(title: "clear everything") {
                    store.clear()
                }
                TextButton(title: "back", action: onBack)
            }
            .padding(.horizontal, Theme.spacingL)

            Spacer()
            Spacer()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .opacity(appeared ? 1 : 0)
        .animation(Theme.fadeIn, value: appeared)
        .onAppear { appeared = true }
    }
}

#Preview {
    ZStack {
        Theme.background.ignoresSafeArea()
        PatternsView(store: PatternStore(), onBack: {})
    }
}
