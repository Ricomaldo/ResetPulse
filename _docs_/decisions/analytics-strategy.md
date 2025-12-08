---
created: '2025-10-18'
updated: '2025-10-18'
status: active
milestone: M7.5
confidence: high
---

# Analytics Strategy - ResetPulse

**Date**: 18 Octobre 2025
**Version**: 1.1.7
**Status**: Implémenté (M7.5)
**Décision**: Mixpanel comme analytics platform avant marketing launch

---

## Contexte & Timing

### Situation Actuelle
- **iOS**: ✅ Live App Store depuis 17 oct (v1.1.6)
- **Android**: 🔄 Submission pending (v1.1.7 avec keep awake)
- **RevenueCat**: ✅ Opérationnel (lifetime 4,99€ + trial 7j)
- **Analytics**: ❌ AUCUN event tracké actuellement

### Problème Identifié
**Sans analytics = conduite yeux fermés avant marketing launch.**

**Impact business :**
- Impossible mesurer baseline conversion organique
- Impossible optimiser onboarding (M8) sans data
- Impossible calculer ROAS Apple Search Ads (M10)
- Impossible identifier friction points paywall

**Citation mentor Harry (Discord) :**
> "TikTok recevait pas les events avant, il optimisait sur rien. Maintenant que j'envoie tout, ça convertit 2x mieux."

### Timing Critique
**M7.5 (19-20 oct)** : Setup analytics AVANT Android submission finale
**M8 (23-25 oct)** : Optimisation conversion nécessite data baseline 7j
**M10 (Nov)** : Apple Search Ads impossible sans attribution events

---

## Décision : Mixpanel

### Alternatives Évaluées

| Solution | Avantages | Inconvénients | Décision |
|----------|-----------|---------------|----------|
| **Mixpanel** | Free 100k events/mois, Setup Expo 30min, Funnels natifs, Source fiable (consensus Discord) | Pas MMP (attribution ads limitée) | ✅ **CHOISI** |
| **Google Analytics 4** | Gratuit illimité, Familier | Setup complexe Expo, Dashboard confus, Pas retail apps focus | ❌ Rejeté |
| **Amplitude** | Puissant analytics comportemental | Overkill scale actuel, Courbe apprentissage | ❌ Overkill |
| **MMP (Tenjin/AppsFlyer)** | Attribution ads multi-plateformes | Coût si volume, Setup complexe SKAN, Inutile avant ROAS validé | ⏸️ Post-M10 si scaling |
| **Custom (Supabase)** | Contrôle total, Pas vendor lock-in | Temps dev (5-10j), Maintenance, Pas funnels auto | ❌ Over-engineering |

### Justification Mixpanel

**Consensus Discord créateurs apps (8 seniors, Harry 8k€/mois) :**
- "Source fiable" (dixit Kévin qui fait 6k€/mois)
- Stack standard apps payantes freemium
- Setup rapide = focus product, pas infra
- Plan gratuit largement suffisant début (100k events = ~3k users actifs)

**Alignment stratégie ResetPulse :**
- Learning capitalisable MoodCycle (même stack)
- Timing serré M7.5 (3h dev vs. 10j custom)
- Budget 0€ = respecte laboratoire low-cost

**Limitation assumée :**
- Attribution ads basique (suffisant Apple Search Ads iOS)
- Si scaling multi-plateformes (TikTok + FB) → migrer MMP
- Décision réévaluée M10 selon ROAS

---

## Events Critiques à Tracker

### Méthodologie Sélection

**Principe triangulaire (validé Discord) :**
1. **Business impact** : Event change décision go/no-go ?
2. **Actionnable** : Peut-on améliorer métrique si mauvaise ?
3. **Mesurable** : Event fiable (pas dépendant réseau/timing) ?

**Anti-pattern évité :**
- ❌ Over-tracking (`button_clicked`, `screen_viewed` = bruit)
- ❌ Vanity metrics (`app_opened` sans contexte = inutile)
- ❌ Events non-actionnables (anime pas décision business)

