---
created: '2025-09-27'
updated: '2025-10-13'
status: active
milestone: M3-M5
confidence: high
---

# ResetPulse - Informations Déploiement iOS

## 🏗️ Infrastructure Apple Configurée

### App Store Connect
- **App Name:** ResetPulse
- **ASC App ID:** 6752913010
- **Bundle ID:** com.irimwebforge.resetpulse
- **Apple Team:** YNG7STJX5U (Eric Zuber - Individual)
- **UGS:** resetpulse

### Certificats & Provisioning
- **Distribution Certificate Serial:** 6698EA21A64871CF2DF04DFFB2E0344A
- **Expiration:** 5 juillet 2026
- **Provisioning Profile ID:** M4CJUQ2Q47
- **Status:** Actif
- **Partage:** Même certificat que MoodCycle

### EAS Configuration
- **Project ID:** f98f80b8-4a15-4ece-afa5-5311174f67b8
- **EAS Project:** @irim/resetPulse
- **API Key ID:** QVW3U955WP
- **API Key Name:** [Expo] EAS Submit rvcHZVG8Td

## 📱 Build v1.0.0 Informations

### Build Details
- **Build ID:** 50447161-3043-40a5-836e-315925d3ef55
- **Date:** 23/09/2025 22:09:35
- **Version:** 1.0.0
- **Build Number:** 1
- **Status:** Uploadé avec succès

### URLs Importantes
- **EAS Dashboard:** https://expo.dev/accounts/irim/projects/resetPulse
- **TestFlight:** https://appstoreconnect.apple.com/apps/6752913010/testflight/ios
- **Build Download:** https://expo.dev/artifacts/eas/aUT9o3WkuKecyue1paiCLV.ipa

## 🔧 Commandes Essentielles

### Build & Deploy
```bash
# Nouveau build iOS
npx eas build --platform ios --profile production

# Soumission App Store
npx eas submit --platform ios

# Status des builds
npx eas build:list --platform ios
```

### Gestion EAS
```bash
# Login EAS
npx eas login

# Configuration projet
npx eas build:configure

# Mise à jour EAS CLI
npm install -g eas-cli
```

## 🎯 Prochaines Étapes TestFlight

1. **Attendre email Apple** (~5-10 min) - Build processing terminé
2. **Créer groupe test** "Famille" dans TestFlight
3. **Ajouter testeurs** par email
4. **Distribuer lien** TestFlight
5. **Collecter retours** sur hub personnalisé

## 🚀 Pour Futures Apps

Cette infrastructure est réutilisable pour :
- MoodCycle (même certificat, nouveau bundle ID)
- Futures apps IRIM (même équipe développeur)
- Même processus EAS Build → Submit

### Template Bundle ID
- Pattern: `com.irimwebforge.[appname]`
- Exemples: `.moodcycle`, `.focustimer`, etc.

## 📋 Checklist Reproductibilité

Pour répliquer ce processus sur une nouvelle app :
- [ ] Nouveau projet React Native/Expo
- [ ] `npx eas build:configure`
- [ ] Créer fiche App Store Connect
- [ ] Nouveau Bundle ID sur developer.apple.com
- [ ] `npx eas build --platform ios`
- [ ] `npx eas submit --platform ios`

## ✅ Status Final - 25/09/2025

### TestFlight iOS
- **Status:** APPROUVÉ après 51h d'attente
- **Groupe test:** Team (Expo) opérationnel
- **Action:** Ajouter testeurs iOS par email

### Google Play Android
- **Status:** Test interne actif
- **Lien direct:** https://play.google.com/apps/internaltest/4701499537445297168
- **Closed testing:** En révision

**Date de création:** 23/09/2025
**Status:** Les deux plateformes opérationnelles ✅