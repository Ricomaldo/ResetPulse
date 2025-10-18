# 📚 ResetPulse - Documentation

> Documentation complète du projet ResetPulse - Timer iOS pour personnes neuroatypiques

## 🚀 Vue d'ensemble

**ResetPulse** est une application de time timer iOS spécialement conçue pour les personnes neuroatypiques (TDAH/TSA). L'app offre une interface épurée pour la méditation (20min) et l'ancrage mental (4min) sans surcharge cognitive.

**Version actuelle :** 1.1.7 (SDK 54, New Architecture)
**Status :** iOS ✅ LIVE App Store | Android 🔄 Submission en cours
**Platforms :** [iOS App Store](https://apps.apple.com/app/resetpulse/id6752913010) | [Android Internal Test](https://play.google.com/apps/internaltest/4701499537445297168)

---

## 📋 Navigation Rapide

### 🏗️ Architecture & Développement
- **[Roadmap Stratégique](ROADMAP.md)** - Vision projet, timeline M1-M11+ et décisions go/no-go
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
1. **[Roadmap Stratégique](ROADMAP.md)** - Vision projet, timeline M1-M11+ (laboratoire avant MoodCycle)
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
- **M1-M2** (29 sept - 2 oct) - Foundation technique, timer core, build iOS/Android
- **M3-M4** (2-3 oct) - Validation terrain, onboarding v2.0, refactorisation
- **M5** (7-9 oct) - RevenueCat integration, freemium, IAP setup
- **M6** (13-17 oct) - iOS LIVE App Store (approval 17 oct 23:30)

### Milestone en Cours 🔄
- **M7** (18-20 oct) - Android submission (Keep awake v1.1.7 implémenté)

### Prochaines Étapes - [📋 Roadmap Complète](ROADMAP.md)
- **M8** (23-25 oct) - Optimisation conversion (méthode Harry)
- **M9** (28-30 oct) - Internationalisation 15 langues (conditionnel)
- **M10** (Nov) - Test marketing Apple Search Ads (décision go/no-go)
- **M11+** (Déc-Jan) - Scaling ou pivot MoodCycle selon ROI M10

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

### 2025-10-18 (v1.1.7 - EN COURS)
- **📱 Keep Awake Feature** - Écran reste allumé pendant timer (ON par défaut, toggle Settings)
- **🤖 Android Submission** - Build release + Google Play Review pending
- **📋 Roadmap Stratégique** - Documentation fusionnée M1-M11+ avec timeline réelle
- **📊 Analytics Strategy** - Mixpanel setup documenté (M7.5 ready implementation)

### 2025-10-17 (v1.1.6 - LIVE APP STORE 🎉)
- **✅ iOS Approval** - App disponible publiquement App Store (approval 17 oct 23:30)
- **💰 RevenueCat Production** - IAP opérationnel (lifetime 4,99€, trial 7 jours)
- **📋 Changelog** - [v1.1.6 iOS Approval](releases/v1.1.6-ios-approval.md)

### 2025-10-08 (v1.1.0 - RevenueCat)
- **💰 RevenueCat SDK** - Integration complète react-native-purchases@9.5.3
- **🎯 Freemium Config** - 2 palettes + 4 activités gratuites
- **🛒 Paywall UI** - Trial 7 jours + lifetime 4,99€
- **📄 ADR** - [ADR Monétisation v1.1.0](decisions/adr-monetization-v11.md)

### 2025-10-07 (v1.0.5 - Android Notifications)
- **🔔 Android Fix** - Permission SCHEDULE_EXACT_ALARM + Notification Channels
- **📋 Changelog** - [v1.0.5 Documentation](releases/v1.0.5-changelog.md)

### 2025-10-03 (v1.0.4 - Premier Déploiement)
- **🚀 Builds Déployés** - Android Internal Testing + iOS TestFlight
- **📋 Changelog** - [v1.0.4 Documentation](releases/v1.0.4-changelog.md)

---

## 📞 Contact & Support

**Support Utilisateurs :** Voir [SUPPORT.md](SUPPORT.md)
**Issues Techniques :** Utiliser les audits dans `/audits`
**Questions Architecture :** Consulter `/decisions` et `/architecture`

---

*Documentation maintenue à jour avec le code. Dernière révision : 2025-10-18*