# Configuration Android Build - ResetPulse

## ✅ Configuration FONCTIONNELLE avec SDK 51

### Package.json (SDK 51 - STABLE)
```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.23.1",
    "expo": "~51.0.0",
    "expo-haptics": "~13.0.1",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-native-gesture-handler": "~2.16.2",
    "react-native-reanimated": "~3.10.1",
    "react-native-safe-area-context": "4.10.5",
    "react-native-svg": "15.2.0"
  }
}
```

### app.json
```json
{
  "expo": {
    "newArchEnabled": false  // IMPORTANT: Désactiver New Architecture
  }
}
```

## Fichier android/app/build.gradle

### Configuration complète android block

```gradle
android {
    compileSdk 35
    buildToolsVersion "35.0.0"

    namespace 'com.irimwebforge.resetpulse'
    defaultConfig {
        applicationId 'com.irimwebforge.resetpulse'
        minSdkVersion 24
        targetSdkVersion 35
        versionCode 9  // Version actuelle sur Play Store
        versionName "1.0.3"
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('@irim__resetPulse.jks')
            storePassword '516b8e1f91a4c81239ce48e48f755b31'
            keyAlias 'e97fb8d842350aa8bc5e6467e4c2a954'
            keyPassword 'c59090720ea513f0cd6bfb2f3fc96a9a'
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            shrinkResources (findProperty('android.enableShrinkResourcesInReleaseBuilds')?.toBoolean() ?: false)
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            crunchPngs (findProperty('android.enablePngCrunchInReleaseBuilds')?.toBoolean() ?: true)

            postprocessing {
                removeUnusedCode false
                removeUnusedResources false
                obfuscate false
                optimizeCode false
                proguardFile 'proguard-rules.pro'
            }
        }
    }

    packagingOptions {
        jniLibs {
            useLegacyPackaging (findProperty('expo.useLegacyPackaging')?.toBoolean() ?: false)
        }
    }

    androidResources {
        ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:!CVS:!thumbs.db:!picasa.ini:!*~'
    }

    bundle {
        language {
            enableSplit = false
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}
```

## Fichier android/local.properties

```
sdk.dir=/Users/irimwebforge/Library/Android/sdk
```

## Process de Build après Prebuild

### 1. Prérequis IMPORTANTS
- [ ] **Utiliser le VRAI keystore du projet racine** : `@irim__resetPulse.jks`
- [ ] **Vérifier le SHA1** : `DB:51:C1:76:49:DB:2E:34:0B:6A:AE:0D:03:2A:DB:0A:05:25:E4:58`
- [ ] `android/local.properties` - SDK path
- [ ] `android/app/build.gradle` - configuration complète avec credentials

### 2. Commandes build
```bash
# Copier le bon keystore
cp @irim__resetPulse.jks android/app/

# Build
cd android
./gradlew clean
./gradlew bundleRelease
```

### 3. Diagnostic crash
```bash
# Test debug d'abord
npx expo run:android

# Logs crash (dans Android Studio Logcat)
# Chercher "ExpoAsset" ou "JavascriptException"
```

## Problèmes Courants (RÉSOLUS ✅)

### Crash ExpoAsset avec SDK 53
**Cause :** Incompatibilité SDK 53 + React 19 + New Architecture
**Solution :** Downgrade vers SDK 51 + React 18.2.0 + désactiver New Architecture

### Wrong signing key
**Cause :** Keystore config perdue après prebuild
**Solution :** Restore signingConfigs + copy keystore file

### SDK not found
**Cause :** local.properties manquant
**Solution :** `echo "sdk.dir=/path/to/sdk" > android/local.properties`

### Missing mapping file warning
**Cause :** postprocessing config manquante
**Action :** Ignore warning ou restore config postprocessing

## Credentials EAS
```bash
npx eas credentials
# → Select Android → production → Download existing keystore
```

**Keystore info :**
- File: `@irim__resetPulse.jks`
- Store Password: `516b8e1f91a4c81239ce48e48f755b31`
- Key Alias: `e97fb8d842350aa8bc5e6467e4c2a954`
- Key Password: `c59090720ea513f0cd6bfb2f3fc96a9a`
- SHA1: `DB:51:C1:76:49:DB:2E:34:0B:6A:AE:0D:03:2A:DB:0A:05:25:E4:58`

## Cycle de Test
1. Build debug : `npx expo run:android`
2. Si OK → Build release : `./gradlew bundleRelease`
3. Upload Play Console → Internal Testing
4. Test sur émulateur via Play Store
5. Fix → Incrément versionCode → Rebuild

## 🎉 SUCCÈS CONFIRMÉ
- **SDK 51** : Stable, pas de crash ExpoAsset
- **Version déployée** : 1.0.3 (versionCode 9)
- **Keystore correct** : SHA1 vérifié et fonctionnel
- **AAB accepté** par Google Play Store ✅