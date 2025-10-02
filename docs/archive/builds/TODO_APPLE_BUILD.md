# TODO: Émancipation d'EAS pour les builds Apple

## 📅 Status: EN COURS (Mis à jour: 02/10/2025)
> **Note:** Ce document était initialement prévu pour le 27/09/2025. Le projet a évolué avec la migration SDK 54 réussie.

### Objectif principal
**S'émanciper d'EAS pour les builds iOS comme on l'a fait pour Android**

### Contexte (Mis à jour)
- ✅ Android : Build local réussi avec SDK 54, sans dépendance à EAS
- ✅ Migration SDK 54 : New Architecture + React 19.1.0 opérationnels
- ⏳ iOS : Encore dépendant d'EAS mais migration technique réussie
- 💰 Motivation : Éviter les coûts EAS et avoir le contrôle total

### Plan d'action

#### 1. Analyser la configuration iOS actuelle
- [ ] Vérifier les certificats et provisioning profiles existants
- [ ] Documenter la configuration Xcode actuelle
- [ ] Identifier les dépendances à EAS dans le projet iOS

#### 2. Configurer le build iOS local
```bash
# Commandes à tester
npx expo prebuild --platform ios --clean
cd ios
pod install
xcodebuild -workspace ResetPulse.xcworkspace -scheme ResetPulse -configuration Release
```

#### 3. Gestion des certificats Apple
- [ ] Télécharger les certificats depuis EAS
- [ ] Configurer Xcode avec les certificats locaux
- [ ] Documenter le processus dans IOS_BUILD_CONFIG.md

#### 4. Créer un script de build iOS
- [ ] Script pour automatiser le build local
- [ ] Génération de l'IPA pour l'App Store
- [ ] Test sur simulateur et device réel

### Ressources nécessaires
- Mac avec Xcode installé
- Apple Developer Account
- Certificats de distribution
- Provisioning profiles

### Avantages attendus
- 🎯 Contrôle total du processus de build
- 💵 Économie sur les coûts EAS
- 🚀 Build plus rapide en local
- 🔧 Debugging plus facile

### Notes importantes (Mises à jour)
- Le build Android a été résolu avec SDK 54 + New Architecture
- ✅ SDK 54 compatible avec iOS - Migration réussie
- Documenter chaque étape comme pour Android

### Références
- Documentation Android réussie : `ANDROID_BUILD_CONFIG.md`
- Configuration actuelle : SDK 54, React 19.1.0, New Architecture ✅
- Version en cours : 1.0.4

---

**Status :** Tâche en cours - Migration technique SDK 54 réussie, reste l'émancipation d'EAS pour les builds locaux.