---
created: '2025-10-18'
updated: '2025-10-18'
status: outdated
milestone: M7
confidence: medium
superseded_by: cockpit/active/
---

# ResetPulse - TODO Opérationnel

*Dernière mise à jour : 18 Octobre 2025*  
*Aligné avec ROADMAP.md - Phases M7-M11+*

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

### J2 (19 oct) : Mixpanel + i18n Integration

**M7.5 - Mixpanel (Matin, 3h)**
- [ ] SDK install iOS + Android
- [ ] 6 events critiques implémentation
  - app_opened
  - onboarding_completed
  - paywall_viewed
  - trial_started
  - purchase_completed
  - purchase_failed
- [ ] RevenueCat webhooks configuration
- [ ] ProGuard rules Android
- [ ] Tests device production
- [ ] Version bump v1.1.8

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

**Google Play**
- [ ] Review checklist policies
- [ ] Questionnaire contenu app
- [ ] Pays distribution (15 langues actives)
- [ ] Pricing & IAP confirmés
- [ ] Age rating questionnaire
- [ ] **Submit v1.2.0 production**
- [ ] Attendre review (1-7 jours)

**App Store Connect**
- [ ] **Submit update v1.2.0 iOS** (parité stores)
- [ ] Review rapide attendue (~24h)

**Temps estimé :** 1 heure setup + attente review

---

## 🎯 M8 : OPTIMISATION CONVERSION

**Timeline :** 23-30 Oct 2025 (7 jours)  
**Statut :** 🎯 PLANIFIÉ  
**Début :** Baseline Mixpanel active (7 jours data minimum)

**KPIs cibles M8 :**
- Trial start rate > 15%
- Trial→Paid > 5%
- Onboarding completion > 70%

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

### Apple Search Ads Setup (J6-J7 - 28-30 oct)
- [ ] Valider budget avec Harry (50€ ou 200€ ?)
- [ ] Créer compte Apple Search Ads
- [ ] Configurer campagne test
- [ ] Sélectionner mots-clés initiaux
  - "timer tdah"
  - "time timer"  
  - "minuteur visuel"
- [ ] Lancer campagne
- [ ] **NE PAS TOUCHER** pendant 21 jours

**Temps estimé :** 2 heures setup

---

## 🌍 i18n COMPLÉTÉ (M7.6)

**Status :** ✅ Intégré dans M7 (19-20 oct)  
**Version :** v1.2.0

Voir section M7 J2 ci-dessus pour checklist détaillée.

---

## 📊 M10 : MARKETING TEST

**Timeline :** Nov 2025 (21 jours minimum stabilité)  
**Statut :** ⏳ CONDITIONNEL - Dépend M8 conversion optimisée  
**Budget :** En suspens validation Harry (50€ vs 200€)

**Décision go/no-go basée data M8 :**
- Si Trial→Paid < 3% : fix onboarding avant pub
- Si Trial→Paid > 5% : go Apple Search Ads test

### Apple Search Ads Test
- [ ] Valider budget définitif avec Harry
- [ ] Créer compte Apple Search Ads
- [ ] Configurer campagne test (budget confirmé)
- [ ] Mots-clés sélectionnés + bids initiaux
- [ ] **Lancer et NE PAS TOUCHER 21 jours**
- [ ] Tableau ROAS quotidien (revenus vs coût)
- [ ] Analyse J21 : LTV > CAC ?

**Temps estimé :** 2 heures setup + 21 jours monitoring passif

---

### Canaux Organiques (En Parallèle M10)
- [ ] Post Reddit r/TDAH (français)
  - Angle authentique vécu perso/familial
  - Demande feedback, pas promo agressive
- [ ] ProductHunt launch (international)
  - Préparer assets + pitch
  - Mobiliser upvotes famille/amis J-1
- [ ] Discord créateurs : retours d'expérience
  - Benchmarks conversion rates apps similaires
  - ASO tips débutants multilingue

**Temps estimé :** 2-3 heures total (actions ponctuelles)

---

## 🚀 M11+ : SCALING OU PIVOT

**Timeline :** Déc 2025 - Jan 2026  
**Statut :** ⏳ CONDITIONNEL - Dépend ROI M10

### Si ROI Positif (LTV > CAC)
- [ ] Budget pub progressif (50→100→200€/mois)
- [ ] Lock Screen Display implementation
- [ ] Apple Watch extension (watchOS learning)
- [ ] Analytics avancés retention/churn
- [ ] Community management actif (Reddit TDAH, Discord)

### Si ROI Négatif
- [ ] Documentation learnings complets
- [ ] Transfert compétences MoodCycle
- [ ] ResetPulse → maintenance mode (portfolio uniquement)

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

**Post-M8 (Apple Search Ads Active)**
- [ ] Coût/install par mot-clé
- [ ] Attribution quality (Mixpanel source tracking)
- [ ] ROAS quotidien (revenus vs coût pub)
- [ ] LTV/CAC ratio (décision go/no-go M10)

**Outils :**
- RevenueCat dashboard (revenus, conversions)
- Mixpanel funnels (comportement users)
- Apple Search Ads console (coût/install)
- Tableau quotidien ROAS manuel (M10)

---

## 🗂️ DOCUMENTATION CONTINUE

### Artefacts à Maintenir
- [ ] CHANGELOG.md (versions)
- [ ] Devlogs apprentissage
- [ ] Retours testeurs structurés
- [ ] Décisions architecture (ADR style)
- [ ] Métriques marketing baseline

**Fréquence :** Après chaque milestone majeur (M7, M8, M9, M10)

---

## ⚠️ SIGNAUX D'ALERTE MONITORING

- [ ] IA galère logique simple → Architecture review
- [ ] Emballement branches parallèles → Retour priorisation stricte
- [ ] Absence validation terrain → Tests utilisateur immédiat
- [ ] Scope creep features → Référence objectif laboratoire
- [ ] Bug récurrent malgré fixes → Refactorisation nécessaire
- [ ] **Burnout TDAH M8+M9** → M9 devient optionnel si fatigue cognitive
- [ ] **Sunk cost fallacy M10** → Décision data-driven uniquement (pas émotionnel)

---

**Prochaine action immédiate : Mixpanel setup dimanche 19 oct matin (3h)**

*Aligné avec ROADMAP.md phases M7-M11+ | Timeline post-feedback seniors Discord*  
*Dernière mise à jour : 19 Octobre 2025 - 8:50*