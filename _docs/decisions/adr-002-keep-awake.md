---
created: '2025-10-18'
updated: '2025-12-14'
status: implemented
type: adr
audit: '#2 - Performance (validated)'
---

# ADR: Keep Awake Strategy

## Status

**IMPLEMENTED** — Validated by Performance Audit #2 (Dec 2025)

## Context

ResetPulse est un timer VISUEL pour utilisateurs TDAH/neuroatypiques. L'ecran se verrouille avant fin timer (30s-2min selon users), perdant la valeur principale de l'app.

**Probleme**: Timer visuel invisible pendant 80-90% de la duree (Pomodoro 25min)

## Decision

**Keep Awake ON par defaut** pendant que le timer tourne, avec toggle Settings.

## Rationale

1. **Alignement mission app** — Timer VISUEL = ecran actif attendu
2. **Benchmark industrie** — Time Timer, Forest, Headspace: ON par defaut
3. **Persona TDAH** — Friction minimale prioritaire, "it just works"
4. **Impact batterie acceptable** — 5-8% par Pomodoro 25min
5. **Opt-out facile** — Toggle visible dans Settings

## Implementation

```javascript
// Hook-based (auto-cleanup garanti)
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

useEffect(() => {
  if (isRunning && keepAwakeEnabled) {
    activateKeepAwake('timer');
  } else {
    deactivateKeepAwake('timer');
  }
  return () => deactivateKeepAwake('timer');
}, [isRunning, keepAwakeEnabled]);
```

## Technical Specifications

- **Scope**: App-only (not system-level)
- **Cleanup**: Automatic on unmount, force-quit, background
- **iOS**: `UIApplication.idleTimerDisabled`
- **Android**: `WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON`
- **Default**: `keepAwakeEnabled: true`

## Settings UI

```
Section: Timer (⚙️)
Label: "Maintenir l'écran allumé"
Hint: "Garde l'écran actif pendant le timer"
Default: ON
```

## Validation (Audit #2)

| Aspect | Expected | Actual | Status |
|--------|----------|--------|--------|
| Default ON | Yes | Yes | ✅ |
| Hook cleanup | Complete | Complete | ✅ |
| App-scoped | Yes | Yes | ✅ |
| Toggle available | Yes | Yes | ✅ |
| Memory leaks | None | None | ✅ |

## Alternatives Considered

### OFF par defaut + Message contextuel
**Rejected**: Friction premier usage + modal = anti-TDAH

### Detection intelligente (batterie + duree)
**Rejected**: Comportement imprevisible (TDAH deteste)

### Mode "Low Power Visual"
**Deferred**: Complexite UI, gain marginal

## Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Battery complaints | Medium | Toggle visible, hint clair |
| Battery critical crash | Low | (Optional) Auto-off <10% |
| Confusion users | Low | Hint in settings |

## References

- [expo-keep-awake docs](https://docs.expo.dev/versions/latest/sdk/keep-awake/)
- iOS: `UIApplication.idleTimerDisabled`
- Android: `FLAG_KEEP_SCREEN_ON`

---

**Original Decision**: 2025-10-18
**Validated**: 2025-12-14 (Audit #2)
