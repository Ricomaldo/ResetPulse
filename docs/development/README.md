# 🛠️ Development - ResetPulse

> Guide complet de développement pour ResetPulse

## 🎯 Vue d'ensemble

Cette section centralise toutes les informations nécessaires au développement de ResetPulse, incluant la configuration, les builds, les tests et le déploiement.

## 📂 Organisation

### 🏗️ [Build Configuration](builds/)
Configuration complète des builds iOS et Android
- Build Android local (keystore, signing)
- Migration SDK 54 + New Architecture
- Plan d'émancipation iOS d'EAS

### 🧪 [Testing](testing/)
Stratégie de tests unifiée
- Jest SDK 54 configuration
- Tests critiques useTimer/useDialOrientation
- Validation système audio

### 🚀 [Features](features/)
Briefings et spécifications des nouvelles features
- Onboarding implementation brief
- Lock Screen Display (planifiée)
- Premium Features Extension (future)

### 🚀 Deployment & Stores
- **[Deployment Info](DEPLOYMENT_INFO.md)** - Configuration déploiement iOS/Android
- **[Store Submission Checklist](STORE_SUBMISSION_CHECKLIST.md)** - Checklist App Store/Google Play

## ⚡ Quick Start

### Prérequis
```bash
# Node.js 20.19.4+ (using 24.9.0)
node --version

# Expo CLI
npm install -g @expo/cli

# Dependencies
npm install
```

### Développement Local
```bash
# Start Expo Dev Server
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

### Tests
```bash
# Tests complets
npm test

# Tests critiques uniquement
npm run test:critical

# Coverage
npm run test:coverage
```

## 🏗️ Architecture Technique

### Stack Principal
- **Framework:** Expo SDK 54
- **React:** 19.1.0
- **React Native:** 0.81.4
- **New Architecture:** Fabric + Turbo Modules ✅

### Dépendances Clés
- **Audio:** expo-audio (SDK 54)
- **Animations:** react-native-reanimated ~4.1.1
- **Storage:** @react-native-async-storage/async-storage
- **SVG:** react-native-svg 15.12.1

### Structure du Code
```
src/
├── components/          # Composants réutilisables
│   ├── timer/          # Composants timer modulaires
│   └── ...
├── hooks/              # Hooks personnalisés
├── contexts/           # Contexts React
├── config/             # Configuration (palettes, activités)
├── constants/          # Constantes et tokens
├── styles/             # Système de design
└── utils/              # Utilitaires
```

## 🎨 Système de Design

### Thème
- **ThemeProvider** avec Context API
- **Palettes configurables** (8 palettes disponibles)
- **Responsive design** basé sur golden ratio
- **Dark/Light mode** ready

### Animations
- **react-native-reanimated** pour performances
- **Animations modulaires** (DialProgress, DialCenter)
- **Haptic feedback** cross-platform

## 🔧 Outils de Développement

### Debugging
```bash
# React Native Debugger
npx react-native start --reset-cache

# Flipper debugging
npx react-native log-ios
npx react-native log-android
```

### Performance
```bash
# Bundle analyzer
npx expo export --platform ios --bundle-analyzer

# Memory profiling
npx react-native profile-hermes
```

## 📋 Checklist Développement

### Avant Commit
- [ ] Tests passent (`npm test`)
- [ ] Lint clean (`npm run lint`)
- [ ] Performance acceptable
- [ ] Responsive testé (iPhone SE → Pro Max)

### Avant Release
- [ ] Tests critiques ✅ (`npm run test:critical`)
- [ ] Build iOS/Android réussi
- [ ] Audio system validé
- [ ] Version synchronisée partout

## 🐛 Troubleshooting

### Problèmes Courants

#### Metro Cache Issues
```bash
npx expo start --clear
# ou
npx react-native start --reset-cache
```

#### iOS Build Errors
```bash
cd ios && pod install --repo-update
npx expo run:ios --clean
```

#### Android Build Errors
```bash
cd android && ./gradlew clean
npx expo run:android --clean
```

#### Audio Not Working
- Vérifier `expo-audio` version (doit être 1.0.13+)
- Tester sur device réel (simulateur limité)
- Vérifier `UIBackgroundModes` dans app.json

## 📚 Ressources

### Documentation Officielle
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)

### Guides Internes
- [Testing Strategy](testing/testing-strategy.md)
- [Audio System Implementation](../releases/v1.0.4-changelog.md)
- [Timer Refactor Lessons](../devlogs/2025-09-27-timer-refactor-lessons.md)

---

*Documentation développement mise à jour avec les outils et processus. Dernière révision : 2025-10-02*