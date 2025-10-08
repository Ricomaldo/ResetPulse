# ResetPulse - Vue d'ensemble des Builds

## 🎯 Stratégie Dual : Android Local + iOS EAS

Ce projet utilise deux workflows de build différents selon la plateforme :

| Plateforme | Méthode | Raison | Upload |
|------------|---------|--------|--------|
| **Android** | Gradle local (`./gradlew`) | Autonomie, contrôle versionCode, pas de quotas | Manuel vers Google Play Console |
| **iOS** | EAS Build cloud | Credentials Apple complexes, pas de Xcode local | Automatique vers TestFlight via `eas submit` |

---

## 📱 Android : Workflow Local

### Commandes rapides
```bash
# 1. Préparer l'environnement
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
cp @irim__resetPulse.jks android/app/

# 2. Build
cd android
./gradlew clean
./gradlew bundleRelease

# 3. Récupérer le AAB
ls -lh app/build/outputs/bundle/release/app-release.aab
```

### Avantages
- ✅ Pas de dépendance à EAS (quotas limités sur plan gratuit)
- ✅ Build instantané (5-7 minutes)
- ✅ Contrôle total du versionCode et signing
- ✅ Workflow déjà validé (v1.0.4 déployé avec succès)

### Prérequis
- Android SDK installé (`$HOME/Library/Android/sdk`)
- Keystore `@irim__resetPulse.jks` à la racine du projet
- `local.properties` créé après chaque prebuild

### Documentation détaillée
→ [ANDROID_BUILD_CONFIG.md](./ANDROID_BUILD_CONFIG.md)

---

## 🍎 iOS : Workflow EAS

### Commandes rapides
```bash
# 1. Build
eas build --platform ios --profile production

# 2. Submit vers TestFlight
eas submit --platform ios --latest
```

### Avantages
- ✅ Pas besoin de Xcode local ni de Mac (build dans le cloud)
- ✅ Credentials Apple gérés automatiquement
- ✅ Auto-increment du buildNumber
- ✅ Submit direct vers TestFlight

### Prérequis
- Compte EAS configuré
- Apple Developer Program actif
- Credentials synchronisés sur EAS servers

### Documentation détaillée
→ [IOS_BUILD_CONFIG.md](./IOS_BUILD_CONFIG.md)

---

## 🔄 Cycle de Release Complet

### 1. Mise à jour de version
```bash
# Increment version (1.0.5 → 1.0.6)
npm run version:patch

# OU version custom
npm run version:set 1.1.0
```

### 2. Build Android (local)
```bash
cd android
./gradlew clean && ./gradlew bundleRelease
```

### 3. Build iOS (EAS)
```bash
eas build --platform ios --profile production
```

### 4. Upload
- **Android** : Upload manuel du AAB vers Google Play Console → Internal Testing
- **iOS** : `eas submit --platform ios --latest` → TestFlight automatique

### 5. Tests
- **Android** : Lien de test interne Google Play
- **iOS** : TestFlight distribué aux testeurs

---

## 📋 Checklist Pre-Build

### Android
- [ ] `android/local.properties` existe avec bon SDK path
- [ ] `@irim__resetPulse.jks` copié dans `android/app/`
- [ ] `android/app/build.gradle` contient versionCode et versionName corrects
- [ ] `android/app/build.gradle` contient signingConfigs release

### iOS
- [ ] `app.json` contient la bonne version
- [ ] EAS credentials à jour
- [ ] `eas.json` configuré avec profile production

---

## 🆘 Troubleshooting

### Android : "SDK location not found"
```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### Android : "Wrong signing key"
```bash
cp @irim__resetPulse.jks android/app/
# Vérifier SHA1 : DB:51:C1:76:49:DB:2E:34:0B:6A:AE:0D:03:2A:DB:0A:05:25:E4:58
```

### iOS : "Provisioning profile expired"
```bash
eas credentials --platform ios
# → Delete old profile → Rebuild génère nouveau profile
```

---

## 🎯 Historique des Versions Déployées

| Version | versionCode | buildNumber | Android | iOS | Date |
|---------|-------------|-------------|---------|-----|------|
| 1.0.4 | 10 | 13 | ✅ Play Store | ✅ TestFlight | 2025-10-05 |
| 1.0.5 | 11 | TBD | 🔄 En cours | ⏸️ Pas encore | 2025-10-08 |

---

## 📚 Ressources

- [Guide Versioning](../VERSIONING.md) - Script automatisé de bump version
- [Deployment Info](../DEPLOYMENT_INFO.md) - Credentials et infos Apple
- [Android Build Config](./ANDROID_BUILD_CONFIG.md) - Documentation complète Android
- [iOS Build Config](./IOS_BUILD_CONFIG.md) - Documentation complète iOS
