---
created: '2025-12-14'
updated: '2025-12-14'
status: active
audit: '#2 - Performance'
source: '_internal/cockpit/knowledge/findings/2025-12-14_02-performance.md'
---

# Performance Baseline - ResetPulse (December 2025)

> Rapport consolide de l'audit #2 Performance avec etat actuel et recommandations

## Executive Summary

**Overall Grade: B+** (Good, with targeted optimization opportunities)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Bundle Size (AAB) | 65MB | <80MB | ✅ |
| Estimated TTI | 800-1200ms | <1500ms | ✅ |
| Native Driver Animations | 100% | 100% | ✅ |
| Memory Leaks | 0 detected | 0 | ✅ |
| P0 Critical Issues | 0 | 0 | ✅ |
| P1 High Priority | 2 | 0 | ⚠️ |
| P2 Medium Priority | 3 | 0 | ⚠️ |

---

## Strengths (What's Working Well)

| Area | Implementation | Status |
|------|---------------|--------|
| **Native Animations** | All use `useNativeDriver: true` | ✅ 60fps |
| **Cleanup Patterns** | Intervals, listeners, refs cleared | ✅ Complete |
| **React.memo** | Strategic on TimerDial, DialCenter | ✅ Not overused |
| **Analytics Init** | Async, non-blocking | ✅ Safe |
| **Timer Logic** | Single source of truth, no drift | ✅ Efficient |
| **Component Split** | TimerDial → DialBase/Progress/Center | ✅ Modular |

---

## P1 - High Priority (Should Fix Soon)

### 1. RevenueCat Init on Every Launch

**Location**: `PurchaseContext.jsx:20-48`
**Impact**: +200-500ms cold start (network dependent)

**Current**:
- `Purchases.configure()` runs every mount
- Network fetch + receipt validation
- Blocks premium access until complete

**Recommendation**:
```javascript
// Cache customerInfo in AsyncStorage
// Show cached status immediately
// Refresh in background
// Only block if cache >24h old
```

**Effort**: ~4h

### 2. No Performance Monitoring

**Location**: N/A (missing)
**Impact**: Flying blind on real-world metrics

**Current**: Mixpanel tracks events, not performance

**Recommendation**:
```javascript
Analytics.track('app_performance', {
  tti_ms: performance.now() - startTime,
  screen: 'timer',
});
```

**Effort**: ~2h

---

## P2 - Medium Priority

### 1. Context Re-render Cascade

**Location**: `TimerOptionsContext.jsx:99-153`
**Impact**: Unnecessary re-renders on unrelated value changes

**Problem**: 17 values in single context object + 17 inline functions

**Recommendation**: Split contexts by concern or use context selectors

### 2. Timer setTimeout vs RAF

**Location**: `useTimer.js:62-74`
**Impact**: Battery drain, potential drift

**Problem**: 100ms setTimeout polling always runs

**Recommendation**: Use RAF in foreground, setTimeout only when backgrounded

### 3. Analytics Early Events

**Location**: `App.js:110-125`
**Impact**: Potential data loss on fast user interactions

**Recommendation**: Queue events until init completes or expose `isAnalyticsReady`

---

## P3 - Low Priority (Nice to Have)

| Issue | Location | Impact |
|-------|----------|--------|
| Context nesting (5 deep) | App.js:154-163 | Moderate tree depth |
| AsyncStorage serial reads (3) | Multiple | ~30% slower init |
| 100ms polling always on | TimerScreen.jsx:188 | CPU wake 10x/sec |
| No debounce on persist | usePersistedState.js | Heavy writes |
| DevBar recreated | OnboardingFlow.jsx:108 | Minor overhead |
| PanResponder deps | TimerDial.jsx:110 | Gesture re-registration |

---

## Bundle Analysis

| Component | Size | Notes |
|-----------|------|-------|
| **Android AAB** | 65MB | Within expected range |
| **JS Source** | 104 files | Clean |
| **Dependencies** | 15 prod | Reasonable |

### Heavy Dependencies (Justified)
1. `react-native-reanimated` — Required for smooth animations
2. `react-native-purchases` — RevenueCat SDK (IAP)
3. `mixpanel-react-native` — Analytics

**No optimization opportunities** — All deps actively used.

---

## Memory Management

**Risk Level: LOW** ✅

| Resource | Instances | Cleanup |
|----------|-----------|---------|
| Intervals | 18 | ✅ All cleared |
| AppState Listeners | 3 | ✅ All removed |
| Animated Loops | Multiple | ✅ All stopped |
| Refs | isMountedRef | ✅ Guards present |

**Potential Risk**: RevenueCat listener (no explicit cleanup) — Impact: Low (singleton)

---

## Keep Awake Implementation

**Status**: ✅ VALIDATED (per legacy ADR)

- Hook-based implementation
- Cleanup on unmount
- App-scoped (not system)
- Toggle in settings
- Default: ON

Legacy decision validated by audit findings.

---

## Benchmarks Comparison

| Metric | ResetPulse | Industry Avg | Grade |
|--------|------------|--------------|-------|
| Cold Start | ~1000ms | 1200-1800ms | **A-** |
| Bundle Size | 65MB | 50-80MB | **B+** |
| Animation FPS | 60fps | 60fps | **A** |
| Memory Mgmt | Complete | Complete | **A** |

---

## Recommendations Summary

### Immediate (P1)
1. **Cache RevenueCat customerInfo** — Reduce cold start 200-500ms
2. **Add performance instrumentation** — Measure real-world TTI

### Short-term (P2)
3. **Refactor context structure** — Reduce re-render cascade
4. **Optimize timer polling** — Only when running
5. **Queue early analytics** — Prevent data loss

### Long-term (P3)
6. **Batch AsyncStorage reads** — multiGet() for ~30% faster init
7. **Debounce state persistence** — Reduce disk I/O

---

## Decisions (Eric 2025-12-14)

### Q1: P1 RevenueCat Caching — **A. Fix now**

Cache customerInfo dans AsyncStorage. Gain: -300ms cold start.

### Q2: Performance Monitoring — **A. Basic TTI only**

Tracker TTI via Mixpanel. Effort: ~2h.

### Q3: Context Refactoring — Deferred

Accepter re-renders actuels, revisiter si problème user.

---

## Handoff Engineer

**File**: `_internal/docs/guides/handoff-engineer-performance.md`

**Scope**:
1. RevenueCat caching (~4h)
2. Basic TTI monitoring (~2h)

---

## References

- **Source Audit**: `_internal/cockpit/knowledge/findings/2025-12-14_02-performance.md`
- **Legacy Comparison**: `_internal/docs/legacy/performance.legacy.md`
- **Keep Awake ADR**: `_internal/docs/decisions/adr-keep-awake.md`

---

**Generated by**: Atlas/Claude-Architect (Phase 2)
**Date**: 2025-12-14
