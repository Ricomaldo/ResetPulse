# ResetPulse - TODO Opérationnel

*Dernière mise à jour : 19 Octobre 2025*
*Focus : M7-M8 (19-30 Oct) - Horizon 11 jours*

---

## 🚨 M7 : PRIORITÉ IMMÉDIATE - Publication Android

**Timeline :** 18-21 Oct 2025 (4 jours)
**Statut :** 🔄 EN COURS
**Version finale :** v1.2.0 (keep awake + Mixpanel + i18n bundled)

### J1 (18 oct) : Keep Awake Feature ✅
- [x] Hook `useTimerKeepAwake` codé (Claude Code)
- [x] Intégration composant Timer
- [x] Toggle Settings "Maintenir écran allumé"
- [x] Default value `true`
- [x] Hint batterie dans Settings
- [x] Version bump v1.1.7

---

### J2 (20 oct) : Mixpanel + i18n Integration

**M7.5 - Mixpanel (Matin, 9h-12h) ✅ VALIDÉ**
- [x] SDK install iOS + Android (mixpanel-react-native@3.1.2)
- [x] 6 events critiques implémentation
  - [x] app_opened (App.js)
  - [x] onboarding_completed (OnboardingController)
  - [x] paywall_viewed (PremiumModal)
  - [x] trial_started (PurchaseContext)
  - [x] purchase_completed (PurchaseContext)
  - [x] purchase_failed (PurchaseContext)
