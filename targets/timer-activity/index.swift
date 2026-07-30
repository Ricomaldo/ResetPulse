// index.swift — point d'entrée de l'extension (WidgetBundle).
// Un widget statique d'écran d'accueil (disque au repos + deep link
// « lancer mon rituel favori ») rejoindra ce bundle en second temps —
// même extension, coût marginal (mission 3d, séquence).

import SwiftUI
import WidgetKit

@main
struct TimerActivityBundle: WidgetBundle {
    var body: some Widget {
        TimerLiveActivity()
    }
}
