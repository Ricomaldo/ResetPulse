# Roadmap Pivot M7.6 - Feedback Seniors Discord

**Date** : 19 Octobre 2025 - 8:40-10:30 (Session stratégique 2h)
**Context** : Planning stratégique M7-M11+ post-iOS approval (18 oct)
**Déclencheur** : Feedback Discord seniors expérimentés (Harry 8k€/mois + Kévin)

---

## TL;DR - Décision Majeure

**i18n 15 langues passe de M9 (conditionnel, 28-30 oct) à M7.6 (priorité, 19-20 oct)**

**Impact** :
- Timeline M7 étendue 3→4 jours (18-21 oct)
- v1.2.0 bundle : Keep awake + Mixpanel + i18n (submit simultané iOS+Android 21 oct)
- Baseline multilingue opérationnelle AVANT optimisation conversion (M8)

**Quote Discord décisive** : _"Traduis d'abord, après on en parle plus"_

---

## Context Initial

### État Roadmap Pré-Pivot (18 oct matin)

**M7 : Publication Android (18-20 oct)**
- Keep awake v1.1.7 ✅
- Mixpanel v1.1.8 (19 oct) 🔄
- Submit Android v1.1.8 (20 oct) 📋

**M9 : Internationalisation (28-30 oct)**
- **Conditionnel** à traction FR suffisante
- 15 langues si métriques M8 validées
- Statut : Optionnel, peut être skip

**Problème identifié** :
- Métriques baseline M8 = FR uniquement
- Si i18n post-M8 → retard ASO multilingue
- Apple Search Ads M10 = marché FR restreint

---

## Feedback Seniors Discord

### Profils Validateurs

**Harry** :
- 8k€/mois revenus apps après 3 mois méthode structurée
- Expérience ASO multilingue validée terrain
- Track record scaling apps freemium

**Kévin** :
- Senior créateur apps communauté Discord
- Expertise marketing mobile

### Verbatim Feedback

> "Traduis d'abord, après on en parle plus"

**Arguments clés** :
1. **Effort minimal** : 4-6h total (demi-journée)
   - expo-localization setup : 1h
   - String extraction + traduction AI : 2-3h
   - App Store metadata 15 langues : 1-2h
   - Tests validation : 1h

2. **ROI fort** : Marché 10x élargi
   - FR → EN/ES/DE/IT/PT/NL/JA/KO/ZH/AR/RU/SV/NO
   - ASO multilingue = trafic organique massif
   - Baseline analytics multi-marchés dès J1

3. **Validation terrain** : Consensus seniors expérimentés
   - "On ne regrette jamais d'avoir traduit tôt"
   - ASO bien fait > pub payante coûteuse
   - Metadata multilingue = fondation marketing

### Insight Décisif

**Séquence optimale validée** :
```
Features techniques → i18n → Baseline multilingue → Optimisation conversion → Marketing
```

**Pas** :
```
Features techniques → Baseline FR → Optimisation FR → i18n → Re-baseline
```

**Rationale** : Évite double travail (optimisation FR puis ré-optimisation multilingue)

---

## Décisions Stratégiques Prises

### 1. Timeline Pivot M7.6

**Ancienne planification** :
- M7 (18-20 oct) : Android submission v1.1.8
- M9 (28-30 oct) : i18n conditionnel

**Nouvelle planification** :
- M7 (18-21 oct, 4 jours) : Android submission v1.2.0
- M7.5 (19 oct matin) : Mixpanel v1.1.8
- **M7.6 (19-20 oct)** : i18n v1.2.0 ✨
- M8 (23-30 oct) : Optimisation conversion baseline multilingue

**Justification** :
- Effort 4-6h acceptable (dimanche après-midi + lundi)
- ROI validation seniors terrain
- Baseline multilingue opérationnelle avant M8

---

### 2. Apple Submissions Planning

**Question soulevée** :
> v1.1.8 (Mixpanel) : Update iOS aussi le 19 oct, ou attendre bundle v1.2.0 ?

