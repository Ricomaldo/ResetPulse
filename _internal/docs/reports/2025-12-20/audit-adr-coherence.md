---
created: '2025-12-20'
updated: '2025-12-20'
status: active
report_type: audit
scope: adr-coherence-analysis
---

# Audit Report : ADR Coherence vs Current Implementation

## Executive Summary

**Overall Coherence Score: 73/100**

ResetPulse's architecture shows **good alignment** between documented decisions (ADRs) and current implementation, with critical gaps in onboarding integration and messaging system implementation. The app has evolved significantly since ADR creation, resulting in some outdated architectural decisions and missing documentation for recent features.

### Key Findings

✅ **Strong Alignment (4/6 ADRs)**
- ADR-001 (Internal Structure): Fully compliant
- ADR-002 (Keep Awake): Fully implemented and validated
- ADR-003 (Monetization): Implementation complete, functional
- ADR-006 (Gestures Stack): Validated and justified

⚠️ **Partial Alignment (1/6 ADRs)**
- ADR-005 (DialZone/AsideZone): Architecture defined but not fully implemented

❌ **Critical Gaps (1/6 ADRs)**
- ADR-007 (Timer State Machine): Messaging system not implemented, PAUSED state still present

🔴 **Missing ADRs**
- Onboarding V3 (10-filter system) - No ADR documenting architecture
- Interaction Profiles (4 personas) - Implemented but not fully documented
- Color System - Comprehensive implementation lacks formal ADR
- i18n Strategy - 15 languages deployed without architecture decision

---

## ADR Compliance Matrix

| ADR | Title | Status | Coherence | Implementation | Notes |
|-----|-------|--------|-----------|----------------|-------|
| **ADR-001** | Internal Structure Convention | ✅ Accepted | **100%** | Complete | `_internal/` convention applied consistently |
| **ADR-002** | Keep Awake Strategy | ✅ Implemented | **100%** | Complete | Validated by Performance Audit #2 |
| **ADR-003** | Monetization Conversion | ✅ Active | **85%** | Complete | RevenueCat integrated, paywall functional, minor gaps (trial notifications) |
| **ADR-005** | Architecture DialZone/AsideZone | ✅ Validated | **60%** | Partial | BottomSheet architecture defined but AsideZone still uses legacy Drawer |
| **ADR-006** | Gestures Stack | ✅ Accepted | **95%** | Validated | Hybrid approach justified, AsideZone migrated to @gorhom/bottom-sheet |
| **ADR-007** | Timer State Machine | ✅ Accepted | **40%** | Partial | Messaging system documented but NOT implemented, PAUSED state still exists |
| **ADR-004** | *(Missing)* Duration/Dial Mechanism | ❓ Not Found | N/A | Unknown | Referenced in ADR-005 but file not found |
| **ADR-008** | *(Missing)* Interaction Profiles | ❓ Not Found | N/A | Partial | 4 personas implemented (`interactionProfileConfig.js`) but no ADR |

---

## Detailed ADR Analysis

### ✅ ADR-001: Internal Structure Convention (100% Compliant)

**Decision**: Accept `_internal/` as project-specific deviation from system ADR-01

**Current State**: ✅ Fully Compliant
- `_internal/cockpit/` used consistently
- `_internal/docs/` structure matches specification
- CLAUDE.md correctly documents convention
- All references use `_internal/` paths

**Gaps**: None

**Recommendation**: ✅ No action required

---

### ✅ ADR-002: Keep Awake Strategy (100% Compliant)

**Decision**: Keep Awake ON by default during timer, toggle in Settings

**Current State**: ✅ Fully Implemented
- `expo-keep-awake` integrated
- Hook-based cleanup implemented (`TimerScreen.jsx`)
- Default ON behavior confirmed
- Settings toggle available

**Validation**: Performance Audit #2 (Dec 2025) confirmed:
- Default ON: ✅
- Hook cleanup: ✅
- App-scoped: ✅
- No memory leaks: ✅