### Les 6 Events Qui Comptent

#### 1. `app_opened`
**Trigger** : App.js mount
**Properties** :
```javascript
{
  is_first_launch: true|false,
  source: 'organic|ads|deeplink', // Future attribution
  platform: 'ios|android',
  app_version: '1.1.7'
}
```
**Pourquoi critique** : Distingue installs vs. réouvertures (métrique rétention D1/D7)
**Actionnable** : Si réouverture faible → problème rétention produit

---

#### 2. `onboarding_completed`
**Trigger** : OnboardingController.jsx completeOnboarding()
**Properties** :
```javascript
{
  duration_seconds: 120,
  steps_completed: 4,
  skipped: false
}
```
**Pourquoi critique** : Taux completion onboarding = prédicteur #1 conversion (benchmark 60-80%)
**Actionnable** : Si < 60% → rallonger/simplifier onboarding (M8)

---

#### 3. `paywall_viewed`
**Trigger** : PremiumModal.jsx useEffect(visible)
**Properties** :
```javascript
{
  source: 'palette_locked|activity_locked|settings_button|onboarding_climax',
  has_completed_onboarding: true|false,
  days_since_install: 0
}
```
**Pourquoi critique** : Mesure reach paywall (objectif 30-50% des installs)
**Actionnable** : Si faible → repositionner triggers (lock content plus tôt)

---

#### 4. `trial_started`
**Trigger** : PremiumModal.jsx handlePurchase (avant RevenueCat call)
**Properties** :
```javascript
{
  product_id: 'premium_lifetime',
  trigger_source: 'palette_locked', // From paywall_viewed
  seconds_since_paywall_view: 15
}
```
**Pourquoi critique** : Intention achat forte (benchmark 15-25% paywall viewers)
**Actionnable** : Si faible → copy paywall, pricing, friction UI

---

#### 5. `purchase_completed`
**Trigger** : PurchaseContext.jsx après RevenueCat success + PremiumModal.jsx
**Properties** :
```javascript
{
  product_id: 'premium_lifetime',
  price_eur: 4.99,
  revenue_eur: 4.99,
  trial_duration_days: 7,
  attributed_campaign: 'organic' // Future ads
}
```
**Pourquoi critique** : Revenue réel (objectif 3-5% installs → paid)
**Actionnable** : Calcul LTV, ROAS, ROI pub

**Note** : Event doublé par RevenueCat webhook (cross-validation)

---

#### 6. `purchase_failed`
**Trigger** : PurchaseContext.jsx catch block errors
**Properties** :
```javascript
{
  product_id: 'premium_lifetime',
  error_code: 'NETWORK_ERROR|STORE_PROBLEM|PAYMENT_PENDING',
  error_message: 'Pas de connexion internet',
  step_failed: 'offerings_fetch|purchase_call|receipt_validation'
}
```
**Pourquoi critique** : Debug friction technique (objectif < 5% échecs)
**Actionnable** : Si network errors élevés → retry logic + offline UX

---

### Events Futurs (Post-M8)

**Engagement Core (rétention) :**
- `timer_started` (activity_id, palette_id, duration_seconds)
- `timer_completed` (completion_rate mesure usage quotidien)

**Activation avancée :**
- `premium_content_blocked` (quelle feature trigger paywall le plus ?)
- `settings_opened` (cherchent-ils à désinstaller ?)

**Attribution marketing (M10) :**
- `ad_click` (campaign_id, ad_group_id)
- `deeplink_opened` (source attribution Apple Search Ads)

**Priorisation** : Implémentation selon ROI mesure vs. temps dev.

---

## Benchmarks Attendus

### Baseline Organique (Semaine 1 sans pub)

**Source** : Consensus Discord (8 apps freemium timer/productivity)

