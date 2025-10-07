# 🔔 Correction Bug Notifications Android - ResetPulse

**Date**: 2025-10-07
**Version**: 1.0.4 → 1.0.5 (à déployer)
**Plateforme**: Android 12+ (API 31+)
**Appareil de test**: Redmi 12 (build production Play Store)

---

## 🐛 Problème Identifié

Les **notifications programmées locales ne se déclenchent PAS** sur les builds production Android, spécifiquement sur Android 12 et supérieur.

### Symptômes
- ✅ Aucune erreur en développement (Expo Go warnings normaux)
- ❌ `scheduleNotificationAsync()` échoue silencieusement en production
- ❌ Timer termine mais aucune notification n'apparaît
- ✅ Le son du timer fonctionne quand l'app est ouverte
- ❌ Aucun feedback quand l'app est en arrière-plan

### Test Device
- **Modèle**: Redmi 12
- **Android**: 12+ (API 31+)
- **Build**: Production AAB via Google Play Internal Testing
- **versionCode**: 10

---

## 📍 Causes Identifiées (3 problèmes critiques)

### 1. ❌ Permission SCHEDULE_EXACT_ALARM manquante (BLOQUANT)

**Android 12+ requirement**: Depuis Android 12 (API 31), la permission `SCHEDULE_EXACT_ALARM` est **OBLIGATOIRE** pour programmer des alarmes exactes.

**Fichier concerné**: `android/app/src/main/AndroidManifest.xml`

**AVANT** (ligne 1-7):
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
  <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
  <uses-permission android:name="android.permission.VIBRATE"/>
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

**Impact**: `scheduleNotificationAsync()` ne programme rien, retourne sans erreur.

---

### 2. ❌ Aucun Android Notification Channel configuré (REQUIS)

**Android 8+ requirement**: Depuis Android 8.0 (API 26), toutes les notifications doivent appartenir à un **channel**.

**Fichier concerné**: `src/hooks/useNotificationTimer.js`

**AVANT** (ligne 68-79):
```javascript
await Notifications.scheduleNotificationAsync({
  content: {
    title: "⏰ Timer terminé !",
    body: `Votre timer de ${Math.floor(seconds/60)}min...`,
    sound: true,
  },
  trigger: {
    type: 'timeInterval', // ❌ String au lieu de enum
    seconds: Math.max(1, seconds),
    // ❌ PAS de channelId
  },
});
```

**Impact**: Notification tombe dans le channel "Miscellaneous" par défaut, pas de garantie de déclenchement.

---

### 3. ⚠️ Plugin expo-notifications absent de app.json

**Fichier concerné**: `app.json`

**AVANT**:
```json
{
  "plugins": [],
  "android": {
    "package": "com.irimwebforge.resetpulse"
    // ❌ Pas de permissions
  }
}
```

**Impact**:
- Permission SCHEDULE_EXACT_ALARM non ajoutée automatiquement
- Sons personnalisés non copiés dans res/raw/

---

## ✅ Solutions Appliquées

### 1. ✅ Ajout permission + plugin dans app.json

**Fichier**: `app.json` (ligne 23-48)

```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/icon.png",
        "color": "#4A5568",
        "sounds": ["./assets/sounds/407342__forthehorde68__fx_bell_short.wav"]
      }
    ]
  ],
  "android": {
    "package": "com.irimwebforge.resetpulse",
    "permissions": [
      "android.permission.SCHEDULE_EXACT_ALARM"
    ]
  }
}
```

**Résultat**:
- Permission ajoutée au AndroidManifest.xml après prebuild
- Son bell_classic copié automatiquement dans res/raw/

---

### 2. ✅ Création du Android Notification Channel

**Fichier**: `src/hooks/useNotificationTimer.js` (ligne 21-48)

```javascript
// Créer le channel Android pour les notifications du timer
// REQUIS pour Android 8.0+ (API 26+)
const setupAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync('timer', {
      name: 'Timer Notifications',
      description: 'Notifications when timer completes',
      importance: Notifications.AndroidImportance.HIGH, // Bannière + son
      sound: '407342__forthehorde68__fx_bell_short.wav', // Son par défaut (bell_classic)
      vibrationPattern: [0, 250, 250, 250], // Vibration courte
      enableLights: true,
      lightColor: '#4A5568', // Couleur thème app
      enableVibrate: true,
      showBadge: true,
    });

    if (__DEV__) {
      console.log('✅ Android notification channel "timer" created');
    }
  } catch (error) {
    console.warn('⚠️ Failed to create Android notification channel:', error.message);
  }
};

// Initialiser le channel au chargement du module
setupAndroidChannel();
```

**Résultat**:
- Channel créé au premier import du hook
- Importance HIGH = bannière + son + vibration
- Son personnalisé configuré pour Android 8+

---

### 3. ✅ Utilisation du channelId + enum correct

