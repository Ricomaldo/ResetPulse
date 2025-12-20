---
created: '2025-12-20'
updated: '2025-12-20'
status: active
report_type: audit
component: Onboarding System
scope: current-state
---

# Rapport d'Analyse : État Actuel du Système d'Onboarding

## 1. Vue d'ensemble

ResetPulse utilise un système d'onboarding **V3 à 10 filtres** (Filters 010-100) avec structure adaptatif. Après le filtre 060 (Branch), les utilisateurs empruntent l'un de deux chemins :
- **discover** (5 filtres) : Vision aspirationnelle → Paywall
- **personalize** (5 filtres) : Configuration audio/interface → Fin sans paywall

Le système enregistre **8 points de décision critiques** et persiste les préférences utilisateur dans **AsyncStorage** avec intégration au contexte **TimerOptionsContext**.

---

## 2. Structure des fichiers

### Répertoires

```
src/screens/onboarding/
├── filters/                          # 10 fichiers filtres (010-100)
│   ├── Filter-010-opening.jsx       # Respiration (5 cycles auto)
│   ├── Filter-020-needs.jsx         # Identification besoins (5 options)
│   ├── Filter-030-creation.jsx      # Création timer (activité/durée/palette)
│   ├── Filter-040-test.jsx          # Test 60 sec
│   ├── Filter-050-notifications.jsx # Permission notifications (déferred)
│   ├── Filter-060-branch.jsx        # Embranchement Discover/Personalize
│   ├── Filter-070-vision-discover.jsx # Vision aspirationnelle (parcours discover)
│   ├── Filter-080-sound-personalize.jsx # Sélection son (parcours personalize)
│   ├── Filter-090-paywall-discover.jsx # Paywall soft (parcours discover)
│   ├── Filter-100-interface-personalize.jsx # Config interface (parcours personalize)
│   └── index.js                     # Exports centralisés
├── OnboardingFlow.jsx               # Orchestrateur principal
├── onboardingConstants.js           # Constantes + helpers
└── index.js                         # Export OnboardingFlow

src/components/onboarding/
└── StepIndicator.jsx                # Indicateur progression (dots + numéro)
```

### Fichiers Clés Détail

| Fichier | Ligne | Description | Données |
|---------|-------|-------------|---------|
| **OnboardingFlow.jsx** | 1-389 | Orchestrateur du flux V3 (switch/case sur currentFilter) | Gère 8 états locaux + analytics |
| **onboardingConstants.js** | 1-124 | Constantes (rs, FREE_ACTIVITIES, NEEDS_OPTIONS, DURATION_OPTIONS, STEP_NAMES) | Helpers + getStepName(index, branch) |
| **Filter-010-opening.jsx** | 1-105 | Animation respiration (5 cycles × 1.5s) | Auto-continue, tap override |
| **Filter-020-needs.jsx** | 1-178 | Multi-select 5 options (meditation, work, creativity, time, neurodivergent) | Validate: min 1 needed |
| **Filter-030-creation.jsx** | 1-368 | Carousel activity/duration/palette/color + preview TimerDial | Returns config + color object |
| **Filter-040-test.jsx** | 1-127 | Timer countdown 60s avec vibration à 30s | Pre-filled avec timerConfig |
| **Filter-050-notifications.jsx** | 1-174 | Demande permission (deferré post-onboarding) | Saved to shouldRequestLater flag |
| **Filter-060-branch.jsx** | 1-116 | 2 choice cards (Discover / Personalize) | Sets branch state |
| **Filter-070-vision-discover.jsx** | 1-136 | 4 journey scenarios (morning/day/break/evening, adaptés selon needs) | Read-only, affichage aspirationnel |
| **Filter-080-sound-personalize.jsx** | 1-277 | List TIMER_SOUNDS avec play preview (2s) | Returns selectedSound ID |
| **Filter-090-paywall-discover.jsx** | 1-122 | Soft paywall (Try Premium / Skip) + PremiumModal | Ends flow avec result='trial' ou 'skipped' |
| **Filter-100-interface-personalize.jsx** | 1-297 | Theme (light/dark/auto) + minimalInterface + digitalTimer toggles | Returns config object, applique thème live |
| **StepIndicator.jsx** | 1-85 | Dots progress + "X/8" | Memoized, simple visual |

---

## 3. Flux onboarding en détail

### Filtre 010 - Opening (Respiration)
- **Entrée:** Aucune (entrée du flux)
- **Logique:** 5 cycles de respiration (scale 1→1.2→1 sur 3s chacun), auto-continue après 7.5s, tap override possible
- **Sortie:** Rien (juste transition)
- **Analytics:** trackOnboardingStarted() au mount, trackOnboardingStepViewed(0, 'opening')

