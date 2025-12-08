---
created: "2025-12-07"
updated: "2025-12-08"
status: done
type: mission
milestone: M8
parent_milestone: m8-overview.md
priority: high
agent: Chrysalis
owner: Merlin
---

# Mission : Onboarding V2

## Objectif

Remplacer l'onboarding V1 (tooltips) par le V2 (6 filtres immersifs) avec analytics intégrés.

---

## État Actuel

### V1 (à supprimer)

```
src/components/onboarding/
├── OnboardingController.jsx
├── OnboardingContext.jsx
├── Tooltip.jsx
├── HighlightOverlay.jsx
└── WelcomeScreen.jsx
```

### V2 (découpé)

```
src/screens/onboarding/
├── OnboardingFlow.jsx          # Orchestrateur
├── index.js                    # Export centralisé
└── filters/
    ├── index.js
    ├── Filter0Opening.jsx      # Respiration intro
    ├── Filter1Needs.jsx        # Identification besoins
    ├── Filter2Creation.jsx     # Création moment
    ├── Filter3Test.jsx         # Test 60sec
    ├── Filter4Vision.jsx       # Vision journée type
    └── Filter5Paywall.jsx      # Paywall soft

src/constants/onboarding.js     # Constantes partagées
```

### Problèmes restants

1. ~~**THEME hardcodé**~~ — ✅ Utilise `useTheme()`
2. **Pas d'analytics** — À ajouter (Phase 2)
3. ~~**Palettes hardcodées**~~ — ✅ Utilise `timerPalettes.js`

---

## Décisions Validées

| Question           | Décision                   |
| ------------------ | -------------------------- |
| Tooltips V1        | Supprimer — V2 fait le job |
| Structure V2       | `src/screens/onboarding/`  |
| Dossier prototypes | Supprimer après migration  |

---

## Plan d'Exécution

### Phase 1 : Corriger le proto

- [x] Thème transversal — `useTheme()` au lieu de `THEME`
- [x] Palettes transversales — `timerPalettes.js`
- [x] Analytics funnel — tracking par étape

### Phase 2 : Enrichir analytics.js ✅

- [x] `trackOnboardingStarted()`
- [x] `trackOnboardingStepViewed(step, stepName)`
- [x] `trackOnboardingStepCompleted(step, stepName, data)`
- [x] `trackOnboardingAbandoned(step, stepName)`
- [x] `trackTimerConfigSaved(config)`

### Phase 3 : Découper et structurer ✅

- [x] Créer `src/screens/onboarding/`
- [x] `OnboardingFlow.jsx` (orchestrateur)
- [x] `filters/Filter0Opening.jsx`
- [x] `filters/Filter1Needs.jsx`
- [x] `filters/Filter2Creation.jsx`
- [x] `filters/Filter3Test.jsx`
- [x] `filters/Filter4Vision.jsx`
- [x] `filters/Filter5Paywall.jsx`
- [x] `src/constants/onboarding.js`

### Phase 4 : Nettoyer usages V1 ✅

- [x] `TimeTimer.jsx` — retirer `useOnboarding`
- [x] `TimerScreen.jsx` — retirer `registerTooltipTarget`
- [x] `ActivityCarousel.jsx` — retirer highlights
- [x] `PaletteCarousel.jsx` — retirer highlights

### Phase 5 : Intégrer V2 dans App.js ✅

- [x] Flow conditionnel `onboardingCompleted`
- [x] Persister + `trackOnboardingCompleted()`
- [x] Clé AsyncStorage `onboarding_v2_completed` (nouvelle clé pour V2)

### Phase 6 : Supprimer V1 ✅

- [x] Supprimer `src/components/onboarding/`
- [x] Supprimer `src/prototypes/`
- [x] Nettoyer imports orphelins

### Phase 7 : Tests Jest ✅

- [x] Tests `onboardingConstants.test.js` (20 tests)
- [x] Tests `analytics.test.js` (21 tests)
- [x] Tests `OnboardingFlow.test.js` (13 tests)
- [x] Restructuration `__tests__/` selon ADR-04

