# TODO: Émancipation d'EAS pour les builds Apple

## 📅 À faire demain (27/09/2025)

### Objectif principal
**S'émanciper d'EAS pour les builds iOS comme on l'a fait pour Android**

### Contexte
- ✅ Android : Build local réussi avec SDK 51, sans dépendance à EAS
- ⏳ iOS : Encore dépendant d'EAS (build en cours cette nuit)
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

### Notes importantes
- Le build Android a été résolu avec SDK 51
- Vérifier la compatibilité SDK 51 avec iOS
- Documenter chaque étape comme pour Android

### Références
- Documentation Android réussie : `ANDROID_BUILD_CONFIG.md`
- Configuration actuelle : SDK 51, React 18.2.0
- Version en cours : 1.0.3

---

**Rappel :** Commencer par cette tâche demain matin avant tout autre développement.