### Filtre 020 - Needs (Besoins utilisateur)
- **Entrée:** Aucune
- **Logique:** Multi-select 5 options → setNeeds([]) dans OnboardingFlow
- **Validation:** Min 1 besoin sélectionné pour continuer
- **Sortie:** `needs: string[]` (ex: ['work', 'meditation'])
- **Impact:** Utilisé par Filter030 (smart defaults) et Filter070 (journey scenarios adapté)
- **Analytics:** trackOnboardingStepCompleted(1, 'needs', { needs_selected, needs_count })

### Filtre 030 - Creation (Configuration Timer)
- **Entrée:** `needs` (pour smart defaults)
- **Smart Defaults (getSmartDefaults):**
  - meditation → 20min + palette[0] + colorIndex 2
  - work → 25min + palette[1] + colorIndex 0
  - creativity → 45min + palette[1] + colorIndex 1
  - time → 15min + palette[0] + colorIndex 0
  - neurodivergent → 25min + palette[1] + colorIndex 0
- **Sortie:** `timerConfig = { activity, duration, palette, colorIndex, color }`

### Filtre 040 - Test (Expérience 60s)
- **Entrée:** `timerConfig` (pour couleur + emoji)
- **Logique:** Countdown real-time 60s → vibration à 30s → auto-continue
- **Sortie:** Rien (just experience)

### Filtre 050 - Notifications (Permission)
- **Entrée:** Aucune
- **Logique:** Demande permission (déferred) → set `shouldRequestLater` flag
- **Important:** Pas de system dialog ici, juste enregistrement de la préférence
- **Post-onboarding:** Si shouldRequestLater=true, OnboardingFlow appelle Notifications.requestPermissionsAsync() après completion

### Filtre 060 - Branch (Embranchement Critique)
- **Entrée:** Aucune
- **Logique:** 2 choice cards → click continue avec branch choice
- **Sortie:** `{ branch: 'discover' | 'personalize' }`
- **Impact:** Détermine le chemin suivant (filtres 6-7)

### Filtre 070 - Vision (Discover path)
- **Entrée:** `needs` (pour adapter scenarios)
- **Logique:** Affichage 4 journey scenarios (morning/day/break/evening) avec descriptions contextuelles
- **Sortie:** Rien (visuelle uniquement)

### Filtre 080 - Sound (Personalize path)
- **Entrée:** Aucune
- **Logique:** List TIMER_SOUNDS, tap to select + play 2s preview
- **Sortie:** `{ selectedSound: 'bell_classic' | ... }`
- **Skip:** Default 'bell_classic'

### Filtre 090 - Paywall (Discover path)
- **Entrée:** Aucune
- **Logique:** Soft paywall avec Try Premium / Skip buttons
- **Modal:** PremiumModal + RevenueCat payload
- **Sortie:** `onComplete('trial')` ou `onComplete('skipped')`

### Filtre 100 - Interface (Personalize path)
- **Entrée:** Aucune
- **Logique:**
  - Segmented control Theme (light/dark/auto) + live preview (applyTheme)
  - Toggle minimalInterface (default=true)
  - Toggle digitalTimer (default=true)
- **Sortie:** `{ theme, minimalInterface, digitalTimer }`

---

## 4. Personas d'interaction

ResetPulse définit **4 personas** dans le contexte **TimerOptionsContext** :

| Persona | Emoji | Comportement | Start | Stop | Cas d'usage |
|---------|-------|--------------|-------|------|-----------|
| **impulsif** | 🚀 | Démarre vite, peut arrêter vite | Long Press | Tap | TDAH, "go fast" users |
| **abandonniste** | 🏃 | Démarre facile, difficile d'arrêter | Tap | Long Press | Évite l'abandon involontaire |
| **ritualiste** | 🎯 | Intentionnel, précis, réfléchi | Long Press | Long Press | Default - most cautious |
| **veloce** | ⚡ | Rapide et fluide, confiant | Tap | Tap | Power users |

**Mécanisme:**
- Définition: `src/utils/interactionProfileConfig.js` line 12-49
- Storage: `@ResetPulse:timerOptions` > `.interactionProfile`
- Usage: Impact sur le composant CommandButton (longPressStartDuration, longPressConfirmDuration)
- **IMPORTANT:** Les personas **NE sont PAS** collectés pendant l'onboarding V3. Ils sont définis par défaut à 'ritualiste' et modifiables via SettingsPanel après onboarding.

---

## 5. Modes outil favori

ResetPulse n'utilise **PAS** 4 "modes outil favori" explicites pendant l'onboarding. À la place, il offre 2 **niveaux de configuration interface** via Filter 100 :

| Paramètre | Type | Default | Description |
|-----------|------|---------|-------------|
| **theme** | enum | 'auto' | light / dark / auto (live preview) |
| **minimalInterface** | bool | true | Masquer controls secondaires |
| **digitalTimer** | bool | true | Afficher chrono numérique |

