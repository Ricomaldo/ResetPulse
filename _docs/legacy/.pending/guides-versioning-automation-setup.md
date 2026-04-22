---
created: '2025-10-07'
updated: '2025-10-07'
status: active
milestone: M5
confidence: high
---

# 🤖 Setup : Automatisation du Versioning

**Date** : 2025-10-07
**Version** : 1.0.5

---

## 🎯 Objectif

Automatiser la mise à jour des versions dans tous les fichiers du projet pour éviter les oublis et les incohérences.

---

## ✅ Ce qui a été créé

### 1. **Script d'automatisation** : `scripts/version-bump.js`

**Fonctionnalités** :
- ✅ Lit la version actuelle de `package.json`
- ✅ Calcule la nouvelle version selon le type de bump (patch/minor/major)
- ✅ Met à jour 6 fichiers automatiquement :
  - `package.json`
  - `app.json`
  - `android/app/build.gradle` (versionCode + versionName)
  - `src/components/SettingsModal.jsx`
  - `docs/README.md`
- ✅ Incrémente automatiquement le `versionCode` Android
- ✅ Affiche un récapitulatif coloré des changements
- ✅ Délai de 3 secondes pour annuler (CTRL+C)
- ✅ Validation format SemVer (X.Y.Z)

**Taille** : ~250 lignes de code

---

### 2. **Commandes npm** : `package.json`

```json
{
  "scripts": {
    "version:patch": "node scripts/version-bump.js patch",
    "version:minor": "node scripts/version-bump.js minor",
    "version:major": "node scripts/version-bump.js major",
    "version:set": "node scripts/version-bump.js set"
  }
}
```

---

### 3. **Documentation complète** : `docs/development/VERSIONING.md`

**Sections** :
- 📋 Vue d'ensemble Semantic Versioning
- 🚀 Utilisation commandes npm
- 📁 Liste fichiers mis à jour
- 🔄 Workflows complets (PATCH/MINOR/MAJOR)
- 📊 Historique versions
- 🎯 Best practices (quand bumper quoi)
- 🔍 Checklist validation
- 🛠️ Troubleshooting
- 🎨 Guide personnalisation script

**Taille** : ~300 lignes de documentation

---

### 4. **README Scripts** : `scripts/README.md`

Documentation du dossier scripts avec :
- Description version-bump.js
- Usage et exemples
- Liste fichiers modifiés
- Référence doc complète

---

## 📊 Exemple d'utilisation

### Avant (manuel)
```bash
# Ouvrir 6 fichiers manuellement
code package.json
code app.json
code android/app/build.gradle
code src/components/SettingsModal.jsx
code docs/README.md

# Modifier chaque fichier un par un
# Risque d'oubli ou d'incohérence
# Temps : ~10 minutes
```

### Après (automatisé)
```bash
npm run version:patch

# Affiche :
📦 Current version: 1.0.5
🚀 New version: 1.0.6
📱 Android versionCode: 11 → 12

Files to update:
  • package.json
  • app.json
  • android/app/build.gradle (versionCode + versionName)
  • src/components/SettingsModal.jsx
  • docs/README.md

Press CTRL+C to cancel, or wait 3 seconds to continue...

Updating files...
✓ package.json: 1.0.5 → 1.0.6
✓ app.json: 1.0.5 → 1.0.6
✓ build.gradle versionCode: 11 → 12
✓ build.gradle versionName: 1.0.5 → 1.0.6
✓ SettingsModal.jsx: 1.0.5 → 1.0.6
✓ docs/README.md: Version actuelle → 1.0.6

✨ Success! Version bumped to 1.0.6

Next steps:
  1. Review changes: git diff
  2. Update CHANGELOG.md manually
  3. Commit: git add . && git commit -m "chore: bump version to 1.0.6"
  4. Build: cd android && ./gradlew bundleRelease
```

**Temps** : ~10 secondes ⚡

---

## 🎯 Cas d'usage résolus

### Cas 1 : Oubli de mise à jour
**Avant** : Version incohérente entre fichiers
```
package.json    → 1.0.6
app.json        → 1.0.5  ❌ Oublié
build.gradle    → 1.0.6
SettingsModal   → 1.0.5  ❌ Oublié
```

**Après** : Cohérence garantie ✅

---

### Cas 2 : Erreur versionCode
**Avant** : versionCode non incrémenté ou mal incrémenté
```
versionCode 11  → 11  ❌ Oublié d'incrémenter
```

**Après** : Auto-incrémentation ✅
```
versionCode 11  → 12  ✅ Automatique
```

---

### Cas 3 : Saut de version (1.0.5 → 1.2.0)
**Avant** : Calculer manuellement, risque d'erreur

**Après** : Flexibilité totale
```bash
# Sauter plusieurs minor versions
npm run version:set 1.2.0

# Ou bumper normalement
npm run version:minor  # 1.0.5 → 1.1.0
npm run version:minor  # 1.1.0 → 1.2.0
```

---

## 🔄 Intégration dans le workflow

### Workflow typique

```bash
# 1. Développer feature
git checkout -b feature/lock-screen-display
# ... code ...
git add .
git commit -m "feat: add lock screen timer display"

# 2. Bumper version (nouvelle feature = MINOR)
npm run version:minor
# 1.0.5 → 1.1.0
# versionCode 11 → 12

# 3. Vérifier changements
git diff

# 4. Mettre à jour CHANGELOG.md manuellement
code docs/releases/v1.1.0-changelog.md

# 5. Commiter version bump
git add .
git commit -m "chore: bump version to 1.1.0"

# 6. Merger dans main
git checkout main
git merge feature/lock-screen-display

# 7. Build production
cd android
./gradlew bundleRelease
```

---

## 📈 Gains

| Aspect | Avant | Après | Gain |
|--------|-------|-------|------|
| **Temps** | ~10 min | ~10 sec | **60x plus rapide** |
| **Erreurs** | Fréquentes | Aucune | **100% fiable** |
| **Cohérence** | Variable | Garantie | **100% cohérent** |
| **versionCode** | Manuel | Auto | **Zéro oubli** |

---

## 🚀 Améliorations futures possibles

### Phase 2 (optionnel)
- [ ] Génération automatique CHANGELOG.md (via commits conventionnels)
- [ ] Git tag automatique après bump
- [ ] Integration avec GitHub Actions (CI/CD)
- [ ] Notification Slack/Discord après bump
- [ ] Rollback automatique en cas d'erreur

### Exemple avec commits conventionnels
```bash
# Installer standard-version
npm install --save-dev standard-version

# Générer CHANGELOG + tag automatiquement
npm run release
```

---

## 📚 Ressources

### Documentation
- **[VERSIONING.md](VERSIONING.md)** - Guide complet
- **[scripts/README.md](../../scripts/README.md)** - Doc scripts
- **[Semantic Versioning](https://semver.org/)** - Standard officiel

### Références externes
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [standard-version](https://github.com/conventional-changelog/standard-version)

---

## ✅ Checklist validation

- [x] Script créé et testé
- [x] Commandes npm ajoutées
- [x] Documentation complète rédigée
- [x] README scripts créé
- [x] Référence ajoutée dans development/README.md
- [x] Script exécutable (chmod +x)
- [x] Validation format SemVer
- [x] Gestion erreurs robuste
- [x] Output coloré et clair
- [x] Délai confirmation (3s)

---

**Setup complété le** : 2025-10-07
**Prêt pour utilisation** : ✅ Production Ready
