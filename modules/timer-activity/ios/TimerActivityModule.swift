// TimerActivityModule.swift — pont Expo Modules API vers ActivityKit
// (mission 3d). Trois fonctions : isSupported / start / end. Pas de push,
// pas d'App Group : tout part de l'app au premier plan (Activity.request).

import ActivityKit
import ExpoModulesCore

// ⚠️ DUPLICATION ASSUMÉE de targets/timer-activity/TimerAttributes.swift
// (pas de partage de code simple entre l'extension et le module — piège
// documenté). Les deux définitions DOIVENT rester identiques : ActivityKit
// apparie l'activité par la forme encodée des attributs.
struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: String
    }

    var colorHex: String
    var emoji: String
    var startDate: Date
    var endDate: Date
}

public class TimerActivityModule: Module {
    public func definition() -> ModuleDefinition {
        Name("TimerActivity")

        /// Live Activities dispo ET autorisées par l'utilisateur pour l'app.
        Function("isSupported") { () -> Bool in
            if #available(iOS 16.2, *) {
                return ActivityAuthorizationInfo().areActivitiesEnabled
            }
            return false
        }

        /// Démarre la Live Activity de séance. Termine d'abord toute
        /// activité orpheline (une seule séance à la fois — miroir de
        /// l'app). Retourne l'id, ou nil si indisponible.
        AsyncFunction("start") { (colorHex: String, emoji: String, durationSeconds: Double) -> String? in
            guard #available(iOS 16.2, *) else { return nil }
            guard ActivityAuthorizationInfo().areActivitiesEnabled else { return nil }

            for activity in Activity<TimerAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }

            let now = Date()
            let attributes = TimerAttributes(
                colorHex: colorHex,
                emoji: emoji,
                startDate: now,
                endDate: now.addingTimeInterval(durationSeconds)
            )
            let content = ActivityContent(
                state: TimerAttributes.ContentState(status: "running"),
                staleDate: nil
            )
            do {
                let activity = try Activity.request(attributes: attributes, content: content)
                return activity.id
            } catch {
                // Refus système (réglage user, budget…) : la séance vit
                // très bien sans son écho — jamais bloquant.
                return nil
            }
        }

        /// Termine la (les) activité(s). done=true → état « accompli ✨ »
        /// affiché ~3 min puis retiré ; done=false (rembobinage) → retrait
        /// immédiat.
        AsyncFunction("end") { (done: Bool) in
            guard #available(iOS 16.2, *) else { return }
            for activity in Activity<TimerAttributes>.activities {
                if done {
                    let content = ActivityContent(
                        state: TimerAttributes.ContentState(status: "done"),
                        staleDate: nil
                    )
                    await activity.end(content, dismissalPolicy: .after(Date(timeIntervalSinceNow: 180)))
                } else {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
            }
        }
    }
}
