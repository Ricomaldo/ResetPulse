---
created: '2025-12-07'
updated: '2025-12-12'
status: active
type: milestone
milestone: M8
---

# M8 — Optimisation Conversion

## Objectif Stratégique

M8 = Optimisation Conversion. Transformer les utilisateurs gratuits en abonnés via :
1. **Améliorer l'UX** (onboarding 6 filtres > tooltips)
2. **Mesurer le funnel** (analytics granulaires par étape)
3. **Valider l'impact** (comparaison baseline M7.5)

**Dimension laboratoire :** Ce projet = apprentissage dev/marketing/monétisation. Chaque itération = données capitalisables pour MoodCycle.

---

## Benchmarks Cibles

| Métrique | Target | Bloqueur |
|----------|--------|----------|
| Onboarding completion | > 65% | < 50% |
| Paywall view rate | > 35% | < 25% |
| Trial start | > 18% | < 10% |
| Overall conversion | > 3.5% | < 2% |

---

## Missions Complétées

| Mission | Statut | Description | Date |
|---------|--------|-------------|------|
| [mission-onboarding-v2.md](../done/mission-onboarding-v2.md) | done | Refonte onboarding 6 filtres | 2025-12-12 |

## Missions Actives

*Aucune mission active — Prêt pour prochaine itération*

### Futures missions identifiées

- `mission-duration-popover.md` — UX preset durée dans TimerScreen
- `mission-analytics-m8.md` — Enrichir tracking funnel (post-onboarding)
- `mission-paywall-optimization.md` — A/B test paywall (si data suffisantes)

---

## Risques Milestone

| Risque | Mitigation |
|--------|------------|
| Régression UX TimerScreen | Tests manuels avant/après |
| Users V1 en cours | `onboardingCompleted` compatible |
| Data insuffisantes | Attendre N=500 avant conclusions |

---

## Notes de Suivi

**2025-12-07 :**
- Structure cockpit validée
- Mission onboarding-v2 lancée

**2025-12-08 :**
- Restructuration fichiers (overview + mission séparés)
- Onboarding V2 : 6 filtres développés, analytics intégrés, tests Jest

**2025-12-12 :**
- ✅ Mission onboarding-v2 complétée et mergée dans main
- Pushed to production (proto → main → origin/main)
- V1 complètement supprimé, V2 en place avec 54 tests

---

## Voir Aussi

- Roadmap complète : `../../docs/ROADMAP.md`
- Timeline cockpit : `../roadmap/timeline.md`