- [x] Token projet corrigé (4b1bd9b9... ResetPulse)
- [x] Server EU configured (https://api-eu.mixpanel.com)
- [x] ProGuard rules Android
- [x] Tests device production (events reçus dashboard)
- [x] Version bump v1.1.8
- [x] Debug session documented (devlog)

**M7.6 - i18n (Après-midi, 4-6h)**
- [ ] expo-localization setup
- [ ] Extraction strings app
- [ ] Traduction 15 langues (AI + review)
  - FR, EN, ES, DE, IT, PT, NL
  - JA, KO, ZH-Hans, ZH-Hant
  - AR, RU, SV, NO
- [ ] Tests validation iOS + Android
- [ ] Version bump v1.2.0

---

### J3 (20 oct) : Assets Store Multilingues

**Google Play Console**
- [ ] Screenshots Android (5 minimum, 1920x1080)
- [ ] Feature Graphic (1024x500)
- [ ] Metadata 15 langues
  - Titre app (30 caractères)
  - Description courte (80 caractères)
  - Description longue (4000 caractères)
  - Keywords ASO par langue

**App Store Connect (Update iOS)**
- [ ] Metadata 15 langues (synchronisé Android)
- [ ] Screenshots localisés (optionnel, évaluer ROI)

**Temps estimé :** 2-3 heures

---

### J4 (21 oct) : Submit Production

**Google Play - Première Soumission**
- [ ] Review checklist policies
- [ ] Questionnaire contenu app
- [ ] Pays distribution (15 langues actives)
- [ ] Pricing & IAP confirmés
- [ ] Age rating questionnaire
- [ ] **Submit v1.2.0 production** (INITIAL Android)
- [ ] Attendre review (1-7 jours)

**App Store Connect - Update iOS**
- [ ] **Submit update v1.2.0 iOS** (v1.1.6 → v1.2.0 : add keep awake + Mixpanel + i18n)
- [ ] Review rapide attendue (~24h)
- [ ] Objectif : Parité features iOS/Android post-reviews

**Temps estimé :** 1 heure setup + attente review

---

## 🎯 M8 : OPTIMISATION CONVERSION

**Timeline :** 23-30 Oct 2025 (7 jours)
**Statut :** 🎯 PLANIFIÉ
**Début :** Baseline Mixpanel active (7 jours data minimum)

**KPIs cibles M8 :**
- Onboarding completion > 65%
- Paywall view rate > 35%
- Trial start > 18% paywall viewers
- Trial → Paid > 20%
- Overall conversion > 3.5% (go/no-go pub)

### Audit Onboarding Actuel (J1 - 23 oct)
- [ ] Analyser baseline Mixpanel 7 jours
- [ ] Documenter flow actuel (combien écrans ?)
- [ ] Identifier moment apparition paywall
- [ ] Noter friction points funnel Mixpanel
- [ ] Lister opportunités effet IKEA

**Temps estimé :** 2 heures analyse data

---

### Refonte Onboarding (J2-J4 - 24-26 oct)

**Méthode Harry - Rallongement + Climax Progressif**

- [ ] Design 2-3 nouveaux écrans personnalisation
  - Choix emoji activité obligatoire (ownership)
  - Création premier timer custom guidé (investissement temps)
  - Préférences couleurs/durées favorites (IKEA effect)
- [ ] Repositionner paywall climax naturel (pas surprise)
- [ ] Transition gratuit→premium progressive
- [ ] A/B test structure (optionnel si temps)

**Temps estimé :** 6-8 heures dev

---

### Attribution Tracking (J5 - 27 oct)
- [ ] Vérifier RevenueCat track source acquisition
- [ ] Configurer Apple Search Ads attribution
- [ ] Tester events firing (install, trial_start, purchase)
- [ ] Dashboard RevenueCat cohérence Mixpanel
- [ ] Documentation flow attribution

**Temps estimé :** 3 heures

---

### Baseline Validation (J6-J7 - 28-30 oct)
- [ ] Observer métriques Mixpanel baseline 7j
- [ ] Comparer benchmarks attendus vs. réels
- [ ] Décision go/no-go Apple Search Ads (M10)
  - Si Trial→Paid < 3% : itération onboarding requise
  - Si Trial→Paid ≥ 3.5% : validation budget pub Harry

**Temps estimé :** Monitoring passif + analyse 2h

---

## 📈 MESURES & SUIVI CONTINU

### KPIs à Monitorer (Post-M7 Launch)

**Baseline Organique (Pre-Marketing)**
- [ ] Installs iOS + Android (source organique)
- [ ] Trial starts (funnel Mixpanel)
- [ ] Trial → Paid conversion rate
- [ ] Onboarding completion rate
- [ ] Retention J1, J7
- [ ] Reviews App Store / Play Store (qualitative)

**Outils :**
- RevenueCat dashboard (revenus, conversions)
- Mixpanel funnels (comportement users)
- Tableau quotidien suivi KPIs

---

## 🗂️ DOCUMENTATION CONTINUE

### Artefacts à Maintenir
- [ ] CHANGELOG.md (versions)
- [ ] Devlogs apprentissage
- [ ] Retours testeurs structurés
- [ ] Décisions architecture (ADR style)
- [ ] Métriques marketing baseline

**Fréquence :** Après chaque milestone majeur (M7, M8)

---

## ⚠️ SIGNAUX D'ALERTE MONITORING

- [ ] IA galère logique simple → Architecture review
- [ ] Emballement branches parallèles → Retour priorisation stricte
- [ ] Absence validation terrain → Tests utilisateur immédiat
- [ ] Scope creep features → Référence objectif laboratoire
- [ ] Bug récurrent malgré fixes → Refactorisation nécessaire
- [ ] **Burnout TDAH** → Pause requise, timeline flexible
- [ ] **Sunk cost fallacy** → Décision data-driven uniquement (pas émotionnel)

---

## 📚 Documentation Associée

**Guides Techniques :**
- [Mixpanel Implementation](docs/development/MIXPANEL_IMPLEMENTATION.md) - Setup 4h, code snippets
- [RevenueCat Testing Checklist](docs/testing/REVENUECAT_TESTING_CHECKLIST.md) - Template réutilisable IAP

**Stratégie :**
- [ROADMAP.md](ROADMAP.md) - Vision complète M1-M11+ (context go/no-go)
- [Analytics Strategy](docs/decisions/analytics-strategy.md) - Pourquoi Mixpanel, benchmarks

---

**Prochaine action immédiate : Mixpanel setup dimanche 19 oct matin (3h)**

**TODO opérationnel M7-M8 (11 jours horizon)**
*Planning M10+ conditionnel à validation M8 - Voir ROADMAP.md pour vision complète*

*Dates indicatives, pas deadlines strictes - Timeline flexible rythme TDAH*
*Dernière mise à jour : 19 Octobre 2025 - 9:10*
