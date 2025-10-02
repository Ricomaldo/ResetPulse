# 📚 ResetPulse - Documentation

> Documentation complète du projet ResetPulse - Timer iOS pour personnes neuroatypiques

## 🚀 Vue d'ensemble

**ResetPulse** est une application de time timer iOS spécialement conçue pour les personnes neuroatypiques (TDAH/TSA). L'app offre une interface épurée pour la méditation (20min) et l'ancrage mental (4min) sans surcharge cognitive.

**Version actuelle :** 1.0.4 (SDK 54, New Architecture)
**Status :** Production active

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
2. **[Build Configuration](development/builds/README.md)** - Configuration iOS/Android
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

### Version Actuelle (v1.0.4)
- **✅ SDK 54 Migration** - Expo SDK 54 + React 19.1.0 + New Architecture
- **✅ Audio System** - Son fonctionne même en mode silencieux + arrière-plan
- **✅ Testing Foundation** - Jest SDK 54 + tests critiques
- **✅ Architecture Modulaire** - TimerDial refactorisé en composants spécialisés

### Prochaines Étapes
- **Lock Screen Display** - Timer visible écran verrouillé
- **Onboarding Wizard** - Guide utilisateur initial
- **Premium Features** - Activités et palettes premium

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

### 2025-10-02
- **Documentation refactoring** - Restructuration complète avec navigation
- **Audit approfondi** - Identification et résolution des redondances
- **Index unifiés** - Navigation fluide entre tous les documents

### 2025-09-29 (v1.0.4)
- **Audio System complet** - Son garanti même en mode silencieux
- **SDK 54 Migration** - New Architecture + React 19.1.0
- **Testing Foundation** - Jest SDK 54 + couverture critique

---

## 📞 Contact & Support

**Support Utilisateurs :** Voir [SUPPORT.md](SUPPORT.md)
**Issues Techniques :** Utiliser les audits dans `/audits`
**Questions Architecture :** Consulter `/decisions` et `/architecture`

---

*Documentation maintenue à jour avec le code. Dernière révision : 2025-10-02*