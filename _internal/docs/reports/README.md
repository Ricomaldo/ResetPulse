---
created: '2025-12-14'
updated: '2025-12-14'
status: active
---

# 📊 Reports — Architecture & Design Documentation

> **"Living" documentation** : Architecture decisions, design system, analytics, performance baselines
>
> ⚠️ **NOT audit findings** — See `../audits/` for historical audit cycles

## 🎯 Objectif

Ce dossier contient la **documentation à jour** du projet :
- Comment le système fonctionne maintenant (architecture decisions)
- Design tokens, patterns, composants (design system)
- Performance baselines & metrics (observations)
- Analytics implementation (tracking plan)
- Premium/IAP integration (design)
- Legal documents (privacy, terms)

**Note clé** : Ceci est la **source de vérité ACTUELLE**, mise à jour au fil du temps.

## 🔄 Relationship to Audits

| Type | Location | Purpose | Mutable? |
|------|----------|---------|----------|
| **Architecture docs** | `/reports/` | Current design, decisions | ✅ Updated regularly |
| **Audit findings** | `/audits/` | Historical snapshots | ❌ Immutable archive |

**Example:**
- `reports/code-quality.md` = "Voici la qualité du code d'après notre standard"
- `audits/audit-2025-14-12/reports/2025-12-14_code-quality-baseline.md` = "Le 2025-12-14, baseline audit a trouvé ça"

## 📝 Naming Convention

**No mandatory prefix** - Tous les fichiers sont des documents de référence.

### Optional prefixes (for organization)

Pour faciliter la navigation :

- `architecture-*` : Architecture decisions (ex: `architecture-theme-system.md`, `architecture-onboarding-v2.md`)
- `design-*` : Design system & patterns (ex: `design-tokens.md`, `design-buttons.md`)
- `analysis-*` : Technical analyses (ex: `analysis-revenuecat.md`, `analysis-performance-baseline.md`)
- `legal-*` : Documents légaux (ex: `legal-privacy-policy.md`)

**Format actuel** : Fichiers simples sans préfixe (ex: `code-quality.md`, `accessibility.md`, `premium.md`)

### Exemples de noms

**Avec préfixe (recommandé pour clarté) :**
- `architecture-theme-system.md`
- `architecture-onboarding-system.md`
- `audit-code-quality.md`
- `audit-wcag-contrast.md`
- `analysis-revenuecat.md`
- `legal-privacy-policy.md`

**Sans préfixe (acceptable) :**
- `code-quality.md`
- `wcag-contrast.md`
- `app-stores-2025.md`
- `ios-audit.md`

## 📂 Contenu typique

- Audits techniques (code, accessibilité, stores)
- Analyses (RevenueCat, performance, etc.)
- Documentation d'architecture
- Design system et patterns
- Documents légaux (privacy policy)
- Rapports d'état et compliance

## 🔄 Migration depuis Legacy

Les fichiers `audits-*`, `architecture-*`, `legal-*` du dossier `legacy/` peuvent être renommés :

- `legacy/audits-AUDIT_PROPRE_CODE_2025.md` → `audit-code-quality.md`
- `legacy/audits-revenuecat-analysis.md` → `analysis-revenuecat.md`
- `legacy/architecture-theme-management.md` → `architecture-theme-system.md`
- `legacy/legal-PRIVACY_POLICY.md` → `legal-privacy-policy.md`

