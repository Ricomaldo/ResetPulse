---
created: '2025-12-14'
updated: '2025-12-14'
status: legacy
type: comparison
audit: '#2 - Performance'
---

# Performance Documentation - Legacy Comparison

> Comparaison entre la documentation performance legacy (M7) et l'audit #2 (2025-12-14)

## Overview

Ce document trace l'**upgrade documentaire** pour la performance ResetPulse, comparant les recommendations legacy avec les findings actuels.

---

## Files Processed

### Legacy Files Status

| File | Status | Action |
|------|--------|--------|
| `decisions-keep-awake-strategy.md` | ✅ VALIDATED | Promote to ADR |
| `decisions-keep-awake-technical-behavior.md` | ✅ VALIDATED | Archive (merged) |

### Rationale

**Keep Awake Strategy** — Decision document with benchmarks, rationale, implementation checklist. Should be formalized as ADR since decision was implemented and validated.

**Technical Behavior** — Technical details about cleanup, scope, safety. Content merged into ADR; original archived.

---

## Evolution Matrix

### Keep Awake Implementation

| Aspect | Legacy Recommendation | Current Implementation | Status |
|--------|----------------------|------------------------|--------|
| **Default** | ON | ON | ✅ Match |
| **Hook-based** | useTimerKeepAwake | useKeepAwake | ✅ Match |
| **Cleanup** | useEffect return | useEffect return | ✅ Match |
| **Scope** | App-only | App-only | ✅ Match |
| **Toggle** | Settings available | Settings available | ✅ Match |
| **Battery monitor** | Optional (<10% auto-off) | Not implemented | ⏳ P3 |

### Performance Areas (New vs Legacy)

| Area | Legacy Coverage | Audit #2 Coverage |
|------|-----------------|-------------------|
| Keep Awake | ✅ Detailed ADR | ✅ Validated |
| RevenueCat Init | ❌ Not covered | 🔴 P1 Gap found |
| Context Re-renders | ❌ Not covered | 🔴 P2 Gap found |
| AsyncStorage Batching | ❌ Not covered | 🟡 P3 Gap found |
| Animation Performance | ❌ Not covered | ✅ Excellent |
| Cleanup Patterns | ⚠️ Keep awake only | ✅ Comprehensive |
| Bundle Size | ❌ Not covered | ✅ 65MB (healthy) |
| Memory Leaks | ❌ Not covered | ✅ None detected |

---

## Gap Analysis

### What Legacy Covered → VALIDATED

| Topic | Legacy Doc | Audit Validation |
|-------|-----------|------------------|
| Keep awake strategy | decisions-keep-awake-strategy.md | ✅ Implemented correctly |
| Cleanup patterns | decisions-keep-awake-technical-behavior.md | ✅ Comprehensive |
| App-scoped safety | decisions-keep-awake-technical-behavior.md | ✅ Confirmed |

### What Legacy Didn't Cover → NEW FINDINGS

| Gap | Audit Finding | Priority |
|-----|---------------|----------|
| RevenueCat cold start | +200-500ms per launch | P1 |
| Performance monitoring | No TTI/metrics tracking | P1 |
| Context cascade | 17 values = mass re-render | P2 |
| Timer RAF vs setTimeout | Battery drain | P2 |
| AsyncStorage serial reads | Could batch | P3 |

---

## Extracted ADR (From Legacy)

The keep-awake decision documents should be promoted to formal ADR:

### ADR: Keep Awake Strategy

**Decision**: Keep awake ON by default during timer running

**Rationale**:
1. Timer VISUAL app = écran actif attendu
2. Benchmark industrie (Time Timer, Forest): ON par défaut
3. Persona TDAH: friction minimale prioritaire
4. Impact batterie acceptable (5-8% / 25min)
5. Opt-out facile via Settings

**Implementation**:
- Hook-based (`useKeepAwake` from expo-keep-awake)
- Cleanup on unmount (useEffect return)
- Toggle in Settings (section Batterie)
- Default: `keepAwakeEnabled: true`

**Status**: ✅ IMPLEMENTED & VALIDATED (Dec 2025)

---

## Progression Summary

### Legacy (M7, Oct 2025)

- Keep awake: Detailed decision + technical behavior
- Performance scope: Single feature (keep awake)
- Coverage: Narrow but deep

### Audit #2 (Dec 2025)

- Performance grade: B+
- Scope: Full app (startup, runtime, memory, bundle)
- Findings: 2 P1, 3 P2, 6 P3
- Strengths: 6 areas validated

### Delta

| Aspect | Before | After | Change |
|--------|--------|-------|--------|
| Keep Awake | Documented | Validated | ✅ |
| RevenueCat Perf | Unknown | P1 Gap | 🆕 |
| Context Perf | Unknown | P2 Gap | 🆕 |
| Animation Perf | Unknown | Excellent | 🆕 |
| Memory Mgmt | Unknown | Complete | 🆕 |
| Bundle Size | Unknown | 65MB OK | 🆕 |

---

## Files to Archive

| File | Destination | Reason |
|------|-------------|--------|
| `decisions-keep-awake-technical-behavior.md` | `.trash/` | Merged into ADR |

## Files to Promote

| File | Destination | Reason |
|------|-------------|--------|
| `decisions-keep-awake-strategy.md` | `decisions/adr-keep-awake.md` | Formalize as ADR |

---

## References

- **Audit Source**: `_internal/cockpit/knowledge/findings/2025-12-14_02-performance.md`
- **New Baseline**: `_internal/docs/reports/audit-performance-baseline-2025-12.md`
- **Legacy Keep Awake Strategy**: `_internal/docs/legacy/decisions-keep-awake-strategy.md`
- **Legacy Keep Awake Technical**: `_internal/docs/legacy/decisions-keep-awake-technical-behavior.md`

---

**Generated by**: Atlas/Claude-Architect (Phase 2)
**Date**: 2025-12-14
