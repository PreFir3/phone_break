import SwiftUI
import Combine

// MARK: - Breath Phase

enum BreathStep: String {
    case breatheIn = "breathe in"
    case hold = "hold"
    case breatheOut = "breathe out"
    case done = ""
}

// MARK: - Breath Manager

class BreathManager: ObservableObject {
    @Published var step: BreathStep = .breatheIn
    @Published var cycle: Int = 0
    @Published var progress: CGFloat = 0 // 0 = contracted, 1 = expanded
    @Published var isFinished: Bool = false

    let totalCycles = 3

    private let breathIn: Double = 4.0
    private let holdTime: Double = 2.0
    private let breathOut: Double = 5.0

    private var timer: AnyCancellable?
    private var elapsed: Double = 0
    private var lastTick: Date = Date()

    func start() {
        cycle = 0
        step = .breatheIn
        progress = 0
        isFinished = false
        elapsed = 0
        lastTick = Date()

        timer = Timer.publish(every: 1.0 / 60.0, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.tick()
            }
    }

    func stop() {
        timer?.cancel()
        timer = nil
    }

    private func tick() {
        let now = Date()
        let dt = now.timeIntervalSince(lastTick)
        lastTick = now
        elapsed += dt

        switch step {
        case .breatheIn:
            progress = min(CGFloat(elapsed / breathIn), 1.0)
            if elapsed >= breathIn {
                step = .hold
                elapsed = 0
            }
        case .hold:
            progress = 1.0
            if elapsed >= holdTime {
                step = .breatheOut
                elapsed = 0
            }
        case .breatheOut:
            progress = max(1.0 - CGFloat(elapsed / breathOut), 0.0)
            if elapsed >= breathOut {
                cycle += 1
                if cycle >= totalCycles {
                    step = .done
                    isFinished = true
                    stop()
                } else {
                    step = .breatheIn
                    elapsed = 0
                }
            }
        case .done:
            break
        }
    }
}
