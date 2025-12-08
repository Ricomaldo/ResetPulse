---
created: '2025-09-28'
updated: '2025-10-13'
status: active
milestone: M3-M6
confidence: high
---

# 🏗️ Build Configuration - ResetPulse

> Configuration complète pour les builds iOS et Android

## 🎯 Vue d'ensemble

Cette section centralise toute la configuration de build pour ResetPulse, incluant les setup Android et iOS, ainsi que les tests de la New Architecture.

## 📋 Documents de Build

### Configuration Plateforme
- **[Android Build Config](ANDROID_BUILD_CONFIG.md)** - Configuration complète Android avec keystore

### Docs Archivées
- **Apple Build TODO** → Archivé (émancipation EAS en cours)
- **New Architecture Testing** → Archivé (migration SDK 54 réussie)

## 🚀 État Actuel

### ✅ Complété
- **Android Build Local** - Build réussi avec SDK 51, sans dépendance EAS
- **SDK 54 Migration** - Expo SDK 54 + React 19.1.0 + New Architecture
- **New Architecture** - Fabric + Turbo Modules activés et fonctionnels

### 🔄 En Cours
- **iOS Build Local** - Émancipation d'EAS en cours
- **Certificats Apple** - Configuration locale des certificats

## ⚙️ Configuration Technique

### Expo SDK 54
```json
{
  "expo": "^54.0.10",
  "react": "19.1.0",
  "react-native": "0.81.4"
}
```

### New Architecture
- **Fabric rendering** ✅
- **Turbo Modules** ✅
- **Performance optimisée** - Build times 120s → 10s avec XCFrameworks

### Android
- **versionCode:** 9
- **versionName:** "1.0.4"
- **Keystore configuré** pour Google Play Store

### iOS
- **Background Audio:** UIBackgroundModes: ["audio"]
- **Version sync:** À synchroniser avec Android

## 🛠️ Scripts de Build

### Android
```bash
# Build local Android
./gradlew assembleRelease

# Avec keystore
./gradlew bundleRelease
```

### iOS (En développement)
```bash
# Build local iOS
npx expo prebuild --platform ios --clean
cd ios && pod install
xcodebuild -workspace ResetPulse.xcworkspace -scheme ResetPulse -configuration Release
```

## 🔧 Troubleshooting

### Problèmes Courants
1. **ExpoAsset crash Android** → Résolu avec SDK 51
2. **New Architecture compatibility** → Configuration UIBackgroundModes
3. **Keystore signing** → Voir ANDROID_BUILD_CONFIG.md

### Rollbacks Documentés
- **SDK 53 → SDK 51** (stabilité Android)
- **React 19.0.0 → 18.2.0** puis **→ 19.1.0** (migration progressive)

## 📊 Métriques de Build

| Plateforme | Status | Build Time | Size |
|------------|--------|------------|------|
| Android    | ✅ Stable | ~2min | ~25MB |
| iOS        | 🔄 EAS | ~10min | ~30MB |

## 🎯 Objectifs

### Court Terme
- [ ] Finaliser iOS build local
- [ ] Documenter processus certificats Apple
- [ ] Créer scripts automatisés

### Long Terme
- [ ] CI/CD automatisé
- [ ] Tests de régression build
- [ ] Monitoring performance

---

*Documentation build maintenue à jour avec les configurations. Dernière révision : 2025-10-02*