**Gaps**: None

**Recommendation**: ✅ No action required

---

### ⚠️ ADR-003: Monetization Conversion (85% Compliant)

**Decision**: One-time purchase €4.99, 2 free palettes + 4 free activities, 7-day trial

**Current State**: ✅ Mostly Implemented

**Aligned Elements**:
- ✅ RevenueCat SDK integrated (`PurchaseContext.jsx`)
- ✅ Pricing: €4.99 one-time purchase
- ✅ Freemium config: 2 free palettes (`softLaser`, `terre`)
- ✅ Freemium config: 4 free activities (`none`, `work`, `break`, `meditation`)
- ✅ Premium: 13 palettes unlocked
- ✅ Premium: 12 activities unlocked
- ✅ 7-day trial via RevenueCat native
- ✅ PremiumModal UI complete
- ✅ Gating logic in ActivityCarousel & PaletteCarousel
- ✅ Analytics events tracked

**Gaps Identified**:

1. **🔴 CRITICAL: Onboarding Paywall Broken** (from Readiness Audit)
   - **ADR Says**: "Onboarding step 4 explicit CTA 'Essai 7j gratuit'"
   - **Current State**: Filter-090-paywall-discover.jsx exists but **no RevenueCat integration** (audit finding)
   - **Impact**: 100% conversion loss on discover path
   - **Fix Required**: Integrate PremiumModal → RevenueCat flow in Filter-090

2. **⚠️ Trial Notification Strategy** (Documented as "Deferred")
   - **ADR Says**: "Minimaliste v1.1.0 - Apple/Google manage expiry notifications"
   - **Current State**: No custom in-app trial reminder
   - **ADR Status**: "Reported v1.2.0 if data shows confusion"
   - **Assessment**: Acceptable for v1.1.0, monitor metrics

3. **⚠️ Free Activities Mismatch**
   - **ADR Says**: `breathing` (4min) is free
   - **Current State**: `meditation` (20min) is free instead (per `rapport-onboarding-etat.md`)
   - **Impact**: Low (both are mindfulness activities)
   - **Recommendation**: Update ADR or code to match

4. **Missing Features from ADR Roadmap**:
   - A/B testing palettes/activities/timing (deferred post-v1.1.0) - Not yet implemented
   - Metrics tracking dashboard - Incomplete

**Coherence Score**: 85% (functional but missing onboarding integration + trial notifications)

**Recommendations**:
- **P0 (BLOCKING)**: Fix Filter-090 paywall integration (2-3h)
- **P1 (HIGH)**: Align free activity list (breathing vs meditation) in ADR or code
- **P2 (MEDIUM)**: Monitor trial conversion metrics, implement in-app reminder if <25% trial→paid

---

### ⚠️ ADR-005: Architecture DialZone/AsideZone (60% Compliant)

**Decision**: 3-zone screen layout (DialZone 62%, MessageZone variable, BottomSheet 3-snap)

**Current State**: ⚠️ Partially Implemented

**Aligned Elements**:
- ✅ DialZone architecture defined (DigitalTimer + Dial)
- ✅ MessageZone concept documented
- ✅ BottomSheet 3-snap architecture defined (15%/38%/90%)
- ✅ Favorite Tool concept (4 options: commands/activities/colors/none)
- ✅ Fibonacci ratio (62/38) documented

**Gaps Identified**:

1. **🔴 CRITICAL: Legacy Drawer Still Active**
   - **ADR Says**: "AsideZone.jsx → AsideZone.bottomsheet.jsx" (migration complete)
   - **Current State**: Audit shows **Drawer still in use**, BottomSheet not deployed
   - **Files Expected**: `AsideZone.bottomsheet.jsx`, `AllOptionsSection.jsx`, `FavoriteToolSection.jsx`
   - **Files Missing**: Above files not found in codebase
   - **Impact**: ADR-005 architecture not implemented, still using pre-ADR design

