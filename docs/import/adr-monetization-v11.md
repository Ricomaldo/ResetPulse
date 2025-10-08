# ADR 001 - Stratégie Monétisation ResetPulse v1.1.0

**Status:** ACCEPTED  
**Date:** Octobre 2025  
**Décideurs:** Eric (dev) + Chrysalis (architecte conseil)  
**Context:** Première intégration RevenueCat, laboratoire apprentissage avant MoodCycle

---

## Décision

**Modèle commercial:** One-time purchase 4,99€ (lifetime unlock)  
**Config freemium:** 2 palettes + 4 activités gratuites  
**Features UX:** Toutes gratuites (audio, dark theme, animations)  
**Trial:** 7 jours gratuit via RevenueCat natif

---

## Contexte

### Analyse Triangulaire Menée

**4 perspectives Claude Code synthétisées:**

1. **Marketing:** Recommandation initiale abonnement 2,99€-4,99€/mois par analogie meditation apps (Headspace, Calm). Config freemium généreuse : 3 palettes + 6 activités.

2. **Architecture:** Patterns limitation déjà cohérents (isTestPremium() dans 3 composants). Context API structure claire. Point d'injection optimal identifié après ThemeProvider.

3. **Implémentation:** Plan 6 phases progressives (2h05 total). Pièges RevenueCat documentés. Timeline v1.1.0 estimée 2-3 semaines.

4. **Arbitrage:** Confrontation objection développeur "timer statique ≠ service contenu renouvelé". Recherches benchmarks pertinents : Forest 3,99€, Be Focused 4,99€ (vs meditation apps inadaptées).

### Objection Fondatrice

> "ResetPulse est un timer visuel personnalisable, pas une app meditation avec contenu audio renouvelé. Les apps benchmarkées justifient abonnement par nouveau contenu mensuel. Mon user paie pour quoi chaque mois ? Accéder aux mêmes 12 palettes qu'il a déjà vues le mois dernier ?"

Cette objection a déclenché Query 5 (réévaluation pricing) qui a invalidé le modèle subscription et confirmé one-time purchase comme standard marché timer apps.

### Tension Commerciale Détectée

Session marketing parallèle a pointé : "Config freemium (3 palettes + 6 activités) couvre déjà spectrum usages principaux. Quelle motivation achat premium si gratuit suffit ?"

Query 6 (optimisation gap) a résolu cette tension via règle simple : **Premium = contenu, pas fonctionnalités**.

---

## Alternatives Considérées

### 1. Subscription Mensuel 2,99€-4,99€ ❌ REJETÉ

**Pour:**
- Revenus théoriques supérieurs (~3200€/an vs 1796€/an)
- Pattern standard wellness apps
- MRR (Monthly Recurring Revenue) prévisible

**Contre:**
- Pas de valeur récurrente justifiable (timer statique)
- Risque review bombing App Store ("Why subscription for timer?")
- Churn massif M1 (30% quand users réalisent pas de valeur mensuelle)
- Dommage réputation pour future MoodCycle
- Benchmarks pertinents (Forest, Be Focused, Time Timer) utilisent one-time

**Raison rejet:** Timer = outil (pas service), subscription injustifiée éthiquement et commercialement.

### 2. One-time 0,99€-1,99€ ❌ REJETÉ

**Pour:**
- Friction achat minimale
- Conversion potentielle élevée (5%+)
- "Prix symbolique" psychologique

**Contre:**
- Pattern junior sous-valorisation identifié
- Revenus insuffisants (1194€/an à 1,99€)
- Perception "cheap app store" (dévalue qualité)
- Hors standard marché (Forest 3,99€, Be Focused 4,99€)

**Raison rejet:** Sous-pricing par insécurité, pas logique commerciale.

### 3. One-time 9,99€+ ❌ REJETÉ

**Pour:**
- Revenus par conversion élevés (2398€/an à 9,99€)
- Positioning premium/qualité

**Contre:**
- Plafond psychologique timer apps (standard 3-5€)
- Conversion chute drastique (2% vs 3-5%)
- Pas justifié par features (vs apps plus complexes)

**Raison rejet:** Hors marché, risque perception "overpriced".

