import SwiftUI

// MARK: - Theme

struct Theme {
    // Colors
    static let background = Color(red: 0.10, green: 0.10, blue: 0.10)
    static let foreground = Color(red: 0.83, green: 0.81, blue: 0.77)
    static let dim = Color(red: 0.83, green: 0.81, blue: 0.77).opacity(0.45)
    static let subtle = Color(red: 0.83, green: 0.81, blue: 0.77).opacity(0.15)
    static let circleGlow = Color(red: 0.83, green: 0.81, blue: 0.77).opacity(0.12)

    // Typography
    static let titleFont = Font.system(.title, design: .serif)
    static let bodyFont = Font.system(.title3, design: .serif)
    static let caption = Font.system(.body, design: .serif)
    static let small = Font.system(.footnote, design: .serif)

    // Spacing
    static let spacingXL: CGFloat = 48
    static let spacingL: CGFloat = 32
    static let spacingM: CGFloat = 20
    static let spacingS: CGFloat = 12

    // Animation
    static let gentleSpring = Animation.spring(response: 0.8, dampingFraction: 0.85)
    static let slowSpring = Animation.spring(response: 1.2, dampingFraction: 0.9)
    static let breathSpring = Animation.spring(response: 1.6, dampingFraction: 0.7)
    static let fadeIn = Animation.easeOut(duration: 0.6)
    static let fadeOut = Animation.easeIn(duration: 0.5)
}
