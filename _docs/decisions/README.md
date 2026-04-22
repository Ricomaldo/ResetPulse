---
created: '2025-12-14'
updated: '2025-12-14'
status: active
---

# 🎯 Decisions

> Documentation décisionnelle : pourquoi

## 🎯 Objectif

Ce dossier contient toutes les décisions techniques, stratégies et Architecture Decision Records (ADRs) du projet.

## 📝 Système de Préfixes

**Aucun préfixe obligatoire** - Tous les fichiers sont des décisions.

### Préfixe recommandé pour ADRs formels

Pour les Architecture Decision Records formels, utilisez le préfixe `adr-*` :

- `adr-*` : ADRs formels (ex: `adr-monetization.md`, `adr-003-strategy-conversion.md`)

### Exemples de noms

**ADRs formels (avec préfixe) :**
- `adr-monetization.md`
- `adr-003-strategy-conversion.md`
- `adr-eas-to-native-ios-build.md`

**Stratégies et décisions (sans préfixe) :**
- `keep-awake-strategy.md`
- `analytics-strategy.md`
- `monetization-decisions.md`
- `carousel-affordance.md`
- `error-boundaries-architecture.md`

## 📂 Contenu typique

- Architecture Decision Records (ADRs)
- Stratégies techniques
- Décisions de design
- Rationales d'implémentation
- Analyses de choix technologiques

## 🔄 Migration depuis Legacy

Les fichiers `decisions-*` du dossier `legacy/` peuvent être renommés en supprimant le préfixe `decisions-` :

- `legacy/decisions-adr-monetization-v11.md` → `adr-monetization-v11.md`
- `legacy/decisions-keep-awake-strategy.md` → `keep-awake-strategy.md`