### 4. Freemium 3 palettes + 6 activités ❌ REJETÉ

**Pour:**
- Accessibilité neuroatypique maximale
- Gratuit "vraiment fonctionnel" (Pomodoro + mindfulness complet)
- Pas de frustration artificielle

**Contre:**
- Gap commercial insuffisant
- 6 activités couvrent tous usages principaux (méditation, focus, cuisine, pauses)
- Conversion attendue <2,5% (gratuit "trop bon")
- Revenus annuels -600€ vs config optimisée

**Raison rejet:** Générosité tue conversion sans gain éthique significatif.

---

## Décision Finale Détaillée

### Pricing

**4,99€ one-time purchase (lifetime unlock)**

**Rationale:**
- Sweet spot marché timer apps (Forest 3,99€, Be Focused 4,99€)
- Référentiel psychologique "prix d'un café"
- Charm pricing (.99 effet conversion)
- Valorise qualité sans sur-pricer
- Conversion attendue 3-5% = 1796€/an viable laboratoire

### Config Freemium

**GRATUIT (Essentials Free):**

**Palettes: 2**
- softLaser (cool tones, esthétique moderne)
- terre (warm tones, naturel apaisant)

Rationale: 2 palettes distinctives créent gap esthétique sans frustration fonctionnelle. Micro-boost conversion +0,5-1% vs 3 palettes.

**Activités: 4**
- none (timer universel, 45min default)
- work (productivité Pomodoro, 25min)
- break (pause Pomodoro, 15min)
- breathing (ancrage neuroatypique, 4min)

Rationale: Couvre baseline fonctionnel - Pomodoro complet + mindfulness entry. Ne couvre PAS yoga, méditation longue, étude, sport, cuisine → gap motivant upgrade.

**Features UX: TOUTES**
- ✅ Audio/sons (10 sons) - Accessibilité ADHD critique (auditory cues)
- ✅ Dark theme - Accessibilité sensibilité lumière
- ✅ Animation pulse - Aide focus neuroatypique
- ✅ Clockwise/scaleMode - Personnalisation basique
- ✅ Favoris activités - UX quality of life

Rationale: Benchmarks Forest/Be Focused confirment - aucune timer app ne limite audio/accessibilité en premium. Premium = contenu, pas fonctionnalités.

**PREMIUM 4,99€:**

**Palettes: +13 (unlock 15 total)**
- Débloquer: classique, tropical, zen, forêt, océan, aurore, crépuscule, douce, pastelles, verts, bleus, canard, darkLaser

**Activités: +12 (unlock 16 total)**
- Productivité: study, homework, creativity, reading
- Mindfulness: meditation, yoga, walking
- Lifestyle: sport, cooking, gaming, music, cleaning

**Value proposition:** "Débloquer MA routine complète" - personnalisation illimitée vs baseline fonctionnel.

### Messaging Premium Modal

**Texte corps:**
```
ResetPulse est gratuit et fonctionnel.
Pour plus d'activités et de palettes, débloquez premium.

15 palettes + 16 activités
4,99€ - Une fois, pour toujours

Trial gratuit 7 jours
```

**Boutons action:**
- CTA positif: "Commencer l'essai gratuit"
- CTA négatif: "Peut-être plus tard"

**Rationale:** Connexion créateur-utilisateur, transparence modèle économique, nombres illustrent sans argumenter. "Gratuit" dans CTA réduit friction, "peut-être" non-culpabilisant.

### Trial Management

**Approche:** Minimaliste v1.1.0 - Apple/Google gèrent notifications expiration

**Rationale:** RevenueCat + stores envoient message système J-1. Focus apprentissage SDK simple. Banner custom in-app reporté v1.2.0 si données montrent confusion.

---

## Conséquences

### Positives

**Revenus attendus:**
- 1000 DL/mois × 3,5% conversion × 4,99€ = 174€/mois = 2088€/an
- Viable laboratoire apprentissage (objectif primaire > revenus immédiats)

**Learning MoodCycle:**
- RevenueCat basics maîtrisés (dashboard, one-time purchase, sandbox testing)
- Pricing psychology validée (sweet spot, trial duration, messaging)
- Balance éthique/commercial documentée (accessibilité vs conversion)
- Benchmark données conversion 3 mois avant MoodCycle pricing complexe

