---
created: '2025-10-18'
updated: '2025-10-21'
status: archived
milestone: M7
confidence: high
---

# Android Submission Checklist - v1.1.6

**Date**: 2025-10-18
**Version**: 1.1.6
**Build**: 16
**Status iOS**: APPROVED (17.10.2025 23:30)
**Status Android**: SUBMITTED

---

## Contexte

Suite à l'approbation iOS v1.1.6, nous procédons à la submission Android pour synchroniser la disponibilité sur les deux stores.

**Bloqueur résolu**: Google Play Service Account credentials débloqués dans RevenueCat

---

## CHECKLIST CRITIQUE (BLOCKER)

### 1. RevenueCat Configuration

- [x] **SDK installé**: react-native-purchases@9.5.3
- [x] **API Key Android configuré**: `goog_OemWJnBmzLuWoAGmEfDJKFBEAYc`
- [x] **Entitlement défini**: `premium_access`
- [x] **Product ID créé**: `com.irimwebforge.resetpulse.premium_lifetime`
- [x] **Service Account invité**: revenuecat-service-account@revenuecat-474510.iam.gserviceaccount.com
- [x] **Permissions service account**:
  - View app information (read-only)
  - View financial data
  - Manage orders and subscriptions

**Vérification**:
```bash
# Vérifier que le service account est bien dans Users & Permissions
# Google Play Console → Users & permissions → Search "revenuecat"
```

### 2. ProGuard Configuration

- [x] **Rules RevenueCat ajoutées**: `android/app/proguard-rules.pro`
  ```proguard
  # RevenueCat SDK
  -keep class com.revenuecat.purchases.** { *; }
  -keep interface com.revenuecat.purchases.** { *; }

  # Google Play Billing
  -keep class com.android.billingclient.** { *; }
  -keep interface com.android.billingclient.** { *; }
  ```

- [ ] **Build release testé avec ProGuard**:
  ```bash
  cd android
  ./gradlew clean
  ./gradlew bundleRelease

  # Vérifier AAB généré
  ls -lh app/build/outputs/bundle/release/app-release.aab
  ```

- [ ] **Test sur device physique**:
  - Installer AAB via Play Console (Internal testing)
  - Tester purchase flow complet
  - Vérifier pas de crash au lancement
  - Tester restore purchases

### 3. Test Mode & Production

- [ ] **TEST_MODE désactivé**:
  ```bash
  # Vérifier src/config/testMode.js
  grep "TEST_MODE = " src/config/testMode.js
  # Doit afficher: export const TEST_MODE = false;
  ```

- [ ] **Vérification manuelle**:
  - Ouvrir `src/config/testMode.js`
  - Confirmer `TEST_MODE = false`
  - Pas de bypass premium en production

### 4. Version & Build Number

- [x] **Version synchronisée**: 1.1.6 (iOS + Android)
- [ ] **Build number incrémenté**:
  ```gradle
  // android/app/build.gradle
  versionCode 16  // Vérifier >= dernier build Play Store
  versionName "1.1.6"
  ```

- [ ] **package.json synchronisé**:
  ```json
  "version": "1.1.6"
  ```

### 5. Signing & Keystore

- [x] **Keystore présent**: `@irim__resetPulse.jks`
- [x] **Signing config**: Vérifié dans `android/app/build.gradle`
- [x] **SHA1 correct**: `DB:51:C1:76:49:DB:2E:34:0B:6A:AE:0D:03:2A:DB:0A:05:25:E4:58`

**Vérification**:
```bash
# Copier keystore si manquant
cp @irim__resetPulse.jks android/app/

# Vérifier SHA1
keytool -list -v -keystore android/app/@irim__resetPulse.jks -alias e97fb8d842350aa8bc5e6467e4c2a954
```

---

## CHECKLIST RECOMMANDÉE

### 6. Google Play Console

- [ ] **In-App Products créés**:
  - Product ID: `com.irimwebforge.resetpulse.premium_lifetime`
  - Type: Managed product (one-time purchase)
  - Prix: 4,99€
  - Status: Active

