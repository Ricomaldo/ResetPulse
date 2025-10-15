# 📚 ResetPulse - Documentation

> Documentation complète du projet ResetPulse - Timer iOS pour personnes neuroatypiques

## 🚀 Vue d'ensemble

**ResetPulse** est une application de time timer iOS spécialement conçue pour les personnes neuroatypiques (TDAH/TSA). L'app offre une interface épurée pour la méditation (20min) et l'ancrage mental (4min) sans surcharge cognitive.

**Version actuelle :** 1.1.5 (SDK 54, New Architecture)
**Status :** 🚧 En développement - RevenueCat Integration Testing
**Platforms :** [Android](https://play.google.com/apps/internaltest/4701499537445297168) | [iOS TestFlight](https://appstoreconnect.apple.com/apps/6752913010/testflight/ios)

---

## 📋 Navigation Rapide

### 🏗️ Architecture & Développement
- **[Roadmap](ROADMAP.md)** - Planification et milestones du projet
- **[Architecture](architecture/)** - Design system, patterns et guidelines
- **[Development](development/)** - Configuration build, deployment et testing
- **[Releases](releases/)** - Changelogs et rapports de version

### 🔍 Audits & Analyses
- **[Audits](audits/)** - Audits techniques, accessibilité et business
- **[Decisions](decisions/)** - Architecture Decision Records (ADRs)

### 📖 Autres
- **[Legal](legal/)** - Politique de confidentialité
- **[Support](SUPPORT.md)** - Support utilisateur
- **[Archive](archive/)** - Documentation historique (v1.0.4 terminée)

---

## 🎯 Documents Essentiels

### Pour Commencer
1. **[ROADMAP.md](ROADMAP.md)** - Vue d'ensemble des phases de développement
2. **[Architecture Overview](architecture/README.md)** - Comprendre la structure du projet
3. **[Development Setup](development/README.md)** - Configuration de l'environnement

### Pour Développer
1. **[Testing Strategy](development/testing/README.md)** - Stratégie de tests unifiée
2. **[Build Configuration](development/builds/)** - Configuration iOS/Android
   - [Android Build Config](development/builds/ANDROID_BUILD_CONFIG.md) - SDK 54 + New Architecture
   - [iOS Build Config](development/builds/IOS_BUILD_CONFIG.md) - EAS Build + TestFlight
3. **[Audio System](development/audio-system.md)** - Système audio complet

### Pour Déployer
1. **[Deployment Guide](development/deployment/README.md)** - Guide de déploiement complet
2. **[Store Submission](development/deployment/STORE_SUBMISSION_CHECKLIST.md)** - Checklist store

---

## 📊 État du Projet

### Milestones Complétés ✅
- **M1 - Foundation & Architecture** - Architecture clean ready for integration
- **M2 - Timer Core Fonctionnel** - Timer avec build iOS stable
- **M3 - Interface Minimale** - Interface utilisateur complète et polie

### Version Actuelle (v1.1.0) - 🚧 En Test
- **💰 RevenueCat Integration** - SDK intégré, freemium (2 palettes + 4 activités)
- **🛒 Purchase Flow** - Paywall UI, trial 7 jours, lifetime 4.99€
- **🔄 Restore Logic** - Gestion robuste restore + edge cases réseau
- **📊 Dashboard Setup** - iOS/Android entitlements configurés

### Version Précédente (v1.0.5) - [📋 Changelog](releases/v1.0.5-changelog.md)
- **✅ Android Notifications Fix** - Permission SCHEDULE_EXACT_ALARM + Notification Channels
- **✅ SDK 54 Migration** - Expo SDK 54 + React 19.0.0 + New Architecture
- **✅ Audio System** - Son fonctionne même en mode silencieux + arrière-plan

### Version Antérieure (v1.0.4) - [📋 Changelog](releases/v1.0.4-changelog.md)
- **✅ Builds Déployés** - Android (versionCode 10) + iOS (buildNumber 13)

### Prochaines Étapes (v1.2.0) - [🎯 Matrice de Priorisation](decisions/time_timer_priority_matrix.md)
- **Lock Screen Display** (Score 4.3) - Timer visible écran verrouillé
- **Internationalisation** (Score 5.0) - 15 langues pour scalabilité globale

---

## 🗂️ Structure de la Documentation

```
docs/
├── README.md                 # ← Ce fichier (index principal)
├── ROADMAP.md               # Planification projet
├── SUPPORT.md               # Support utilisateur
├── architecture/            # Design system, patterns, guidelines
├── development/             # Features actives (onboarding) + builds + testing
├── releases/                # Changelogs et rapports
├── audits/                  # Audits techniques et business
├── decisions/               # Architecture Decision Records
├── legal/                   # Aspects légaux
└── archive/                # Documentation historique (v1.0.4 terminée)
```

---

## 🔄 Dernières Mises à Jour

### 2025-10-08 (v1.1.0 - EN TEST)
- **💰 RevenueCat SDK** - Integration complète avec react-native-purchases@9.5.3
- **🎯 Freemium Config** - 2 palettes (softLaser, terre) + 4 activités gratuites
- **🛒 Premium Modal** - Paywall UI avec messaging ADR-validé
- **📋 Test Checklist** - [TODO.md](../TODO.md) pour tests dev build
- **📄 ADR Documentation** - [ADR Monétisation v1.1.0](decisions/adr-monetization-v11.md)

### 2025-10-07 (v1.0.5 - DÉPLOYÉE)
- **🔔 Android Notifications Fix** - Permission SCHEDULE_EXACT_ALARM + Channels
- **📋 Changelog v1.0.5** - [Documentation complète](releases/v1.0.5-changelog.md)
- **📝 Fix Report** - [Rapport détaillé](archive/fixes/NOTIFICATION_FIX_ANDROID_2025.md)

### 2025-10-03 (v1.0.4 - DÉPLOYÉE)
- **🚀 Builds Déployés** - Android Internal Testing + iOS TestFlight
- **📱 Android Build** - versionCode 10, AAB 61MB, SDK 54 + New Architecture
- **🍎 iOS Build** - buildNumber 13, EAS Build + TestFlight
- **📋 Changelog v1.0.4** - [Documentation complète](releases/v1.0.4-changelog.md)

### 2025-10-02
- **🎨 Onboarding System v2.0** - Tooltips interactifs avec spotlight SVG
- **⚙️ Settings Modal Redesign** - Hiérarchie visuelle iOS 15+
- **🌓 System Theme Fix** - Détection fiable avec Appearance API
- **✅ Tests Passent** - 29/29 tests validés SDK 54

---

## 📞 Contact & Support

**Support Utilisateurs :** Voir [SUPPORT.md](SUPPORT.md)
**Issues Techniques :** Utiliser les audits dans `/audits`
**Questions Architecture :** Consulter `/decisions` et `/architecture`

---

*Documentation maintenue à jour avec le code. Dernière révision : 2025-10-08*