**Impact postérieur:**
- `minimalInterface=true` → Affiche FavoriteToolBox (mini, 2 boutons) sinon ToolBox (full 4 boutons)
- `digitalTimer=true` → Affiche digital time display au-dessus du cadran
- `theme` → Applique le thème système (light/dark/auto)

---

## 6. Données persistées

### AsyncStorage Keys

| Clé | Format | Source Filter | Contenu | Persistence |
|-----|--------|---------------|---------|-------------|
| `onboarding_v2_completed` | 'true' / null | N/A (Flag) | Boolean flag pour router | Permanent |
| `user_timer_config` | JSON | Filter 030 (Creation) | `{activity, duration, palette, colorIndex, color}` | Deleted post-load |
| `user_sound_config` | JSON | Filter 080 (Sound/Personalize) | `selectedSound` ID string | Deleted post-load |
| `user_interface_config` | JSON | Filter 100 (Interface/Personalize) | `{theme, minimalInterface, digitalTimer}` | Deleted post-load |

### Persistence Flow

```
OnboardingFlow.jsx (handleOnboardingComplete)
    ↓
App.js (handleOnboardingComplete) - line 61-82
    ↓
AsyncStorage.setItem()
    ↓
(4 clés sauvegardées)
```

**Chargement (TimerOptionsContext.jsx line 89-154):**
- Après `usePersistedObject` boot
- Load `user_timer_config` → apply currentActivity + currentDuration
- Load `user_sound_config` → apply selectedSoundId
- Load `user_interface_config` → apply theme + minimalInterface + digitalTimer
- Delete après application (clean up)

---

## 7. Mécanisme de progression

### Skip Logic

**Filtres Obligatoires:**
- 010 (Opening) - Aucun skip
- 020 (Needs) - Aucun skip (min 1 requis)
- 030 (Creation) - Aucun skip
- 040 (Test) - Auto-complete (60s)
- 050 (Notifications) - Peut skip (setNotificationPermission=false)
- 060 (Branch) - Aucun skip (2-way choice)

**Filtres Branch-Dependant:**
- **Discover Path:** 070 (Vision) - Aucun skip, 090 (Paywall) - Skip possible
- **Personalize Path:** 080 (Sound) - Skip possible, 100 (Interface) - Skip possible

### Completion Flag

**Flag:** `onboarding_v2_completed`
- **Storage:** AsyncStorage
- **Set on:** OnboardingFlow onComplete callback → App.js line 62
- **Router Logic:** App.js line 93-97 (conditional render TimerScreen vs OnboardingFlow)

### Back Navigation

- **Available:** Filtres 1-7 (back button visible line 304)
- **Logic:** goToPreviousFilter() → setCurrentFilter(prev - 1)
- **No Skip:** Cannot navigate backward past filter 0

### Resumability

**Post-onboarding, can user modify?**
- **Interface Config:** Oui, via SettingsPanel
- **Timer Config:** Oui, via TimerScreen carousel + ActivityCarousel
- **Sound Config:** Oui, via SettingsPanel
- **Interaction Profile:** Oui, via SettingsPanel (défault ritualiste)
- **Onboarding Reset:** Dev mode only (handleResetOnboarding dans App.js line 125-135)

---

## 8. Intégration avec TimerOptionsContext

### Data Flow Diagram

```
OnboardingFlow handleComplete()
    ↓
App.handleOnboardingComplete(data)
    ├→ AsyncStorage.setItem('user_timer_config')
    ├→ AsyncStorage.setItem('user_sound_config')
    ├→ AsyncStorage.setItem('user_interface_config')
    └→ setOnboardingCompleted(true) → render TimerScreen

(On TimerScreen Mount)
    ↓
TimerOptionsContext useEffect (line 90)
    ├→ Load & parse 'user_timer_config' → currentActivity + currentDuration
    ├→ Load & parse 'user_sound_config' → selectedSoundId
    └→ Load & parse 'user_interface_config' → theme + minimalInterface + digitalTimer
        (Delete post-load for cleanup)
```

### Properties Mapped

| Filter Source | Property | TimerOptionsContext Property | Path |
|---|---|---|---|
| Filter 030 | activity | currentActivity | Line 101 |
| Filter 030 | duration | currentDuration | Line 104 |
| Filter 080 | selectedSound | selectedSoundId | Line 121 |
| Filter 100 | minimalInterface | useMinimalInterface | Line 142 |
| Filter 100 | digitalTimer | showDigitalTimer | Line 145 |

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

L'onboarding V3 est un système modulaire et extensible avec 10 filtres, 2 branches adaptatifs, 4 personas d'interaction (non-collectés pendant onboarding, modifiables post-), et 3 niveaux de configuration interface. Toutes les données sont persistées en AsyncStorage puis appliquées au TimerOptionsContext pour initialiser l'app avec les préférences utilisateur.

**Report Generated**: 2025-12-20
**Source**: Codebase exploration of Onboarding System
**Scope**: Current state, file structure, data flow, personas, persistence