---

## Fichiers à Modifier

| Fichier                                    | Action                   |
| ------------------------------------------ | ------------------------ |
| `src/services/analytics.js`                | +5 events onboarding     |
| `src/prototypes/OnboardingV2Prototype.jsx` | useTheme() + analytics   |
| `App.js`                                   | Remplacer flow V1 par V2 |
| `src/screens/TimerScreen.jsx`              | Retirer useOnboarding    |
| `src/components/TimeTimer.jsx`             | Retirer useOnboarding    |
| `src/components/ActivityCarousel.jsx`      | Retirer highlights       |
| `src/components/PaletteCarousel.jsx`       | Retirer highlights       |

---

## Analytics — Nouveaux Events

| Event                       | Trigger       | Pourquoi          |
| --------------------------- | ------------- | ----------------- |
| `onboarding_started`        | Filter0 mount | Baseline entrée   |
| `onboarding_step_viewed`    | Chaque filtre | Où ils décrochent |
| `onboarding_step_completed` | Transition    | Progression       |
| `onboarding_abandoned`      | App close     | Friction critique |
| `timer_config_saved`        | Fin Filter5   | Choix populaires  |

---

## Done Cette Session

- [x] Intégrer TimerDial dans Filter 2 (preview)
- [x] Intégrer TimerDial animé dans Filter 3 (countdown 60sec)
- [x] Ajouter modes dial 1min, 5min, 10min (dialModes.js)
- [x] Refactorer useDialOrientation avec getDialMode()
- [x] Lisser animation dial (interval 50ms)
- [x] Personnaliser Filter 4 selon needs
- [x] Supprimer DigitalTimer du Filter 3
- [x] Wrapper proto dans providers (ThemeProvider, TimerPaletteProvider)

---

## Notes Session

**2025-12-07 :**

- Session productive : dial intégré, modes courts ajoutés, animation fluide
- Le proto est proche d'être production-ready côté UX
- Prochaine priorité : découpage fichier puis intégration flow

**2025-12-08 :**

- Phase 3 complétée : découpage du proto en 6 filtres + orchestrateur
- Utilise `useTheme()` et `timerPalettes.js` (plus de hardcoding)
- Phase 2 complétée : 5 events analytics ajoutés + injection dans OnboardingFlow
  - `onboarding_started` au mount
  - `onboarding_step_viewed` à chaque changement de filtre
  - `onboarding_step_completed` avec data enrichie (needs, config)
  - `onboarding_abandoned` via AppState listener
  - `timer_config_saved` en Filter2
- Phase 5 complétée : intégration App.js
  - `AppContent` utilise maintenant `OnboardingFlow` V2
  - Persistance avec `onboarding_v2_completed` (clé séparée de V1)
  - `OnboardingProvider` V1 gardé temporairement (Phase 4)
- Prochaines étapes : Phase 4 (nettoyer V1 dans composants) puis Phase 6 (supprimer V1)

---

## Résultat

**Mission terminée le 2025-12-08**

- V1 onboarding complètement supprimé
- V2 avec 6 filtres immersifs en production
- 5 events analytics intégrés (Mixpanel)
- 54 tests Jest couvrent l'onboarding
- Structure tests conforme ADR-04

**Fichiers créés/modifiés :**

- App.js (providers pour proto)
- src/prototypes/OnboardingV2Prototype.jsx (TimerDial, animation, Filter4)
- src/constants/dialModes.js (modes 1min, 5min, 10min)
- src/constants/onboarding.js (constantes V2)
- src/hooks/useDialOrientation.js (refacto getDialMode)
- src/components/timer/TimerDial.jsx (refacto)
- src/components/TimeTimer.jsx (refacto)
- src/screens/onboarding/ (nouveau module V2 découpé)

**Commits :**

- (à faire en fin de session)

---

_Quand terminée, déplacer dans `done/`_
