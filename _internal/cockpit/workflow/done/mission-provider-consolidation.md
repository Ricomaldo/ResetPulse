---
created: '2025-12-21'
updated: '2025-12-21'
completed: '2025-12-21'
type: mission
status: completed
model: sonnet
priority: P1
agent_plan: ac99070
commit: 3b6b774
duration: ~2h
tests: 211/211
---

# Mission: Consolidation Providers (TimerOptions + TimerPalette + UserPreferences → TimerConfigProvider)

**Objectif:** Fusionner 3 providers éparpillés en 1 seul contexte cohérent pour simplifier l'arbre React et résoudre le bug DialCenter en onboarding.

**Durée estimée:** 6-7h (Plan Opus + Exécution Sonnet)
**Agent Plan:** ac99070 (Opus) - Architecture complète livrée

---

## 📊 État Actuel Mesuré

**27 fichiers impactés** (audit exhaustif réalisé):
- **1 à créer**: `src/contexts/TimerConfigContext.jsx` (~450 lignes)
- **22 à modifier**: imports + provider tree updates
- **3 à supprimer**: anciens providers
- **1 test à créer**: `__tests__/contexts/TimerConfigContext.test.js`

**Tests baseline:** 220/220 passed ✅

---

## 🏗️ Architecture Proposée (Par Agent Plan Opus)

### State Consolidé (8 Namespaces)

```javascript
useTimerConfig() → {
  // === TIMER OPTIONS ===
  timer: {
    currentActivity: Object,       // {id, emoji, label, defaultDuration, isPremium, ...}
    currentDuration: Number,       // seconds
    selectedSoundId: String,
    clockwise: Boolean,
    scaleMode: String,             // '1min' | '5min' | '15min' | '25min' | '45min' | '60min'
  },

  // === DISPLAY OPTIONS ===
  display: {
    shouldPulse: Boolean,
    showDigitalTimer: Boolean,
    showActivityEmoji: Boolean,
    showTime: Boolean,
  },

  // === INTERACTION PROFILE (ADR-007) ===
  interaction: {
    interactionProfile: String,        // 'impulsif' | 'abandonniste' | 'ritualiste' | 'veloce'
    longPressConfirmDuration: Number,  // 1000-5000ms
    longPressStartDuration: Number,    // 1000-5000ms
    startAnimationDuration: Number,    // 300-2000ms
  },

  // === SYSTEM OPTIONS ===
  system: {
    keepAwakeEnabled: Boolean,
  },

  // === FAVORITES ===
  favorites: {
    favoriteActivities: Array,     // ['work', 'break', 'meditation']
    favoritePalettes: Array,       // ['serenity', 'earth']
  },

  // === UI LAYOUT ===
  layout: {
    commandBarConfig: Array,
    carouselBarConfig: Array,
    favoriteToolMode: String,      // 'activities' | 'colors' | 'commands' | 'none' | 'combo'
  },

  // === PROGRESS/STATS ===
  stats: {
    activityDurations: Object,     // {work: 1500, meditation: 1200, ...}
    completedTimersCount: Number,
    hasSeenTwoTimersModal: Boolean,
  },

  // === PALETTE ===
  palette: {
    currentPalette: String,        // 'serenity' | 'earth' | ...
    selectedColorIndex: Number,    // 0-3
    // Derived: paletteInfo, paletteColors, timerColors, currentColor
  },

  // === TRANSIENT (not persisted) ===
  transient: {
    timerRemaining: Number,
    flashActivity: Object | null,
    isLoading: Boolean,
  },

  // === ACTIONS (all setters + helpers) ===
  setCurrentActivity, setCurrentDuration, setShouldPulse, setPalette, etc.
}
```

### AsyncStorage Redesign (Single Key)

**Nouveau système:**
```
@ResetPulse:config → {
  version: 2,  // Migration marker
  timer: {...},
  display: {...},
  interaction: {...},
  system: {...},
  favorites: {...},
  layout: {...},
  stats: {...},
  palette: {...}
}
```

**Migration auto** depuis anciens keys au premier lancement:
- `@ResetPulse:timerOptions`
- `@ResetPulse:timerPalette`
- `@ResetPulse:selectedColor`
- `@ResetPulse:favoriteToolMode`

### Provider Tree Fix

**Avant (bugué):**
```
App → ... → AppContent → TimerPaletteProvider
                             ├── OnboardingFlow ❌ Pas de TimerOptionsProvider!
                             └── TimerScreen → TimerOptionsProvider ❌ Trop bas
```

**Après (fixé):**
```
App → TimerConfigProvider ← Monté ICI (top-level)
         → ... → AppContent
                     ├── OnboardingFlow ✅ Accès au provider!
                     └── TimerScreen ✅ Accès au provider!
```

### Backward Compatibility (Zéro Breaking Change)

**Alias hooks exportés:**
```javascript
export const useTimerOptions = () => { /* flat structure */ };
export const useTimerPalette = () => { /* palette only */ };
export const useUserPreferences = () => { /* favoriteToolMode only */ };
```

→ **Tous les fichiers gardent leurs imports actuels** (juste changer le path)

---

