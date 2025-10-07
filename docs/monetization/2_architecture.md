⏺ 📊 Analyse Architecture ResetPulse - Intégration RevenueCat Freemium

🎯 Résumé Exécutif

Architecture solide avec patterns de limitation déjà en place.
L'intégration RevenueCat sera fluide avec quelques ajustements mineurs.
Les conditionnements existants sont cohérents mais centralisés via une
fonction test (isTestPremium()) à remplacer par RevenueCat.

---

1️⃣ PATTERNS DE LIMITATION EXISTANTS

✅ Points Forts - Patterns Consistants

Localisation des vérifications (3 composants principaux):

1. PaletteCarousel.jsx (lignes 31, 78-87)
   const isPremiumUser = isTestPremium();
   if (!paletteInfo.isPremium || isPremiumUser) { /_ allow _/ }
2. ActivityCarousel.jsx (lignes 27, 109-113, 278)
   const isPremiumUser = isTestPremium();
   const isLocked = activity.isPremium && !isPremiumUser;
   if (isLocked) { haptics.warning(); return; }
3. SettingsModal.jsx (lignes 50, 513-514, 677)
   const isPremiumUser = isTestPremium();
   const isLocked = isPalettePremium(paletteName) && !isPremiumUser;

Pattern UX cohérent:

- 🔒 Icône lock badge sur items premium
- Opacité réduite (0.4-0.6) pour items verrouillés
- Scroll-back automatique si tentative d'accès premium
  (PaletteCarousel:82-87)
- Feedback haptique warning() sur tap (ActivityCarousel:110)

📦 Configuration Centralisée

timerPalettes.js - 3 palettes gratuites / 12 premium:
classique: { isPremium: false } // ✅ Gratuit
softLaser: { isPremium: false } // ✅ Gratuit
terre: { isPremium: false } // ✅ Gratuit
tropical: { isPremium: true } // 🔒 Premium
// ... 11 autres palettes premium

activities.js - 4 activités gratuites / 12 premium:
none: { isPremium: false } // ✅ Gratuit (Basique)
work: { isPremium: false } // ✅ Gratuit (Pomodoro)
break: { isPremium: false } // ✅ Gratuit
reading: { isPremium: false } // ✅ Gratuit
sport: { isPremium: true } // 🔒 Premium
// ... 11 autres activités premium

⚠️ Note: Objectif freemium = 2 palettes + 3 activités gratuites,
actuellement 3 palettes + 4 activités. À ajuster.

---

2️⃣ STRUCTURE GESTION D'ÉTAT

Context API - Architecture en Couches

App.js
├── ThemeProvider (racine)
│ ├── OnboardingProvider
│ │ └── AppContent
│ │ └── TimerPaletteProvider
│ │ └── TimerScreen
│ │ └── TimerOptionsProvider (dans TimerScreen)

Contexts identifiés:

1. ThemeProvider (src/theme/ThemeProvider.jsx)


    - Gère light/dark mode
    - Tokens design (spacing, colors, shadows)
    - Pas de logique premium ici

2. TimerPaletteProvider (src/contexts/TimerPaletteContext.jsx)


    - Palette active + couleurs disponibles
    - getAvailablePalettes(isPremiumUser) - prêt pour RevenueCat ✅
    - Déjà paramétré pour recevoir un flag premium

3. TimerOptionsProvider (src/contexts/TimerOptionsContext.jsx)


    - Options timer (pulse, activities, clockwise, etc.)
    - Pas de logique premium directe
    - Utilisé par SettingsModal et ActivityCarousel

4. OnboardingProvider (src/components/onboarding/OnboardingController.jsx)


    - Gestion du premier lancement
    - Indépendant du premium

Hooks Personnalisés

- usePersistedState (src/hooks/usePersistedState.js) - AsyncStorage simple
- usePersistedObject - Objet complet persisté (utilisé par TimerOptions)
- useTimer (src/hooks/useTimer.js) - Logique timer
- useSimpleAudio, useDialOrientation, useNotificationTimer

Aucun hook premium n'existe actuellement.

---

3️⃣ POINTS D'INJECTION OPTIMAUX POUR REVENUECATPROVIDER

🎯 Recommandation: Position Stratégique

Option A - Injection après ThemeProvider (RECOMMANDÉ ✅):

// App.js
<ErrorBoundary>
<ThemeProvider>
<RevenueCatProvider> {/_ 👈 ICI _/}
<OnboardingProvider>
<AppContent />
</OnboardingProvider>
</RevenueCatProvider>
</ThemeProvider>
</ErrorBoundary>

Avantages:

- ✅ Disponible dans tous les composants enfants
- ✅ Accès au theme via useTheme() dans RevenueCatProvider (paywall UI)
- ✅ Ne pollue pas la racine (ErrorBoundary reste outermost)
- ✅ Onboarding peut déjà accéder au statut premium si besoin

Option B - Injection au niveau AppContent (Alternative):

// App.js - AppContent()
<Animated.View>
<RevenueCatProvider> {/_ 👈 Ou ici _/}
<TimerPaletteProvider>
<TimerScreen />
</TimerPaletteProvider>
</RevenueCatProvider>
</Animated.View>