**Alignement mission:**
- Accessibilité neuroatypique préservée (audio, dark theme, mindfulness entry gratuits)
- Premium = enhancement légitime, pas blocage artificiel
- Pas de dark patterns (usage limits, ads, nag screens)

**Réputation:**
- First app commerciale = build trust
- One-time honest vs subscription questionable
- Messaging transparent créateur-utilisateur

### Négatives

**Revenus inférieurs subscription:**
- 2088€/an one-time vs 3200€/an théorique subscription
- Différence -1112€/an acceptée pour cohérence produit

**Conversion incertaine:**
- 3,5% projection basée benchmarks, pas données réelles
- Risque conversion <2,5% si gap insuffisant malgré optimisation
- A/B testing nécessaire M1-M3 pour validation

**Complexité RevenueCat limitée:**
- One-time purchase = learning basique vs subscription avancé
- Moins de features explorées (entitlements multiples, grace periods complexes)
- Acceptable pour objectif laboratoire phase 1

### Risques Identifiés

**Scope creep (CRITIQUE):**
- TDA/H + 20 projets historique = risque features v1.2.0+ bleed into v1.1.0
- Mitigation: Feature flags hardcodé false, commit messages strict "NO stats/rotation per scope"

**Trial UX confusion (MOYEN):**
- Users ignorent trial existe, paient direct, demandent refund
- Mitigation: Onboarding step 4 explicit CTA "Essai 7j gratuit", PremiumModal trial badge prominent

**Family Sharing (MOYEN):**
- Actif par défaut iOS, analytics conversion faussés
- Mitigation: RevenueCat dashboard segmenter direct vs shared purchase

**Timing transition testeurs (RÉSOLU):**
- v1.0.4 testeurs voient tout débloqué, v1.1.0 verront freemium strict
- Mitigation: Message TestFlight explicite "dernière version premium complet, prochaine teste freemium"

---

## Implémentation

### Configuration Technique

**RevenueCat Products:**
```javascript
{
  "premium_lifetime": {
    "identifier": "com.irimwebforge.resetpulse.premium",
    "price": "$4.99",
    "type": "non_consumable",
    "trial": "7 days",
    "description": "Unlock all palettes & activities forever"
  }
}
```

**Entitlement:**
- ID: "premium_access"
- Unlock condition: premium_lifetime purchased OU trial active

**Freemium Config (src/config/freemiumConfig.js):**
```javascript
export const FREEMIUM_CONFIG = {
  free: {
    palettes: ['softLaser', 'terre'],
    activities: ['none', 'work', 'break', 'breathing'],
    features: {
      audio: true,
      darkTheme: true,
      pulse: true,
      clockwise: true,
      scaleMode: true,
      favorites: true
    }
  },
  premium: {
    palettes: 'all',
    activities: 'all',
    price: '$4.99',
    type: 'one-time'
  },
  paywall: {
    triggers: [
      'premium_activity_tap',
      'timer_count_7',
      'palette_locked_tap'
    ]
  }
}
```

**Modifications Fichiers:**

timerPalettes.js:
```javascript
// Passer en premium
classique: { isPremium: true, ... }

// Garder gratuit
softLaser: { isPremium: false, ... }
terre: { isPremium: false, ... }
```

activities.js:
```javascript
// Garder gratuit
none: { isPremium: false, ... }
work: { isPremium: false, ... }
break: { isPremium: false, ... }
breathing: { isPremium: false, ... }

// Passer en premium
reading: { isPremium: true, ... }
study: { isPremium: true, ... }
meditation: { isPremium: true, ... }
// ... 9 autres
```

### Architecture Code

**Provider injection:**
```javascript
<ErrorBoundary>
  <ThemeProvider>
    <PurchaseProvider>  // Après Theme pour accès useTheme() dans paywall
      <OnboardingProvider>
        <AppContent />
```

**Hook migration:**
```javascript
// Remplacer dans 3 composants:
// ActivityCarousel.jsx, PaletteCarousel.jsx, SettingsModal.jsx

- const isPremiumUser = isTestPremium();
+ const { isPremium } = usePremiumStatus();
+ const isPremiumUser = isPremium;
```