## 📋 Plan d'Exécution (8 Phases)

### Phase 1: Créer TimerConfigProvider (Foundation)
**Durée:** ~2h | **Risque:** Low

**Fichiers à créer:**
- `src/contexts/TimerConfigContext.jsx` (~450 lignes)

**Tâches:**
- [ ] Créer fichier avec state consolidé (8 namespaces)
- [ ] Implémenter `usePersistedObject` avec nouvelle clé `@ResetPulse:config`
- [ ] Implémenter migration logic (lecture anciens keys au 1er lancement)
- [ ] Implémenter tous les setters avec validation
- [ ] Exporter `TimerConfigProvider`, `useTimerConfig`
- [ ] Exporter alias hooks: `useTimerOptions`, `useTimerPalette`, `useUserPreferences`

**Validation:**
```bash
npx babel src/contexts/TimerConfigContext.jsx --out-file /dev/null
npm run test  # Should stay 220/220
```

---

### Phase 2: Update Provider Tree (App.js)
**Durée:** ~30min | **Risque:** Medium

**Fichiers à modifier:**
- `App.js`

**Tâches:**
- [ ] Import `TimerConfigProvider`
- [ ] Remove `UserPreferencesProvider` wrapper (lignes 208, 226)
- [ ] Add `TimerConfigProvider` à top-level (wrapping tout)
- [ ] Remove `TimerPaletteProvider` de AppContent (ligne 86)

**Validation:**
```bash
npm run test  # Should stay 220/220
npx expo start --clear  # Smoke test manuel
```

---

### Phase 3: Update TimerScreen.jsx
**Durée:** ~30min | **Risque:** Low

**Fichiers à modifier:**
- `src/screens/TimerScreen.jsx`

**Tâches:**
- [ ] Remove `TimerOptionsProvider` wrapper du default export (lignes 206-213)
- [ ] Garder `TimerScreenContent` inchangé (utilise alias `useTimerOptions`)
- [ ] Update import path vers nouveau contexte

**Validation:**
```bash
npm run test:timer  # useTimer tests
npm run test        # All tests
```

---

### Phase 4: Update Core Components (Batch 1)
**Durée:** ~1h | **Risque:** Low

**Fichiers à modifier (8):**
1. `src/components/dial/dial/DialCenter.jsx`
2. `src/components/buttons/PulseButton.jsx`
3. `src/components/dial/TimeTimer.jsx`
4. `src/hooks/useTimer.js`
5. `src/hooks/useTimerKeepAwake.js`
6. `src/components/controls/DigitalTimer.jsx`
7. `src/components/controls/ControlBar.jsx`
8. `src/components/controls/PresetPills.jsx`

**Stratégie:** Utiliser alias hooks (juste changer import path)

**Tâches:**
- [ ] Update imports: `import { useTimerOptions } from '../contexts/TimerConfigContext'`
- [ ] Pas de changement de code (alias hook compatible)

**Validation:**
```bash
npm run test  # Should stay 220/220
```

---

### Phase 5: Update Carousels & Pickers (Batch 2)
**Durée:** ~45min | **Risque:** Low

**Fichiers à modifier (4):**
1. `src/components/carousels/ActivityCarousel.jsx`
2. `src/components/carousels/PaletteCarousel.jsx`
3. `src/components/pickers/PalettePreview.jsx`
4. `src/components/settings/SettingsPanel.jsx`

**Tâches:**
- [ ] Update imports vers `TimerConfigContext`

**Validation:**
```bash
npm run test  # Should stay 220/220
```

---

### Phase 6: Update Layout & Dev (Batch 3)
**Durée:** ~30min | **Risque:** Low

**Fichiers à modifier (4):**
1. `src/components/layout/AsideZone.jsx`
2. `src/components/layout/aside-content/ToolBox.jsx`
3. `src/components/layout/aside-content/FavoriteToolBox.jsx`
4. `src/dev/components/DevFab.jsx`

**Tâches:**
- [ ] Update imports vers `TimerConfigContext`

**Validation:**
```bash
npm run test  # Should stay 220/220
```

---

### Phase 7: Update Tests & Create New Tests
**Durée:** ~1h | **Risque:** Medium

**Fichiers à modifier (3):**
1. `__tests__/contexts/TimerOptionsContext.test.js` - Update mocks
2. `__tests__/hooks/useTimer.test.js` - Update mock
3. `__tests__/screens/TimerScreen.test.js` - Update mock

**Fichiers à créer (1):**
1. `__tests__/contexts/TimerConfigContext.test.js` - Tests complets

**Tests à couvrir:**
- [ ] Migration AsyncStorage (anciens keys → nouveau)
- [ ] State groupé (8 namespaces)
- [ ] Backward compatibility (alias hooks)
- [ ] Validation (clamps, enums)

**Validation:**
```bash
npm run test  # Should reach 225+/225+
```

---

### Phase 8: Cleanup & Final Validation
**Durée:** ~30min | **Risque:** Low

**Fichiers à supprimer (3):**
1. `src/contexts/TimerOptionsContext.jsx`
2. `src/contexts/TimerPaletteContext.jsx`
3. `src/contexts/UserPreferencesContext.jsx`

