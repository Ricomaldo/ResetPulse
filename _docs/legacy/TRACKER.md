---
created: '2025-12-14'
updated: '2025-12-14'
status: active
type: tracker
owner: Atlas/Claude-Architect
---

# Legacy Documentation — Reference Files

> Fichiers conserves comme reference apres les 10 audits

## Structure

```
legacy/
├── TRACKER.md              # This file
├── ANALYSIS.md             # Tri .archives/ → legacy/.pending/.trash
├── *.legacy.md             # Comparison files (audit artifacts)
├── code-archive/           # Archived code samples
├── [kept files]            # Reference documentation (27 files)
├── .pending/               # Fichiers en attente d'évaluation (5 files)
└── .trash/                 # Fichiers obsolètes (18 files)
```

---

## Kept Files (12) — Active References

| File | Audit | Why Kept |
|------|-------|----------|
| `architecture-theme-management.md` | #7 | Theme system reference |
| `audits-AUDIT_PROPRE_CODE_2025.md` | #1 | Historical baseline |
| `decisions-adr-003-strateie-conversion.md` | #5 | Conversion strategy ADR |
| `decisions-analytics-strategy.md` | #9 | Analytics rationale |
| `decisions-carousel-affordance.md` | #8 | Carousel UX decisions |
| `decisions-error-boundaries-architecture.md` | #7 | Error handling architecture |
| `decisions-keep-awake-strategy.md` | #2 | Keep-awake ADR basis |
| `guides-MIXPANEL_IMPLEMENTATION.md` | #9 | M7.5 setup guide |
| `guides-REVENUECAT_BEST_PRACTICES.md` | #10 | RevenueCat patterns |
| `legal-PRIVACY_POLICY.md` | #3 | Privacy policy (⚠️ needs update) |

---

## Comparison Files (4) — Audit Artifacts

| File | Content |
|------|---------|
| `architecture.legacy.md` | /src/ structure comparison |
| `code-quality.legacy.md` | M3 → Dec 2025 evolution |
| `performance.legacy.md` | Keep-awake validation |
| `test-coverage.legacy.md` | Testing patterns extracted |

---

## Archived Files — Tri Effectué (2025-12-14)

**Status**: ✅ TRI COMPLET

Les 38 fichiers de `.archives/` ont été triés :

- **→ `legacy/`** (15 fichiers) : Références utiles (ROADMAP, SUPPORT, decisions, guides builds, audits)
- **→ `.pending/`** (5 fichiers) : En attente d'évaluation (voir `.pending/README.md`)
- **→ `.trash/`** (18 fichiers) : Obsolètes (README, archive-*, fixes appliqués, frameworks établis)

**Détails** : Voir `ANALYSIS.md` pour le détail du tri.

---

## Alerts

| File | Issue |
|------|-------|
| `legal-PRIVACY_POLICY.md` | Claims "no analytics" but Mixpanel + RevenueCat integrated |

---

## Audit Summary

| Audit | Legacy Docs Processed | Result |
|-------|----------------------|--------|
| #7 Architecture | 5 files | 4 archived, 1 kept |
| #1 Code Quality | 1 file | Kept as baseline |
| #6 Test Coverage | 4 files | 4 archived (patterns extracted) |
| #2 Performance | 2 files | 1 promoted to ADR, 1 merged |
| #3 Security | 1 file | Kept (needs update) |
| #8 Design System | 1 file | Kept as rationale |
| #4 Accessibility | 1 file | Archived (outdated) |
| #9 Analytics | 2 files | Both kept as reference |
| #5 UX/Conversion | 2 files | 1 kept, 1 archived (V1) |
| #10 Premium | 3 files | 2 kept, 1 archived |

**Total**: 22 legacy files processed across 10 audits

---

**Last Updated**: 2025-12-14
**Status**: AUDIT PHASE COMPLETE
