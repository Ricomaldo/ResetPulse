---
created: '2025-12-20'
updated: '2025-01-XX'
status: active
report_type: audit
component: Onboarding System
scope: current-state
---

# Rapport d'Analyse : État Actuel du Système d'Onboarding

## 1. Vue d'ensemble

ResetPulse utilise un système d'onboarding **v2.1 à 9 filtres linéaires** (Filters 010-090) sans branches. Tous les utilisateurs suivent le même parcours :
- **Flow linéaire** : 9 étapes séquentielles pour tous les utilisateurs
- **Pas de branches** : Suppression du système discover/personalize (ADR-010)

Le système enregistre les préférences utilisateur dans **AsyncStorage** avec intégration au contexte **TimerConfigContext** (consolidé, ADR-009).

---

## 2. Structure des fichiers

### Répertoires

```
src/screens/onboarding/
├── filters/                          # 9 fichiers filtres (010-090)
│   ├── Filter-010-opening.jsx       # Respiration (5 cycles auto)
│   ├── Filter-020-tool.jsx          # Sélection mode outil favori
│   ├── Filter-030-creation.jsx     # Création timer (activité/durée/palette)
│   ├── Filter-040-test-start.jsx   # Démarrage test timer
│   ├── Filter-050-test-stop.jsx    # Arrêt test timer
│   ├── Filter-060-sound.jsx         # Sélection son
│   ├── Filter-070-notifications.jsx # Permission notifications (déferred)
│   ├── Filter-080-paywall.jsx       # Paywall soft
│   ├── Filter-090-first-timer.jsx   # Premier timer réel
│   └── index.js                     # Exports centralisés
├── OnboardingFlow.jsx               # Orchestrateur principal (v2.1)
├── onboardingConstants.js           # Constantes + helpers
└── index.js                         # Export OnboardingFlow

src/components/onboarding/
└── StepIndicator.jsx                # Indicateur progression (dots + numéro)
```

### Fichiers Clés Détail

| Fichier | Ligne | Description | Données |
|---------|-------|-------------|---------|
| **OnboardingFlow.jsx** | 1-229 | Orchestrateur du flux v2.1 (switch/case sur currentStep) | Gère état persistant + analytics |
| **onboardingConstants.js** | 1-124 | Constantes (rs, FREE_ACTIVITIES, NEEDS_OPTIONS, DURATION_OPTIONS, STEP_NAMES) | Helpers + getStepName(index, branch) |
| **Filter-010-opening.jsx** | 1-105 | Animation respiration (5 cycles × 1.5s) | Auto-continue, tap override |
| **Filter-020-tool.jsx** | ? | Sélection mode outil favori | Returns favoriteToolMode |
| **Filter-030-creation.jsx** | 1-368 | Carousel activity/duration/palette/color + preview TimerDial | Returns config + color object |
| **Filter-040-test-start.jsx** | ? | Démarrage test timer | Returns startTiming |
| **Filter-050-test-stop.jsx** | ? | Arrêt test timer | Returns stopTiming |
| **Filter-060-sound.jsx** | ? | List TIMER_SOUNDS avec play preview (2s) | Returns selectedSound ID |
| **Filter-070-notifications.jsx** | ? | Demande permission (deferré post-onboarding) | Saved to notificationPermission flag |
| **Filter-080-paywall.jsx** | ? | Soft paywall (Try Premium / Skip) + PremiumModal | Returns purchaseResult |
| **Filter-090-first-timer.jsx** | ? | Premier timer réel | Returns firstTimerCompleted |
| **StepIndicator.jsx** | 1-85 | Dots progress + "X/9" | Memoized, simple visual (caché sur step 0 et 8) |

---

## 3. Flux onboarding en détail (v2.1 - 9 filtres linéaires)

### Filtre 010 - Opening (Respiration)
- **Entrée:** Aucune (entrée du flux)
- **Logique:** 5 cycles de respiration (scale 1→1.2→1 sur 3s chacun), auto-continue après 7.5s, tap override possible
- **Sortie:** Rien (juste transition)
- **Analytics:** trackOnboardingStarted() au mount, trackOnboardingStepViewed(0, 'filter_0')

### Filtre 020 - Tool (Mode outil favori)
- **Entrée:** Aucune
- **Logique:** Sélection du mode outil favori (favoriteToolMode)
- **Sortie:** `favoriteToolMode: string`
- **Analytics:** trackOnboardingStepCompleted(1, 'filter_1', { favoriteToolMode })

### Filtre 030 - Creation (Configuration Timer)
- **Entrée:** Aucune
- **Logique:** Carousel activity/duration/palette/color + preview TimerDial
- **Sortie:** `customActivity: object` (activité créée)
- **Analytics:** trackOnboardingStepCompleted(2, 'filter_2', { customActivity })