**Fichiers à modifier (1):**
1. `CLAUDE.md` - Update documentation

**Tâches:**
- [ ] Delete old provider files
- [ ] Verify no remaining imports
- [ ] (Optional) Remove deprecation warnings from alias hooks
- [ ] Update CLAUDE.md

**Validation:**
```bash
npm run test          # Should stay 225+/225+
npm run lint          # If available
npx expo start --clear  # Smoke test manuel complet
```

**Manual Smoke Tests:**
- [ ] App launch sans erreur
- [ ] Timer start/stop fonctionnel
- [ ] Settings panel persistence OK
- [ ] Palette change OK
- [ ] Onboarding reset → DialCenter render OK

---

## 📁 Fichiers Impactés (Liste Exhaustive - 27 fichiers)

### useTimerOptions Consumers (13)
- `src/components/controls/DigitalTimer.jsx`
- `src/components/settings/SettingsPanel.jsx`
- `src/components/carousels/ActivityCarousel.jsx`
- `src/components/dial/TimeTimer.jsx`
- `src/hooks/useTimer.js`
- `src/hooks/useTimerKeepAwake.js`
- `src/components/dial/dial/DialCenter.jsx`
- `src/components/buttons/PulseButton.jsx`
- `src/screens/TimerScreen.jsx`
- `src/components/controls/ControlBar.jsx`
- `src/components/carousels/PaletteCarousel.jsx`
- `src/components/controls/PresetPills.jsx`
- `src/components/layout/AsideZone.jsx`

### useTimerPalette Consumers (5)
- `src/components/carousels/ActivityCarousel.jsx`
- `src/components/dial/TimeTimer.jsx`
- `src/hooks/useTimer.js`
- `src/components/carousels/PaletteCarousel.jsx`
- `src/components/pickers/PalettePreview.jsx`

### useUserPreferences Consumers (4)
- `src/components/settings/SettingsPanel.jsx`
- `src/components/layout/aside-content/ToolBox.jsx`
- `src/components/layout/aside-content/FavoriteToolBox.jsx`
- `src/dev/components/DevFab.jsx` (dev-only)

### Providers (3 à supprimer)
- `src/contexts/TimerOptionsContext.jsx`
- `src/contexts/TimerPaletteContext.jsx`
- `src/contexts/UserPreferencesContext.jsx`

### Tests (4 à modifier + 1 à créer)
- `__tests__/contexts/TimerOptionsContext.test.js`
- `__tests__/hooks/useTimer.test.js`
- `__tests__/screens/TimerScreen.test.js`
- `__tests__/contexts/TimerConfigContext.test.js` (nouveau)

### App & Docs (2)
- `App.js`
- `CLAUDE.md`

---

## 🛡️ Rollback Strategy

**Commits granulaires par phase:**
```bash
git commit -m "feat(contexts): Add TimerConfigProvider foundation [Phase 1]"
git commit -m "refactor(app): Update provider tree [Phase 2]"
git commit -m "refactor(timer): Remove TimerScreen wrapper [Phase 3]"
# etc.
```

**Rollback complet (si needed):**
```bash
git checkout src/contexts/TimerOptionsContext.jsx
git checkout src/contexts/TimerPaletteContext.jsx
git checkout src/contexts/UserPreferencesContext.jsx
git checkout App.js
rm src/contexts/TimerConfigContext.jsx
```

**AsyncStorage rollback:**
- Delete `@ResetPulse:config`
- Old keys (`@ResetPulse:timerOptions`, etc.) preserved during migration

---

## 🎯 Points Critiques

1. **Provider mount point:** Top-level (available to OnboardingFlow AND TimerScreen)
2. **Backward compatibility:** Alias hooks permettent migration sans breaking changes
3. **AsyncStorage migration:** Auto sur 1er lancement, users gardent leur config
4. **Tests validation:** Run à CHAQUE phase (220/220 minimum)
5. **Custom activities:** Preserve integration avec `useCustomActivities` hook

---

## 🔗 Références

| Document | Location |
|----------|----------|
| Plan Architecture Opus | Agent ac99070 (résumable si needed) |
| App.js provider tree | `App.js` (lignes 208-233) |
| TimerScreen wrapper | `src/screens/TimerScreen.jsx` (lignes 206-213) |
| Old TimerOptions | `src/contexts/TimerOptionsContext.jsx` (~300 lignes) |
| Old TimerPalette | `src/contexts/TimerPaletteContext.jsx` (~142 lignes) |
| Old UserPreferences | `src/contexts/UserPreferencesContext.jsx` (~78 lignes) |
| Persistence pattern | `src/hooks/usePersistedState.js` |

---

## 📝 Notes

- **Model Execution:** Sonnet (refactor massif, find/replace, structure complexe)
- **Model Planning:** Opus (architecture exhaustive, plan détaillé 8 phases)
- **Approche:** Plan → Execute → Validate à chaque phase
- **Durée totale:** 6-7h (estimation Opus)
- **Tests baseline:** 220/220 ✅
- **Tests target:** 225+/225+ (après ajout tests TimerConfigContext)
