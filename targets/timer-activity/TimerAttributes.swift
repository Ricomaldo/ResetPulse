// TimerAttributes.swift — le contrat de données de la Live Activity.
// ⚠️ DUPLIQUÉ dans modules/timer-activity/ios/TimerActivityModule.swift
// (pas de partage de code simple entre l'extension et le module Expo —
// piège documenté). Toute modification ici DOIT être répliquée là-bas.
//
// Règle d'or (décompte animé par le système, zéro update, zéro batterie) :
// startDate/endDate FIXES posées au lancement — jamais un temps écoulé
// mutable. Budget ActivityKit 4 KB : on est à quelques centaines d'octets.

import ActivityKit
import Foundation

struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// "running" pendant la séance, "done" à l'accomplissement.
        var status: String
    }

    /// Couleur de la séance (hex, ex. "#E89665") — la couleur du rituel.
    var colorHex: String
    /// L'emoji compagnon de l'Activité.
    var emoji: String
    /// Bornes fixes de la séance — le système anime le décompte tout seul.
    var startDate: Date
    var endDate: Date
}
