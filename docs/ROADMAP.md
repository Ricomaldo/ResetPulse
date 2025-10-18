# ResetPulse - Roadmap Stratégique 2025

## Vision Projet

Time Timer visuel pour utilisateurs neuroatypiques. Laboratoire d'apprentissage complet dev/marketing/publication/monétisation. Focus : créer un outil utile pour soi et sa famille d'abord, valider viabilité commerciale ensuite.

**Objectif final** : Réplication méthode Harry (280€/jour profit net après stabilisation).

---

## Grands Principes

**Usage-First Development**
L'app doit servir dans la vraie vie avant optimisation commerciale. Retours terrain guident architecture, pas suppositions développeur.

**Learning Capitalisable**
Chaque étape valide compétences transférables vers projets futurs (MoodCycle). Échec = données, pas défaite personnelle.

**Itération Rapide Sans Perfectionnisme**
80% fonctionnel suffit pour tester. Sur-ingénierie = procrastination déguisée.

**Marketing Intégré Dès Le Début**
Conversion avant pub. Attribution tracking avant budget. Onboarding = fondation revenus.

---

## Timeline Complète

### M1-M2 : Foundation Technique

**Dates** : 29 sept - 2 oct 2025 (4 jours)
**Statut** : ✅ VALIDÉ

Migration React → React Native. Timer core + UI responsive cross-platform. Build iOS/Android fonctionnels.

**Apprentissages acquis :**

- React Native production-ready
- Cross-platform architecture
- Expo workflow maîtrisé
- Activities carousel avec favoris

**Git milestone** : `0c41aa5` (29 sept) - "feat: Foundation v1.0.4 - SDK 54 migration + Audio System complet"

---

### M3-M4 : Validation Terrain

**Dates** : 2-3 oct 2025 (2 jours)
**Statut** : ✅ VALIDÉ

TestFlight famille (3 testeurs). Refactorisation architecture basée signaux réels. Onboarding system v2.0 avec tooltips interactifs. Settings modal redesign iOS 15+.

**Apprentissages acquis :**

- Tests utilisateurs précoces critiques
- Refactorisation préventive basée usage réel
- User feedback > analyse statique
- Onboarding SVG spotlight professionnel

**Git milestone** : `a9825e8` (3 oct) - v1.0.4 déployée (iOS buildNumber 13, Android versionCode 10)

---

### M5 : Infrastructure Monétisation

**Dates** : 7-9 oct 2025 (3 jours)
**Statut** : ✅ VALIDÉ

RevenueCat + IAP setup. Freemium (2 palettes + 4 activités gratuites). Paywall UI avec trial 7 jours + lifetime 4,99€. Tests sandbox iOS/Android.

**Apprentissages acquis :**

- RevenueCat SDK opérationnel
- IAP architecture fonctionnelle
- Freemium UX non-oppressive
- Restore purchases + edge cases réseau

**Git milestone** : `1ef9634` (8 oct) - "feat: implement RevenueCat monetization (v1.1.0)"

---

### M6 : Publication iOS

**Dates** : 13-17 oct 2025 (5 jours - 3 tentatives Apple Review)
**Statut** : ✅ VALIDÉ - LIVE APP STORE

Pipeline dev→store complet validé. App disponible publiquement depuis 18 oct 2025.

**Apprentissages acquis :**

- Cycle publication iOS end-to-end
- Apple Review workflow (rejets = learning)
- IAP entitlements debugging (provisioning profile)
- UIBackgroundModes compliance strict

**Tentatives Apple Review :**

1. **v1.1.4** (13 oct) : IAP entitlement blocker (backend Apple)
2. **v1.1.5** (15 oct) : Rejet UIBackgroundModes audio injustifié
3. **v1.1.6** (16 oct) : **APPROVED** (17 oct 23:30, délai 24h)

**Git milestone** : `d7a2d03` (16 oct) - "chore: finalize v1.1.6 for Apple Review submission"

---

### M7 : Publication Android

**Dates** : 18-20 oct 2025 (3 jours)
**Statut** : 🔄 EN COURS

Google Play submission. Validation cross-platform complète. Assets store + test monétisation Android. Keep awake feature (v1.1.7).

**Objectif :** Double présence store (iOS + Android) = double apprentissage marketing.

**Bloqueurs résolus :**

- ✅ Google Play Service Account configuré (post-Mai 2024)
- ✅ RevenueCat credentials débloqués
- ✅ ProGuard rules RevenueCat + Billing
- ✅ Keep awake implémenté (ON par défaut, toggle Settings)

**Timeline estimée :**

- J1 (18 oct) : Keep awake implementation + version bump 1.1.7 ✅
- J2 (19 oct) : Build release test + Android Internal Test upload
- J3 (20 oct) : Google Play Review submission (délai review 1-7 jours)