**Décision** : ❌ Skip v1.1.8 iOS standalone

**Rationale** :
1. **Évite fragmentation versions** : v1.1.6 → v1.1.8 → v1.2.0 = 3 updates/3j
2. **Apple Review fatigue** : 2 reviews successives = overhead
3. **Délai Mixpanel acceptable** : 48h vs. immediate = négligeable baseline organique
4. **Parité stores** : iOS + Android v1.2.0 simultané = cohérence

**Timeline finale** :
- **iOS** : v1.1.6 (live) → v1.2.0 (21 oct submit)
- **Android** : v1.2.0 (21 oct submit, première version production)
- **Bundle complet** : Keep awake + Mixpanel + i18n 15 langues

**Avantages** :
- Metadata stores synchronisé 15 langues
- Baseline analytics démarre 2 plateformes simultanément
- ASO cohérent iOS/Android pour M8 conversion tracking

---

### 3. Documentation Pédagogique

**Problème détecté** :
- TODO.md (RevenueCat tests v1.1.0) obsolète depuis iOS approval
- todo-oct2025.md (M7-M11+) à jour mais anticipe trop (M10/M11+ conditionnel)
- Duplication confuse

**Principe rappelé** :
> "ResetPulse = Laboratoire apprentissage. Tout doit être réutilisable MoodCycle."

**Solution implémentée (Option D - Pédagogique + Focus)** :

#### a) Template Pédagogique Créé
**`docs/testing/REVENUECAT_TESTING_CHECKLIST.md`**
- Checklist complète IAP testing iOS + Android
- Validé production ResetPulse v1.1.0-v1.1.6
- Valeur : Process step-by-step première intégration RevenueCat réussie
- Réutilisable : MoodCycle, futurs projets freemium
- Sections : Freemium config, Purchase flow, Restore, Edge cases, Dashboard, ProGuard

#### b) TODO.md Focus Court-Terme
**Horizon 11 jours (19-30 Oct)**
- M7 (19-21 Oct) : Mixpanel + i18n + submit v1.2.0
- M8 (23-30 Oct) : Optimisation conversion baseline 7j
- **Retiré** : M10/M11+ (conditionnel, voir ROADMAP.md)
- **Footer** : "Dates indicatives, pas deadlines strictes"

**Rationale TDAH-friendly** :
- Focus cognitif optimisé : 11 jours vs. 3 mois
- Évite paralysie anticipation excessive
- Séquence logique préservée (features → baseline → optimisation)

#### c) Archive Version Complète
**`docs/archive/todo-oct2025-full-m7-m11.md`**
- Version originale avec M10/M11+ préservée
- Référence vision complète si nécessaire

**Structure finale** :
```
TODO.md           → Focus opérationnel M7-M8 (11j)
ROADMAP.md        → Vision stratégique M1-M11+ (go/no-go)
docs/testing/     → Templates pédagogiques réutilisables
docs/archive/     → Versions historiques complètes
```

---

## Langues Cibles (15)

**Marchés prioritaires** :
- **Europe Ouest** : FR (source), EN, ES, DE, IT, PT, NL
- **Asie** : JA, KO, ZH-Hans, ZH-Hant
- **Autres** : AR, RU, SV, NO

**Critères sélection** :
- App Store Connect langues supportées
- Marchés apps santé/bien-être matures
- Taille marché TDAH/neuroatypiques
- Coût traduction AI faible (expo-localization)

**Workload détaillé** :
1. expo-localization setup : 1h
2. String extraction app : 30min
3. Traduction 15 langues (AI + review) : 2-3h
4. App Store metadata 15 langues : 1-2h
5. Tests validation iOS + Android : 1h
**Total** : 4-6h (validation seniors terrain)

---

## Timeline M7 Finale (Corrigée)

