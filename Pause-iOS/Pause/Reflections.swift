import SwiftUI

// MARK: - Reflections

struct Reflections {
    static let map: [Reason: [String]] = [
        .relax: [
            "You wanted to unwind. That's a real need.",
            "Rest is important — your phone just isn't always where you'll find it.",
            "Wanting to relax is valid. You already started by pausing here."
        ],
        .escape: [
            "Sometimes reality is heavy. You don't have to carry it all at once.",
            "Wanting a break doesn't make you weak. You just took a real one.",
            "You paused instead of numbing. That matters."
        ],
        .boredom: [
            "Boredom is uncomfortable. You just sat with it for a moment.",
            "Not every empty minute needs filling. You proved that just now.",
            "Your mind wanted stimulation. You gave it stillness instead."
        ],
        .habit: [
            "Muscle memory brought you here. Awareness brought you to this moment.",
            "The loop is strong. But you just interrupted it.",
            "You noticed the pattern. That's the hardest step."
        ]
    ]

    static let completions: [String] = [
        "You did something small and real just now.",
        "That took less than a minute. And it was enough.",
        "You chose presence over noise.",
        "This moment was yours. Not your phone's."
    ]

    static func reflection(for reason: Reason) -> String {
        let pool = map[reason] ?? map[.habit]!
        return pool.randomElement()!
    }

    static func completion() -> String {
        completions.randomElement()!
    }
}
