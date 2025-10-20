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

**Dates** : 18-21 oct 2025 (4 jours)
**Statut** : 🔄 EN COURS

Google Play submission v1.2.0. Validation cross-platform complète. Phase globale incluant M7.5 (Mixpanel) + M7.6 (i18n) avant submit production.

**Objectif :** Double présence store (iOS + Android) = double apprentissage marketing.

**Bloqueurs résolus :**

- ✅ Google Play Service Account configuré (post-Mai 2024)
- ✅ RevenueCat credentials débloqués
- ✅ ProGuard rules RevenueCat + Billing
- ✅ Keep awake implémenté (ON par défaut, toggle Settings)

**Timeline estimée :**

- J1 (18 oct) : Keep awake v1.1.7 ✅
- J2 (19 oct) : Mixpanel (M7.5) + i18n (M7.6) integration
- J3 (20 oct) : Assets store + metadata 15 langues iOS/Android
- J4 (21 oct) : **Submission simultanée iOS UPDATE v1.2.0 + Android INITIAL v1.2.0** (keep awake + Mixpanel + i18n bundled)

**Décision Apple submissions :**

- ❌ **Skip v1.1.8 iOS** - Évite fragmentation versions (v1.1.6 → v1.1.8 → v1.2.0 = 3 updates/3j)
- ✅ **v1.2.0 iOS + Android simultané (21 oct)** - Parité stores + metadata multilingue cohérent + baseline analytics synchronisé
- **Rationale** : Délai Mixpanel 48h acceptable vs. overhead Apple Review double (v1.1.8 puis v1.2.0)

**Clarification submissions J4** :
- **iOS** : Update v1.1.6 → v1.2.0 (add keep awake + Mixpanel + i18n aux users existants)
- **Android** : Première soumission Google Play v1.2.0 directement
- **Objectif** : Parité features stores post-reviews (délai iOS ~24h, Android 1-7j)
- **Analytics baseline** : Démarre quand Android live (iOS update rapide mais Android délai incertain)

---

### M7.5 : Analytics Foundation

**Dates** : 20 oct 2025 (9h-12h, 4h30 avec debug)
**Statut** : ✅ VALIDÉ - Events reçus dashboard
**Version** : v1.1.8

Mixpanel integration avant marketing launch. 6 events critiques trackés. Baseline analytics opérationnelle M8.

**Objectif :** Voir ce que font les users AVANT dépenser 1€ pub.

**Events implémentés (6/6) :**

- ✅ `app_opened` (attribution baseline + is_first_launch) - App.js
- ✅ `onboarding_completed` (funnel top, target > 65%) - OnboardingController
- ✅ `paywall_viewed` (reach measurement, source tracking) - PremiumModal
- ✅ `trial_started` (intention achat) - PurchaseContext
- ✅ `purchase_completed` (revenue tracking, cross-check webhook) - PurchaseContext
- ✅ `purchase_failed` (friction debug, error_code granulaire) - PurchaseContext

**Configuration validée :**

- ✅ SDK : mixpanel-react-native@3.1.2
- ✅ Token projet : `***REMOVED***` (ResetPulse)
- ✅ Server EU : `https://api-eu.mixpanel.com` (RGPD compliance)
- ✅ ProGuard rules Android : Obfuscation configured
- ✅ Flush DEV : Feedback immédiat debugging

**Debug session (1h30) :**

- 🐛 **Galère 1** : Token organisation au lieu projet → Events droppés
- 🐛 **Galère 2** : Serveurs US au lieu EU → RGPD non-compliant
- ✅ **Fix** : Token + setServerURL() corrigés
- ⏱️ **Délai dashboard** : 3-5 minutes (pas 30s comme supposé)

**Pattern validé :**

- ✅ Test 1 event avant intégrer tous (économie 2h debug)
- ✅ Logs diagnostics (token + server URL visibility)
- ✅ Flush immédiat DEV (feedback rapide M8)

**Learning capitalisé MoodCycle :**

- Checklist setup Mixpanel réutilisable
- Erreurs classiques documentées (évite 2h debug)
- Stack analytics validé terrain

**Documentation complète :**

- [Analytics Strategy](decisions/analytics-strategy.md) - Pourquoi/Quoi (35 pages)
- [Mixpanel Implementation](development/MIXPANEL_IMPLEMENTATION.md) - Comment/Quand (40 pages)
- [Implementation Devlog](devlog/analytics/mixpanel-m7-5-implementation.md) - Learning session terrain

**Timeline :** Dimanche 19 oct matin (3h dev selon énergie TDAH)

