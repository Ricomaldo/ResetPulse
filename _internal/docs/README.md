---
created: '2025-12-14'
updated: '2025-12-14'
status: active
---

# 📚 ResetPulse - Documentation

> Documentation du projet ResetPulse - Timer iOS pour personnes neuroatypiques

## 🎯 Vue d'ensemble

Documentation organisée en 3 catégories principales avec système de préfixes optionnels pour faciliter la navigation.

## 📂 Structure

```
_internal/docs/
├── README.md              # Ce fichier
├── guides/                # 📖 Opérationnel (comment faire)
├── decisions/             # 🎯 Décisions (pourquoi)
├── reports/               # 📊 Rapports (audits, analyses, architecture, legal)
└── legacy/                # 📦 Documentation précédente (référence)
```

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

### [`reports/`](reports/) - Rapports
Audits, analyses, documentation d'architecture et documents légaux.
- Audits techniques
- Analyses (RevenueCat, performance, etc.)
- Architecture et design system
- Documents légaux

**Préfixes optionnels :** `architecture-*`, `audit-*`, `analysis-*`, `legal-*`

## 📦 Documentation Legacy

Tous les fichiers de documentation précédents sont conservés dans le dossier [`legacy/`](legacy/) pour référence lors de la réécriture.

## 🚀 Système de Préfixes

Chaque dossier a son propre système de préfixes optionnels. Consultez les README de chaque dossier pour les détails :
- [`guides/README.md`](guides/README.md)
- [`decisions/README.md`](decisions/README.md)
- [`reports/README.md`](reports/README.md)

Les préfixes sont **optionnels** mais **recommandés** pour faciliter la navigation et l'organisation.

