---
created: '2025-12-07'
updated: '2025-12-15'
type: roadmap-synthesis
source: _internal/docs/legacy/ROADMAP.md
---

# ResetPulse — Timeline Synthèse

> Vue cockpit. Source complète : [ROADMAP.md](../../docs/legacy/ROADMAP.md)

---

## Vision

Time Timer visuel pour utilisateurs neuroatypiques.
Laboratoire d'apprentissage dev/marketing/monétisation.
Objectif final : réplication méthode Harry (280€/jour profit net).

---

## Timeline

| Phase | Dates | Statut | Description |
|-------|-------|--------|-------------|
| **M1-M2** | 29 sept - 2 oct | ✅ | Foundation technique RN/Expo |
| **M3-M4** | 2-3 oct | ✅ | Validation terrain, onboarding V1 |
| **M5** | 7-9 oct | ✅ | RevenueCat + IAP freemium |
| **M6** | 13-17 oct | ✅ | Publication iOS (3 tentatives Apple) |
| **M7** | 18-21 oct | ✅ | Publication Android |
| **M7.5** | 20 oct | ✅ | Mixpanel analytics (6 events) |
| **M7.6** | 19-20 oct | ✅ | i18n 15 langues |
| **M8** | 15-16 déc | ✅ | **Phase 2 Complete: v1.4 → v2.0.0** (A11y, UX, Tests) |
| **M9** | 16-17 déc | 🔄 | **Phase 3: QA + Deployment** (Manual QA, screenshots, TestFlight, Deploy Dec 17) |
| **M10** | 17-27 déc | ⏳ | **Analytics Validation** (10 days data, optimization loop) |
| **M11** | 27 déc+ | ⏳ | **v2.1/2.2 + Ads Launch** |

---

## M8 — ✅ COMPLETE (Dec 15)

**Réalisé (Phase 2 P0 Blockers)**:
- ✅ Accessibility: WCAG AA (A1-A4) — modals, touch targets, timer dial, color contrast
- ✅ UX/Conversion: Complete pipeline (U1-U6) — DEV_MODE, AsyncStorage, paywall, progress, recovery, modal stacking
- ✅ Test Coverage: 239/239 tests (100%) — pragmatic smoke suite
- ✅ Git history: 17 commits (Phase 2 + Jest simplification + cleanup)
- ✅ Version bump: v1.4 → v2.0.0 (major feature release)

**Statut**: Production candidate ready. All P0 blockers eliminated.

→ Archive: `workflow/done/mission-post-audits-fix-sequence.md`

---

## M9 — 🔄 CURRENT (Dec 16-17)

**Objectif :** Valider sur appareils, finaliser release v2.0.0

**Chantiers :**
- Manual QA (VoiceOver/TalkBack) on physical devices
- Screenshots update pour stores (AppStore/Google Play)
- TestFlight internal build validation
- Deploy to production (Dec 17 if all green)
- Setup analytics monitoring (10-day window)

→ Mission backlog: `workflow/backlog/mission-phase-3-quick-wins.md`

---

## Décisions clés

| Sujet | Décision | Détails |
|-------|----------|---------|
| Analytics | Mixpanel | [analytics-strategy.md](../../docs/decisions/analytics-strategy.md) |
| Monétisation | Freemium 2+4 | [adr-monetization-v11.md](../../docs/decisions/adr-monetization-v11.md) |
| Keep awake | ON par défaut | [keep-awake-strategy.md](../../docs/decisions/keep-awake-strategy.md) |

---

## M10 — Analytics Validation Window (Dec 17-27)

**Objectif :** Récolter 10 jours de data, valider hypothèses conversion

**KPIs à tracker** (base pour optimisation M11):

| Métrique | Target | Action si <Target |
|----------|--------|----------|
| Onboarding completion | > 65% | Optimize funnel (M11) |
| Paywall view | > 35% | Re-position paywall (M11) |
| Trial start | > 18% | Improve messaging (M11) |
| Overall conversion | > 3.5% | Go/No-Go pour ads |

**Feedback loop**: Analytics + user feedback → optimizations in M11

---

## M11+ — Growth Phase (Déc 27+)

**v2.1/2.2 + Ads Launch**:
- Implement learnings from M10 analytics
- Version bump: v2.1 or v2.2 (minor/patch)
- Launch paid ads (Google Ads, Apple Search Ads)
- Replicate "Méthode Harry" learnings

---

## Learnings capitalisables MoodCycle

- Stack Expo + RN production-ready
- RevenueCat IAP workflow
- Mixpanel analytics pattern
- Apple/Google Review process
- Méthode Harry (si validée M10)
