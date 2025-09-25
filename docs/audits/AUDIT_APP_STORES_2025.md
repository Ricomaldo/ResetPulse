# 🔍 Audit ResetPulse - Conformité App Store & Google Play 2025

## 📱 Vue d'Ensemble de l'Application
**App:** ResetPulse v1.0.0
**Type:** Timer visuel personnalisable (4-20min)
**Stack:** React Native/Expo
**Catégorie:** Productivité
**Monétisation:** Aucune (pas de RevenueCat, pas d'IAP)

---

## 🚨 POINTS CRITIQUES MAJEURS

### ⚡ 1. RISQUE ÉPILEPSIE - HAUTE PRIORITÉ
**Problème détecté:** Animation de pulsation (`shouldPulse`) activée par défaut
- **Fichier:** `src/components/TimerCircle.jsx:37-76`
- **Impact:** Rejet potentiel iOS/Android pour risque de photosensibilité
- **Fréquence:** Animation répétée toutes les 1.2s pendant toute la durée du timer

**✅ Actions requises:**
1. **Désactiver pulsation par défaut** dans `TimerOptionsContext.jsx:13`
2. **Ajouter avertissement** si utilisateur active la pulsation
3. **Limiter fréquence** à max 3Hz (recommandation W3C WCAG 2.3)

### 📱 2. PERMISSIONS ANDROID EXCESSIVES
**Problème:** Permissions non nécessaires dans `AndroidManifest.xml`
- `READ_EXTERNAL_STORAGE` - Non utilisé
- `WRITE_EXTERNAL_STORAGE` - Non utilisé
- `SYSTEM_ALERT_WINDOW` - Non justifié pour un timer

**✅ Actions requises:**
1. Supprimer ces 3 permissions du manifest principal
2. Garder uniquement `INTERNET` (Expo) et `VIBRATE` (haptic)

---

## 📋 ANALYSE PAR PLATEFORME

### 🍎 iOS App Store - Points de Vigilance

#### ✅ Points conformes
- Pas de permissions sensibles requises
- Pas de références médicales/santé dans le code
- Architecture propre avec Expo
- Orientation portrait uniquement (simplifie review)

#### ⚠️ Points d'attention
1. **Nom de l'app:** "ResetPulse" pourrait être mal interprété
   - Risque: Association avec "pulse" médical
   - Recommandation: Préparer description claire "Timer visuel"

2. **Bundle ID:** `com.irimwebforge.resetpulse`
   - Vérifier disponibilité sur App Store Connect
   - Prévoir certificats/provisioning profiles

3. **Version minimale iOS:** 12.0
   - OK mais considérer iOS 13+ pour 2025

#### 📝 Métadonnées App Store
**À ÉVITER absolument:**
- Mots "ADHD", "thérapeutique", "médical", "traitement"
- Claims de bénéfices santé
- Références à des conditions médicales

**Formulations recommandées:**
```
✅ "Timer visuel pour améliorer votre productivité"
✅ "Outil de gestion du temps personnalisable"
✅ "Timer minimaliste avec palettes de couleurs"
❌ "Aide aux personnes ADHD"
❌ "Solution thérapeutique"
```

### 🤖 Google Play Store - Points de Vigilance

#### ✅ Points conformes
- Package name valide
- Target SDK récent (via Expo)
- Edge-to-edge activé (Android 15 ready)

#### ⚠️ Points d'attention
1. **Permissions excessives** (voir section critique)

2. **Politique Famille:**
   - Si ciblage tous âges, respecter stricter guidelines
   - Pas de collecte de données (OK ✅)
   - Pas de publicité (OK ✅)

3. **Déclaration de données:**
   - Déclarer "Aucune donnée collectée"
   - Mentionner stockage local uniquement (AsyncStorage)

#### 📝 Description Google Play
**Structure recommandée:**
1. Description courte (80 chars): "Timer visuel personnalisable pour votre productivité quotidienne"
2. Description complète: Focus sur fonctionnalités, pas sur conditions médicales

---

## 🎨 ACCESSIBILITÉ & CONFORMITÉ WCAG

### Problèmes détectés
1. **Contraste couleurs:** Vérifier ratios sur palettes sombres
2. **Tailles touch targets:** Minimum 44x44 iOS, 48x48dp Android
3. **Labels accessibilité:** Manquants sur plusieurs composants

### Actions requises
```javascript
// Exemple ajout accessibilité
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Démarrer le timer"
  accessibilityHint="Double-tap pour démarrer"
  accessibilityRole="button"
>
```

---

## ✅ CHECKLIST PRÉ-SOUMISSION

### 📱 iOS App Store
- [ ] Désactiver pulsation par défaut
- [ ] Build sur iPhone physique (pas que simulateur)
- [ ] Screenshots 6.7" + 5.5" minimum
- [ ] Préparer réponses review (justifier timer usage)
- [ ] Privacy Policy URL (même si pas de données)
- [ ] Support URL actif
- [ ] TestFlight beta avant soumission prod

### 🤖 Google Play
- [ ] Retirer permissions inutiles
- [ ] APK/AAB signé correctement
- [ ] Screenshots téléphone + tablette 7" et 10"
- [ ] Feature graphic 1024x500
- [ ] Déclaration données (aucune collecte)
- [ ] Test sur Android 8+ (API 26+)
- [ ] Questionnaire contenu (tous âges approprié)

---

## 🔧 ACTIONS IMMÉDIATES PRIORITAIRES

### 1. Fix Pulsation (URGENT)
```javascript
// src/contexts/TimerOptionsContext.jsx ligne 13
shouldPulse: false, // Changé de true à false
```

### 2. Nettoyer Permissions Android
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<!-- SUPPRIMER ces lignes: -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
```

### 3. Ajouter Modal Avertissement Pulsation
```javascript
// Nouveau composant PulseWarningModal.jsx
const showWarning = () => {
  Alert.alert(
    "Animation de pulsation",
    "Cette option active une animation répétitive. " +
    "Évitez si vous êtes sensible aux effets visuels.",
    [
      { text: "Annuler", style: "cancel" },
      { text: "Activer", onPress: enablePulse }
    ]
  );
};
```

---

## 📊 ESTIMATION RISQUE DE REJET

| Plateforme | Risque Actuel | Après Corrections |
|------------|---------------|-------------------|
| **iOS App Store** | 🟡 Moyen (40%) | 🟢 Faible (10%) |
| **Google Play** | 🟠 Élevé (60%) | 🟢 Faible (15%) |

### Facteurs de risque principaux:
1. **Animations pulsation** → Épilepsie (les deux stores)
2. **Permissions Android** → Rejection automatique possible
3. **Nom "Pulse"** → Confusion médicale potentielle

---

## 💡 RECOMMANDATIONS STRATÉGIQUES

### Pour la v1.0.0
1. **Lancer simple:** Timer productivité sans références santé
2. **A/B Testing:** Noms alternatifs ("FocusRing", "TimeArc", etc.)
3. **Soft launch:** Canada/Australie avant global

### Pour v1.1+
1. Ajouter mode "Accessibilité" (sans animations)
2. Intégrer shortcuts iOS / widgets Android
3. Mode daltonien pour palettes

### Marketing Store
- **Mots-clés:** productivité, timer, focus, pomodoro, minimaliste
- **Éviter:** ADHD, thérapie, médical, traitement, symptômes
- **Screenshots:** Montrer variété palettes, pas pulsation active

---

## 📞 SUPPORT & RÉPONSES AU REVIEW

### Réponse type si rejet épilepsie:
```
Nous avons désactivé les animations par défaut et ajouté
des avertissements clairs. L'app respecte maintenant les
directives WCAG 2.1 niveau AA pour la photosensibilité.
```

### Réponse type si rejet permissions:
```
Les permissions ont été retirées car non nécessaires.
L'app utilise uniquement le stockage local pour les
préférences utilisateur, sans accès aux fichiers externes.
```

---

## 📅 TIMELINE RECOMMANDÉE

1. **Jour 1-2:** Corrections critiques (pulsation, permissions)
2. **Jour 3:** Tests accessibilité + ajout labels
3. **Jour 4:** Préparation assets stores (screenshots, descriptions)
4. **Jour 5:** Build final + tests dispositifs physiques
5. **Jour 6:** Soumission TestFlight / Play Console internal test
6. **Jour 10:** Soumission production après feedback beta

---

**Document préparé le:** 23/09/2025
**Validité:** Guidelines App Store 17.x / Play Console 2025