**Fichier**: `src/hooks/useNotificationTimer.js` (ligne 97-109)

```javascript
const id = await Notifications.scheduleNotificationAsync({
  content: {
    title: "⏰ Timer terminé !",
    body: `Votre timer de ${Math.floor(seconds/60)}min ${seconds%60}s est terminé`,
    sound: '407342__forthehorde68__fx_bell_short.wav', // Son bell_classic
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, // ✅ Enum correct SDK 54
    seconds: Math.max(1, seconds),
    channelId: 'timer', // ✅ Android : utilise le channel créé
  },
});
```

**Changements**:
- `type: 'timeInterval'` → `Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL`
- `sound: true` → `sound: '407342__forthehorde68__fx_bell_short.wav'`
- Ajout de `channelId: 'timer'`

---

### 4. ✅ Prebuild + Configuration native

**Commandes exécutées**:
```bash
# Regenerate native code with new config
npx expo prebuild --clean --platform android

# Copy notification sound to raw folder
mkdir -p android/app/src/main/res/raw
cp assets/sounds/407342__forthehorde68__fx_bell_short.wav android/app/src/main/res/raw/

# Restore release signing config
# (Done in android/app/build.gradle)

# Copy keystore
cp @irim__resetPulse.jks android/app/
```

**Vérification AndroidManifest.xml** (ligne 1-7):
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
  <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>  ✅ AJOUTÉE
  <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
  <uses-permission android:name="android.permission.VIBRATE"/>
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

---

## 🧪 Tests à Effectuer

### Build Production Android

```bash
# Increment versionCode in android/app/build.gradle
# versionCode 10 → 11

# Build release AAB
cd android
./gradlew clean
./gradlew bundleRelease

# Upload to Play Console → Internal Testing
# Installer sur Redmi 12
```

### Scénarios de Test

#### Test 1 : Notification avec app en foreground
1. Ouvrir ResetPulse
2. Régler timer sur 1 minute
3. Démarrer le timer
4. **Attendre 1 minute**
5. ✅ Vérifier : Notification apparaît + son + vibration

#### Test 2 : Notification avec app en background
1. Ouvrir ResetPulse
2. Régler timer sur 1 minute
3. Démarrer le timer
4. **Mettre l'app en arrière-plan** (home button)
5. **Attendre 1 minute**
6. ✅ Vérifier : Notification apparaît + son + vibration

#### Test 3 : Notification avec app fermée
1. Ouvrir ResetPulse
2. Régler timer sur 1 minute
3. Démarrer le timer
4. **Fermer l'app complètement** (swipe task manager)
5. **Attendre 1 minute**
6. ✅ Vérifier : Notification apparaît + son + vibration

#### Test 4 : Vérification permissions Android
1. Paramètres Android → Apps → ResetPulse → Permissions
2. ✅ Vérifier : "Alarmes et rappels" est **Autorisé**

#### Test 5 : Vérification channel Android
1. Paramètres Android → Apps → ResetPulse → Notifications
2. ✅ Vérifier : Channel "Timer Notifications" existe
3. ✅ Vérifier : Importance = **Élevée**

---

## 📊 Impact

### Avant (v1.0.4)
- ❌ Notifications ne fonctionnent pas sur Android 12+
- ⚠️ Pas de feedback utilisateur en arrière-plan
- ❌ Timer invisible quand app fermée

### Après (v1.0.5)
- ✅ Notifications fonctionnent sur Android 8.0 à 14+
- ✅ Son + vibration personnalisés
- ✅ Notification visible sur écran verrouillé
- ✅ Channel configuré avec importance HIGH

---

## 🔗 Références Documentation

- [Expo Notifications SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/notifications/)
- [Android SCHEDULE_EXACT_ALARM](https://developer.android.com/about/versions/12/behavior-changes-12#exact-alarm-permission)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
- [expo-notifications plugin](https://docs.expo.dev/versions/latest/sdk/notifications/#configuration-in-appjsonappconfigjs)

---

## 📁 Fichiers Modifiés

1. `app.json` - Ajout plugin + permission
2. `src/hooks/useNotificationTimer.js` - Channel + channelId + enum
3. `android/app/src/main/AndroidManifest.xml` - Permission SCHEDULE_EXACT_ALARM (après prebuild)
4. `android/app/src/main/res/raw/407342__forthehorde68__fx_bell_short.wav` - Son notification (copié)
5. `android/app/build.gradle` - Restore release signing config

---

## 🚀 Prochaine Étape

**v1.0.5 Deployment**:
1. Incrémenter versionCode 10 → 11
2. Build release AAB
3. Upload Play Console Internal Testing
4. Tester sur Redmi 12
5. Si OK → Rollout production

---

**Correction effectuée le**: 2025-10-07
**Testé sur**: À tester (Redmi 12, Android 12+)
**Status**: ⏳ En attente de test production
