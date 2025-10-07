# 📜 Scripts - ResetPulse

Scripts utilitaires pour automatiser les tâches de développement.

---

## 🔢 version-bump.js

Script d'automatisation du versioning (Semantic Versioning).

### Usage

```bash
# Afficher la version actuelle et les options
node scripts/version-bump.js

# Via npm scripts (recommandé)
npm run version:patch  # 1.0.5 → 1.0.6
npm run version:minor  # 1.0.5 → 1.1.0
npm run version:major  # 1.0.5 → 2.0.0
npm run version:set 1.2.3  # Version spécifique
```

### Fichiers mis à jour
- ✅ `package.json`
- ✅ `app.json`
- ✅ `android/app/build.gradle` (versionCode + versionName)
- ✅ `src/components/SettingsModal.jsx`
- ✅ `docs/README.md`

### Features
- 📊 Affiche version actuelle avant modification
- ⏱️ Délai de 3 secondes pour annuler (CTRL+C)
- 🎨 Output coloré et clair
- ✅ Incrémente automatiquement versionCode Android
- 🔍 Validation format SemVer

### Documentation complète
Voir [docs/development/VERSIONING.md](../docs/development/VERSIONING.md)

---

## 🔍 detect-transform-needs.js

Script d'analyse des transformations de code nécessaires.

### Usage
```bash
npm run detect:transforms
```

---

## 📝 Ajouter un nouveau script

1. Créer le fichier dans `/scripts`
2. Ajouter le shebang : `#!/usr/bin/env node`
3. Rendre exécutable : `chmod +x scripts/mon-script.js`
4. Ajouter commande npm dans `package.json` :
   ```json
   {
     "scripts": {
       "mon-script": "node scripts/mon-script.js"
     }
   }
   ```
5. Documenter ici

---

**Dernière mise à jour** : 2025-10-07
