import SwiftUI

struct GentleButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(Theme.caption)
                .foregroundColor(Theme.foreground)
                .padding(.horizontal, 32)
                .padding(.vertical, 14)
                .background(
                    Capsule()
                        .stroke(Theme.foreground.opacity(0.2), lineWidth: 1)
                )
        }
    }
}

struct TextButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(Theme.small)
                .foregroundColor(Theme.dim)
        }
    }
}

struct ReasonButton: View {
    let reason: Reason
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Text(reason.rawValue)
                    .font(Theme.caption)
                    .foregroundColor(Theme.foreground)
                Spacer()
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Theme.foreground.opacity(0.12), lineWidth: 1)
            )
        }
    }
}

#Preview {
    ZStack {
        Theme.background.ignoresSafeArea()
        VStack(spacing: 20) {
            GentleButton(title: "pause with me") {}
            TextButton(title: "patterns") {}
            ReasonButton(reason: .boredom) {}
        }
        .padding()
    }
}