**PremiumModal trigger:**
```javascript
// ActivityCarousel.jsx ligne 111
if (activity.isPremium && !isPremiumUser) {
  haptics.warning();
  setShowPremiumModal(true);
  return;
}
```

### Timeline v1.1.0

**Semaine 1 (5-7j):**
- Phase 1-3: Installation SDK, PurchaseContext, migration testMode (9h)
- Phase 4: PremiumModal MVP simple (3h)
- Phase 5: Edge cases (offline, restore, race conditions) (2h)

**Semaine 2 (3-5j):**
- Phase 6: Sandbox testing iOS/Android (4h)
- Analytics events (paywall_viewed, trial_started, purchase_completed) (2h)
- TestFlight famille avec freemium config

**Semaine 3 (buffer):**
- Ajustements retours testeurs
- Documentation learning
- Préparation App Store (si validation OK)

**Total estimé:** 2-3 semaines post-validation v1.0.4

### A/B Testing Roadmap (post-v1.1.0)

**M1 - Test Palettes:**
- Variant A: 2 palettes gratuites
- Variant B: 3 palettes gratuites
- Métrique: Conversion rate premium

**M2 - Test Mindfulness:**
- Variant A: breathing gratuit (actuel)
- Variant B: breathing premium (Pomodoro pur)
- Métrique: D7 retention + conversion

**M3 - Test Paywall Timing:**
- Variant A: Après 7 timers complétés
- Variant B: Après 3 taps activité premium
- Métrique: Trial start rate + conversion

### Metrics Succès v1.1.0

**Technique:**
- Zero crash related RevenueCat
- Restore purchases fonctionne 100%
- Offline fallback gracieux
- Build time <15min avec plugin RC

**Business (M0-M3):**
- Trial start rate: >20% users
- D7 retention: >20%
- Paywall → trial: >30%
- Conversion trial→paid: >25%
- Overall conversion: 3-5%

**Red flags:**
- Trial start <10% → paywall invisible/mal timing
- Conversion <2% → gap insuffisant OU pricing trop élevé
- Churn >15%/mois → product-market fit issue

---

## Confrontation Doc Marketing

**Alignement validé:**
- Message onboarding "Choisissez, ajustez, lancez" cohérent avec messaging premium fonctionnel
- Positionnement "personnalisation" justifie 4,99€ comme extension naturelle
- Usages identifiés (méditation, focus, cuisine) = freemium 4 activités couvre baseline
- Ton authentique créateur-utilisateur = version C modal premium

**Ajustements requis:**
- Ajouter section marketing: "Modèle économique: Freemium + achat unique 4,99€"
- Mentionner trial 7j dans description App Store (transparence)
- Screenshots: Badge "Premium" discret sur items verrouillés (design à valider)

---

## Related Documents

**Artefacts Références:**
- [Analyse Triangulaire Claude Code](revenuecat-analysis) - 4 perspectives synthétisées
- [Décisions Monétisation v1.1.0](monetization-decisions) - Session formation langage commercial
- [Marketing Core v1.0](doc externe) - Positionnement, screenshots, ASO

**Process:**
- Query 5: Réévaluation pricing (objection subscription)
- Query 6: Optimisation gap freemium/premium
- Session marketing: Validation cohérence messaging

---

## Prochaines Étapes

**Immédiat:**
1. Message TestFlight v1.0.4 annonçant transition freemium v1.1.0
2. Finaliser theme system logo (prérequis UI paywall)
3. Setup compte RevenueCat + configuration dashboard

**Session Implémentation (après validation v1.0.4):**
1. Installation SDK + configuration app.json
2. PurchaseContext + hook usePremiumStatus
3. PremiumModal component
4. Migration isTestPremium() → usePremiumStatus()
5. Sandbox testing iOS/Android
6. TestFlight freemium config

**Post-v1.1.0:**
- Monitoring metrics 3 mois baseline
- A/B testing palettes/activités/timing
- Itération data-driven conversion optimization
- Documentation learnings MoodCycle

---

**Version:** 1.0  
**Statut:** ACCEPTED - Ready for implementation  
**Prochain review:** Post-TestFlight v1.1.0 (données conversion réelles)