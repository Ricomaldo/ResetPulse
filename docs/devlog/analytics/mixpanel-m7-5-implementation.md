# Mixpanel M7.5 Implementation - Learning Session

**Date** : 20 Octobre 2025 (Dimanche matin 9h-12h)
**Milestone** : M7.5 Analytics Foundation
**Version** : v1.1.8
**Status** : ✅ VALIDÉ - Events reçus dashboard

---

## TL;DR - Learning Clés

**Galère** : Events envoyés (logs OK) mais pas reçus dashboard (0 events)

**Causes** :
1. Token organisation au lieu de token projet
2. Serveurs US au lieu EU (RGPD compliance)

**Solutions** :
1. Token corrigé : `19fef...` → `4b1bd9b9...` (projet ResetPulse)
2. Config EU : `this.mixpanel.setServerURL('https://api-eu.mixpanel.com')`
3. Flush DEV : `mixpanel.flush()` pour feedback immédiat

**Pattern validé** : Toujours tester 1 event avant intégrer tous

**Délai dashboard** : 3-5 minutes (pas 30 secondes comme supposé)

---

## Chronologie Session

### 9h00 - Début Implementation

**État initial** :
- SDK `mixpanel-react-native@3.1.2` installé
- Service `analytics.js` créé (6 events méthodes)
- Hook `useAnalytics()` prêt
- App.js init Mixpanel au startup

**Objectif** : Valider 1 event `app_opened` avant intégrer les 5 autres

---

### 9h15 - Premier Test Event

**Code** :
```javascript
// App.js
await Analytics.init();
Analytics.trackAppOpened(true); // Test event
```

**Logs console** :
```
✅ [Analytics] Mixpanel initialized successfully
   Platform: ios
   App Version: 1.1.7
   Ready to track events
📊 [Analytics] app_opened {"is_first_launch": true}
```

**Dashboard Mixpanel** : "0 matches" (aucun event)

**🚨 Problème détecté** : Events envoyés mais pas reçus

---

### 9h30 - Debug Token

**Hypothèse** : Token incorrect ?

**Vérification dashboard** :
- Settings → Project Token : `4b1bd9b9a3be61afb7c19b40ad5a73de`

**Code `analytics.js:22`** :
```javascript
const MIXPANEL_TOKEN = '19fef5beb302264e8e3eaf9c0ccaed91'; // ❌ MAUVAIS
```

**🔍 Découverte** : Token organisation (global) au lieu de token projet (ResetPulse)

**Fix appliqué** :
```javascript
const MIXPANEL_TOKEN = '4b1bd9b9a3be61afb7c19b40ad5a73de'; // ✅ CORRECT
```

**Commit** : `c36c7b3` - Fix token organization → project

---

### 10h00 - Rebuild + Nouveau Test

**Résultat** : Dashboard toujours "0 matches"

**Analyse logs** :
- Token correct dans code ✅
- Init success ✅
- Event envoyé ✅
- Mais dashboard vide ❌

**🚨 Nouveau problème** : Token correct mais events toujours pas reçus

---

### 10h15 - Debug Data Residency

**Vérification dashboard** :
- Settings → Data Residency : **EU**
- Settings → Usage Statistics : Event Count **0**

**Hypothèse** : Serveurs US vs. EU mismatch ?

**Code `analytics.js:44-45`** :
```javascript
this.mixpanel = new Mixpanel(MIXPANEL_TOKEN, trackAutomaticEvents, useNative);
await this.mixpanel.init(); // ← Pas de config serveur EU !
```

**🔍 Découverte** : SDK envoie vers `api.mixpanel.com` (US) par défaut, projet configuré EU = events droppés

**Doc Mixpanel** :
> "For EU projects, call setServerURL('https://api-eu.mixpanel.com') after init()"

**Fix appliqué** :
```javascript
await this.mixpanel.init();
this.mixpanel.setServerURL('https://api-eu.mixpanel.com'); // EU servers
```

**Commit** : `35bed5e` - Add EU data residency server URL

---

### 10h45 - Rebuild + Test Final