- [ ] **License Testing configuré**:
  - Ajouter compte tester dans Settings → License testing
  - Type: License testers
  - Email de test ajouté

- [ ] **Store Listing à jour**:
  - Screenshots actuels (montrant features v1.1.6)
  - Description mentionnant premium features
  - Privacy policy à jour (IAP)

### 7. Testing Sandbox

- [ ] **Test purchase flow sandbox**:
  - Compte tester configuré
  - Test achat one-time purchase
  - Vérification déblocage contenu
  - Test restore purchases
  - Test network errors (mode avion)

- [ ] **Validation RevenueCat Dashboard**:
  - Transaction apparaît dans dashboard
  - Customer info updated
  - Entitlement activé

### 8. Logs & Debug

- [ ] **Logs RevenueCat nettoyés**:
  ```javascript
  // Vérifier src/contexts/PurchaseContext.jsx:33-35
  if (__DEV__) {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  }
  // ✅ Logs uniquement en DEV
  ```

- [ ] **Console.log production nettoyés**:
  ```bash
  # Chercher console.log non conditionnels
  grep -r "console\\.log" src/ --include="*.js" --include="*.jsx" | grep -v "__DEV__" | grep -v "RevenueCat"
  ```

### 9. Permissions & Manifest

- [x] **INTERNET permission**: Présente (requise RevenueCat)
- [x] **Pas de permissions inutiles**: Manifest nettoyé
- [x] **Billing permission**: Gérée automatiquement par SDK

**Vérification**:
```bash
cat android/app/src/main/AndroidManifest.xml | grep "uses-permission"
```

---

## CHECKLIST OPTIONNELLE (Post-MVP)

### 10. Analytics Events

- [ ] **Events purchase configurés**:
  - `paywall_viewed`
  - `purchase_initiated`
  - `purchase_completed`
  - `purchase_failed`
  - `restore_purchases`

### 11. Monitoring

- [ ] **Crash reporting configuré**: Sentry/Firebase
- [ ] **Performance monitoring**: Firebase Performance
- [ ] **RevenueCat webhook**: Configured pour backend sync (si applicable)

---

## PROCESS SUBMISSION

### Étape 1: Build Release

```bash
# 1. Vérifier TEST_MODE = false
grep "TEST_MODE = " src/config/testMode.js

# 2. Copier keystore
cp @irim__resetPulse.jks android/app/

# 3. Créer local.properties
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# 4. Build
cd android
./gradlew clean
./gradlew bundleRelease

# 5. Vérifier output
ls -lh app/build/outputs/bundle/release/app-release.aab
```

**Output attendu**: `app-release.aab` (~60-70MB)

### Étape 2: Upload Play Console

1. **Google Play Console** → All applications → ResetPulse
2. **Production** → Create new release
3. **Upload** → `app/build/outputs/bundle/release/app-release.aab`
4. **Release name**: `1.1.6 - RevenueCat Integration`
5. **Release notes** (français):

```markdown
Nouveautés v1.1.6:

🎨 Premium Features
• Débloquez 15 palettes de couleurs
• Accédez à 16 activités thématiques
• Essai gratuit de 7 jours

🔧 Améliorations
• Optimisations performances
• Corrections bugs mineurs
• Amélioration stabilité

Merci pour votre soutien !
```

6. **Review & Roll out**

### Étape 3: Internal Testing (Recommandé)

**Avant production**, tester via Internal Testing:

1. **Play Console** → Internal testing → Create release
2. Upload même AAB
3. Ajouter testers (email)
4. **Tests critiques**:
   - Download depuis Play Store (internal track)
   - Launch app (pas de crash)
   - Purchase flow complet
   - Restore purchases
   - Mode avion (graceful degradation)

5. Si OK → Promote to Production

### Étape 4: Production Release

1. **Review submission** (24-48h généralement)
2. **Monitoring post-release**:
   - RevenueCat Dashboard → transactions
   - Play Console → Crash reports
   - Analytics → installations

---

## ROLLBACK PLAN

