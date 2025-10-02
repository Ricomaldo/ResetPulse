# Configuration iOS Build - ResetPulse

## ✅ Configuration FONCTIONNELLE avec SDK 54 (New Architecture)

### Package.json (SDK 54 - NEW ARCHITECTURE)
```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "~2.2.3",
    "expo": "~54.0.10",
    "expo-audio": "~1.0.13",
    "expo-haptics": "~15.0.7",
    "expo-notifications": "~0.32.11",
    "expo-status-bar": "~2.0.8",
    "react": "19.0.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.22.2",
    "react-native-reanimated": "~4.0.1",
    "react-native-safe-area-context": "~5.4.0",
    "react-native-svg": "16.0.9"
  }
}
```

### app.json
```json
{
  "expo": {
    "version": "1.0.4",
    "newArchEnabled": true,
    "userInterfaceStyle": "automatic",
    "ios": {
      "bundleIdentifier": "com.irimwebforge.resetpulse",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "UIBackgroundModes": ["audio"]
      }
    },
    "plugins": []
  }
}
```

**⚠️ Important:** `plugins: []` - Pas besoin du plugin `expo-notifications` pour les notifications locales. Le plugin active les Push Notifications remote qui nécessitent un provisioning profile spécifique.

### eas.json
```json
{
  "cli": {
    "version": ">= 16.13.4",
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "6752913010"
      }
    }
  }
}
```

## Credentials & Identifiants

### App Store Connect
- **ASC App ID**: 6752913010
- **Bundle ID**: com.irimwebforge.resetpulse
- **Apple Team**: YNG7STJX5U (Eric Zuber - Individual)

### Distribution Certificate
- **Serial Number**: 6698EA21A64871CF2DF04DFFB2E0344A
- **Expiration**: 05/07/2026

### Provisioning Profile (Actuel)
- **Developer Portal ID**: UVK2S43525
- **Status**: Active
- **Expiration**: 05/07/2026
- **Capabilities**: Push Notifications (pour expo-notifications)

## Process de Build avec EAS

### 1. Build Production

```bash
eas build --platform ios --profile production
```

**Étapes clés:**
1. Auto-increment buildNumber (géré par EAS)
2. Utilise les credentials remote (EAS servers)
3. Génère l'IPA signé

### 2. Questions Importantes lors du Build

#### Push Notifications Setup
```
? Would you like to set up Push Notifications for your project? › No
```
**Répondre: No** - On utilise uniquement des notifications locales, pas de push serveur.

#### Push Notifications Service Key
```
? Generate a new Apple Push Notifications service key? › No
```
**Répondre: No** - Pas besoin de P8 key pour notifications locales.

### 3. Submit vers TestFlight

```bash
eas submit --platform ios --latest
```

Ou en non-interactif (nécessite ascAppId dans eas.json):
```bash
eas submit --platform ios --latest --non-interactive
```

## 🎉 SUCCÈS CONFIRMÉ - SDK 54 NEW ARCHITECTURE

- **Version déployée**: 1.0.4 (buildNumber 13)
- **SDK 54**: React Native 0.81.5 + New Architecture activée ✅
- **React 19**: Migration complète
- **Build time**: ~10-15 minutes (EAS cloud)
- **TestFlight**: Traitement Apple 5-10 minutes après submit

### Liens TestFlight
- **URL**: https://appstoreconnect.apple.com/apps/6752913010/testflight/ios
- **Submission Details**: https://expo.dev/accounts/irim/projects/resetPulse/submissions

## Problèmes Courants (RÉSOLUS ✅)

### Provisioning Profile doesn't support Push Notifications
**Cause**: Plugin `expo-notifications` active automatiquement Push Notifications capability même pour notifications locales.

**Solution**:
1. Supprimer le provisioning profile ancien sur expo.dev/credentials
2. Relancer le build → EAS génère nouveau profile avec Push Notifications
3. Répondre "No" aux questions sur Push Notifications setup (pas de remote push)

### expo-notifications nécessite Push Notifications capability
**Comprendre**:
- La **librairie** `expo-notifications` dans package.json active automatiquement la capability
- Même pour notifications **locales uniquement**
- Le provisioning profile **doit inclure** Push Notifications capability
- Mais on n'a **pas besoin** de Push Notifications service key (P8)

### Duplicate dependencies warnings (expo doctor)
**Impact**: Non bloquant pour le build
- `react` duplicates via `jest-expo` → Dev dependencies uniquement
- Patch versions mineures → Fonctionnel, juste pas dernières patches

## Architecture Technique

### New Architecture Enabled
```json
"newArchEnabled": true
```
- Fabric renderer activé
- TurboModules activés
- Bridge legacy en interop pour compatibilité
- Performances améliorées

### Background Audio
```json
"UIBackgroundModes": ["audio"]
```
- Son joue même app en arrière-plan
- Essentiel pour timer avec son de fin

### Build Auto-Increment
```json
"autoIncrement": true
```
- EAS incrémente automatiquement le buildNumber
- Évite les erreurs de version duplicate sur App Store Connect

## Cycle de Test

1. **Build EAS** : `eas build --platform ios --profile production`
2. **Submit TestFlight** : `eas submit --platform ios --latest`
3. **Apple Processing** : 5-10 minutes
4. **Internal Testing** : Testeurs externes via TestFlight
5. **Feedback** → Fix → Rebuild

## Commandes Utiles

```bash
# Voir les builds
eas build:list --platform ios

# Voir les submissions
eas submit:list --platform ios

# Gérer les credentials (interactif)
eas credentials --platform ios

# Upgrade EAS CLI
npm install -g eas-cli@latest
```

## Notes SDK 54

### Compatibilité
- **React Native 0.81.5** - Dernière version stable
- **React 19** - Migration réussie
- **Expo SDK 54** - Support complet New Architecture
- **iOS Deployment Target**: 13.4 minimum

### Future-Proof
Cette configuration est prête pour:
- SDK 55+ (New Architecture obligatoire)
- Futures features natives
- MoodCycle app architecture
