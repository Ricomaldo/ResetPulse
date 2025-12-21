---
created: '2025-12-21'
updated: '2025-12-21'
type: mission
status: in-progress
model: sonnet
priority: P1
---

# Mission: Consolidation Providers (TimerOptions + TimerPalette + UserPreferences → TimerConfigProvider)

**Objectif:** Fusionner 3 providers éparpillés en 1 seul contexte cohérent pour simplifier l'arbre React et résoudre le bug DialCenter en onboarding.

**Durée estimée:** 1h (Sonnet + refactor automatisé)

---

## 📋 Checklist Exécution

### Phase 1: Architecture (Créer nouveau provider)
- [ ] **Créer** `src/contexts/TimerConfigProvider.jsx`
  - Fusionner TimerOptions + TimerPalette + UserPreferences
  - Hook: `useTimerConfig()` (remplace les 3 hooks)
  - ~350 lignes, tous les helpers et state fusionnés
  - Montage: AppContent (toujours dispo pour OnboardingFlow + TimerScreen)

### Phase 2: Refactor Imports (Automatisé)
- [ ] **Find/Replace massif** dans `src/`:
  1. `import { useTimerOptions }` → `import { useTimerConfig }`
  2. `import { useTimerPalette }` → `import { useTimerConfig }`
  3. `import { useUserPreferences }` → `import { useTimerConfig }`
  4. `const { ... } = useTimerOptions()` → `const { ... } = useTimerConfig()`
  5. `const { ... } = useTimerPalette()` → `const { ... } = useTimerConfig()`
  6. `const { ... } = useUserPreferences()` → `const { ... } = useTimerConfig()`

### Phase 3: Update App.js Provider Tree
- [ ] **Replace** lignes 86 de App.js:
  - `<TimerPaletteProvider>` → keep (à intégrer dans TimerConfigProvider)
  - Ajouter `<TimerConfigProvider>` en wrappant AppContent au lieu de le mettre dans TimerScreen
  - Supprimer imports des 3 anciens providers

### Phase 4: Test & Validation
- [ ] **Build:** `npm start` (no errors)
- [ ] **Test Onboarding:**
  - DialCenter preview render (pas d'erreur useTimerConfig)
  - Filter030Creation accessible
- [ ] **Test TimerScreen:**
  - All features work (timer, carousels, settings)
  - Persisted state properly loaded
- [ ] **Dev check:** No console errors

### Phase 5: Cleanup & Commit
- [ ] **Delete** fichiers obsolètes:
  - `src/contexts/TimerOptionsContext.jsx`
  - `src/contexts/TimerPaletteContext.jsx`
  - `src/contexts/UserPreferencesContext.jsx`
- [ ] **Git commit:** "refactor: consolidate providers → TimerConfigProvider"

---

## 🔍 Fichiers Impactés (~20)

**Qui utilise `useTimerOptions()`:**
- `src/screens/TimerScreen.jsx`
- `src/components/buttons/PulseButton.jsx`
- `src/components/dial/dial/DialCenter.jsx`
- `src/components/controls/DigitalTimer.jsx`
- `src/components/settings/SettingsPanel.jsx`
- `src/components/controls/ControlBar.jsx`
- `src/components/carousels/ActivityCarousel.jsx`
- `src/components/carousels/PaletteCarousel.jsx`
- `src/components/controls/PresetPills.jsx`
- `src/components/layout/AsideZone.jsx`
- `src/components/dial/TimeTimer.jsx`
- `src/hooks/useTimerKeepAwake.js`
- `src/hooks/useTimer.js`

**Qui utilise `useTimerPalette()`:**
- `src/components/modals/MoreColorsModal.jsx`
- `src/components/modals/MoreActivitiesModal.jsx`
- `src/components/modals/DiscoveryModal.jsx`
- `src/components/modals/PremiumModal.jsx`
- `src/screens/onboarding/filters/Filter-030-creation.jsx`

**Qui utilise `useUserPreferences()`:**
- `src/components/layout/AsideZone.jsx` (favoriteToolMode)

---

## 📦 État du Provider (fusionné)

```javascript
useTimerConfig() retourne:
{
  // Timer behavior (from TimerOptions)
  currentActivity, currentDuration, selectedSoundId,
  shouldPulse, interactionProfile, keepAwakeEnabled,
  showDigitalTimer, showActivityEmoji, clockwise, scaleMode,
  favoriteActivities, favoritePalettes, commandBarConfig, carouselBarConfig,
  longPressConfirmDuration, longPressStartDuration,
  timerRemaining, flashActivity,
  hasSeenTwoTimersModal, completedTimersCount,

  // Timer appearance (from TimerPalette)
  currentPalette, paletteInfo, paletteColors, timerColors,
  selectedColorIndex, currentColor,

  // User preferences (from UserPreferences)
  favoriteToolMode,

  // Methods (tous les helpers)
  setDuration, setActivity, setSoundId, ...
  setPalette, setColorIndex, setColorByType, ...
  setFavoriteToolMode, ...
}
```

---

## ⚠️ Points Critiques

1. **AsyncStorage keys doivent rester identiques** pour pas perdre persistent state:
   - `@ResetPulse:timerOptions`
   - `@ResetPulse:timerPalette`
   - `@ResetPulse:selectedColor`
   - `@ResetPulse:favoriteToolMode`

2. **DialCenter & PulseButton en onboarding:**
   - Avant: utilisaient `useTimerOptions()` → erreur si pas de provider
   - Après: utilisent `useTimerConfig()` → retourne defaults si provider pas encore monté
   - TimerConfigProvider monté dans AppContent → disponible partout

3. **Test importants:**
   - Onboarding V2 doit pouvoir afficher le dial preview
   - TimerScreen doit garder toute sa fonctionnalité
   - État persisted doit être restauré au relaunch

---

## 🔗 Références

| Document | Location |
|----------|----------|
| App.js tree | `src/App.js` (lignes 84-102) |
| Old TimerOptions | `src/contexts/TimerOptionsContext.jsx` |
| Old TimerPalette | `src/contexts/TimerPaletteContext.jsx` |
| Old UserPreferences | `src/contexts/UserPreferencesContext.jsx` |
| Impacted files | ~20 fichiers (voir section "Fichiers Impactés") |

---

## 📝 Notes

- Model: **Sonnet** (refactor massif, find/replace, structure complexe)
- Approche: **Find/replace automatisé** → test complet
- Rollback: Si erreur, `git checkout` les 3 vieux fichiers
- Après: On peut refonder OnboardingFlow sans problèmes de contexte