**Logs console** :
```
✅ [Analytics] Mixpanel initialized successfully
   Platform: ios
   App Version: 1.1.8
   Token: 4b1bd9b9a3be...
   Server URL: https://api-eu.mixpanel.com
   Ready to track events
📊 [Analytics] app_opened {"is_first_launch": true}
   ✈️  Event flushed to server
```

**Dashboard Mixpanel** (après **3-5 minutes**) :
- Events → Live View : **`app_opened` visible** ✅
- Usage Statistics : Event Count **1** ✅

**🎉 SUCCÈS** : Events arrivent enfin dans dashboard !

---

### 11h00 - Intégration 5 Events Restants

**Pattern validé** : 1 event test → debug → intégration complète

**Events intégrés** :
1. ✅ `app_opened` - App.js init (déjà testé)
2. ✅ `onboarding_completed` - OnboardingController.jsx
3. ✅ `paywall_viewed` - PremiumModal.jsx
4. ✅ `trial_started` - PurchaseContext.jsx
5. ✅ `purchase_completed` - PurchaseContext.jsx
6. ✅ `purchase_failed` - PurchaseContext.jsx

**Commits** :
- `6be70f9` - Integrate 4 core events
- `ba14c3d` - Complete M7.5 v1.1.8

---

### 11h30 - ProGuard + Version Bump

**Android production ready** :
```proguard
# Mixpanel SDK - Analytics (M7.5)
-keep class com.mixpanel.** { *; }
-keep interface com.mixpanel.** { *; }
-dontwarn com.mixpanel.**
```

**Version bump** :
- `app.json` : 1.1.7 → 1.1.8
- `package.json` : 1.1.7 → 1.1.8

---

## Learning Capitalisé

### 1. Token Organisation vs. Projet

**Erreur classique débutant** :
- Dashboard Mixpanel affiche 2 tokens (organisation + projet)
- Organisation token = global tous projets
- Projet token = spécifique ResetPulse

**Comment éviter** :
- Dashboard → Project Settings → copier **"Project Token"** (pas API credentials)
- Tester 1 event avant intégration complète

**Symptôme** : Events envoyés (logs OK) mais dashboard 0 events

---

### 2. EU Data Residency Configuration