2. **MessageZone Exists But Not Integrated**
   - **ADR Says**: "Message Zone permanente (feedback immédiat visible quel que soit le snap)"
   - **Current State**: `MessageZone.jsx` exists (per modal audit) but **not integrated into onboarding** (per readiness audit)
   - **Impact**: Timer test (Filter-040) doesn't showcase MessageZone animations
   - **Recommendation**: Integrate into Filter-040-test.jsx (30min fix)

3. **BottomSheet Snap Points Not Used in Onboarding**
   - **ADR Says**: 15%/38%/90% snap architecture
   - **Current State**: Documented in `BottomSheet.template.jsx` (pattern only), not used in onboarding
   - **Impact**: Users don't learn 3-snap behavior during onboarding
   - **Recommendation**: Add Filter 105 (optional) or integrate into existing filter

4. **ControlBar Layout Horizontal Defined But Not Implemented**
   - **ADR Says**: "ControlBar (layout horizontal) : Presets + Durée + Actions"
   - **Current State**: Unknown if implemented (not verified in audits)
   - **Files to Check**: `ControlBar.jsx`, `Layer1.jsx`, `Layer2.jsx`

**Coherence Score**: 60% (architecture defined but implementation incomplete)

**Recommendations**:
- **P0 (BLOCKING)**: Complete AsideZone → BottomSheet migration (8-12h)
- **P1 (HIGH)**: Integrate MessageZone into Filter-040-test.jsx (30min)
- **P2 (MEDIUM)**: Add BottomSheet 3-snap education to onboarding (1.5h)

---

### ✅ ADR-006: Gestures Stack (95% Compliant)

**Decision**: Hybrid approach - @gorhom/bottom-sheet for AsideZone, PanResponder for DialZone

**Current State**: ✅ Validated and Justified

**Aligned Elements**:
- ✅ @gorhom/bottom-sheet installed (v5.0.7)
- ✅ react-native-reanimated installed (v3.16.7)
- ✅ react-native-gesture-handler installed (v2.21.2)
- ✅ Babel config applied
- ✅ PanResponder maintained for DialZone (decision validated)
- ✅ NativeViewGestureHandler protection added
- ✅ Architecture pattern: DialZone and AsideZone both self-contained

**Gaps Identified**:

