# 🔢 Système de Versioning - ResetPulse

## 📋 Vue d'ensemble

ResetPulse utilise un système automatisé de gestion des versions suivant le **Semantic Versioning (SemVer)**.

### Format de version : `MAJOR.MINOR.PATCH`

- **MAJOR** : Changements incompatibles (breaking changes)
- **MINOR** : Nouvelles fonctionnalités compatibles
- **PATCH** : Corrections de bugs

**Exemple** : `1.0.5` → Major: 1, Minor: 0, Patch: 5

---

## 🚀 Utilisation du Script Automatisé

### Commandes disponibles

```bash
# Incrémenter le PATCH (1.0.5 → 1.0.6)
npm run version:patch

# Incrémenter le MINOR (1.0.5 → 1.1.0)
npm run version:minor

# Incrémenter le MAJOR (1.0.5 → 2.0.0)
npm run version:major

# Définir une version spécifique
npm run version:set 1.2.3
```

---

## 📁 Fichiers mis à jour automatiquement

Le script `scripts/version-bump.js` met à jour **6 fichiers** en une seule commande :

### 1. **package.json**
```json
{
  "version": "1.0.6"
}
```

### 2. **app.json**
```json
{
  "expo": {
    "version": "1.0.6"
  }
}
```

### 3. **android/app/build.gradle**
```gradle
versionCode 12        // Auto-incrémenté
versionName "1.0.6"
```
⚠️ **Important** : Le `versionCode` est **incrémenté automatiquement** à chaque bump (requis pour Google Play)

### 4. **src/components/SettingsModal.jsx**
```jsx
<Text>Version 1.0.6</Text>
```

### 5. **docs/README.md**
```markdown
**Version actuelle :** 1.0.6
```

### 6. **iOS Info.plist** (via app.json)
- `CFBundleShortVersionString` → 1.0.6

---

## 🔄 Workflow Complet

### Scénario 1 : Correction de bug (PATCH)

```bash
# 1. Faire les corrections dans le code
git add .
git commit -m "fix: notifications Android 12+"

# 2. Bumper la version PATCH
npm run version:patch

# 3. Vérifier les changements
git diff

# 4. Mettre à jour CHANGELOG.md manuellement
# Ajouter la section [1.0.6] avec détails du fix

# 5. Commiter les changements de version
git add .
git commit -m "chore: bump version to 1.0.6"

# 6. Build Android
cd android
./gradlew bundleRelease

# 7. Upload Play Console
```

---

### Scénario 2 : Nouvelle fonctionnalité (MINOR)

```bash
# 1. Développer la feature
git add .
git commit -m "feat: add lock screen timer display"

# 2. Bumper la version MINOR
npm run version:minor
# 1.0.5 → 1.1.0

# 3. Mettre à jour CHANGELOG.md
# Ajouter section [1.1.0] avec détails feature

# 4. Commiter
git add .
git commit -m "chore: bump version to 1.1.0"

# 5. Build et deploy
```

---

### Scénario 3 : Breaking change (MAJOR)

```bash
# 1. Faire les changements majeurs
git add .
git commit -m "feat!: migrate to Expo SDK 55"

# 2. Bumper la version MAJOR
npm run version:major
# 1.0.5 → 2.0.0

# 3. Documenter les breaking changes dans CHANGELOG
# Section [2.0.0] avec migrations guides

# 4. Commiter et tagger
git add .
git commit -m "chore: bump version to 2.0.0 - SDK 55 migration"
git tag v2.0.0
```

---

## 📊 Historique des Versions

### Version actuelle : **1.0.5**
- **versionCode** : 11 (Android)
- **buildNumber** : Auto-incrémenté par EAS (iOS)

### Changelog
- **1.0.5** - Android Notifications Fix (SCHEDULE_EXACT_ALARM)
- **1.0.4** - SDK 54 Migration + Audio System
- **1.0.3** - Android Build Fixes
- **1.0.2** - Platform Compatibility
- **1.0.1** - Performance Improvements
- **1.0.0** - Initial Release

---

## 🎯 Best Practices

### Quand bumper PATCH ?
- ✅ Corrections de bugs
- ✅ Optimisations performance
- ✅ Refactoring interne
- ✅ Mises à jour dépendances (patches)

### Quand bumper MINOR ?
- ✅ Nouvelles fonctionnalités
- ✅ Améliorations UX significatives
- ✅ Ajout APIs non-breaking
- ✅ Nouvelles features opt-in

### Quand bumper MAJOR ?
- ✅ Breaking changes API
- ✅ Migrations SDK majeures
- ✅ Refonte architecture
- ✅ Suppression features deprecated

---

## 🔍 Vérification Post-Bump

Après avoir exécuté `npm run version:*`, vérifiez :

```bash
# 1. Voir les fichiers modifiés
git status

# 2. Vérifier les changements
git diff

# 3. Confirmer la cohérence des versions
grep -r "1.0.6" package.json app.json android/app/build.gradle src/components/SettingsModal.jsx docs/README.md
```

### Checklist de validation

- [ ] package.json version mise à jour
- [ ] app.json expo.version mise à jour
- [ ] build.gradle versionCode incrémenté
- [ ] build.gradle versionName mise à jour
- [ ] SettingsModal.jsx version affichée mise à jour
- [ ] docs/README.md version actuelle mise à jour
- [ ] CHANGELOG.md nouvelle section créée (manuel)

---

## 🛠️ Troubleshooting

### Erreur : "Invalid version format"
```bash
# Vérifier que la version suit le format X.Y.Z
npm run version:set 1.0.6  # ✅ Correct
npm run version:set 1.0    # ❌ Incorrect
```

### Rollback d'une version
```bash
# Annuler les changements non commités
git restore .

# Ou revenir à un commit spécifique
git reset --hard HEAD~1
```

### Script ne trouve pas les fichiers
```bash
# Vérifier que vous êtes à la racine du projet
pwd
# Doit afficher : /path/to/ResetPulse

# Vérifier que le script existe
ls scripts/version-bump.js
```

---

## 🎨 Personnalisation du Script

Le script `scripts/version-bump.js` peut être modifié pour :

### Ajouter d'autres fichiers
```javascript
function updateCustomFile(newVersion) {
  const filePath = path.join(__dirname, '../path/to/file.js');
  let content = readFile(filePath);
  content = content.replace(/VERSION = ".*"/, `VERSION = "${newVersion}"`);
  writeFile(filePath, content);
}
```

### Modifier le versionCode logic
```javascript
// Actuellement : incrémente de 1
const newVersionCode = currentVersionCode + 1;

// Alternative : basé sur date
const newVersionCode = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
```

---

## 📚 Références

- **Semantic Versioning** : https://semver.org/
- **Conventional Commits** : https://www.conventionalcommits.org/
- **Keep a Changelog** : https://keepachangelog.com/
- **Expo Versioning** : https://docs.expo.dev/build-reference/app-versions/

---

## 🔗 Fichiers Liés

- Script : `scripts/version-bump.js`
- Changelog : `CHANGELOG.md`
- Build Android : `docs/development/builds/ANDROID_BUILD_CONFIG.md`
- Build iOS : `docs/development/builds/IOS_BUILD_CONFIG.md`

---

**Dernière mise à jour** : 2025-10-07
**Version du script** : 1.0.0
