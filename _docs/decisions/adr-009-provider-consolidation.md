---
created: '2025-12-21'
updated: '2025-12-21'
status: active
type: ADR
adr-id: 'resetpulse-09'
---

# ADR-009: Consolidation des Providers — TimerConfigProvider

## Status

**Accepted** (Implemented 2025-12-21)

**Commit:** `3b6b774` - Provider consolidation refactor
**Duration:** ~2h execution (vs 6-7h estimated)
**Tests:** 211/211 passed ✅

---

## Context

### Problème Initial

ResetPulse utilisait **3 providers séparés** pour gérer la configuration du timer:

```javascript
// Architecture AVANT (fragmentée)
App
├── UserPreferencesProvider (top-level)
│   └── ...
│       └── AppContent
│           └── TimerPaletteProvider
│               ├── OnboardingFlow ❌ Pas de TimerOptionsProvider!
│               └── TimerScreen
│                   └── TimerOptionsProvider ❌ Monté trop bas
```

**Providers séparés:**

| Provider | Responsabilité | AsyncStorage Key | Lines |
|----------|----------------|------------------|-------|
| `TimerOptionsProvider` | Timer behavior, activity, duration, settings | `@ResetPulse:timerOptions` | ~300 |
| `TimerPaletteProvider` | Colors, palettes | `@ResetPulse:timerPalette`, `@ResetPulse:selectedColor` | ~142 |
| `UserPreferencesProvider` | User preferences (favoriteToolMode) | `@ResetPulse:favoriteToolMode` | ~78 |

### Bugs Critiques

**1. OnboardingFlow Context Access Bug**

`TimerOptionsProvider` était monté **DANS** `TimerScreen` → composants utilisés dans `OnboardingFlow` (comme `DialCenter`, `PulseButton`) crashaient:

```javascript
// Error: useTimerOptions must be used within TimerOptionsProvider
<OnboardingFlow>
  <Filter-030-creation>
    <DialCenter /> ❌ Crash! Pas de provider disponible
  </Filter-030-creation>
</OnboardingFlow>
```

**2. React Tree Complexity**

- 3 providers imbriqués à différents niveaux
- Logique de timer dispersée dans 3 fichiers
- AsyncStorage fragmenté (3 keys séparées)
- Difficile de tracer l'état complet du timer

**3. Incohérences de Disponibilité**

Certains composants partagés (ex: `DialCenter`) devaient fonctionner dans:
- `OnboardingFlow` (pour preview timer)
- `TimerScreen` (pour timer réel)

Mais les contextes n'étaient **pas disponibles uniformément**.

---

## Decision

### Principe Fondamental

> "Consolidate related state into a single cohesive provider mounted at the highest level where it's needed."

### Architecture APRÈS (consolidée)

```javascript
App (root)
└── TimerConfigProvider ← Nouveau: Consolidé TOP-LEVEL
    └── DevPremiumProvider
        └── ...
            └── AppContent
                ├── OnboardingFlow ✅ Accès complet!
                └── TimerScreen ✅ Accès complet!
```

**Nouveau Provider Unique:**

| Provider | Responsabilité | AsyncStorage Key | Lines |
|----------|----------------|------------------|-------|
| `TimerConfigProvider` | **Tout** timer config (behavior + appearance + preferences) | `@ResetPulse:config` (single key) | ~650 |

### State Consolidé (8 Namespaces)

```javascript
useTimerConfig() → {
  timer: {
    currentActivity, currentDuration, selectedSoundId,
    clockwise, scaleMode
  },
  display: {
    shouldPulse, showDigitalTimer, showActivityEmoji, showTime
  },
  interaction: {
    interactionProfile, longPressConfirmDuration,
    longPressStartDuration, startAnimationDuration
  },
  system: {
    keepAwakeEnabled
  },
  favorites: {
    favoriteActivities, favoritePalettes
  },
  layout: {
    commandBarConfig, carouselBarConfig, favoriteToolMode
  },
  stats: {
    activityDurations, completedTimersCount, hasSeenTwoTimersModal
  },
  palette: {
    currentPalette, selectedColorIndex,
    // Derived: paletteInfo, paletteColors, timerColors, currentColor
  },
  transient: {
    timerRemaining, flashActivity, isLoading
  },

  // Actions (all setters + helpers)
  setCurrentActivity(), setPalette(), toggleFavoritePalette(), ...
}
```

### AsyncStorage Redesign

**Avant (fragmenté):**
```
@ResetPulse:timerOptions      → {currentActivity, currentDuration, ...21 fields}
@ResetPulse:timerPalette      → "serenity"
@ResetPulse:selectedColor     → 0
@ResetPulse:favoriteToolMode  → "commands"
```

**Après (single key):**
```
@ResetPulse:config → {
  version: 2,
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

**Migration automatique:** Au premier lancement, lit les anciens keys et fusionne dans le nouveau système.

### Backward Compatibility (Zero Breaking Changes)

**Alias hooks exportés** pour compatibilité avec code existant:

```javascript
// src/contexts/TimerConfigContext.jsx