### J1 (18 oct) : Keep Awake Feature ✅
- Hook `useTimerKeepAwake` codé
- Toggle Settings "Maintenir écran allumé" (ON par défaut)
- Version bump v1.1.7

### J2 (19 oct) : Mixpanel + i18n Integration

**Matin (3h) - M7.5 Mixpanel** :
- SDK install iOS + Android
- 6 events critiques implémentation
- RevenueCat webhooks configuration
- ProGuard rules Android
- Version bump v1.1.8

**Après-midi (4-6h) - M7.6 i18n** :
- expo-localization setup
- Extraction strings + traduction 15 langues
- Tests validation cross-platform
- Version bump v1.2.0

### J3 (20 oct) : Assets Store Multilingues
- Screenshots Android (5 minimum)
- Feature Graphic Google Play
- Metadata 15 langues iOS/Android synchronisé
- Keywords ASO par langue

### J4 (21 oct) : Submit Production
- **Google Play** : Submit v1.2.0 (keep awake + Mixpanel + i18n)
- **App Store Connect** : Submit update v1.2.0 iOS (parité stores)
- Attente review : Google 1-7j, Apple ~24h

---

## Impact M8 Optimisation Conversion

### Inputs Disponibles (Post-M7.6)

**Baseline multilingue 7 jours** :
- ✅ Analytics Mixpanel (M7.5)
- ✅ i18n 15 langues (M7.6)
- ✅ Données organiques multi-marchés

**KPIs cibles M8 (benchmarks ajustés)** :
- Onboarding completion > 65%
- Paywall view rate > 35%
- Trial start > 18% paywall viewers
- Trial → Paid > 20% (timer apps context, pas 22%)
- Overall conversion > 3.5% (go/no-go pub)

**Décision go/no-go Apple Search Ads (M10)** :
- Si Trial→Paid < 3% : itération onboarding requise
- Si Trial→Paid ≥ 3.5% : validation budget pub Harry

**Avantage baseline multilingue** :
- Données volume supérieur (15 marchés vs. 1)
- Identification patterns cross-culturels
- Optimisation onboarding universelle (pas FR-spécifique)

---

## Learning Capitalisé

### 1. Validation Communauté > Intuition Solo

**Insight** :
- Intuition initiale : i18n conditionnel M9 (peur sur-engineering)
- Feedback seniors : "Traduis d'abord" (ROI validé terrain)
- **Leçon** : Consensus expérimentés > suppositions débutant

**Application MoodCycle** :
- i18n dès M7 (pas M9 conditionnel)
- ASO multilingue = fondation marketing dès J1
- Évite biais "marché FR d'abord"

### 2. Séquence Optimale Features→i18n→Baseline

**Pattern validé** :
```
1. Features techniques stables
2. i18n multilingue
3. Baseline analytics multi-marchés
4. Optimisation conversion data-driven
5. Marketing test (Apple Search Ads)
```

**Anti-pattern évité** :
```
1. Features techniques
2. Baseline FR uniquement
3. Optimisation FR-spécifique
4. i18n post-optimisation
5. Re-baseline + ré-optimisation
→ Double travail, retard ASO
```

### 3. Documentation Pédagogique vs. Opérationnelle

**Distinction clé** :
- **Pédagogique** : Templates réutilisables (REVENUECAT_TESTING_CHECKLIST.md)
- **Opérationnel** : TODO focus court-terme (11j horizon)
- **Stratégique** : ROADMAP vision complète (go/no-go)

**Valeur MoodCycle** :
- Process IAP testing validé → Copy-paste checklist
- expo-localization workflow → Réutilisable tel quel
- Méthodologie roadmap/TODO → Framework transférable

### 4. Timeline Flexible TDAH-Friendly

**Principe documenté** :
> "Dates indicatives, pas deadlines strictes - Timeline flexible rythme TDAH"

**Implementation** :
- Focus 11 jours (M7-M8) vs. 3 mois (M7-M11+)
- Séquence logique prioritaire > timing exact
- M10/M11+ conditionnel (pas anticipé TODO)