Inconvénient: Onboarding ne pourrait pas accéder au statut premium (pas
critique).

---

4️⃣ DETTES TECHNIQUES & INCOHÉRENCES

🚨 Problèmes Critiques à Résoudre AVANT RevenueCat

A) testMode.js - Source de Vérité Temporaire

Fichier: src/config/testMode.js
export const TEST_MODE = true; // 🔥 HARD-CODED
export const isTestPremium = () => TEST_MODE;

Problème:

- ❌ Fonction globale appelée partout (3 composants + 1 config)
- ❌ Pas de gestion de cache/memoization
- ❌ Remplacer par useRevenueCat() nécessitera 4 fichiers modifiés

Solution:
// Créer un hook custom
const usePremiumStatus = () => {
const { entitlements } = useRevenueCat();
return entitlements.active['pro'] !== undefined;
};

// Remplacer dans les 3 composants:
// const isPremiumUser = isTestPremium(); ❌
// const isPremiumUser = usePremiumStatus(); ✅

B) Incohérence Freemium Config vs. Objectif

Objectif: 2 palettes + 3 activités gratuitesActuel: 3 palettes + 4
activités gratuites

Impact:

- ⚠️ Faut-il restreindre avant ou pendant l'intégration RevenueCat?
- ⚠️ Risque de friction utilisateur si restriction post-lancement

Recommandation:

1. Décider maintenant quelle palette/activité retirer
2. Modifier timerPalettes.js et activities.js AVANT RevenueCat
3. Tester l'expérience freemium avec TEST_MODE = false

Suggestion:
// timerPalettes.js - Passer "classique" en premium?
classique: { isPremium: true } // Garder "terre" + "softLaser" gratuits

// activities.js - Passer "reading" en premium?
reading: { isPremium: true } // Garder "none" + "work" + "break"

C) Context Nesting - Légère Complexité

Problème:

- TimerOptionsProvider est à l'intérieur de TimerScreen (ligne non
  visible, mais déduit)
- Devrait être au même niveau que TimerPaletteProvider pour cohérence

Impact:

- ⚠️ Si RevenueCatProvider est au-dessus de TimerScreen, OK
- ⚠️ Mais structure moins claire pour futurs devs

Recommandation (non-bloquant):
// App.js - AppContent
<TimerPaletteProvider>
<TimerOptionsProvider> {/_ Remonter ici _/}
<TimerScreen />
</TimerOptionsProvider>
</TimerPaletteProvider>

D) Helpers Premium - Duplication Logique

Fichiers:

- timerPalettes.js: getAllPalettes(isPremiumUser)
- TimerPaletteContext.jsx: getAvailablePalettes(isPremiumUser)

Problème:

- ❌ Deux fonctions font la même chose (filtrer par premium)
- ❌ Context re-implémente la logique au lieu d'utiliser le helper

Solution:
// TimerPaletteContext.jsx
import { getAllPalettes } from '../config/timerPalettes';

getAvailablePalettes: (isPremiumUser = false) => {
return getAllPalettes(isPremiumUser); // ✅ Réutiliser au lieu de
dupliquer
}

---

5️⃣ STRATÉGIE D'INTÉGRATION REVENUCAT

📋 Plan d'Implémentation (5 Étapes)

Phase 1️⃣: Nettoyage Pré-intégration (1-2h)

Tâches:

1. ✅ Ajuster freemium config (décider palettes/activités gratuites)
2. ✅ Créer src/contexts/RevenueCatContext.jsx
3. ✅ Créer src/hooks/usePremiumStatus.js (wrapper autour useRevenueCat)
4. ✅ Installer SDK: npm install react-native-purchases

Fichiers touchés:

- src/config/timerPalettes.js
- src/config/activities.js

Phase 2️⃣: Setup RevenueCat Provider (2-3h)

Créer le Context:
// src/contexts/RevenueCatContext.jsx
import Purchases from 'react-native-purchases';

export const RevenueCatProvider = ({ children }) => {
const [isPremium, setIsPremium] = useState(false);
const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const init = async () => {
        await Purchases.configure({
          apiKey: Platform.select({
            ios: 'appl_xxx',
            android: 'goog_xxx'
          })
        });

        const customerInfo = await Purchases.getCustomerInfo();
        setIsPremium(customerInfo.entitlements.active['pro'] !== undefined);
        setIsLoading(false);
      };

      init();
    }, []);

    return (
      <RevenueCatContext.Provider value={{ isPremium, isLoading }}>
        {children}
      </RevenueCatContext.Provider>
    );

};

Injecter dans App.js:
<ThemeProvider>
<RevenueCatProvider> {/_ 👈 Après Theme, avant Onboarding _/}
<OnboardingProvider>
<AppContent />
</OnboardingProvider>
</RevenueCatProvider>
</ThemeProvider>

Phase 3️⃣: Migration testMode → RevenueCat (1h)

Créer le hook:
// src/hooks/usePremiumStatus.js
import { useRevenueCat } from '../contexts/RevenueCatContext';