---

### M7.5 : Analytics Setup

**Dates** : 19-20 oct 2025 (4h dev)
**Statut** : 📋 DOCUMENTÉ - Ready Implementation

Mixpanel integration avant marketing launch. 6 events critiques trackés. RevenueCat webhooks cross-validation.

**Objectif :** Voir ce que font les users AVANT dépenser 1€ pub.

**Events implémentés :**

- `app_opened` (attribution baseline + is_first_launch)
- `onboarding_completed` (funnel top, target > 65%)
- `paywall_viewed` (reach measurement, source tracking)
- `trial_started` (intention achat)
- `purchase_completed` (revenue tracking, cross-check webhook)
- `purchase_failed` (friction debug, error_code granulaire)

**Configuration :**

- ✅ Mixpanel token production : `19fef...aed91`
- ✅ RevenueCat webhooks dashboard activés
- ✅ ProGuard rules Android documentées
- ✅ Dashboard funnel template créé

**Décision stratégique :**

- Mixpanel vs. MMP (Tenjin/AppsFlyer) : Mixpanel suffisant pré-ROAS
- Consensus Discord (Harry/Kévin) : "Source fiable" apps freemium
- Learning capitalisé MoodCycle : Stack analytics validé

**Benchmarks attendus (baseline organique semaine 1) :**

- Onboarding completion > 65% (Discord benchmark 60-80%)
- Paywall view rate > 35% installs
- Trial start > 18% paywall viewers
- Trial → Paid > 20% (timer apps ≠ meditation apps)
- Overall conversion > 3.5% (go/no-go pub)

**Documentation complète :**

- [Analytics Strategy](decisions/analytics-strategy.md) - Pourquoi/Quoi (35 pages)
- [Mixpanel Implementation](development/MIXPANEL_IMPLEMENTATION.md) - Comment/Quand (40 pages)

**Timeline :**

- Samedi 19 oct : SDK install + 6 events code (3h)
- Dimanche 20 oct : Webhooks + Android test + validation (1h)
- Lundi 21 oct : Submit v1.1.8 (analytics bundled)

**Apprentissages acquis (post-implementation) :**

- Analytics setup iOS + Android production
- Event architecture scalable (super properties)
- Dashboard funnels RevenueCat-synced
- Baseline metrics pre-marketing (M8 input)

**Git milestone** : TBD (post-implémentation samedi)

---

### M8 : Optimisation Conversion

**Dates** : 23-25 oct 2025 (3 jours)
**Statut** : 🎯 PLANIFIÉ

Implémentation "Méthode Harry" avant toute publicité :

- Onboarding rallongé (effet IKEA + climax paywall naturel)
- Attribution tracking propre (RevenueCat → Apple Search Ads)
- A/B testing copy paywall si besoin

**Objectif :** Maximiser conversion trial→paid avant investir budget pub.

**KPIs cibles :**

- Trial start rate > 15% (benchmark apps freemium)
- Trial→Paid > 5% (baseline RevenueCat)
- Onboarding completion > 70%

**Note :** Onboarding v2.0 déjà live (tooltips interactifs depuis 2 oct). M8 = rallongement stratégique uniquement.

---

### M9 : Internationalisation

**Dates** : 28-30 oct 2025 (3 jours)
**Statut** : 🎯 PLANIFIÉ - Conditionnel

expo-localization + 15 langues. ASO multilingue. Décision basée validation product-market fit français d'abord.

**Objectif :** Marché 10x élargi si traction française validée.

**Conditionnel :** Si traction FR > 100 users/mois organiques, go i18n. Sinon, focus M10 direct.

---

### M10 : Test Marketing Structuré

**Dates** : Nov 2025 (durée TBD selon budget)
**Statut** : ⏳ CONDITIONNEL - Dépend M8

Apple Search Ads test. Stabilité 21 jours minimum (méthode Harry). Mesure coût/install, trial→paid, attribution quality.

**Objectif :** Valider canal acquisition rentable ou identifier pivot nécessaire.

**Budget :** En suspens (validation avec mentor Harry requise)

- Hypothèse basse : 50€ test = ~2.5 conversions (statistiquement insuffisant)
- Hypothèse recommandée : 200€ test = ~10 conversions (signal clair)

**Décision go/no-go :** Si ROI positif (LTV > CAC), scaling progressif. Si ROI négatif, transfert learnings MoodCycle.

---

### M11+ : Scaling ou Pivot

**Dates** : Déc 2025 - Jan 2026
**Statut** : ⏳ CONDITIONNEL - Dépend M10

**Si ROI positif (M10) :**

