---
created: '2025-12-07'
updated: '2025-12-14'
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
| **M8** | En cours | 🔄 | **Optimisation conversion** |
| **M10** | Nov 2025 | ⏳ | Test marketing (conditionnel M8) |
| **M11+** | Déc 2025+ | ⏳ | Scaling ou pivot MoodCycle |

---

## M8 — Position actuelle

**Objectif :** Maximiser conversion trial→paid avant pub

**Chantiers :**
- Onboarding V2 (6 filtres)
- Analytics funnel granulaire
- Baseline 7j validation

→ Mission active : `active/m8-onboarding-v2.md`

---

## Décisions clés

| Sujet | Décision | Détails |
|-------|----------|---------|
| Analytics | Mixpanel | [analytics-strategy.md](../../docs/decisions/analytics-strategy.md) |
| Monétisation | Freemium 2+4 | [adr-monetization-v11.md](../../docs/decisions/adr-monetization-v11.md) |
| Keep awake | ON par défaut | [keep-awake-strategy.md](../../docs/decisions/keep-awake-strategy.md) |

---

## Go/No-Go M10

| Métrique | Target | Bloqueur |
|----------|--------|----------|
| Onboarding completion | > 65% | < 50% |
| Paywall view | > 35% | < 25% |
| Trial start | > 18% | < 10% |
| Overall conversion | > 3.5% | < 2% |

---

## Learnings capitalisables MoodCycle

- Stack Expo + RN production-ready
- RevenueCat IAP workflow
- Mixpanel analytics pattern
- Apple/Google Review process
- Méthode Harry (si validée M10)
