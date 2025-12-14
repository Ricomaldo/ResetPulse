---
created: '2025-12-14'
updated: '2025-12-14'
status: active
---

# UX/Conversion Report — ResetPulse

> Analyse du funnel de conversion et de l'experience utilisateur

## Quick Status

| Aspect | Score | Status |
|--------|-------|--------|
| **UX Health** | B- (75/100) | Functional but friction |
| **Conversion Health** | C+ (68/100) | Below target |
| **P0 Critical Issues** | 4 | Blocking conversion |
| **P1 Important** | 11 | Friction points |
| **P2 Polish** | 18 | Nice-to-have |

**Biggest Gaps**:
- Onboarding completion: 40% (target: 60%)
- Two Timers milestone: 18% (target: 40%)
- Install-to-Trial: ~3% (could be 6%+)

---

## Conversion Funnel Summary

```
1000 installs
├── 900 → Start onboarding (10% immediate drop)
├── 720 → Reach permissions (20% OB drop)
├── 504 → Grant permissions (30% decline)  ← P0: Timing too early
├── 454 → Complete onboarding (10% fatigue)
├── 317 → Two timers milestone (30% usage drop)
├── 47  → View paywall (85% drop)  ← P0: Modal fragility
├── 9   → Start trial (80% drop)   ← P0: No error recovery
```

**Current Install→Trial**: ~0.9-3%
**Target Install→Trial**: 6%+ (2x improvement possible)

---

## P0 — Critical Conversion Blockers (4)

### 1. Onboarding Abandonment - No Progress Indicator

**Location**: `src/screens/onboarding/OnboardingFlow.jsx`
**Impact**: 30-40% abandonment (industry standard: 5-10%)

**Problem**: 8 screens with branching paths, no visual indicator of progress.

**Fix**: Add `<StepIndicator current={n} total={8} />` at top of each filter.

---

### 2. Modal Stacking Creates UX Deadlock

**Location**: ActivityCarousel → PremiumModal → MoreActivitiesModal chain

**Problem**:
- 2-3 modals can nest without back navigation
- Race conditions on dismissal
- User loses context and abandons

**Example Chain**:
```
ActivityCarousel (tap "+")
  → PremiumModal
    → MoreActivitiesModal
      → PremiumModal (loop!)
```

**Fix**: Implement modal navigation state machine, single PremiumModal with `source` prop.

---

### 3. Purchase Error Recovery Missing

**Location**: `src/contexts/PurchaseContext.jsx` + `PremiumModal.jsx`

**Failure Scenarios**:
- Network error → Alert → Modal closes → **No retry path**
- Store problem → Generic message → **No guidance**
- Payment pending → **No status check later**

**Impact**: Lost revenue at final step, customer support burden.

**Fix**: Add "Retry Purchase" button, pending status UI in settings, support link.

---

### 4. App Launch Blocks on AsyncStorage

**Location**: `App.js` lines 38-47

**Problem**:
```javascript
const [onboardingCompleted, setOnboardingCompleted] = useState(null);
// null blocks render → blank screen 500-1000ms
```

**Impact**: First impression critical for retention. User perceives app as slow.

**Fix**: Use cached state as optimistic value, show branded splash during load.

---

## P1 — Important Friction (11 items)

| Issue | Location | Impact | Effort |
|-------|----------|--------|--------|
| Paywall copy not personalized | Filter-090-paywall | Lower conversion | 4-6h |
| Discovery modals appear too late | MoreActivitiesModal | Missed preview | 1d |
| Two Timers trigger fragile | TimerScreen:169 | 18% vs 40% target | 30min |
| Freemium limits not communicated | Carousels | Friction at desire | 1h |
| Permission timing suboptimal | Filter-050 | 23% dropout | 1d |
| Settings discovery low | TimerScreen | Premium upsell hidden | 2h |
| Digital timer toggle hidden | TimerScreen | ADHD users miss it | 2h |
| Activity duration not auto-saved | TimerOptionsContext | Daily friction | 1h |
| Branch choice lacks preview | Filter-060 | Decision anxiety | 4h |
| Premium trial language unclear | PremiumModal | Purchase hesitation | 1h |
| Carousel perf on low-end | Carousels | ADHD focus break | 2h |

---

## ADR-003 Conversion Strategy — Status

| ADR-003 Target | Current | Status |
|----------------|---------|--------|
| Timer #2 completion > 40% | 18% | Below |
| Modale rappel → trial > 15% | Unknown | - |
| Discovery → trial > 20% | Unknown | - |
| Trial → Paid > 50% | Unknown | - |
| Install → Paid > 3.5% | ~3% | Borderline |
| Paywall → Trial > 18% | 20% | Above |

**Strategy is valid, execution has gaps**. The "soft conversion" (3-4/10 aggressiveness) philosophy is correct for neuroatypical users. Implementation needs fixes.

---

## Neurodivergent UX Considerations

**Well Implemented**:
- Clean timer-centric UI (minimalist)
- No ads or artificial limits
- Dual-path onboarding (reduces friction)

**Needs Attention**:
- Digital timer hidden (ADHD users need countdown)
- Gesture-only controls (no button fallbacks)
- 8-screen onboarding too long (target: 3-5)
- Permission request before value demo

---

## Recommendations Priority

### Sprint 1 (~8h) — Quick Wins
1. Add Progress Indicator (P0-1) — 2-4h
2. Fix Two Timers Modal trigger (P1-3) — 30min
3. Add Purchase Error Retry (P0-3) — 2-3h
4. Improve Freemium Messaging (P1-4) — 1h

### Sprint 2-3 (~1-2 weeks) — Core Fixes
5. Refactor Modal Navigation (P0-2) — 2-3d
6. Fix AsyncStorage Blocking (P0-4) — 4-6h
7. Move Notification Permission (P1-5) — 1d
8. Branch Preview (P1-9) — 4h

### Q1 2026 — Strategic
9. Condense Onboarding (test 5-screen variant)
10. Feature Flags Infrastructure (A/B testing)
11. Premium Comparison Chart

---

## Target Improvements (3-month horizon)

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| OB Completion | 40% | 55% | +15% |
| Two Timers Reach | 18% | 35% | +17% |
| Install → Trial | 3% | 6% | 2x |

---

## Legacy Reference

| Doc | Status | Notes |
|-----|--------|-------|
| [ADR-003: Stratégie Conversion](../legacy/decisions-adr-003-strateie-conversion.md) | Active | Strategic direction, still valid |
| [Onboarding Brief V1](../legacy/guides-features-onboarding-brief.md) | OUTDATED | V1 tooltips, superseded by V2 filters |

---

## References

- Audit: `_internal/cockpit/knowledge/findings/2025-12-14_05-ux-conversion.md`
- [ADR-003 Conversion Strategy](../legacy/decisions-adr-003-strateie-conversion.md)
- Cross-reference: [Accessibility Report](accessibility.md) (color contrast affects conversion)
- Cross-reference: [Analytics Report](analytics.md) (funnel tracking)

---

**Last Audit**: 2025-12-14 (Claude-Discovery)
**Next Review**: After P0 items completed