**Erreur critique RGPD** :
- Projet créé avec data residency EU
- SDK par défaut envoie vers US (`api.mixpanel.com`)
- Events silencieusement droppés (pas d'erreur console)

**Fix obligatoire** :
```javascript
await this.mixpanel.init();
this.mixpanel.setServerURL('https://api-eu.mixpanel.com'); // Après init()
```

**Comment détecter** :
- Dashboard Settings → Data Residency = EU
- Dashboard Usage Statistics = 0 events malgré logs
- Solution : Ajouter `setServerURL()` après `init()`

**Réutilisable MoodCycle** : Ne JAMAIS oublier cette ligne si projet EU

---

### 3. Délai Dashboard ≠ Temps Réel

**Supposition initiale** : Events apparaissent en 10-30 secondes

**Réalité terrain** : **3-5 minutes** délai normal

**Implication** :
- Ne pas paniquer si event pas immédiat
- Tester, attendre 5 minutes, vérifier dashboard
- Flush en DEV réduit queue mais pas délai serveur

**Pattern de test** :
1. Envoyer event
2. Attendre **5 minutes complètes**
3. Refresh dashboard
4. Si toujours vide après 5min → debug token/endpoint

---

### 4. Flush Immédiat DEV

**Problème** : Events en queue, envoyés batch toutes les 60s

**Solution** :
```javascript
if (__DEV__) {
  this.mixpanel.flush(); // Force envoi immédiat
  console.log('📊 [Analytics]', eventName, properties);
  console.log('   ✈️  Event flushed to server');
}
```

**Avantages** :
- Feedback rapide debugging M8
- Confirmation envoi dans logs
- Production non affectée (`if (__DEV__)`)

---

### 5. Pattern "Test 1 Event First"

**Erreur évitée** :
- Intégrer 6 events d'un coup
- Découvrir que aucun ne fonctionne
- Debug complexe (quel event? quelle config?)

**Pattern validé** :
1. Implémenter 1 event simple (`app_opened`)
2. Tester dashboard (attendre 5min)
3. Si OK → intégrer les 5 autres
4. Si KO → debug token/endpoint

**Temps gagné** : 2h debug évitées

---

## Commits Session (12 total)

1. `ff0ff3e` - Roadmap M7.5 milestone
2. `7cf6a39` - Timeline pivot i18n M7.6
3. `034e528` - M7 sequence fix
4. `30046b7` - Apple submissions planning
5. `e008e8f` - TODO consolidation
6. `218369b` - Devlog pivot stratégique
7. **`c36c7b3`** - **Fix token organization → project** 🔧
8. **`35bed5e`** - **Fix EU data residency** 🔧
9. **`6be70f9`** - **4 events integrated**
10. **`ba14c3d`** - **M7.5 Complete v1.1.8** ✅
11. `aee4e57` - Debug logging + flush
12. `8041d16` - Refactor debug code

**Total session** : 3h (9h-12h)

**Dont debug** : 1h30 (token + EU endpoint)

**Économie pattern "test 1 first"** : ~2h évitées

---

## Metrics M7.5 Final

**Code** :
- 1 service : `analytics.js` (213 lignes)
- 1 hook : `useAnalytics.js` (19 lignes)
- 6 events : Implémentés dans 4 fichiers

**Configuration** :
- Token : `4b1bd9b9a3be61afb7c19b40ad5a73de`
- Endpoint : `https://api-eu.mixpanel.com`
- ProGuard : 3 rules Android

**Tests** :
- ✅ app_opened validé dashboard
- ⏳ 5 autres events à valider usage réel

**Documentation** :
- 2 docs stratégie (75 pages)
- 1 devlog implementation (ce fichier)
- ROADMAP + TODO + CHANGELOG updated

---

## Réutilisable MoodCycle

### Checklist Setup Mixpanel

**1. Création Projet Dashboard**
- [ ] Dashboard → Create Project
- [ ] Name : MoodCycle
- [ ] Data Residency : **EU** (RGPD)
- [ ] Copier **Project Token** (pas Organization)

**2. SDK Installation**
```bash
npx expo install mixpanel-react-native
```

**3. Service Analytics** (copier `analytics.js` ResetPulse)
```javascript
const MIXPANEL_TOKEN = 'PASTE_PROJECT_TOKEN_HERE'; // Projet MoodCycle

await this.mixpanel.init();
this.mixpanel.setServerURL('https://api-eu.mixpanel.com'); // ⚠️ NE PAS OUBLIER
```

**4. Test 1 Event**
```javascript
Analytics.trackAppOpened(true);
```

**5. Attendre 5 Minutes**
- Dashboard → Events → Live View
- Vérifier event `app_opened` visible

**6. Si 0 Events Après 5min**
- [ ] Token correct ? (commence par bon préfixe)
- [ ] setServerURL() appelé ? (logs "Server URL: https://api-eu.mixpanel.com")
- [ ] Data Residency EU ? (Settings dashboard)

**7. Si Event Visible → Intégrer Tous**

---

## Erreurs à Ne JAMAIS Refaire

❌ **Utiliser token organisation au lieu de projet**
- Symptôme : Events invisibles dashboard
- Fix : Dashboard → Project Settings → Project Token

❌ **Oublier `setServerURL()` sur projet EU**
- Symptôme : Events droppés silencieusement
- Fix : `mixpanel.setServerURL('https://api-eu.mixpanel.com')` après `init()`

❌ **Intégrer tous events avant tester 1 seul**
- Symptôme : Debug complexe si config broken
- Fix : Pattern "Test 1 Event First"

❌ **Paniquer si event pas visible après 30s**
- Symptôme : Faux problème, délai normal
- Fix : Attendre 5 minutes complètes avant debug

---

## Next Steps M7.6

**Timeline** :
- Dimanche 20 oct après-midi : expo-localization + strings 15 langues (4-6h)
- Lundi 21 oct : Metadata stores iOS/Android
- Mardi 22 oct : Submit v1.2.0 production simultané

**Baseline analytics opérationnelle** : M7.5 validé ✅

---

**Session M7.5 : 3h implementation + 1h30 debug = 4h30 total**

*Learning capitalisé pour MoodCycle - Checklist réutilisable évite 2h debug*
