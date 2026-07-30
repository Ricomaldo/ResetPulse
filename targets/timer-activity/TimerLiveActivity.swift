// TimerLiveActivity.swift — la séance ResetPulse sur l'écran verrouillé et
// dans la Dynamic Island (mission 3d).
//
// CONTRAINTE VÉRIFIÉE (forums Apple 816884/766932) : le camembert Time Timer
// (secteur plein qui se vide) est IMPOSSIBLE à animer par le système en Live
// Activity — un ProgressViewStyle custom fige sur device réel (faux positif
// en simulateur). Design retenu : ANNEAU circulaire système teinté de la
// couleur de séance + emoji au centre + décompte mono. Le camembert reste
// l'app ; l'anneau est son écho.
//
// Zéro i18n dans l'extension : emoji + chiffres + ✨ uniquement — universel.

import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Couleur hex → SwiftUI Color

extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)
        let r, g, b: Double
        if cleaned.count == 6 {
            r = Double((value >> 16) & 0xFF) / 255
            g = Double((value >> 8) & 0xFF) / 255
            b = Double(value & 0xFF) / 255
        } else {
            (r, g, b) = (0.91, 0.59, 0.40) // corail de marque en repli
        }
        self.init(red: r, green: g, blue: b)
    }
}

// MARK: - Vues partagées

/// L'anneau qui se vide, animé PAR LE SYSTÈME (timerInterval) — emoji au
/// centre via currentValueLabel. Marche app tuée, écran verrouillé.
struct TimerRing: View {
    let context: ActivityViewContext<TimerAttributes>
    var emojiSize: CGFloat = 18

    var body: some View {
        ProgressView(
            timerInterval: context.attributes.startDate...context.attributes.endDate,
            countsDown: true
        ) {
            EmptyView()
        } currentValueLabel: {
            Text(context.attributes.emoji)
                .font(.system(size: emojiSize))
        }
        .progressViewStyle(.circular)
        .tint(Color(hex: context.attributes.colorHex))
    }
}

/// Le décompte en chiffres, rendu par le système.
struct TimerCountdown: View {
    let context: ActivityViewContext<TimerAttributes>
    var size: CGFloat = 28

    var body: some View {
        Text(
            timerInterval: context.attributes.startDate...context.attributes.endDate,
            countsDown: true
        )
        .font(.system(size: size, weight: .semibold, design: .monospaced))
        .monospacedDigit()
        .multilineTextAlignment(.trailing)
    }
}

/// Fin de séance : l'emoji compagnon + ✨ — reste affiché quelques minutes
/// (dismissalPolicy .after posée côté module).
struct DoneView: View {
    let context: ActivityViewContext<TimerAttributes>

    var body: some View {
        HStack(spacing: 10) {
            Text(context.attributes.emoji).font(.system(size: 28))
            Text("✨").font(.system(size: 24))
        }
    }
}

// MARK: - La Live Activity

struct TimerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TimerAttributes.self) { context in
            // ---- Écran verrouillé ----
            HStack(spacing: 16) {
                if context.state.status == "done" {
                    DoneView(context: context)
                        .frame(maxWidth: .infinity, alignment: .center)
                } else {
                    TimerRing(context: context, emojiSize: 20)
                        .frame(width: 52, height: 52)
                    Spacer()
                    TimerCountdown(context: context, size: 34)
                }
            }
            .padding(18)
            .activityBackgroundTint(Color(red: 0.957, green: 0.937, blue: 0.906)) // crème #F4EFE7
            .activitySystemActionForegroundColor(Color(hex: context.attributes.colorHex))
        } dynamicIsland: { context in
            DynamicIsland {
                // ---- Île étendue (appui long) ----
                DynamicIslandExpandedRegion(.leading) {
                    TimerRing(context: context, emojiSize: 16)
                        .frame(width: 44, height: 44)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    if context.state.status == "done" {
                        Text("✨").font(.system(size: 24))
                    } else {
                        TimerCountdown(context: context, size: 26)
                            .frame(maxWidth: 96)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    EmptyView()
                }
            } compactLeading: {
                TimerRing(context: context, emojiSize: 10)
            } compactTrailing: {
                if context.state.status == "done" {
                    Text("✨")
                } else {
                    TimerCountdown(context: context, size: 14)
                        .frame(maxWidth: 52)
                }
            } minimal: {
                TimerRing(context: context, emojiSize: 9)
            }
            .keylineTint(Color(hex: context.attributes.colorHex))
        }
    }
}
