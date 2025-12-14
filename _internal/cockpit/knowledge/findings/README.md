---
created: '2025-12-14'
status: active
---

# Findings (Audits en cours)

> Rapports temporaires d'audits liés aux missions actives

## 🎯 Usage

Ce dossier contient les **findings temporaires** d'audits en cours, liés à des missions actives dans `workflow/active/`.

## 📝 Format de Nommage

**Format standard :** `YYYY-MM-DD_NN-nom-audit.md`

**Exemples :**
- `2025-12-14_01-code-quality.md`
- `2025-12-14_07-architecture.md`
- `2025-12-14_10-premium-integration.md`

**Convention :**
- `YYYY-MM-DD` : Date de l'audit
- `NN` : Numéro d'ordre (01, 02, 03...)
- `nom-audit` : Nom descriptif en kebab-case

## 🔄 Migration vers `docs/reports/`

**Quand migrer :**
- ✅ Audit complété et validé
- ✅ Format standardisé (P0/P1/P2, recommandations)
- ✅ Référence pour audits futurs

**Processus :**
1. Renommer le fichier : `YYYY-MM-DD_NN-nom-audit.md` → `audit-nom-audit.md`
2. Déplacer vers : `_internal/docs/reports/audit-nom-audit.md`
3. Supprimer l'original de `findings/`

**Exemple :**
```
findings/2025-12-14_01-code-quality.md
  → _internal/docs/reports/audit-code-quality.md
```

## 📋 Format Rapport Standard

Voir le template dans `workflow/active/current.md` pour le format standard des rapports.

---

*Dernière mise à jour : 2025-12-14*

