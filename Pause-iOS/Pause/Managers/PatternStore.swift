import Foundation

// MARK: - Reason

enum Reason: String, CaseIterable, Identifiable {
    case relax = "to relax"
    case escape = "to break from reality"
    case boredom = "bored"
    case habit = "habit"

    var id: String { rawValue }
}

// MARK: - Pattern Store

class PatternStore: ObservableObject {
    @Published var patterns: [String: Int] = [:]
    @Published var totalSessions: Int = 0

    private let patternsKey = "pause_patterns"
    private let totalKey = "pause_total"

    init() {
        load()
    }

    func record(_ reason: Reason) {
        patterns[reason.rawValue, default: 0] += 1
        totalSessions += 1
        save()
    }

    func clear() {
        patterns = [:]
        totalSessions = 0
        UserDefaults.standard.removeObject(forKey: patternsKey)
        UserDefaults.standard.removeObject(forKey: totalKey)
    }

    private func load() {
        if let data = UserDefaults.standard.data(forKey: patternsKey),
           let decoded = try? JSONDecoder().decode([String: Int].self, from: data) {
            patterns = decoded
        }
        totalSessions = UserDefaults.standard.integer(forKey: totalKey)
    }

    private func save() {
        if let data = try? JSONEncoder().encode(patterns) {
            UserDefaults.standard.set(data, forKey: patternsKey)
        }
        UserDefaults.standard.set(totalSessions, forKey: totalKey)
    }
}
