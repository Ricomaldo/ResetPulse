---
created: '2025-12-14'
updated: '2025-12-14'
status: active
---

# 📚 ResetPulse - Documentation

> Documentation du projet ResetPulse - Timer iOS pour personnes neuroatypiques

## 🚀 Point d'Entrée

**→ Commencer par [`INDEX.md`](INDEX.md)** — Vue d'ensemble avec status et liens

## 🎯 Vue d'ensemble

Documentation organisée en 3 catégories principales avec système de préfixes optionnels pour faciliter la navigation.

## 📂 Structure

```
_internal/docs/
├── README.md              # Ce fichier (guide de navigation)
├── guides/                # 📖 Opérationnel (comment faire)
├── decisions/             # 🎯 Décisions (pourquoi)
├── reports/               # 📊 Architecture & Design "LIVING" (à jour)
├── audits/                # 📋 Audit Cycles (historique immuable)
└── legacy/                # 📦 Documentation précédente (référence)
```

### Key Distinction

| Folder | Type | Mutability | Purpose |
|--------|------|-----------|---------|
| **`reports/`** | Living docs | ✅ Updated regularly | Current architecture, design system, analyses |
| **`audits/`** | Historical snapshots | ❌ Immutable | Audit cycles (baseline → fixes → validation) |

**Example clarity:**
- `reports/code-quality.md` = "Code quality standard NOW"
- `audits/audit-2025-14-12/reports/2025-12-14_code-quality-baseline.md` = "Code quality snapshot on 2025-12-14"

## 📖 Catégories

### [`guides/`](guides/) - Opérationnel
Guides pratiques pour développer, builder, déployer et tester.
- Builds iOS/Android
- Déploiement
- Tests
- Features
- Versioning

**Préfixes optionnels :** `builds-*`, `deployment-*`, `testing-*`, `features-*`, `versioning-*`

### [`decisions/`](decisions/) - Décisions
Décisions techniques, stratégies et Architecture Decision Records (ADRs).
- ADRs formels
- Stratégies techniques
- Rationales d'implémentation

**Préfixe recommandé pour ADRs :** `adr-*`

### [`reports/`](reports/) - Architecture & Design (LIVING)
**"Source de vérité ACTUELLE"** — Documentation mise à jour régulièrement.
- Architecture decisions (comment ça fonctionne)
- Design system (tokens, patterns, composants)
- Performance baselines & metrics
- Analytics implementation (tracking plan)
- Premium/IAP integration design
- Documents légaux (privacy, terms)

**⚠️ NOT audit findings** — See [`audits/`](#audits---cycles-formels) for historical snapshots

**Préfixes optionnels :** `architecture-*`, `design-*`, `analysis-*`, `legal-*`

### [`audits/`](audits/) - Audit Cycles (IMMUTABLE)
**Historical snapshots** — Audit archives, immuables après validation.
- Audit baseline (découverte des findings)
- Audit validation (vérification post-fixes)
- Handoffs per domain
- Complete methodology & execution logs

**Structure example:**
```
audits/
└── audit-2025-14-12/          ← Dated archive (immutable)
    ├── INDEX.md               ← Summary of 10 audits
    ├── CHECKLIST.md           ← All 46+ findings (P0-P3)
    ├── reports/               ← Baseline + validation audit files
    ├── handoffs/              ← Engineer context
    └── method/                ← Methodology & execution log
```

Each audit cycle is **timestamped and complete** — never modified after sign-off.

## 📦 Documentation Legacy

Tous les fichiers de documentation précédents sont conservés dans le dossier [`legacy/`](legacy/) pour référence lors de la réécriture.

## 🚀 Système de Préfixes

Chaque dossier a son propre système de préfixes optionnels. Consultez les README de chaque dossier pour les détails :
- [`guides/README.md`](guides/README.md)
- [`decisions/README.md`](decisions/README.md)
- [`reports/README.md`](reports/README.md)

Les préfixes sont **optionnels** mais **recommandés** pour faciliter la navigation et l'organisation.