### Filtre 040 - Test Start (Démarrage test)
- **Entrée:** Aucune
- **Logique:** Démarrage d'un timer de test
- **Sortie:** `startTiming: timestamp`
- **Analytics:** trackOnboardingStepCompleted(3, 'filter_3', { startTiming })

### Filtre 050 - Test Stop (Arrêt test)
- **Entrée:** `startTiming` (du filtre précédent)
- **Logique:** Arrêt du timer de test
- **Sortie:** `stopTiming: timestamp`
- **Analytics:** trackOnboardingStepCompleted(4, 'filter_4', { stopTiming })

### Filtre 060 - Sound (Sélection son)
- **Entrée:** Aucune
- **Logique:** List TIMER_SOUNDS, tap to select + play 2s preview
- **Sortie:** `selectedSoundId: string`
- **Analytics:** trackOnboardingStepCompleted(5, 'filter_5', { selectedSoundId })

### Filtre 070 - Notifications (Permission)
- **Entrée:** Aucune
- **Logique:** Demande permission (déferred) → set `notificationPermission` flag
- **Important:** Pas de system dialog ici, juste enregistrement de la préférence
- **Sortie:** `notificationPermission: boolean`
- **Post-onboarding:** Si notificationPermission=true, OnboardingFlow appelle Notifications.requestPermissionsAsync() après completion

### Filtre 080 - Paywall (Paywall soft)
- **Entrée:** `customActivity`, `persona` (pour contexte)
- **Logique:** Soft paywall avec Try Premium / Skip buttons
- **Modal:** PremiumModal + RevenueCat payload
- **Sortie:** `purchaseResult: 'trial' | 'skipped' | 'purchased'`
- **Analytics:** trackOnboardingStepCompleted(7, 'filter_7', { purchaseResult })

### Filtre 090 - First Timer (Premier timer réel)
- **Entrée:** `customActivity`, `persona`, `favoriteToolMode`
- **Logique:** Premier timer réel avec configuration complète
- **Sortie:** `firstTimerCompleted: boolean`
- **Analytics:** trackOnboardingStepCompleted(8, 'filter_8', { firstTimerCompleted })

---

## 4. Personas d'interaction

ResetPulse définit **4 personas** dans le contexte **TimerConfigContext** (consolidé, ADR-009) :

| Persona | Emoji | Comportement | Start | Stop | Cas d'usage |
|---------|-------|--------------|-------|------|-----------|
| **impulsif** | 🚀 | Démarre vite, peut arrêter vite | Long Press | Tap | TDAH, "go fast" users |
| **abandonniste** | 🏃 | Démarre facile, difficile d'arrêter | Tap | Long Press | Évite l'abandon involontaire |
| **ritualiste** | 🎯 | Intentionnel, précis, réfléchi | Long Press | Long Press | Default - most cautious |
| **veloce** | ⚡ | Rapide et fluide, confiant | Tap | Tap | Power users |

**Mécanisme:**
- Définition: `src/utils/interactionProfileConfig.js` line 12-49
- Storage: `@ResetPulse:timerConfig` > `.persona` (via TimerConfigContext)
- Usage: Impact sur le composant CommandButton (longPressStartDuration, longPressConfirmDuration)
- **IMPORTANT:** Les personas **NE sont PAS** collectés pendant l'onboarding v2.1. Ils sont définis par défaut à 'ritualiste' et modifiables via SettingsPanel après onboarding.

---

## 5. Modes outil favori

ResetPulse collecte le **mode outil favori** pendant l'onboarding v2.1 via Filter 020 (Tool) :

| Paramètre | Type | Default | Description |
|-----------|------|---------|-------------|
| **favoriteToolMode** | string | null | Mode outil favori sélectionné |

**Impact postérieur:**
- Utilisé dans Filter 090 (First Timer) pour configurer le premier timer réel
- Stocké dans `flowData.favoriteToolMode` et persisté dans AsyncStorage

---

## 6. Données persistées

### AsyncStorage Keys (v2.1)

| Clé | Format | Source Filter | Contenu | Persistence |
|-----|--------|---------------|---------|-------------|
| `@ResetPulse:onboardingStep` | number | OnboardingFlow | Étape actuelle (0-8) | Supprimé à la fin |
| `@ResetPulse:onboardingData` | JSON | OnboardingFlow | `{favoriteToolMode, customActivity, startTiming, stopTiming, persona, selectedSoundId, notificationPermission, purchaseResult, firstTimerCompleted}` | Supprimé à la fin |

### Persistence Flow (v2.1)

```
OnboardingFlow.jsx (handleContinue)
    ↓
usePersistedState('@ResetPulse:onboardingStep') → Sauvegarde étape actuelle
usePersistedObject('@ResetPulse:onboardingData') → Sauvegarde données collectées
    ↓
OnboardingFlow (handleContinue step 8)
    ↓
AsyncStorage.multiRemove(['@ResetPulse:onboardingStep', '@ResetPulse:onboardingData'])
    ↓
setOnboardingCompleted(true) → TimerConfigContext
```