### Si crash production détecté

1. **Play Console** → Stop rollout immediately
2. **Diagnostic**:
   ```bash
   adb logcat | grep -i "crash\|exception\|revenuecat"
   ```
3. **Fix** + increment versionCode
4. **Re-submit** avec hotfix

### Si purchase flow broken

1. **RevenueCat Dashboard** → Check API status
2. **Play Console** → Verify IAP products active
3. **Service Account** → Verify permissions
4. **Rollback** à version précédente si critique

---

## TIMELINE ESTIMÉE

### Jour 1 (Aujourd'hui)
- [x] ProGuard rules ajoutées
- [ ] Build release + test ProGuard
- [ ] Upload Internal Testing
- [ ] Test purchase flow sandbox

### Jour 2
- [ ] Tests device physique validés
- [ ] Submit Production
- [ ] Monitoring initial

### Jour 3-4
- [ ] Review Google Play (24-48h)
- [ ] Approval + Live sur Play Store
- [ ] Monitoring post-launch

**Timeline total**: 2-3 jours maximum

---

## RISKS & MITIGATIONS

### Risk 1: ProGuard crash production
**Probabilité**: Moyenne
**Impact**: CRITICAL
**Mitigation**:
- ✅ Rules ajoutées
- ⏳ Test build release avant submit
- ⏳ Internal testing avant production

### Risk 2: RevenueCat purchase fail
**Probabilité**: Faible
**Impact**: HIGH
**Mitigation**:
- ✅ Service account configuré
- ✅ API key validée
- ⏳ Sandbox testing complet

### Risk 3: TEST_MODE oublié ON
**Probabilité**: Faible
**Impact**: CRITICAL (tout gratuit)
**Mitigation**:
- ⏳ Checklist manuelle
- ⏳ Grep verification script

### Risk 4: Review rejection Google Play
**Probabilité**: Faible (IAP standard)
**Impact**: MEDIUM (délai 1-2j)
**Mitigation**:
- Store listing conforme
- Privacy policy IAP mentionné
- Screenshots actuels

---

## SUCCESS METRICS

### Release Success
- [ ] AAB uploaded sans erreur
- [ ] Review approved <48h
- [ ] App live on Play Store
- [ ] Zero crash post-launch (24h)

### Purchase Flow Success
- [ ] Premier achat sandbox validé
- [ ] RevenueCat transaction logged
- [ ] Content unlocked après purchase
- [ ] Restore purchases fonctionnel

### User Metrics (Week 1)
- Downloads: TBD
- D1 retention: >20%
- Trial start rate: >20%
- Conversion rate: 3-5%

---

## CONTACTS & RESOURCES

**Google Play Console**:
- URL: https://play.google.com/console
- Account: irimwebforge@gmail.com
- App ID: com.irimwebforge.resetpulse

**RevenueCat Dashboard**:
- Project: revenuecat-474510
- Android API Key: goog_OemWJnBmzLuWoAGmEfDJKFBEAYc

**Documentation**:
- Android Build Config: `docs/development/builds/ANDROID_BUILD_CONFIG.md`
- RevenueCat Audit: `docs/development/REVENUECAT_ANDROID_AUDIT.md`
- Best Practices: `docs/development/REVENUECAT_BEST_PRACTICES.md`

---

## FINAL CHECKS (Avant Submit)

```bash
# 1. Version correcte
grep "versionCode\|versionName" android/app/build.gradle

# 2. TEST_MODE désactivé
grep "TEST_MODE = " src/config/testMode.js

# 3. Keystore présent
ls -la android/app/@irim__resetPulse.jks

# 4. ProGuard rules présentes
grep -A 3 "RevenueCat SDK" android/app/proguard-rules.pro

# 5. AAB généré
ls -lh android/app/build/outputs/bundle/release/app-release.aab
```

**Si tous ✅ → READY FOR SUBMISSION 🚀**

---

**Créé**: 2025-10-18
**iOS Status**: ✅ APPROVED
**Android Status**: 🚀 READY
**Next**: Build release + Internal testing