- Budget pub progressif 50→100→200€/mois
- Réplication méthode Harry (objectif 280€/jour profit net après 3-6 mois)
- Lock Screen Display (timer visible écran verrouillé)
- Apple Watch extension (différenciation technique, learning watchOS)

**Si ROI négatif (M10) :**

- Transfert learnings complets vers MoodCycle
- ResetPulse maintenu en portfolio (maintenance uniquement)
- Pas investment marketing supplémentaire

**Features conditionnelles :**

- **Lock Screen Display** (User Impact 4.5, Learning 3.0) - Timer persistant écran verrouillé
- **Apple Watch** (User Impact 3.5, Learning 5.0) - Compétence rare différenciante
- **Analytics avancés** - Data-driven retention/churn
- **Community management** - Reddit TDAH, Discord créateurs (early adopters organiques)

---

## Métriques Succès Projet

### ✅ Validation Technique (Acquise)

- App live 2 stores (iOS ✅, Android 🔄)
- Pipeline reproductible end-to-end
- Architecture scalable validée terrain

### 🎯 Validation Commerciale (En Cours)

- 1€ reversé Apple = validation symbolique
- ROI pub positif (M10) = validation viabilité
- 280€/jour profit (M11+) = validation scaling (réplication Harry)

### ✅ Validation Apprentissage (Continue)

- Framework transférable MoodCycle
- Compétences monétisation mobiles opérationnelles
- Méthodologie marketing structurée (méthode Harry)

---

## Contexte Développeur

Eric, développeur freelance IA-natif (18 mois, 20 projets portfolio). Spécialisé outils neuro-adaptatifs. TDA/H personnel, contexte familial neurodivers (fils TSA+TDA/H, belle-fille TDA/H).

ResetPulse = projet #20, laboratoire technique/commercial avant MoodCycle (app cycle menstruel neuro-adaptée, projet principal 2026).

Membre collectif Discord créateurs apps (seniors expérimentés, mentor Harry 8k€/mois après 3 mois méthode structurée).

---

## Risques Assumés

### Commercial

- Marché timer saturé (Time Timer, Forest, Be Focused) → Différenciation neuro-spécifique doit convaincre
- Apple Search Ads coûteux France → Test M10 = validation go/no-go claire
- RevenueCat fees 10% → Acceptable si volume suffisant

### Opérationnel

- M8+M9 = 6 jours sprint intensif → Risque burnout TDAH
- **Mitigation** : M9 devient optionnel si fatigue cognitive détectée
- Google Play Review imprévisible (1-7 jours) → Buffer timeline M7

### Stratégique

- Si échec M10 → Transfert immédiat MoodCycle (pas attachement émotionnel)
- Sunk cost fallacy anticipé → Décision go/no-go basée data uniquement

---

## Documentation Associée

### Décisions Architecturales

- [ADR Monétisation v1.1](decisions/adr-monetization-v11.md) - Freemium 2 palettes
- [Analytics Strategy](decisions/analytics-strategy.md) - Mixpanel vs alternatives, 6 events critiques, benchmarks
- [Keep Awake Strategy](decisions/keep-awake-strategy.md) - ON par défaut (TDAH UX)
- [Apple Provisioning Profile IAP](decisions/apple-provisioning-profile-iap-failure.md) - Debugging iOS entitlements
- [Priority Matrix (Archive)](archive/decisions/time_timer_priority_matrix.md) - Scoring historique features

### Releases & Changelogs

- [v1.0.5 Changelog](releases/v1.0.5-changelog.md) - Android notifications fix + SDK 54
- [v1.1.6 iOS Approval](releases/v1.1.6-ios-approval.md) - Apple Review success (17 oct 2025)
- [Android Submission Checklist](releases/ANDROID_SUBMISSION_CHECKLIST.md) - Pre-submission audit M7

### Technical Guides

- [Mixpanel Implementation](development/MIXPANEL_IMPLEMENTATION.md) - Setup 4h, code snippets, troubleshooting
- [RevenueCat Best Practices](development/REVENUECAT_BEST_PRACTICES.md) - Guide intégration complète
- [RevenueCat Android Audit](development/REVENUECAT_ANDROID_AUDIT.md) - Configuration Android spécifique
- [Android Build Config](development/builds/ANDROID_BUILD_CONFIG.md) - SDK 54 + New Architecture
- [iOS Build Config](development/builds/IOS_BUILD_CONFIG.md) - EAS Build + TestFlight

---

**Roadmap vivante - Actualisation selon usage réel et validation commerciale progressive**

_Dernière mise à jour : 18 Octobre 2025 - v1.1.7 (Keep Awake + Android pending) + M7.5 Analytics documenté_