export const usePremiumStatus = () => {
const { isPremium, isLoading } = useRevenueCat();

    // Fallback TEST_MODE pendant développement
    if (__DEV__ && TEST_MODE) return { isPremium: true, isLoading: false };

    return { isPremium, isLoading };

};

Remplacer dans 3 composants:
// PaletteCarousel.jsx

- import { isTestPremium } from '../config/testMode';

* import { usePremiumStatus } from '../hooks/usePremiumStatus';

- const isPremiumUser = isTestPremium();

* const { isPremium } = usePremiumStatus();
* const isPremiumUser = isPremium;

Même chose pour:

- ActivityCarousel.jsx (lignes 10, 27)
- SettingsModal.jsx (lignes 26, 50)

Phase 4️⃣: Paywall & Purchase Flow (3-4h)

Créer le Paywall:
// src/components/PremiumModal.jsx
export const PremiumModal = ({ visible, onClose }) => {
const { purchasePackage } = useRevenueCat();
const theme = useTheme();

    const handlePurchase = async () => {
      try {
        const { customerInfo } = await purchasePackage(selectedPackage);
        if (customerInfo.entitlements.active['pro']) {
          onClose();
          // Success haptic + toast
        }
      } catch (e) {
        // Handle error
      }
    };

    return (
      <Modal visible={visible}>
        {/* UI Paywall avec design theme */}
      </Modal>
    );

};

Intégrer dans les points de blocage:
// ActivityCarousel.jsx:109
if (isLocked) {
haptics.warning();

- // TODO: Show premium modal

* setPremiumModalVisible(true);
  return;
  }

Phase 5️⃣: Testing & Refinement (2-3h)

Tests critiques:

1. ✅ Mode free: Vérifier 2 palettes + 3 activités visibles
2. ✅ Lock badges affichés correctement
3. ✅ Tap sur locked item → Paywall s'ouvre
4. ✅ Achat test → Déverrouillage instantané (listener RevenueCat)
5. ✅ Restore purchases fonctionne
6. ✅ Offline → Fallback gracefully

---

6️⃣ RÉSUMÉ DES MODIFICATIONS

Fichiers à Créer (3)

1. src/contexts/RevenueCatContext.jsx
2. src/hooks/usePremiumStatus.js
3. src/components/PremiumModal.jsx (paywall)

Fichiers à Modifier (7)

1. App.js - Injection RevenueCatProvider
2. src/config/timerPalettes.js - Ajuster isPremium flags
3. src/config/activities.js - Ajuster isPremium flags
4. src/components/PaletteCarousel.jsx - Remplacer isTestPremium
5. src/components/ActivityCarousel.jsx - Remplacer isTestPremium + paywall
6. src/components/SettingsModal.jsx - Remplacer isTestPremium
7. src/contexts/TimerPaletteContext.jsx - Déduplication helper (optionnel)

Fichiers à Supprimer (1)

- src/config/testMode.js (garder en commentaire pour dev)

---

7️⃣ RISQUES & MITIGATIONS

| Risque | Impact | Mitigation
|
|-------------------------|-------------|---------------------------------
-----------------|
| RevenueCat init failure | 🔴 Critique | Fallback vers mode free + retry
logic |
| Network timeout | 🟡 Moyen | Cache customerInfo + offline
grace period |
| Achat non reconnu | 🔴 Critique | Listener
Purchases.addCustomerInfoUpdateListener |
| Test mode oublié ON | 🟠 Élevé | CI/CD check TEST_MODE = false
avant build prod |
| UX friction freemium | 🟡 Moyen | A/B test: 2 vs 3 palettes
gratuites |

---

✅ RECOMMANDATIONS FINALES

Avant RevenueCat

1. Décider config freemium définitive (2 palettes? lesquelles?)
2. Tester expérience avec TEST_MODE = false localement
3. Créer maquettes paywall (Figma?) pour valider UX

Pendant Intégration

4. Commencer par Phase 1-2 (setup provider)
5. Tester Phase 3 (migration) sur 1 seul composant d'abord
6. Monitorer logs RevenueCat en dev (verbose mode)

Après Intégration

7. Analytics: Tracker taux de conversion free → premium
8. A/B testing: Timing d'affichage du paywall
9. Feedback: Sondage in-app pour comprendre friction

---

📊 Estimation Totale

| Phase               | Temps | Complexité          |
| ------------------- | ----- | ------------------- |
| Phase 1 (Nettoyage) | 1-2h  | 🟢 Faible           |
| Phase 2 (Provider)  | 2-3h  | 🟡 Moyenne          |
| Phase 3 (Migration) | 1h    | 🟢 Faible           |
| Phase 4 (Paywall)   | 3-4h  | 🟡 Moyenne          |
| Phase 5 (Testing)   | 2-3h  | 🟠 Élevée           |
| TOTAL               | 9-13h | Faisable en 2 jours |

Architecture existante: ✅ Très bien préparéeDette technique: ⚠️ Mineure
(testMode.js)Compatibilité RevenueCat: ✅ Excellente

L'intégration sera fluide car les patterns de conditionnement sont déjà
cohérents et l'architecture modulaire via Context API facilite l'injection
du provider RevenueCat.