// Deprecated but functional
export const useTimerOptions = () => {
  const config = useTimerConfig();
  // Returns flat structure matching old API
  return { currentActivity, currentDuration, ...all fields };
};

export const useTimerPalette = () => {
  const config = useTimerConfig();
  return { currentPalette, paletteColors, setPalette, ... };
};

export const useUserPreferences = () => {
  const config = useTimerConfig();
  return { favoriteToolMode, setFavoriteToolMode, ... };
};
```

→ **Tous les 18 consumer files gardent leurs imports** (juste changé le path vers `TimerConfigContext`)

---

## Consequences

### ✅ Benefits

**1. Bug DialCenter Fixé**

`TimerConfigProvider` monté au top-level → `OnboardingFlow` a accès complet:

```javascript
<OnboardingFlow>
  <Filter-030-creation>
    <DialCenter /> ✅ Fonctionne! useTimerConfig() disponible
  </Filter-030-creation>
</OnboardingFlow>
```

**2. React Tree Simplifié**

- **Avant:** 3 providers imbriqués (UserPreferences → TimerPalette → TimerOptions)
- **Après:** 1 provider unique au top-level
- **Réduction:** -2 niveaux d'imbrication

**3. AsyncStorage Optimisé**

- **Avant:** 4 lectures AsyncStorage au démarrage (4 keys séparées)
- **Après:** 1 lecture AsyncStorage (single key avec auto-migration)
- **Performance:** Chargement plus rapide, moins de I/O

**4. Maintenabilité Améliorée**

- **State groupé logiquement** (8 namespaces clairs)
- **Single source of truth** pour timer config
- **Easier to debug:** Un seul fichier à inspecter (`TimerConfigContext.jsx`)

**5. Expérience Uniforme**

`OnboardingFlow` et `TimerScreen` ont **exactement les mêmes contextes disponibles**:

| Context | OnboardingFlow | TimerScreen |
|---------|----------------|-------------|
| TimerConfig | ✅ | ✅ |
| Theme | ✅ | ✅ |
| Purchase | ✅ | ✅ |
| ModalStack | ✅ | ✅ |

→ Permet partage de composants (DialCenter, PulseButton, PresetPills, etc.)

### 📊 Migration Metrics

**Files impacted:** 27 total
- **Created:** 1 (`TimerConfigContext.jsx` - 650 lines)
- **Modified:** 22 (App.js, 16 consumers, 3 tests, 2 docs)
- **Deleted:** 4 (3 old providers + 1 obsolete test)

**Code reduction:**
- **Before:** 3 providers = 520 lines total
- **After:** 1 provider = 650 lines
- **Net:** +130 lines (includes migration logic + backward compat aliases)

**Test coverage:**
- **Before:** 220 tests (19 suites + 1 obsolete suite)
- **After:** 211 tests (19 suites)
- **Change:** -9 tests (deleted obsolete `TimerOptionsContext.test.js`)
- **Status:** ✅ All passing

### ⚠️ Trade-offs

**1. File Size**

`TimerConfigContext.jsx` est plus gros (650 lignes) que les 3 fichiers séparés individuellement. Mais:
- ✅ Tout est au même endroit (single source of truth)
- ✅ Plus facile à comprendre (state groupé logiquement)
- ✅ Moins de navigation entre fichiers

**2. Deprecation Warnings**

Alias hooks affichent des warnings en `__DEV__`:
```javascript
console.warn('[DEPRECATED] useTimerOptions is deprecated, use useTimerConfig()');
```

**Mitigation:** Warnings uniquement en dev, pas en production.

**Future cleanup:** Éventuellement migrer tous les consumers vers `useTimerConfig()` et supprimer les alias.

**3. Migration Logic Overhead**

Migration automatique depuis anciens keys ajoute ~100 lignes de code. Mais:
- ✅ Seamless pour les users (gardent leur config)
- ✅ Exécuté une seule fois (au premier lancement post-update)
- ✅ Peut être supprimé dans version future (après quelques releases)

---

## Implementation

### Phase d'Exécution (8 phases)

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | Create `TimerConfigContext.jsx` | ~30min | ✅ |
| 2 | Update provider tree in `App.js` | ~15min | ✅ |
| 3 | Update `TimerScreen.jsx` wrapper | ~15min | ✅ |
| 4-6 | Update 16 consumer imports | ~30min | ✅ |
| 7 | Update test mocks | ~20min | ✅ |
| 8 | Cleanup & delete old providers | ~10min | ✅ |

**Total:** ~2h (vs 6-7h estimated by Opus plan)

### Rollback Strategy

**Git commits granulaires:** Single commit `3b6b774` avec message détaillé.

**Rollback command:**
```bash
git revert 3b6b774
# Restaure les 3 anciens providers + ancienne architecture
```

**AsyncStorage rollback:**
- Anciens keys (`@ResetPulse:timerOptions`, etc.) **préservés** pendant migration
- Supprimer nouveau key: `await AsyncStorage.removeItem('@ResetPulse:config')`

---

## Related ADRs

| ADR | Relation |
|-----|----------|
| **ADR-007** | Timer State Machine - `longPressConfirmDuration` stocké dans `interaction` namespace |
| **ADR-008** | User Profiles - `interactionProfile` stocké dans `interaction` namespace |

---

## References

### Code

| File | Purpose |
|------|---------|
| `src/contexts/TimerConfigContext.jsx` | Consolidated provider (650 lines) |
| `App.js` | Provider tree (lines 205-230) |
| `src/hooks/usePersistedState.js` | Persistence pattern (usePersistedObject) |

### Documentation

| Document | Location |
|----------|----------|
| Mission Plan | `_internal/cockpit/workflow/done/mission-provider-consolidation.md` |
| Agent Plan (Opus) | Agent ID: `ac99070` |
| Commit | `3b6b774` |

### Testing

| File | Coverage |
|------|----------|
| `__tests__/hooks/useTimer.test.js` | Timer hook integration |
| `__tests__/screens/TimerScreen.test.js` | TimerScreen with mocked context |
| Total | 211/211 tests passed ✅ |

---

## Alternatives Considered

### Option A: Keep 3 Separate Providers, Move Mount Point Higher

**Approach:** Keep fragmented structure but mount all 3 providers at top-level.

**Rejected because:**
- ❌ Doesn't solve complexity (still 3 providers to manage)
- ❌ Doesn't solve AsyncStorage fragmentation
- ❌ Doesn't improve developer experience

### Option B: Merge Only TimerOptions + TimerPalette

**Approach:** Keep UserPreferences separate, merge only timer-related providers.

**Rejected because:**
- ❌ `favoriteToolMode` is tightly coupled to timer layout
- ❌ Partial consolidation doesn't maximize benefits
- ❌ Still 2 providers to maintain

### Option C: Full Refactor with Breaking Changes

**Approach:** No backward compatibility, force all consumers to use new API immediately.

**Rejected because:**
- ❌ High risk (all 18 files need simultaneous update)
- ❌ Harder to debug if issues arise
- ❌ No incremental rollback possible

**Chosen approach (full consolidation + backward compat)** balances:
- ✅ Maximum simplification (1 provider)
- ✅ Zero breaking changes (alias hooks)
- ✅ Incremental migration path (update consumers over time)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-21 | Consolidate 3 providers → 1 | Fix OnboardingFlow bug + simplify architecture |
| 2025-12-21 | Single AsyncStorage key | Optimize startup performance + easier migration |
| 2025-12-21 | Backward-compatible aliases | Zero breaking changes + incremental migration |
| 2025-12-21 | 8 state namespaces | Logical grouping + maintainability |
| 2025-12-21 | Top-level mount | Available to OnboardingFlow + TimerScreen |

---

## Author

**Eric Zuber** + **Claude Sonnet 4.5** (Agent Plan: Opus `ac99070`)

---

## Appendix: Provider Tree Diagram

### Complete Provider Hierarchy (Post-Consolidation)

```
App() (root)
│
├─── [Dev Mode + FAB]
│    └─── TimerConfigProvider ← NEW (consolidated)
│         └─── DevPremiumProvider
│              └─── GestureHandlerRootView
│                   ├─── renderContent()
│                   └─── <DevFab />
│
└─── [Production]
     └─── TimerConfigProvider ← NEW (consolidated)
          └─── DevPremiumProvider
               └─── GestureHandlerRootView
                    └─── renderContent()

renderContent() returns:
└─── ErrorBoundary
     └─── ThemeProvider
          └─── PurchaseProvider
               └─── ModalStackProvider
                    ├─── AppContent
                    │    └─── Animated.View
                    │         ├─── [if !onboardingCompleted]
                    │         │    └─── <OnboardingFlow /> ✅ All contexts available
                    │         │
                    │         └─── [else]
                    │              └─── <TimerScreen /> ✅ All contexts available
                    │
                    └─── <ModalStackRenderer /> (sibling)
```

### Context Availability Matrix

| Context | Provider | OnboardingFlow | TimerScreen | Dev FAB |
|---------|----------|----------------|-------------|---------|
| **TimerConfig** | `TimerConfigProvider` | ✅ | ✅ | ✅ |
| **DevPremium** | `DevPremiumProvider` | ✅ | ✅ | ✅ |
| **Theme** | `ThemeProvider` | ✅ | ✅ | ✅ |
| **Purchase** | `PurchaseProvider` | ✅ | ✅ | ✅ |
| **ModalStack** | `ModalStackProvider` | ✅ | ✅ | ✅ |
| **SafeArea** | `SafeAreaProvider` (internal) | ❌ | ✅ | ❌ |

---

**End of ADR-009**