| Métrique | Benchmark Industrie | Target ResetPulse | Décision Si < Target |
|----------|---------------------|-------------------|----------------------|
| **Onboarding completion** | 60-80% | > 65% | Rallonger onboarding (M8) |
| **Paywall view rate** | 30-50% installs | > 35% | Repositionner triggers lock |
| **Trial start rate** | 15-25% paywall viewers | > 18% | Rewrite copy paywall |
| **Trial → Paid** | 20-30% | > 20% | Price test / messaging |
| **Overall conversion** | 3-5% installs → paid | > 3.5% | Bloqueur critique (no-go pub) |

**Méthodologie mesure :**
1. Fresh install TestFlight (famille + beta testers)
2. Usage naturel 7 jours
3. Dashboard Mixpanel Funnels quotidien
4. Google Sheets tracking manuel (backup)

### Validation Go/No-Go Marketing (M10)

**Critères décision Apple Search Ads 50-200€ :**

✅ **GO si baseline organique :**
- Onboarding completion > 65%
- Paywall view > 35%
- Overall conversion > 3.5%
- Purchase_failed < 5%

❌ **NO-GO si :**
- Onboarding completion < 50% (produit pas prêt)
- Overall conversion < 2% (économie unitaire négative)
- Purchase_failed > 10% (tech debt bloqueur)

⏸️ **ITERATE (M8) si :**
- Onboarding OK mais paywall view faible → repositionner
- Paywall view OK mais trial faible → copy/pricing
- Trial OK mais paid faible → trial duration test

---

## Architecture Technique

### Intégration Points

**Fichiers modifiés (estimation 3h dev) :**
```
src/
├── config/
│   └── mixpanel.js              # Init SDK + wrapper track()
├── App.js                        # app_opened event
├── components/
│   ├── PremiumModal.jsx          # paywall_viewed, trial_started, purchase_completed
│   └── onboarding/
│       └── OnboardingController.jsx  # onboarding_completed
└── contexts/
    └── PurchaseContext.jsx       # purchase_failed (catch block)
```

**ProGuard Android (critique) :**
```proguard
# android/app/proguard-rules.pro
-keep class com.mixpanel.** { *; }
-keep interface com.mixpanel.** { *; }
```

**Sans ces rules** : Crash production Android (ClassNotFoundException)

### Super Properties (Context Global)

**Chaque event enrichi automatiquement :**
```javascript
{
  user_id: 'RC_user_abc123', // RevenueCat customer ID
  is_premium: true|false,
  platform: 'ios|android',
  app_version: '1.1.7',
  device_locale: 'fr_FR',
  onboarding_completed: true|false,
  days_since_install: 3,
  timers_completed_total: 12 // Incrémenté
}
```

**Utilité :** Segmentation cohortes (premium vs. free, iOS vs. Android, early adopters vs. late)

### RevenueCat Webhooks (Cross-Validation)

**Configuration Dashboard RevenueCat :**
- Integrations → Mixpanel
- Token collé
- Events activés : Initial Purchase, Trial Started, Renewal, Cancellation

**Avantages :**
- Backup si code rate event (crash app, network fail)
- Source vérité paiements (Apple/Google)
- Détection fraude (events code sans webhook = suspicious)

**Trade-off :**
- Events doublés (code + webhook) = normal, gardés pour cross-check
- Délai webhook 1-5min (acceptable, pas temps réel critique)

---

## Dashboard & Reporting

### Funnel Conversion Primaire (Mixpanel)

**Setup initial (30min) :**

**Funnel "Acquisition → Revenue" :**
```
1. app_opened (where is_first_launch = true)
   └─ 100 installs
2. onboarding_completed
   └─ 70 users (70%)
3. paywall_viewed
   └─ 35 users (50% of onboarding)
4. trial_started
   └─ 7 users (20% of paywall viewers)
5. purchase_completed
   └─ 2 users (28% trial conversion)
```

**Lecture rapide :** Chaque matin, 1 regard = santé produit.

