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
    // P1-9 (review design) : la couleur de séance rendait pâle/taupe sur la
    // carte crème du lock screen. Vérifié : l'extension n'a pas de bug
    // d'alpha — `colorHex` transmis côté JS (useLiveActivity.js) est
    // toujours `#RRGGBB` (6 hex, jamais d'alpha), le repli `cleaned.count
    // != 6` ne se déclenche donc pas en usage normal. La paleness vient du
    // rendu système : le ProgressView circulaire + les matériaux vibrants
    // du Live Activity désaturent visuellement les tons de la palette de
    // marque. Fix : saturation POUSSÉE ici (une seule fois, à la source),
    // profite aux 3 usages (.tint de l'anneau, activitySystemActionForegroundColor,
    // keylineTint) sans toucher au ProgressViewStyle (fige sur device, cf.
    // tête de fichier). Écart autour de la moyenne des 3 canaux plutôt
    // qu'un aller-retour HSB (UIColor.getHue) : même effet de saturation,
    // moins de surface à erreur de conversion, et la luminosité perçue
    // reste stable (la moyenne ne bouge pas), contrairement à un plancher
    // de luminosité qui aurait poussé vers PLUS de pâleur, pas moins.
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)
        var r, g, b: Double
        if cleaned.count == 6 {
            r = Double((value >> 16) & 0xFF) / 255
            g = Double((value >> 8) & 0xFF) / 255
            b = Double(value & 0xFF) / 255
        } else {
            (r, g, b) = (0.91, 0.59, 0.40) // corail de marque en repli
        }
        let saturationBoost = 1.35
        let luminance = (r + g + b) / 3
        r = min(1, max(0, luminance + (r - luminance) * saturationBoost))
        g = min(1, max(0, luminance + (g - luminance) * saturationBoost))
        b = min(1, max(0, luminance + (b - luminance) * saturationBoost))
        self.init(red: r, green: g, blue: b)
    }
}

// MARK: - Accomplissement

extension ActivityViewContext where Attributes == TimerAttributes {
    /// « Accompli » vu du widget — deux chemins (ADR-018 §③) :
    /// - l'app a parlé : end(done) → status "done" ;
    /// - l'app est suspendue : le système a dépassé staleDate (= endDate,
    ///   posée au start côté module) et re-rend avec `isStale` — l'anneau
    ///   momifié à 0:00 bascule TOUT SEUL, sans réveiller l'app.
    var isDone: Bool {
        state.status == "done" || isStale
    }
}

// MARK: - Vues partagées

/// L'anneau qui se vide, animé PAR LE SYSTÈME (timerInterval) — emoji au
/// centre via currentValueLabel. Marche app tuée, écran verrouillé.
struct TimerRing: View {
    let context: ActivityViewContext<TimerAttributes>
    var emojiSize: CGFloat = 18

    var body: some View {
        // Le ProgressView circulaire système tourne dans un sens fixe (à
        // priori horaire — non vérifié sur device par l'auteur de ce
        // changement, faute de build). Miroir horizontal quand l'app est
        // réglée anti-horaire (timer.clockwise == false, défaut de l'app,
        // convention Time Timer), pour que l'anneau natif suive le disque
        // app. Le Text de l'emoji est contre-miroité pour ne pas apparaître
        // inversé.
        //
        // SI LE SENS OBSERVÉ SUR DEVICE EST L'INVERSE de ce qui précède :
        // un seul `!` à ajouter/retirer ici, sur la ligne juste en dessous
        // (`context.attributes.clockwise == false` → `== true`).
        //
        // ⚠️ À VÉRIFIER SUR DEVICE PAR LE PILOTE (non buildable par l'auteur
        // de ce changement) : que l'anneau ANIME toujours sous ce miroir, pas
        // seulement qu'il pointe dans le bon sens. Ce fichier a un précédent
        // documenté plus haut — un ProgressViewStyle custom fige sur device
        // réel (faux positif en simulateur). .scaleEffect est un mécanisme
        // différent (transform de géométrie posé après .progressViewStyle,
        // pas un style de substitution) donc a priori un risque moindre,
        // mais reste non vérifié. Si l'anneau est figé plutôt qu'inversé, ce
        // .scaleEffect est le premier suspect.
        let shouldMirror = context.attributes.clockwise == false
        ProgressView(
            timerInterval: context.attributes.startDate...context.attributes.endDate,
            countsDown: true
        ) {
            EmptyView()
        } currentValueLabel: {
            Text(context.attributes.emoji)
                .font(.system(size: emojiSize))
                .scaleEffect(x: shouldMirror ? -1 : 1, y: 1)
        }
        .progressViewStyle(.circular)
        .tint(Color(hex: context.attributes.colorHex))
        // Levier supplémentaire si le tint boosté (cf. extension Color plus
        // haut) reste pâle sur device : `.saturation(1.x)` ici, modifier
        // SwiftUI standard (pas un ProgressViewStyle custom, aucun risque
        // de gel). Non ajouté par prudence — empiler deux transforms de
        // couleur non vérifiées sur device en même temps rendrait un
        // éventuel sur-dosage impossible à diagnostiquer. Au pilote de
        // juger le boost seul avant d'ajouter celui-ci.
        .scaleEffect(x: shouldMirror ? -1 : 1, y: 1)
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
                if context.isDone {
                    DoneView(context: context)
                        .frame(maxWidth: .infinity, alignment: .center)
                } else {
                    // Emoji monté d'un cran (P1-9, review design) : 20→26.
                    TimerRing(context: context, emojiSize: 26)
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
                    // Emoji monté d'un cran (P1-9, review design) : 16→20.
                    TimerRing(context: context, emojiSize: 20)
                        .frame(width: 44, height: 44)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    if context.isDone {
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
                // Accompli : l'anneau (0:00 momifié) cède la place. Leading +
                // trailing s'affichent ENSEMBLE en compact → emoji compagnon
                // ici, ✨ en trailing — l'écho mini de DoneView (emoji + ✨),
                // jamais « ✨ ✨ ».
                if context.isDone {
                    Text(context.attributes.emoji).font(.system(size: 12))
                } else {
                    // Emoji monté d'un cran, proportionnel aux surfaces
                    // écran verrouillé/île étendue ci-dessus (P1-9) : 10→13.
                    // Slot compact TRÈS contraint (Dynamic Island) — à
                    // confirmer sur device qu'il ne clippe pas.
                    TimerRing(context: context, emojiSize: 13)
                }
            } compactTrailing: {
                if context.isDone {
                    Text("✨")
                } else {
                    TimerCountdown(context: context, size: 14)
                        .frame(maxWidth: 52)
                }
            } minimal: {
                if context.isDone {
                    Text("✨").font(.system(size: 11))
                } else {
                    // Emoji monté d'un cran, proportionnel (P1-9) : 9→11.
                    // Slot minimal = le plus petit de tous (cercle unique
                    // ~26pt) — priorité device : vérifier le clipping avant
                    // toute couleur.
                    TimerRing(context: context, emojiSize: 11)
                }
            }
            .keylineTint(Color(hex: context.attributes.colorHex))
        }
    }
}