**Déploiement :**

- **iOS** : Bundled dans v1.2.0 (skip v1.1.8 standalone, submit 21 oct)
- **Android** : Bundled dans v1.2.0 (submit 21 oct)
- **Rationale** : Baseline analytics démarre iOS+Android simultanément post-deploy v1.2.0 (délai 48h acceptable vs. fragmentation versions)

**Apprentissages acquis (post-implementation) :**

- Analytics setup iOS + Android production
- Event architecture scalable (super properties)
- Dashboard funnels RevenueCat-synced
- Baseline metrics pre-marketing (M8 input)

**Git milestone** : TBD (post-implémentation)

---

### M7.6 : Internationalisation

**Dates** : 19-20 oct 2025 (4-6h)
**Statut** : 🎯 PLANIFIÉ - Priorité Validée Seniors
**Version** : v1.2.0

expo-localization + 15 langues app + metadata stores iOS/Android.

**Objectif :** Marché 10x élargi. ROI fort si ASO bien fait (consensus Discord).

**Pivot stratégique :**

- **Ancienne planification** : M9 (28-30 oct) conditionnel à traction FR
- **Nouvelle décision** : M7.6 (19-20 oct) AVANT marketing launch
- **Justification** : Feedback seniors Discord (Harry 8k€/mois + Kévin)
  - "Traduis d'abord, après on en parle plus"
  - Effort : demi-journée (validation terrain seniors expérimentés)
  - Baseline multilingue opérationnelle avant Apple Search Ads (M8)

**Langues cibles (15) :**

- FR (source), EN, ES, DE, IT, PT, NL
- JA, KO, ZH-Hans, ZH-Hant
- AR, RU, SV, NO

**Workload détaillé :**

- expo-localization setup (1h)
- String extraction + traduction (2-3h)
- App Store metadata 15 langues (1-2h)
- Tests validation iOS + Android (1h)

**Documentation à créer :**

- Guide i18n implementation (code snippets)
- Checklist metadata stores 15 langues

**Timeline :**

- Dimanche 19 oct après-midi : expo-localization + strings (4-6h)
- Lundi 20 oct : Metadata stores 15 langues iOS/Android + tests
- Mardi 21 oct : **Submit v1.2.0 production simultané iOS + Android**

**Déploiement :**

- **Submission simultanée** : iOS App Store + Google Play (21 oct)
- **Parité stores** : Même version, mêmes features, metadata 15 langues synchronisé
- **Avantage ASO** : Baseline multilingue opérationnelle 2 plateformes pour M8 conversion tracking

**Apprentissages acquis (post-implementation) :**

- expo-localization production-ready
- ASO multilingue workflow
- Metadata stores 15 langues process industrialisé
- Learning capitalisé MoodCycle (cycle menstruel = public international)

**Git milestone** : TBD (post-implémentation)

---

### M8 : Optimisation Conversion

**Dates** : 23-30 oct 2025 (7j baseline + itération)
**Statut** : 🎯 PLANIFIÉ

Implémentation "Méthode Harry" avant toute publicité. Baseline multilingue déjà opérationnelle (M7.6).

**Objectif :** Maximiser conversion trial→paid avant investir budget pub.

**Inputs disponibles :**

- ✅ Analytics Mixpanel (M7.5)
- ✅ i18n 15 langues (M7.6)
- ✅ 7j baseline organique multilingue

**Actions conditionnelles (data-driven) :**

- Onboarding rallongé si completion < 65%
- Paywall repositionné si view rate < 35%
- Copy paywall optimisé si trial start < 18%
- Attribution tracking Apple Search Ads setup

**Benchmarks attendus (baseline organique semaine 1) :**

- Onboarding completion > 65% (Discord benchmark 60-80%)
- Paywall view rate > 35% installs
- Trial start > 18% paywall viewers
- Trial → Paid > 20% (timer apps context)
- Overall conversion > 3.5% (go/no-go pub)

**Timeline flexible (rythme TDAH) :**

- 23-30 oct : Observation baseline multilingue
- Si métriques < benchmarks → Itération onboarding/paywall
- Si métriques OK → Apple Search Ads test direct (M10)

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

- Timeline flexible selon rythme TDAH → Dates indicatives, pas deadlines strictes
- Google Play Review imprévisible (1-7 jours) → Buffer timeline M7
- Séquence logique prioritaire (Mixpanel → i18n → submit) > timing exact

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

_Dernière mise à jour : 19 Octobre 2025 - Timeline pivot M7.6 i18n (feedback seniors Discord) + M7.5 Analytics ready_