### Google Sheets Quotidien (Backup + Partage)

**Template simple :**

| Date | Installs | Onboarding % | Paywall % | Trial % | Paid % | Revenue | Pub € | ROAS |
|------|----------|--------------|-----------|---------|--------|---------|-------|------|
| 19/10 | 5 | 80% | 40% | 20% | 25% | 4.99€ | 0€ | ∞ |
| 20/10 | 3 | 66% | 33% | 0% | 0% | 0€ | 0€ | - |

**Formule ROAS :** `= Revenue / Pub Spent`
**Target M10 :** ROAS > 1.5x = profitable (benchmark Discord)

**Avantages Sheets :**
- Partage famille/testeurs (transparence)
- Backup si Mixpanel down
- Annotations qualitatives ("crash iOS ce jour")

---

## Timeline Décision

### Phase M7.5 : Setup Analytics (19-20 oct)
**Durée** : 3h dev + 1h validation

**Deliverables :**
- ✅ Mixpanel SDK installé iOS + Android
- ✅ 6 events trackés en production
- ✅ RevenueCat webhooks configurés
- ✅ Dashboard funnel créé
- ✅ Tests validation sandbox (fresh install flow)

**Validation :** Screenshot Mixpanel Live View avec events visibles

---

### Phase M8 : Baseline Organique (23-30 oct)
**Durée** : 7 jours observation

**Actions :**
- Monitoring quotidien conversions (5min/jour)
- Google Sheets rempli matin
- Notes qualitatives (feedbacks testeurs)

**Objectif :** Mesurer conversion naturelle AVANT itération onboarding

**Questions répondues :**
- Combien % complètent onboarding ?
- Combien % voient paywall ?
- Combien % convertissent organiquement ?

---

### Phase M8.5 : Optimisation Conversion (1-3 nov)
**Durée** : 3 jours itération

**Décision basée baseline :**

**Si onboarding completion < 65% :**
- Rallonger tooltips (effet IKEA)
- Ajouter climax paywall naturel fin onboarding
- Simplifier steps (4 → 3 si confusion détectée)

**Si paywall view < 35% :**
- Lock content plus tôt (ex: 3e palette au lieu de 4e)
- Ajouter CTA Settings → Premium
- Onboarding mention explicite "2 palettes gratuites, 15 premium"

**Si trial start < 18% :**
- Rewrite copy paywall (tester 2-3 versions)
- Highlight trial gratuit 7j plus visible
- A/B test pricing display (4,99€ vs. "Moins d'1 café")

**Output :** Version optimisée (v1.2.0 potentielle)

---

### Phase M10 : Go/No-Go Marketing (Nov)
**Décision** : Apple Search Ads 50-200€ ?

**Critères validation :**

✅ **GO si :**
- Baseline organique > benchmarks
- Onboarding completion > 65%
- Overall conversion > 3.5%
- Tech debt résolu (purchase_failed < 5%)

❌ **NO-GO si :**
- Conversion < 2% (économie unitaire négative)
- Friction technique majeure non résolue
- Feedback qualitatif négatif (app "pas utile")

**Si GO :**
- Budget 50€ test 7j (CPI estimé 1€ = 50 installs)
- Mesure ROAS quotidien
- Décision continue/stop après 7j

**Si NO-GO :**
- Pivot learnings MoodCycle
- ResetPulse maintenance portfolio uniquement
- Documentation post-mortem complète

---

## Risques & Mitigations

### Risque Technique

**❌ Mixpanel SDK conflict Expo**
- Probabilité : Faible (SDK mature)
- Impact : BLOQUEUR (3h lost)
- Mitigation : Test iOS + Android avant commit

**❌ ProGuard strip classes Android**
- Probabilité : Moyenne (oublié souvent)
- Impact : CRITIQUE (crash production)
- Mitigation : Rules ajoutées + test build release