**Avantage** :
- Évite paralysie anticipation
- Maintient momentum court-terme
- Décisions data-driven (pas émotionnel)

---

## Commits Session (5 Total)

1. **ff0ff3e** - `docs(roadmap): add M7.5 Analytics Setup milestone`
   - Mixpanel 6 events, token production, benchmarks

2. **7cf6a39** - `docs: timeline pivot M7.6 i18n (19-20 Oct) - feedback seniors Discord`
   - Pivot stratégique M9→M7.6
   - Justification "Traduis d'abord"
   - 15 langues workload détaillé

3. **034e528** - `fix(docs): correct M7 timeline sequence (4 days, submit J4 after M7.5+M7.6)`
   - Incohérence détectée : submit J3 avant M7.5+M7.6
   - Séquence logique rétablie : features → assets → submit

4. **30046b7** - `docs: add Apple submissions planning (v1.2.0 iOS+Android simultané 21 Oct)`
   - Décision skip v1.1.8 iOS standalone
   - Parité stores v1.2.0 (metadata synchronisé)
   - Rationale délai Mixpanel 48h acceptable

5. **e008e8f** - `refactor(docs): consolidate TODO - focus M7-M8 + archive pedagogical templates`
   - TODO.md focus 11j (M7-M8)
   - REVENUECAT_TESTING_CHECKLIST.md template réutilisable
   - Archive todo-oct2025-full-m7-m11.md

---

## Métriques Session

**Durée** : 2h (8:40-10:30, dimanche 19 oct matin)

**Documentation produite** :
- 1 devlog stratégique (ce fichier)
- 1 template pédagogique (RevenueCat testing)
- 3 updates ROADMAP.md (M7, M7.5, M7.6)
- 1 TODO.md focus court-terme
- 5 commits structurés

**Décisions structurantes** :
- Pivot i18n M9→M7.6 (marché 10x élargi)
- Apple submissions v1.2.0 simultané (parité stores)
- Documentation pédagogique vs. opérationnelle
- Timeline TDAH-friendly (11j focus)

**Learning capitalisé MoodCycle** :
- ASO multilingue workflow validé
- expo-localization production-ready
- Séquence optimale features→i18n→baseline→conversion
- Framework roadmap/TODO réutilisable

---

## Next Steps

**Immédiat (Dimanche 19 oct)** :
- ✅ Devlog documentation session (ce fichier)
- 🔄 Mixpanel implementation (matin, 3h restantes)
- 📋 expo-localization setup (après-midi, 4-6h)

**Lundi 20 oct** :
- Metadata stores 15 langues iOS/Android
- Tests validation cross-platform
- Assets Google Play finaux

**Mardi 21 oct** :
- Submit v1.2.0 production simultané (iOS + Android)
- Début baseline analytics multilingue 7j (input M8)

**23-30 oct (M8)** :
- Analyse baseline Mixpanel multi-marchés
- Optimisation conversion data-driven
- Décision go/no-go Apple Search Ads (M10)

---

## Conclusion

Cette session de planification stratégique valide un **pattern méthodologique clé** :

**Feedback communauté expérimentée > Intuition solo débutant**

Le pivot i18n M9→M7.6 représente un **micro-échec d'anticipation** (planification initiale sous-optimale) transformé en **learning capitalisable** (séquence optimale validée terrain).

**Quote finale (Harry)** : _"On ne regrette jamais d'avoir traduit tôt. ASO bien fait > pub payante coûteuse."_

Ce principe sera appliqué **dès M7 sur MoodCycle** (app cycle menstruel neuro-adaptée, projet principal 2026).

---

**Session planification stratégique - Dimanche 19 Octobre 2025**
*Feedback seniors Discord → Pivot i18n M7.6 → Baseline multilingue M8 → Learning capitalisé MoodCycle*

*ResetPulse = Laboratoire apprentissage complet dev/marketing/publication/monétisation*