**Chargement (TimerConfigContext.jsx):**
- Les données sont chargées directement via `usePersistedState` et `usePersistedObject`
- Application automatique via `setOnboardingCompleted(true)`
- Nettoyage automatique après completion

---

## 7. Mécanisme de progression

### Skip Logic (v2.1)

**Filtres Obligatoires:**
- 010 (Opening) - Aucun skip (auto-continue après 7.5s)
- 020 (Tool) - Aucun skip
- 030 (Creation) - Aucun skip
- 040 (Test Start) - Aucun skip
- 050 (Test Stop) - Aucun skip
- 060 (Sound) - Skip possible (default 'bell_classic')
- 070 (Notifications) - Peut skip (setNotificationPermission=false)
- 080 (Paywall) - Skip possible
- 090 (First Timer) - Aucun skip

### Completion Flag

**Flag:** `onboardingCompleted` (via TimerConfigContext)
- **Storage:** TimerConfigContext state
- **Set on:** OnboardingFlow handleContinue (step 8) → setOnboardingCompleted(true)
- **Router Logic:** App.js (conditional render TimerScreen vs OnboardingFlow)

### Back Navigation (v2.1)

- **Available:** Tous les steps sauf step 0
- **Logic:** Android BackHandler → setCurrentStep(prev - 1)
- **No Skip:** Cannot navigate backward past step 0
- **Note:** Pas de bouton retour visible dans l'UI (géré par Android BackHandler uniquement)

### Resumability

**Post-onboarding, can user modify?**
- **Interface Config:** Oui, via SettingsPanel
- **Timer Config:** Oui, via TimerScreen carousel + ActivityCarousel
- **Sound Config:** Oui, via SettingsPanel
- **Interaction Profile:** Oui, via SettingsPanel (défault ritualiste)
- **Onboarding Reset:** Dev mode only (handleResetOnboarding dans App.js line 125-135)

---

## 8. Intégration avec TimerConfigContext (v2.1)

### Data Flow Diagram

```
OnboardingFlow handleContinue(stepData)
    ↓
setFlowData((prev) => ({ ...prev, ...stepData }))
    ↓
(Step 8 - Last step)
    ↓
AsyncStorage.multiRemove(['@ResetPulse:onboardingStep', '@ResetPulse:onboardingData'])
    ↓
setOnboardingCompleted(true) → TimerConfigContext
    ↓
onComplete(flowData) → App.js
    ↓
render TimerScreen
```

### Properties Mapped

| Filter Source | Property | TimerConfigContext Property | Namespace |
|---|---|---|---|
| Filter 020 | favoriteToolMode | favoriteToolMode | timer.favoriteToolMode |
| Filter 030 | customActivity | currentActivity | timer.currentActivity |
| Filter 060 | selectedSoundId | selectedSoundId | timer.selectedSoundId |
| Filter 070 | notificationPermission | notificationPermission | display.notificationPermission |
| Filter 080 | purchaseResult | purchaseResult | stats.purchaseResult |
| Filter 090 | firstTimerCompleted | firstTimerCompleted | stats.firstTimerCompleted |

---

## 9. Navigation et points d'entrée

| Besoin | Fichier | Lignes |
|--------|---------|--------|
| Ajouter filtre | filters/Filter-XXX-name.jsx + index.js | New file + line 3-14 |
| Modifier flow logic | OnboardingFlow.jsx | Line 165-296 (renderFilter switch) |
| Ajouter needs option | onboardingConstants.js | Line 21-27 (NEEDS_OPTIONS) |
| Modifier smart defaults | onboardingConstants.js | Line 30-49 (getSmartDefaults) |
| Changer scenarios | onboardingConstants.js | Line 52-98 (getJourneyScenarios) |
| Modifier persistence | App.js | Line 61-82 (handleOnboardingComplete) |
| Ajouter context load | TimerOptionsContext.jsx | Line 90-154 (loadOnboardingConfig) |
| Router logic | App.js | Line 93-97 (conditional render) |
| Dev reset tools | App.js | Line 125-145 (handleReset*) |

---

## Conclusion

L'onboarding v2.1 est un système linéaire avec 9 filtres séquentiels, sans branches. Toutes les données sont persistées en AsyncStorage via `usePersistedState` et `usePersistedObject`, puis appliquées au TimerConfigContext (consolidé, ADR-009) pour initialiser l'app avec les préférences utilisateur. Le StepIndicator est caché sur le premier et dernier step. La navigation retour est gérée par Android BackHandler (pas de bouton visible).

**Report Generated**: 2025-12-20  
**Last Updated**: 2025-01-XX (après migration v2.1)  
**Source**: Codebase exploration of Onboarding System  
**Scope**: Current state (v2.1), file structure, data flow, personas, persistence