**❌ RevenueCat webhooks délai > 5min**
- Probabilité : Faible
- Impact : MINEUR (events doublés retardés)
- Mitigation : Code events = source primaire, webhooks = backup

### Risque Stratégique

**❌ Over-optimisation prématurée**
- Symptôme : Passer 10j optimiser onboarding avant baseline
- Impact : Temps perdu (optimise sur suppositions)
- Mitigation : 7j baseline AVANT toute itération

**❌ Analysis paralysis**
- Symptôme : Tracker 50 events, dashboard complexe, décision bloquée
- Impact : Burnout TDAH, pas action
- Mitigation : 6 events seulement, décision binaire go/no-go

**❌ Ignorer signaux qualitatifs**
- Symptôme : Conversion 4% mais feedbacks "app inutile"
- Impact : Pub gaspillée (churn élevé post-install)
- Mitigation : Google Sheets notes quotidiennes + Discord retours

---

## Learnings Capitalisables MoodCycle

### Setup Reproductible
- Stack Mixpanel validé (même SDK Expo)
- Events architecture template (6 events core adaptés)
- Dashboard funnel réutilisable
- ProGuard rules pattern

### Benchmarks Contextuels
- Timer apps freemium baseline (3-5% conversion)
- Onboarding completion TDAH users (potentiellement < benchmark neurotypique)
- Trial → Paid dynamics one-time purchase

### Erreurs Évitées
- Pub sans analytics (argent perdu Harry quote)
- MMP overkill début (Kévin learning)
- Over-tracking vanity metrics (consensus Discord)

### Process Décision
- Baseline 7j AVANT optimisation
- Go/no-go critères chiffrés (pas feeling)
- Pivot assumé si ROI négatif (pas sunk cost)

---

## Questions Ouvertes (À Valider Implémentation)

### Configuration
- [ ] **Mixpanel token** : Hardcodé ou env var ? (Recommandation : hardcodé début, migrate post-MVP)
- [ ] **User ID** : RevenueCat customer_id ou UUID device ? (Recommandation : RC pour cross-device)
- [ ] **Opt-out analytics** : RGPD compliance requis ? (Recommandation : non si anonymisé)

### Events
- [ ] **`timer_started/completed`** : Phase M7.5 ou M8.5 ? (Recommandation : M8.5, focus conversion d'abord)
- [ ] **`premium_content_blocked`** : Utile décision immediate ? (Recommandation : oui, add M7.5 si temps)

### Dashboard
- [ ] **Retention cohorts** : D1/D7/D30 automatiques Mixpanel ou manuel ? (Recommandation : auto suffit)
- [ ] **Segments premium vs free** : Créer immédiatement ? (Recommandation : oui, 5min setup)

---

## Références & Resources

### Documentation Externe
- [Mixpanel React Native SDK](https://github.com/mixpanel/mixpanel-react-native)
- [RevenueCat Webhooks](https://docs.revenuecat.com/docs/webhooks)
- [Expo Analytics Best Practices](https://docs.expo.dev/guides/using-analytics/)

### Benchmarks Industrie
- [Lenny's Newsletter - Mobile App Benchmarks 2024](https://www.lennysnewsletter.com/)
- RevenueCat Blog - Trial Conversion Rates
- Discord créateurs apps (historique #analytics)

### Documentation Interne
- `docs/development/REVENUECAT_BEST_PRACTICES.md` - Purchase flow intégration
- `docs/decisions/adr-monetization-v11.md` - Stratégie freemium
- `docs/ROADMAP.md` - M7.5/M8/M10 timeline

---

## Changelog

**18 Oct 2025** - Document initial
- Décision Mixpanel vs. alternatives
- 6 events critiques définis
- Benchmarks baseline établis
- Timeline M7.5 → M10 planifiée

---

**Prochaine étape** : Validation approche avec Eric → Création guide implémentation technique

**Status** : ✅ VALIDÉ → Prêt implémentation M7.5 (19-20 oct)