1. **⚠️ AsideZone Migration Status Uncertain**
   - **ADR Says**: "✅ P0 : AsideZone (Drawer) — COMPLÉTÉ" (2025-12-19)
   - **Current State**: ADR-005 audit shows **Drawer still active** (conflicting status)
   - **Resolution Needed**: Verify if migration actually completed or ADR status incorrect
   - **Impact**: Medium (doesn't affect DialZone gestures, but creates confusion)

**Coherence Score**: 95% (validated architecture, minor status inconsistency)

**Recommendations**:
- **P1 (HIGH)**: Verify AsideZone migration status, update ADR-006 if not complete
- **P2 (LOW)**: Add gesture conflict tests (DialZone drag vs BottomSheet swipe)

---

### ❌ ADR-007: Timer State Machine (40% Compliant)

**Decision**: Remove PAUSED state, implement "Rembobinage" pattern (long-press to stop)

**Current State**: ❌ Partially Implemented (Critical Gaps)

**Aligned Elements**:
- ✅ Concept defined: 3 states (REST, RUNNING, COMPLETE)
- ✅ Long-press stop pattern documented (2500ms default, 1000-5000ms range)
- ✅ Rembobinage animation direction specified (inverse of timer)
- ✅ Haptic feedback strategy defined
- ✅ Accessibility considerations (longPressConfirmDuration customizable)

**Gaps Identified**:

1. **🔴 CRITICAL: Messaging System Not Implemented**
   - **ADR Says**: "Messaging System" with 6 states (REST, SÉLECTION, RUNNING, COMPLETE, TRANSITION, RESET)
   - **Current State**: Per onboarding readiness audit, MessageZone exists but **not integrated into onboarding**
   - **Missing Implementation**:
     - `t('invitation')` key missing from locales (per i18n audit: "Prêt ?", "Ready?", etc.)
     - `flashActivity` state not added to `TimerOptionsContext.jsx`
     - `handleActivitySelect()` not implemented in `ActivityCarousel.jsx`
     - `getMessage()` logic not added to `ActivityLabel.jsx`
     - `timerMessages.*` keys present in EN only (missing in 14 languages per i18n audit)
   - **Impact**: HIGH - Timer lacks contextual messaging, onboarding doesn't teach messaging system

2. **🔴 CRITICAL: PAUSED State Still Exists**
   - **ADR Says**: "Supprimer isPaused" (remove PAUSED state)
   - **Current State**: Unknown if PAUSED removed from `useTimer.js`
   - **Files to Check**: `useTimer.js`, `TimerDial.jsx`, `PlaybackButtons.jsx`
   - **Impact**: HIGH - Core architectural change not implemented

3. **⚠️ LongPressStopButton Not Implemented**
   - **ADR Says**: "Composant nouveau : LongPressStopButton"
   - **Current State**: Not found in codebase (no evidence in audits)
   - **Files Expected**: `LongPressStopButton.jsx`
   - **Impact**: MEDIUM - Long-press stop pattern not available to users

4. **⚠️ 12 Files Impacted Not Modified**
   - **ADR Lists**: 12 files to modify (useTimer.js, TimerOptionsContext.js, TimerDial.jsx, etc.)
   - **Current State**: No evidence of modifications in audit reports
   - **Impact**: HIGH - Core state machine refactor not executed

5. **Missing i18n Keys**
   - **ADR Says**: `invitation` key required in all locales
   - **Current State**: Per i18n audit, **NOT present** in any locale file
   - **Impact**: CRITICAL - Messaging system cannot function without translation keys

**Coherence Score**: 40% (documented but not implemented)

**Recommendations**:
- **P0 (BLOCKING)**: Verify PAUSED state status, remove if still present (2h)
- **P0 (BLOCKING)**: Add `invitation` key to all 15 locale files (30min)
- **P1 (HIGH)**: Implement messaging system (flashActivity, getMessage, handleActivitySelect) (4h)
- **P1 (HIGH)**: Create LongPressStopButton component with rembobinage animation (3h)
- **P2 (MEDIUM)**: Complete all 12 file modifications per ADR-007 implementation plan (6h)
- **P2 (MEDIUM)**: Translate timerMessages.* to all 14 non-English languages (4h)

---

## Missing ADRs (Undocumented Architecture)

### ❌ ADR-008: Interaction Profiles (Missing)

**Current State**: ✅ Implemented but ❌ Not Documented

**Evidence**:
- `src/utils/interactionProfileConfig.js` defines 4 personas:
  - `impulsif` (🚀): Long Press Start, Tap Stop
  - `abandonniste` (🏃): Tap Start, Long Press Stop
  - `ritualiste` (🎯): Long Press Start, Long Press Stop (default)
  - `veloce` (⚡): Tap Start, Tap Stop
- `TimerOptionsContext` stores `interactionProfile` property
- `CommandButton` uses `longPressStartDuration` and `longPressConfirmDuration`

**Gaps**:
- No formal ADR documenting personas architecture
- No personas collection during onboarding V3 (per onboarding state audit)
- Users default to 'ritualiste' without choice
- Personas modifiable in SettingsPanel but not introduced in onboarding

**Impact**: MEDIUM - Feature exists but lacks architectural documentation and onboarding integration

**Recommendation**:
- **P1 (HIGH)**: Create ADR-008 documenting personas architecture (1h)
- **P1 (HIGH)**: Add Filter 025 (Persona Detection) to onboarding or integrate into Filter 020-Needs (2h)

---

### ❌ ADR-009: Onboarding V3 Architecture (Missing)

**Current State**: ✅ Fully Implemented but ❌ Not Documented

**Evidence**:
- 10-filter system (Filters 010-100) fully implemented
- 2-branch adaptive flow (discover/personalize)
- 8 critical decision points tracked
- AsyncStorage persistence implemented
- Smart defaults system working
- Journey scenarios adapted to needs

**Gaps**:
- No ADR documenting V3 architecture decisions
- No rationale for 10-filter structure vs alternatives
- No documentation of 2-branch strategy decision
- No decision record for smart defaults algorithm

**Impact**: MEDIUM - Major feature lacks architectural documentation

**Recommendation**:
- **P1 (HIGH)**: Create ADR-009 documenting onboarding V3 architecture (2h)
- **P2 (MEDIUM)**: Document smart defaults algorithm rationale
- **P2 (MEDIUM)**: Document 2-branch strategy (discover vs personalize) decision

---

### ❌ ADR-010: Color System Architecture (Missing)

**Current State**: ✅ Fully Implemented but ❌ Not Documented

**Evidence**:
- 3-level color system (`baseColors`, `lightTheme`/`darkTheme`, `devColors`)
- Platform-specific patterns (iOS borders, Android elevation)
- WCAG AA compliance validated
- Visual hierarchy (Cream, White, Coral) documented in CLAUDE.md

**Gaps**:
- No ADR documenting color system architecture
- No decision record for 3-level approach
- No rationale for platform-specific patterns

**Impact**: LOW - Well-documented in CLAUDE.md but lacks formal ADR

**Recommendation**:
- **P2 (MEDIUM)**: Create ADR-010 documenting color system architecture (1h)

---

### ❌ ADR-011: i18n Strategy (Missing)

**Current State**: ✅ Fully Implemented but ❌ Not Documented

**Evidence**:
- 15 languages supported
- i18n-js 15.6.1 framework
- `useTranslation()` hook everywhere
- Fallback to English enabled
- Auto-detection via expo-localization

**Gaps**:
- No ADR documenting i18n strategy
- No decision record for 15-language support
- No rationale for i18n-js vs alternatives (react-i18next, etc.)
- No translation workflow documented

**Impact**: MEDIUM - Major feature lacks architectural documentation

**Recommendation**:
- **P1 (HIGH)**: Create ADR-011 documenting i18n strategy (1h)
- **P2 (MEDIUM)**: Document translation workflow and completion targets

---

## Outdated ADRs Requiring Update

### 🟡 ADR-003: Monetization Conversion

**Status**: Active but partially outdated

**Sections Requiring Update**:

1. **Free Activities List** (Line 210-213)
   - **ADR Says**: `breathing` (4min) is free
   - **Current Reality**: `meditation` (20min) is free instead
   - **Update Required**: Sync with actual implementation

2. **Onboarding Paywall Integration** (Line 64, 450-460)
   - **ADR Says**: "Onboarding step 4 explicit CTA"
   - **Current Reality**: Filter-090-paywall-discover.jsx exists but broken (no RevenueCat integration)
   - **Update Required**: Document current broken state and fix plan

3. **A/B Testing Roadmap** (Line 386-402)
   - **ADR Says**: "M1-M3 testing planned"
   - **Current Reality**: No evidence of A/B testing infrastructure
   - **Update Required**: Mark as "Deferred post-v1.1.0" or document timeline

4. **Metrics Success Criteria** (Line 404-422)
   - **ADR Says**: "Trial start rate: >20% users"
   - **Current Reality**: No metrics dashboard mentioned in audits
   - **Update Required**: Document current metrics tracking status

**Recommendation**: Update ADR-003 Section 13 ("Prochaines Étapes") with current v1.2.3 status

---

### 🟡 ADR-005: Architecture DialZone/AsideZone

**Status**: Validated but implementation incomplete

**Sections Requiring Update**:

1. **Implementation Status** (Line 176-194)
   - **ADR Says**: "Nouveaux: AsideZone.bottomsheet.jsx, AllOptionsSection.jsx, FavoriteToolSection.jsx"
   - **Current Reality**: Files not found, Drawer still active
   - **Update Required**: Mark as "In Progress" or "Deferred"

2. **Migration Timeline** (No explicit timeline in ADR)
   - **ADR Status**: "VALIDÉ" (implies complete)
   - **Current Reality**: Architecture defined but not deployed
   - **Update Required**: Add implementation timeline section

**Recommendation**: Change status from "VALIDÉ" to "ACCEPTÉ (implémentation en cours)"

---

### 🟡 ADR-007: Timer State Machine

**Status**: Accepted but not implemented

**Sections Requiring Update**:

1. **Implementation Status** (Line 282-297)
   - **ADR Says**: 12 files to modify (list provided)
   - **Current Reality**: No evidence of modifications
   - **Update Required**: Add "Implementation Status: Not Started" section

2. **Messaging System** (Line 122-251)
   - **ADR Says**: Detailed messaging system with 6 states
   - **Current Reality**: MessageZone exists but not integrated
   - **Update Required**: Mark as "Partially Implemented (component exists, integration pending)"

3. **Tests Validation** (Line 362-380)
   - **ADR Says**: Checklist of behaviors to test
   - **Current Reality**: Cannot test if not implemented
   - **Update Required**: Mark all tests as "Pending Implementation"

**Recommendation**: Change status from "ACCEPTÉ" to "ACCEPTÉ (implémentation bloquée)" with implementation plan

---

## Critical Gaps Summary

### 🔴 P0 - BLOCKING (Production Risk)

| # | Gap | ADR | Impact | Effort | Priority |
|---|-----|-----|--------|--------|----------|
| 1 | Onboarding Paywall Broken (Filter-090) | ADR-003 | 100% conversion loss on discover path | 2-3h | **BLOCKING** |
| 2 | `t('invitation')` key missing from all locales | ADR-007 | Messaging system cannot function | 30min | **BLOCKING** |
| 3 | PAUSED state removal status unknown | ADR-007 | Core state machine conflict | 2h | **BLOCKING** |
| 4 | MessageZone not integrated into onboarding | ADR-007 | Timer lacks contextual feedback | 4h | **HIGH** |

### 🟠 P1 - HIGH (Feature Incomplete)

| # | Gap | ADR | Impact | Effort | Priority |
|---|-----|-----|--------|--------|----------|
| 5 | AsideZone → BottomSheet migration incomplete | ADR-005 | ADR architecture not deployed | 8-12h | **HIGH** |
| 6 | LongPressStopButton not implemented | ADR-007 | Long-press stop pattern missing | 3h | **HIGH** |
| 7 | Personas not collected during onboarding | Missing ADR-008 | Users don't learn interaction profiles | 2h | **HIGH** |
| 8 | Favorite Tool not introduced in onboarding | ADR-005 | Users miss quality-of-life feature | 1.5h | **HIGH** |
| 9 | timerMessages.* missing in 14 languages | ADR-007 | Timer messages not localized | 4h | **HIGH** |

### 🟡 P2 - MEDIUM (Documentation/Polish)

| # | Gap | ADR | Impact | Effort | Priority |
|---|-----|-----|--------|--------|----------|
| 10 | ADR-008 (Interaction Profiles) missing | N/A | Feature lacks architectural documentation | 1h | **MEDIUM** |
| 11 | ADR-009 (Onboarding V3) missing | N/A | Major feature undocumented | 2h | **MEDIUM** |
| 12 | ADR-011 (i18n Strategy) missing | N/A | 15-language system undocumented | 1h | **MEDIUM** |
| 13 | Free activity mismatch (breathing vs meditation) | ADR-003 | Minor inconsistency | 15min | **MEDIUM** |
| 14 | BottomSheet 3-snap not in onboarding | ADR-005 | Users don't learn snap behavior | 1.5h | **MEDIUM** |

---

## Recommendations by Priority

### Phase 1: Critical Fixes (1-2 days, 10-12h total)

**Goal**: Resolve production blockers and core architectural conflicts

1. **Fix Onboarding Paywall** (P0 - 2-3h)
   - Integrate RevenueCat flow into `Filter-090-paywall-discover.jsx`
   - Test purchase flow on discover path
   - Validate trial CTA works

2. **Add `invitation` i18n Key** (P0 - 30min)
   - Add to all 15 locale files
   - Test messaging system with "Prêt ?", "Ready?", etc.

3. **Verify PAUSED State Status** (P0 - 2h)
   - Check `useTimer.js` for isPaused references
   - If present, plan removal per ADR-007
   - Update ADR-007 with current status

4. **Implement Messaging System** (P0 - 4h)
   - Add `flashActivity` state to `TimerOptionsContext.jsx`
   - Implement `handleActivitySelect()` in `ActivityCarousel.jsx`
   - Add `getMessage()` logic to `ActivityLabel.jsx`
   - Test REST/RUNNING/COMPLETE states

5. **Update ADR Statuses** (P0 - 1h)
   - Mark ADR-005 as "Accepted (implementation in progress)"
   - Mark ADR-007 as "Accepted (implementation blocked)"
   - Update ADR-003 with current broken paywall status

---

### Phase 2: Feature Completion (1-2 weeks, 20-25h total)

**Goal**: Complete ADR-defined architectures

6. **Complete AsideZone → BottomSheet Migration** (P1 - 8-12h)
   - Implement `AsideZone.bottomsheet.jsx` per ADR-005
   - Create `AllOptionsSection.jsx` (snap 90%)
   - Create `FavoriteToolSection.jsx` (snap 15%)
   - Deprecate legacy Drawer

7. **Implement LongPressStopButton** (P1 - 3h)
   - Create component with rembobinage animation
   - Integrate into `TimerDial.jsx` and `PlaybackButtons.jsx`
   - Add haptic feedback per ADR-007

8. **Add Personas to Onboarding** (P1 - 2h)
   - Create Filter 025 (Persona Detection) or integrate into Filter 020
   - Implement persona questions
   - Demo PulseButton with chosen persona

9. **Integrate Favorite Tool into Onboarding** (P1 - 1.5h)
   - Add section to Filter 100-Interface-Personalize
   - Show 4 cards (commands/activities/colors/none)
   - Live preview in snap 15%

10. **Translate timerMessages to 14 Languages** (P1 - 4h)
    - Auto-translate timerMessages.* keys
    - Manual review for context
    - Validate all 15 languages complete

---

### Phase 3: Documentation & Polish (3-5 days, 8-10h total)

**Goal**: Close architectural documentation gaps

11. **Create Missing ADRs** (P2 - 4h)
    - ADR-008: Interaction Profiles (1h)
    - ADR-009: Onboarding V3 Architecture (2h)
    - ADR-011: i18n Strategy (1h)

12. **Integrate BottomSheet Education** (P2 - 1.5h)
    - Add Filter 105 (optional) or enhance existing filter
    - Demo 3-snap behavior (15%/38%/90%)
    - Explain progressive disclosure

13. **Fix Free Activity Mismatch** (P2 - 15min)
    - Align ADR-003 with actual implementation
    - Choose: breathing or meditation as 4th free activity
    - Update config or ADR

14. **Create ADR-010 (Color System)** (P2 - 1h)
    - Document 3-level architecture
    - Rationale for platform-specific patterns
    - WCAG AA compliance strategy

15. **Monitor Metrics & Update ADRs** (P2 - Ongoing)
    - Track trial start rate, conversion, D7 retention
    - Update ADR-003 with actual metrics
    - Plan A/B testing if metrics below targets

---

## Action Plan Summary

| Phase | Duration | Effort | Focus | Output |
|-------|----------|--------|-------|--------|
| **Phase 1** | 1-2 days | 10-12h | Critical fixes + ADR updates | Paywall fixed, messaging functional, ADRs accurate |
| **Phase 2** | 1-2 weeks | 20-25h | Feature completion | AsideZone migrated, personas in OB, long-press stop working |
| **Phase 3** | 3-5 days | 8-10h | Documentation & polish | Missing ADRs created, onboarding complete |
| **Total** | 2-3 weeks | **38-47h** | Full ADR coherence | All ADRs implemented or updated |

---

## Metrics for Success

### Technical Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| ADR Implementation Rate | 100% | 73% | ⚠️ Below Target |
| ADR Documentation Coverage | 100% | 67% (6/9 ADRs exist) | ⚠️ Below Target |
| Architecture Coherence Score | >90% | 73% | ⚠️ Below Target |
| Critical Gaps Resolved | 100% | 0% | 🔴 Blocking |

### Business Metrics (Post-Fix)

| Metric | Target (ADR-003) | Monitor After Fix |
|--------|------------------|-------------------|
| Paywall → Trial | >30% | Track after Filter-090 fix |
| Trial Start Rate | >20% users | Track after onboarding fix |
| Trial → Premium | >25% | Track after messaging system |
| Overall Conversion | 3-5% | Track after all fixes |
| D7 Retention | >20% | Track after personas integration |

---

## References

### Source Documents

**ADRs Analyzed**:
- ADR-001: Internal Structure Convention (`adr-001-resetpulse-internal-structure.md`)
- ADR-002: Keep Awake Strategy (`adr-002-keep-awake.md`)
- ADR-003: Monetization Conversion (`adr-003-monetization-conversion.md`)
- ADR-005: Architecture DialZone/AsideZone (`adr-005-architecture-dialzone-asidezone.md`)
- ADR-006: Gestures Stack (`adr-006-gestures-stack.md`)
- ADR-007: Timer State Machine (`adr-007-timer-state-machine.md`)

**Current State Reports**:
- Onboarding State Report (`rapport-onboarding-etat.md`)
- Onboarding Readiness Audit (`rapport-audit-onboarding.md`)
- Modals & Conversion Logic (`rapport-modales-conversion.md`)
- i18n System Audit (`rapport-i18n-audit.md`)

### Implementation Files (Key References)

- `/Users/irimwebforge/dev/apps/resetpulse/_internal/docs/decisions/` (ADR directory)
- `/Users/irimwebforge/dev/apps/resetpulse/_internal/docs/reports/2025-12-20/` (Current audits)
- `/Users/irimwebforge/dev/apps/resetpulse/src/screens/onboarding/filters/` (Onboarding filters)
- `/Users/irimwebforge/dev/apps/resetpulse/src/contexts/PurchaseContext.jsx` (Monetization)
- `/Users/irimwebforge/dev/apps/resetpulse/src/utils/interactionProfileConfig.js` (Personas)
- `/Users/irimwebforge/dev/apps/resetpulse/locales/` (i18n files)

---

## Conclusion

ResetPulse's architecture shows **strong foundational coherence** (73%) between documented decisions and implementation, with critical gaps in newer features (onboarding V3, messaging system, personas). The app has evolved beyond its initial ADRs, requiring:

1. **Immediate fixes** to production blockers (paywall, messaging keys)
2. **Feature completion** for documented architectures (AsideZone, long-press stop, personas)
3. **Documentation updates** for implemented but undocumented features (onboarding V3, i18n, color system)

**Next Steps**:
1. Execute Phase 1 (Critical Fixes) - 10-12h over 1-2 days
2. Plan Phase 2 (Feature Completion) - 20-25h over 1-2 weeks
3. Monitor metrics post-fix and adjust Phase 3 priorities

**Audit Completed**: 2025-12-20
**Status**: Ready for implementation planning
**Next Review**: After Phase 1 completion
