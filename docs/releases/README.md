# 🚀 Releases - ResetPulse

> Historique complet des versions et rapports de releases

## 🎯 Vue d'ensemble

Cette section centralise tous les changelogs, rapports de releases et historique des versions de ResetPulse.

## 📋 Releases Disponibles

### Versions Principales
- **[v1.0.4 Changelog](v1.0.4-changelog.md)** - Audio System complet + SDK 54 migration
- **[M1 Report](M1-report.md)** - Rapport du milestone M1 (Foundation)

### Changelog Complet
Le changelog complet est maintenu dans le fichier racine `CHANGELOG.md` du projet.

## 🚀 Version Actuelle: v1.0.4

### 🎯 Highlights v1.0.4
- **SDK 54 Migration** ✅ - Expo SDK 54 + React 19.1.0 + New Architecture
- **Audio System Complet** ✅ - Son garanti même en mode silencieux + arrière-plan
- **Architecture Modulaire** ✅ - TimerDial refactorisé en composants spécialisés
- **Testing Foundation** ✅ - Jest SDK 54 + tests critiques

### Technologies
- **Expo SDK:** 54.0.10
- **React:** 19.1.0
- **React Native:** 0.81.4
- **New Architecture:** Fabric + Turbo Modules ✅

## 📊 Historique des Versions

| Version | Date | Highlights | Status |
|---------|------|------------|--------|
| **1.0.4** | 2025-09-29 | SDK 54 + Audio System + New Architecture | 🟢 Current |
| **1.0.3** | 2025-09-26 | Android Build Fix + SDK 51 Rollback | 🟡 Superseded |
| **1.0.2** | 2025-09-25 | Android Platform Fixes + UI Improvements | 🟡 Superseded |
| **1.0.1** | 2025-09-24 | Code Quality + Performance + Freemium | 🟡 Superseded |
| **1.0.0** | 2025-09-23 | Initial Release + Core Features | 🟡 Superseded |

## 🛣️ Roadmap Accompli

### ✅ M1: Foundation & Architecture
- Init Expo project + structure folders
- ThemeProvider avec color tokens
- Hook useTimer + logique core
- Rendu SVG basique + progression

### ✅ M2: Timer Core Fonctionnel
- Timer core fonctionnel
- Build iOS validé
- Tests unitaires logique timer

### ✅ M3: Interface Minimale
- 4 pastilles couleurs + interface complète
- Boutons play/pause/reset
- Presets 4min/20min
- Animations fluides + TestFlight build

## 🔄 Prochaines Versions

### v1.1.0 (Planifiée)
- **Lock Screen Display** - Timer visible écran verrouillé
- **Onboarding Wizard** - Guide utilisateur initial
- **Premium Features** - Activités et palettes premium étendues

### v1.2.0 (Future)
- **Apple Watch Support** - Extension watchOS
- **Widget iOS** - Home screen widget
- **Analytics** - Usage metrics et insights

## 📈 Métriques de Release

### Performance
- **Build Time:** 120s → 10s (SDK 54 + XCFrameworks)
- **Package Lock:** 12k → 4k lignes (dépendances optimisées)
- **Bundle Size:** ~25MB Android, ~30MB iOS

### Qualité
- **Test Coverage:** useTimer 74.57%, useDialOrientation 41.17%
- **Bug Fixes:** 15+ bugs critiques résolus
- **Code Quality:** 7.5/10 (dernier audit)

### Features
- **8 Palettes** de couleurs disponibles
- **12 Activités** (4 gratuites + 8 premium)
- **Cross-platform** iOS/Android support
- **Accessibility** WCAG 2.1 compliance

## 🔧 Release Process

### Pre-Release Checklist
- [ ] Tests passent (`npm run test:critical`)
- [ ] Builds iOS/Android réussis
- [ ] Audio system validé sur device
- [ ] Version synchronisée (app.json, build.gradle, package.json)

### Release Steps
1. **Version bump** - Semantic versioning
2. **Changelog update** - Documentation des changements
3. **Build & Test** - Validation complète
4. **Deploy** - App Store + Google Play
5. **Documentation** - Mise à jour docs

### Post-Release
- [ ] Release notes publiées
- [ ] Feedback utilisateurs collecté
- [ ] Métriques monitored
- [ ] Hotfixes si nécessaire

---

*Releases documentées et maintenues à jour. Dernière révision : 2025-10-02*