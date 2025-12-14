---
created: '2025-10-08'
updated: '2025-10-08'
status: archived
milestone: M5
confidence: high
---

# RevenueCat Integration - Analyse Triangulaire Claude Code

## Statut Compilation
- [x] Query 3 - Stratégie Marketing
- [x] Query 1 - Stratégie Architecture
- [x] Query 2 - Plan Implémentation
- [x] Query 4 - Arbitrage Divergences

**ANALYSE TRIANGULAIRE COMPLÈTE**

---

## 1. STRATÉGIE MARKETING FREEMIUM

### Feedback Claude Code

**Diagnostic Proposition Actuelle:**
- **Incohérence:** Mindfulness 100% premium alors que core persona neuroatypique
- **Ratio agressif:** 75% palettes + 75% activités bloquées = frustration précoce
- **Paywall absent:** Lock icon visible mais aucun CTA/timing/flow
- **Value prop floue:** Palettes = cosmétique, activités = fonctionnel non démontré

**Benchmarks Identifiés:**
- Time Timer: Core gratuit, features "power user" premium
- Tiimo: Accessibilité = gratuit fonctionnel, premium = collab/sync
- Meditation apps: 1-4 sessions gratuites, trial 7-14j pour créer habitude
- Forest: Payment model adapté plateforme (iOS one-time, Android freemium)

**Hiérarchie Features:**

MUST-HAVE GRATUIT:
- Timer visuel complet (critique)
- 2-3 palettes couleurs (essentiel sensorialité)
- Cycle Pomodoro complet Travail+Pause (critique productivité)
- **1 activité mindfulness = Respiration 4min** (essentiel ancrage persona)
- Haptic + Audio (essentiel sensorialité neuroatypique)

NICE-TO-HAVE PREMIUM:
- Palettes thématiques mood-based (pricing power moyen)
- Activités lifestyle (moyen)
- Timer sequences/routines (élevé)
- Multi-device sync (élevé)
- Lock screen widgets (élevé)
- Stats & insights (moyen)

**Timing Paywall Optimal:**
1. D0 First Session: Zero friction, premier timer gratuit complet
2. D1-D3 Engagement: 3-5 sessions gratuites pour créer habitude
3. Trigger après 5-7 timers: Paywall contextuel avec trial 7j
4. D30 Re-engagement: Smart notification si non converti

**3 Variantes Proposées:**

**VARIANTE 1 "Mindful Core" (RECOMMANDÉE):**
- Gratuit: 3 palettes + 6 activités essentielles (+ Respiration, Étude)
- Premium: $4.99/mois, $29.99/an, $49.99 lifetime
- Trial 7 jours toutes features
- Trade-off: Fonctionnel complet gratuit, premium = lifestyle upgrade
- Conversion attendue: 3-5%
- Rétention D30: 15-20%

**VARIANTE 2 "Progressive Unlock":**
- Gamification: 5 timers → +1 activité, 15 timers → +1 palette
- Premium: $3.99/mois, $24.99/an (skip grind)
- Trade-off: Engagement élevé mais complexe à implémenter
- Conversion attendue: 5-8%
- Rétention D30: 25-30%

**VARIANTE 3 "Vertical Sampling":**
- 1 sample gratuit par verticale (Productivité, Mindfulness, Lifestyle)
- Premium à la carte: Packs $4.99-9.99 ou Bundle $19.99
- Trade-off: Micro-pricing accessible mais fragmentation complexe
- Conversion attendue: 8-12%
- ARPU: $8-12

**Arguments Vente Premium Contextualisés:**
- Post-Pomodoro: "Débloquer Sport & Yoga pour équilibrer ton flow"
- Post-Respiration 5×: "Méditation guidée 20min pour aller plus loin"
- Test 3 palettes: "13 palettes premium pour matcher tous tes états"
- Time blindness TDAH: "Widget écran d'accueil garde ton timer visible"

**Risques & Mitigations:**
- Conversion <2%: A/B test pricing, add features haute valeur, lifetime attractive
- Trial abuse: Limiter 1× par device, soft paywall post-trial
- Gratuit "trop bon": Rotation activités, routines custom premium
- Paywall mal timing: Jamais pendant timer actif, dismiss facile
- Exclusion financière: Student discount, accessibility program, lifetime option

**KPIs Tracking:**
- Phase Discovery (M0-M3): Trial start >20%, D7 retention >20%
- Phase Conversion (M3-M6): Trial→paid >25%, Overall >3-5%
- Phase Retention (M6-M12): D30 paid >60%, ARPU >$2.50, LTV >$30

**Roadmap Implémentation:**
- Immediate v1.1.0: Respiration+Étude gratuits, RevenueCat setup, Paywall UI
- Short-term v1.2.0: Analytics events, A/B testing framework
- Mid-term v1.3.0+: Premium features delivery, iteration data-driven

**MoodCycle Learnings:**
- Trial duration optimal (7j vs 14j)
- Paywall timing psychology (after value, not before)
- Pricing tiers response
- Neuroatypical messaging (accessibility-first)
- RevenueCat mastery (entitlements, restore, family sharing)
- MoodCycle conversion attendue: 8-12% vs ResetPulse 3-5%
- MoodCycle ARPU potentiel: $5-8/mois vs ResetPulse $2-4/mois

### Points Clés Identifiés

1. **Incohérence stratégique majeure:** Mindfulness 100% premium = contradiction mission neuroatypique
2. **Variante 1 alignée mission:** Accessibilité prioritaire, premium = enhancement
3. **Trial 7 jours = standard wellness:** Pattern validé industrie
4. **Paywall timing critique:** Après création habitude (5-7 timers), jamais pendant flow
5. **Arguments vente contextualisés:** Messaging post-timer selon activité complétée
6. **Accessibilité financière:** Student discount, accessibility program, lifetime option
7. **MoodCycle transferability:** Conversion supérieure attendue (8-12%), ARPU plus élevé

### Questions Émergentes

1. **Architecture freemium config:** Centraliser dans `freemium.js` ou disperser par feature?
2. **Trial implementation:** RevenueCat gère nativement ou logique custom nécessaire?
3. **A/B testing framework:** Quel outil? RevenueCat Experiments ou custom analytics?
4. **Rotation activités (risque 3):** Complexité technique vs bénéfice conversion?
5. **Accessibility program:** Process validation manuelle ou automatique?
6. **Stats premium:** Quelle complexité backend si tout AsyncStorage actuellement?
7. **Lock screen widget premium:** Faisabilité technique React Native vs native code? 

---

## 2. STRATÉGIE ARCHITECTURE TECHNIQUE

### Feedback Claude Code

**Résumé Exécutif:**
Architecture solide, intégration RevenueCat sera fluide avec ajustements mineurs. Patterns de limitation déjà cohérents. Source de vérité temporaire `isTestPremium()` à remplacer.

**Patterns Existants (3 composants principaux):**

PaletteCarousel.jsx:
```javascript
const isPremiumUser = isTestPremium();
if (!paletteInfo.isPremium || isPremiumUser) { /* allow */ }
```

ActivityCarousel.jsx:
```javascript
const isLocked = activity.isPremium && !isPremiumUser;
if (isLocked) { haptics.warning(); return; }
```

SettingsModal.jsx:
```javascript
const isLocked = isPalettePremium(paletteName) && !isPremiumUser;
```

Pattern UX cohérent: Lock badge 🔒, opacité 0.4-0.6, scroll-back auto, haptic warning

**Configuration Actuelle vs Objectif:**
- Actuel: 3 palettes gratuites (classique, softLaser, terre) + 4 activités (none, work, break, reading)
- Objectif: 2 palettes + 3 activités
- **GAP:** Décision requise sur quelle palette/activité retirer

**Structure Context API (Couches):**
```
App.js
├── ThemeProvider (racine)
│   ├── OnboardingProvider
│   │   └── AppContent
│   │       └── TimerPaletteProvider
│   │           └── TimerScreen
│   │               └── TimerOptionsProvider (nested)
```

**Point d'Injection Optimal (RECOMMANDÉ):**
```javascript
<ThemeProvider>
  <RevenueCatProvider>  // 👈 Après Theme, avant Onboarding
    <OnboardingProvider>
      <AppContent />
    </OnboardingProvider>
  </RevenueCatProvider>
</ThemeProvider>
```

Avantages: Disponible partout, accès theme pour paywall UI, onboarding peut accéder statut premium

**Dettes Techniques Critiques:**

1. **testMode.js - Hard-coded global:**
```javascript
export const TEST_MODE = true;  // 🔥 HARD-CODED
export const isTestPremium = () => TEST_MODE;
```
Problème: Appelé dans 3 composants, pas de memoization, nécessite 4 fichiers modifiés

Solution proposée:
```javascript
const usePremiumStatus = () => {
  const { entitlements } = useRevenueCat();
  return entitlements.active['pro'] !== undefined;
};
```

2. **Incohérence freemium config:**
Décider maintenant quelle palette/activité retirer AVANT intégration RevenueCat

Suggestions:
- Palettes: Passer "classique" en premium? Garder "terre" + "softLaser"
- Activités: Passer "reading" en premium? Garder "none" + "work" + "break"

3. **Context nesting inconsistant:**
TimerOptionsProvider nested dans TimerScreen au lieu de même niveau que TimerPaletteProvider

4. **Duplication logique helpers:**
`getAllPalettes()` (timerPalettes.js) vs `getAvailablePalettes()` (TimerPaletteContext) - faire la même chose

**Plan d'Implémentation (5 Phases):**

Phase 1 - Nettoyage Pré-intégration (1-2h):
- Ajuster freemium config (décider palettes/activités)
- Créer RevenueCatContext.jsx
- Créer usePremiumStatus.js hook
- Installer SDK

Phase 2 - Setup Provider (2-3h):
- Créer RevenueCatProvider avec init + listener
- Injecter dans App.js après ThemeProvider

Phase 3 - Migration testMode (1h):
- Créer hook usePremiumStatus avec fallback TEST_MODE en dev
- Remplacer isTestPremium() dans 3 composants

Phase 4 - Paywall & Purchase (3-4h):
- Créer PremiumModal component
- Intégrer dans points de blocage (ActivityCarousel, PaletteCarousel)

Phase 5 - Testing (2-3h):
- Tests mode free, lock badges, purchase flow, restore, offline

**Fichiers Touchés:**

Créer (3):
- RevenueCatContext.jsx
- usePremiumStatus.js
- PremiumModal.jsx

Modifier (7):
- App.js (injection provider)
- timerPalettes.js (ajuster isPremium flags)
- activities.js (ajuster isPremium flags)
- PaletteCarousel.jsx (remplacer isTestPremium)
- ActivityCarousel.jsx (remplacer + paywall trigger)
- SettingsModal.jsx (remplacer isTestPremium)
- TimerPaletteContext.jsx (déduplication helper - optionnel)

Supprimer (1):
- testMode.js (garder en commentaire pour dev)

**Risques Identifiés:**
- RevenueCat init failure (critique): Fallback mode free + retry logic
- Network timeout (moyen): Cache customerInfo + offline grace period
- Achat non reconnu (critique): Listener `addCustomerInfoUpdateListener`
- TEST_MODE oublié ON (élevé): CI/CD check avant build prod
- UX friction freemium (moyen): A/B test 2 vs 3 palettes

**Estimation Totale: 9-13h (faisable en 2 jours)**
- Architecture existante: ✅ Très bien préparée
- Dette technique: ⚠️ Mineure (testMode.js)
- Compatibilité RevenueCat: ✅ Excellente

### Points Clés Identifiés

1. **Patterns limitation déjà cohérents:** Lock icon, opacité, haptic warning, scroll-back - UX uniforme
2. **Context API structure claire:** Point d'injection optimal identifié après ThemeProvider
3. **Dette technique mineure:** testMode.js hard-coded mais migration simple via hook custom
4. **Config freemium à finaliser:** Décision palette/activité à retirer AVANT intégration
5. **Migration incrémentale possible:** Remplacer isTestPremium() composant par composant
6. **Duplication helpers mineure:** Non-bloquant, nettoyage optionnel
7. **Timeline réaliste:** 9-13h avec phases clairement définies

### Questions Émergentes

1. **Quelle palette retirer:** Classique (générique) ou SoftLaser (esthétique) pour ne garder que 2?
2. **Quelle activité retirer:** Reading (usage moins fréquent?) pour descendre à 3?
3. **Timing restriction:** Modifier config AVANT ou PENDANT intégration RevenueCat?
4. **TEST_MODE en production:** Garder fallback dev ou supprimer complètement?
5. **Déduplication helpers:** Priorité nettoyage ou laisser tel quel (non-bloquant)?
6. **Context nesting refacto:** Remonter TimerOptionsProvider maintenant ou après RevenueCat?
7. **Offline grace period:** Combien de temps cache customerInfo si network fail?
8. **Paywall UI complexity:** Modal simple ou expérience onboarding riche? 

---

## 3. PLAN IMPLÉMENTATION DÉTAILLÉ

### Feedback Claude Code

**Architecture Actuelle Identifiée:**
- Expo SDK 54 + React Native 0.81.4
- testMode.js avec `isTestPremium()` global
- 2 palettes gratuites (classique, softLaser) + 12 premium
- 4 activités gratuites (none, work, break, reading) + 12 premium
- Contextes: TimerPaletteContext, TimerOptionsContext

**Plan 6 Phases Progressives:**

**PHASE 1 - PRÉPARATION (15 min):**

Installation:
```bash
npx expo install react-native-purchases
```

Configuration app.json:
- Plugin RevenueCat avec clés API iOS/Android
- ⚠️ Nécessite rebuild natif (eas build)

Structure dossiers créée:
```
src/
  contexts/
    PurchaseContext.jsx        [CRÉER]
  hooks/
    usePurchases.js            [CRÉER]
  config/
    revenuecat.js              [CRÉER]
    testMode.js                [MODIFIER - garder logique test]
  components/
    PremiumModal.jsx           [CRÉER]
    PremiumBadge.jsx           [CRÉER - optionnel]
```

Test: `npx expo prebuild --clean` (sans lancer)

**PHASE 2 - CORE REVENUECAT (30 min):**

2.1 Configuration (revenuecat.js):
- Clés API iOS/Android (variables environnement)
- Produits: premium_monthly, premium_yearly, premium_lifetime
- Entitlements: "premium_access"
- ⚠️ Jamais hardcoder clés, utiliser app.config.js

2.2 PurchaseContext.jsx:
État global: isPremium, isLoading, products, offerings
Méthodes: purchaseProduct(), restorePurchases()
Pièges:
- Gérer `PurchasesErrorCode.userCancelledError`
- Listener `addCustomerInfoUpdateListener()` pour sync temps réel
- Cleanup listener dans useEffect

2.3 Hook usePurchases.js:
Wrapper contexte + helpers
- usePurchases() → { isPremium, purchaseProduct, ... }
- checkPremiumAccess(item) → boolean

Tests:
- Logger customerInfo au mount
- Vérifier entitlement "premium_access"
- Tester mode sandbox iOS/Android

**PHASE 3 - MVP FONCTIONNEL (20 min):**

3.1 testMode.js modifié:
```javascript
export const useIsPremium = () => {
  const { isPremium } = usePurchases();
  return TEST_MODE || isPremium;
};
```

3.2 App.js wrapper:
```javascript
<ErrorBoundary>
  <PurchaseProvider>  // 👈 Avant ThemeProvider
    <ThemeProvider>
      <OnboardingProvider>
```
Ordre crucial: PurchaseProvider avant ThemeProvider pour disponibilité globale

3.3 Mise à jour composants:
ActivityCarousel.jsx:27, PaletteCarousel.jsx:31
```javascript
// Remplacer
const isPremiumUser = isTestPremium();
// Par
const isPremiumUser = useIsPremium();
```

Points d'attention:
- Garder logique isLocked actuelle
- Conserver animations/haptics warning
- NE PAS changer TODOs "Show premium modal" (ligne 111) encore

Tests MVP:
- TEST_MODE=true → tout débloqué
- TEST_MODE=false + sandbox → vérifier locks
- Clic activité verrouillée → haptic warning

**PHASE 4 - MODAL PREMIUM (25 min):**

4.1 PremiumModal.jsx:
Responsabilité: Paywall avec Offerings RevenueCat
Props: visible, onClose, highlightedFeature
Features:
- Liste produits avec prix dynamiques (offerings.current)
- Bouton achat par produit
- Bouton restore
- Design: réutiliser thème/responsive existant

Pièges:
- États: loading, purchasing, error
- Afficher product.priceString (pas prix hardcodé)
- Accessibility labels

4.2 Intégration ActivityCarousel.jsx ligne 111:
```javascript
const [showPremium, setShowPremium] = useState(false);

if (activity.isPremium && !isPremiumUser) {
  haptics.warning();
  setShowPremium(true); // Remplace TODO
  return;
}

<PremiumModal
  visible={showPremium}
  onClose={() => setShowPremium(false)}
  highlightedFeature={`Activité ${activity.label}`}
/>
```

PaletteCarousel.jsx ligne 86: Même pattern après scroll-back

Tests:
- Clic palette premium → modal apparaît
- Vérifier prix réels Sandbox
- Achat test → modal ferme + débloque
- Restore → restaure achats existants

**PHASE 5 - EDGE CASES (15 min):**

5.1 Offline/Network errors:
```javascript
try {
  await Purchases.purchaseProduct(productId);
} catch (e) {
  if (e.code === PurchasesErrorCode.networkError) {
    Alert.alert("Pas de connexion", "Réessayez");
  }
}
```

5.2 Race conditions:
- isLoading pendant fetch offerings
- Désactiver boutons pendant purchasing

5.3 Persistence locale fallback:
```javascript
useEffect(() => {
  AsyncStorage.setItem('@premium', isPremium.toString());
}, [isPremium]);
```

5.4 Premium déjà acquis:
- Vérifier customerInfo au premier lancement
- Auto-débloquer si entitlement actif

Tests:
- Mode avion → message erreur réseau
- Double-clic achat → bouton désactivé
- Kill app pendant achat → restore fonctionne
- Nouvel install avec compte → restore auto

**PHASE 6 - TESTING SANDBOX (20 min):**

Configuration Sandbox:
- iOS: StoreKit Configuration file + Sandbox tester
- Android: License Testing (Google Play Console)

Scénarios critiques:
1. Achat mensuel → déblocage immédiat
2. Annulation → contenu reste verrouillé
3. Restore → compte avec achat actif
4. Expiration → abonnement test expiré (RevenueCat accélère)
5. Refund → révocation accès

Logs RevenueCat:
```javascript
Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG); // Dev only
```

Tests manuels:
- Console Xcode/Logcat pour transactions
- Dashboard RevenueCat → vérifier événements
- Tester device physique (simulateur limité)

**MVP MINIMAL TESTABLE:**
Phases 1-3 = Base fonctionnelle (1h)
- Achat basique fonctionne
- Locks visuels activés
- Test mode opérationnel

Validation: Sandbox purchase → contenu débloqué

**ORDRE D'IMPLÉMENTATION RECOMMANDÉ:**
1. Phase 1.1-1.2 (installation + config)
2. Phase 2.1 (config RevenueCat)
3. Phase 2.2 (PurchaseContext)
4. Phase 2.3 (hook)
5. Phase 3 (intégration MVP)
6. Phase 6 (test sandbox - AVANT modal)
7. Phase 4 (modal premium)
8. Phase 5 (edge cases)

Rationale: Tester achat programmatique avant UI complexe

**PIÈGES SPÉCIFIQUES REVENUECAT:**
1. Produits non chargés: Check offerings !== null
2. CustomerInfo stale: Forcer getCustomerInfo() après restore
3. iOS Receipt validation: Nécessite build signé (pas Expo Go)
4. Android obfuscation: Configurer ProGuard rules
5. Entitlement vs Product: Toujours checker entitlement (pas productId)

**ROLLBACK SAFETY:**
```javascript
const FORCE_PREMIUM = __DEV__ && TEST_MODE;
return FORCE_PREMIUM || isPremium;
```
Garder testMode.js pour désactiver RevenueCat si problème production

**Estimation Totale: 2h05 (125 min)**
- Phase 1: 15 min
- Phase 2: 30 min
- Phase 3: 20 min
- Phase 4: 25 min
- Phase 5: 15 min
- Phase 6: 20 min

### Points Clés Identifiés

1. **Approche MVP progressive:** 6 phases incrémentales avec validation à chaque étape
2. **Test sandbox AVANT UI complexe:** Valider achat programmatique avant modal (Phase 6 avant 4)
3. **PurchaseProvider avant ThemeProvider:** Ordre injection crucial pour disponibilité globale
4. **testMode.js conservé:** Rollback safety + tests internes sans achats réels
5. **Edge cases exhaustifs:** Offline, race conditions, persistence, restore - tous couverts Phase 5
6. **Pièges RevenueCat documentés:** 5 pièges spécifiques identifiés (offerings null, stale info, etc.)
7. **Timeline réaliste:** 2h05 avec phases clairement chronométrées

### Questions Émergentes

1. **Rebuild natif EAS:** Combien de temps attendre premier build avec plugin RC?
2. **Variables environnement:** Utiliser .env ou app.config.js pour clés API?
3. **Sandbox testing device:** iPhone physique requis ou simulateur suffisant iOS?
4. **ProGuard rules Android:** Configuration spécifique RevenueCat fournie ou custom?
5. **Listener cleanup timing:** useEffect cleanup suffit ou besoin unmount explicit?
6. **AsyncStorage fallback priority:** Préférer cache local ou toujours fetch customerInfo?
7. **StoreKit Configuration file:** Créer manuellement ou généré par RevenueCat?
8. **Modal highlightedFeature usage:** Argument vente différencié par feature ou générique? 

---

## SYNTHÈSE CONVERGENCES/DIVERGENCES

### Convergences (3 perspectives alignées)

1. **Variante 1 "Mindful Core" validée:**
   - Marketing: Accessibilité neuroatypique prioritaire
   - Architecture: Config actuelle proche (3→6 activités gratuites incluant Respiration)
   - Implémentation: Modification simple activities.js + timerPalettes.js

2. **Trial 7 jours standard industrie:**
   - Marketing: Pattern validé wellness apps, créer habitude avant conversion
   - Architecture: RevenueCat gère nativement via entitlements
   - Implémentation: Configuration offerings dashboard RC (pas code custom)

3. **Hook usePremiumStatus() pivot central:**
   - Marketing: N/A (abstraction technique)
   - Architecture: Remplace isTestPremium() dans 3 composants
   - Implémentation: Phase 3 migration testMode → usePurchases()

4. **Paywall timing post-completion:**
   - Marketing: Après 5-7 timers, jamais pendant timer actif
   - Architecture: Trigger dans handleActivityPress après haptic warning
   - Implémentation: setState showPremium dans ActivityCarousel ligne 111

5. **Test sandbox avant UI:**
   - Marketing: Validation conversion réelle avant optimisation UX
   - Architecture: N/A
   - Implémentation: Phase 6 avant Phase 4 (achat programmatique validé)

6. **Rollback safety testMode.js:**
   - Marketing: N/A
   - Architecture: Garder en commentaire pour dev
   - Implémentation: FORCE_PREMIUM flag conservé

### Divergences (tensions à arbitrer)

1. **Config freemium finale:**
   - Marketing: 3 palettes + 6 activités (+ Respiration, Étude)
   - Architecture: Décision palette/activité à retirer AVANT intégration (2+3)
   - Implémentation: 2 palettes (classique, softLaser) + 4 activités actuelles
   - **TENSION:** Marketing veut expansion gratuit, Architecture alerte GAP objectif initial

2. **Stats premium backend:**
   - Marketing: Stats & insights = premium feature pricing power moyen
   - Architecture: AsyncStorage actuel, complexité backend si stats premium
   - Implémentation: N/A (hors scope v1.1.0)
   - **TENSION:** Feature premium attractive mais infrastructure manquante

3. **Rotation activités (risque gratuit "trop bon"):**
   - Marketing: Rotation mensuelle 2 fixes + 2 rotations pour limiter gratuité
   - Architecture: Complexité tracking + state management
   - Implémentation: Pas mentionné dans phases
   - **TENSION:** Mitigation conversion vs complexité technique

4. **A/B testing framework:**
   - Marketing: A/B test pricing, trial duration, paywall timing
   - Architecture: N/A
   - Implémentation: Pas mentionné
   - **TENSION:** Optimisation data-driven vs scope v1.1.0

5. **Lock screen widget premium:**
   - Marketing: Pricing power élevé (time blindness ADHD)
   - Architecture: Faisabilité React Native vs native code?
   - Implémentation: Pas mentionné
   - **TENSION:** Feature différenciante vs effort développement inconnu

6. **Accessibility program:**
   - Marketing: Free premium sur demande (inclusion financière)
   - Architecture: Process validation manuelle ou automatique?
   - Implémentation: N/A (hors scope technique)
   - **TENSION:** Mission sociale vs complexité opérationnelle

7. **Premium messaging contextuel:**
   - Marketing: Arguments vente post-timer selon activité (4 variantes documentées)
   - Architecture: N/A
   - Implémentation: highlightedFeature prop générique dans PremiumModal
   - **TENSION:** Personnalisation poussée vs simplicité MVP

### Décisions Architecture à Prendre

### Décisions Architecture à Prendre

**DÉCISIONS FINALES ARBITRÉES (Query 4):**

1. **Config freemium:** 3 palettes + 6 activités ✅
   - Palettes: classique, softLaser, terre
   - Activités: none, work, break, breathing, reading, study
   - Rationale: Mission neuroatypique > conversion agressive, benchmark meditation apps (6 gratuits = D1 retention 40%+)

2. **Palette si restriction à 2:** Retirer "classique", garder "softLaser" + "terre" ✅
   - Rationale: Distinctivité cool/warm tones vs primaires standard
   - **Décision finale:** Garder 3 palettes (pas de restriction)

3. **PurchaseProvider injection:** APRÈS ThemeProvider ✅
   - Pattern: ErrorBoundary > Theme > Purchase > Onboarding > AppContent
   - Rationale: PremiumModal utilise useTheme() pour design tokens

4. **PremiumModal complexity:** MVP simple v1.1.0 → Iteration messaging v1.2.0 ✅
   - v1.1.0: highlightedFeature prop générique (3h implementation)
   - v1.2.0: Messaging contextuel si conversion <3% (6-8h variants)
   - Rationale: Valider prix/timing AVANT optimiser copy, lift conversion +0.5-1.5% seulement

5. **Trial implementation:** RevenueCat natif + edge-case minimale ✅
   - RevenueCat gère: Eligibility, grace period, auto-renewal, family sharing
   - Code custom requis: Check trial status, UI feedback expiration proche
   - Pièges: Device ID ≠ Apple ID (re-eligibility), sandbox 5min accelerated, grace period UI

6. **Features premium roadmap post-v1.1.0:**
   - v1.2.0 (M+1): Lock screen widget iOS (pricing power élevé, effort moyen, learning MoodCycle)
   - v1.3.0 (M+2): Rotation activités si conversion <3% (FOMO dopamine-friendly)
   - v1.4.0 (M+3): Stats & insights simple (backend léger AsyncStorage, self-awareness use case)
   - Backlog M+6: A/B testing framework (après baseline metrics)
   - Exclus v1.x: Timer sequences, multi-device sync (complexe/backend)

7. **Offline grace period:** Cache indefinitely + force refresh smart ✅
   - SDK cache par défaut, force refresh si >7j ou purchase ou foreground
   - UX network fail: 30j offline = premium actif (cache), après 30j soft banner
   - Rationale: Neuroatypiques anxiété bugs tech, trust cache vs aggressive re-check

**RISQUES NON VISIBLES IDENTIFIÉS (Query 4):**

1. **Scope Creep Résistance (CRITIQUE):**
   - Symptôme: TDA/H + 20 projets + docs scope creep
   - Risque: Features v1.2.0+ bleed into v1.1.0 implementation
   - Mitigation: Feature flags hardcodé false, commit messages "NO stats/rotation per scope"

2. **Trial UX Confusion (MOYEN):**
   - Gap: Où user voit "7 jours gratuit"?
   - Risque: User ignore trial, paie direct, demande refund
   - Mitigation: Onboarding step 4 explicit CTA, PremiumModal trial badge prominent

3. **Family Sharing Edge Case (MOYEN):**
   - Gap: Actif par défaut iOS, docs silencieuses
   - Risque: Analytics conversion faussés (shared vs direct purchase)
   - Mitigation: RevenueCat dashboard segmenter, pricing considérer family = feature

**DÉCISIONS BLOQUANTES vs POST-MVP:**

🔴 **BLOQUANTES (décidées maintenant):**
1. Config freemium: 3 palettes + 6 activités ✅
2. Provider order: Après ThemeProvider ✅
3. Trial implementation: RevenueCat natif ✅

🟡 **OPTIMISATIONS POST-MVP (itérer après data):**
4. Messaging contextuel (si conversion <3%)
5. Rotation activités (si retention D30 <15%)
6. Cache refresh policy (adjust si complaints)

**TIMELINE AJUSTÉE v1.1.0:**

Semaine 1 (5-7j):
- Phase 1-3 Implementation (9h)
- Phase 4 PremiumModal MVP simple (3h)
- Phase 5 Edge cases (2h)

Semaine 2 (3-5j):
- Phase 6 Sandbox testing (4h)
- Analytics events (2h)
- TestFlight famille (3 testeurs)

Total: 2-3 semaines ✅

---

## PROCHAINES ÉTAPES CONSENSUS

### Phase Préparatoire Immédiate (Avant Phase 1 technique)

1. **Finaliser config freemium:**
   - Décision palette: Retirer "classique", garder "softLaser" + "terre"
   - Décision activité: Ajouter "breathing" aux 4 actuelles (none, work, break, reading)
   - Modifier timerPalettes.js et activities.js

2. **Setup RevenueCat Dashboard:**
   - Créer produits: premium_monthly ($4.99), premium_yearly ($29.99), premium_lifetime ($49.99)
   - Configurer entitlement: "premium_access"
   - Créer offering "default" avec trial 7 jours

3. **Validation concept paywall:**
   - Sketch modal premium (Figma optionnel)
   - Valider messaging générique vs contextuel (MVP = générique)

### Roadmap Technique v1.1.0 (2-3 semaines)

**Semaine 1 (Setup Foundation):**
- Jour 1-2: Phases 1-2 (Installation SDK, PurchaseContext, hook)
- Jour 3: Phase 3 (Migration testMode, intégration MVP)
- Jour 4: Phase 6 (Testing sandbox achat programmatique)
- Jour 5: Validation MVP minimal testable

**Semaine 2 (UI & Edge Cases):**
- Jour 6-7: Phase 4 (PremiumModal, intégration composants)
- Jour 8: Phase 5 (Edge cases: offline, race conditions, restore)
- Jour 9-10: Tests end-to-end, debugging

**Semaine 3 (Polish & Deploy):**
- Jour 11-12: Analytics events (paywall_viewed, trial_started, purchase_completed)
- Jour 13: Build production EAS
- Jour 14: TestFlight beta famille
- Jour 15: Monitoring dashboard RevenueCat + ajustements

### Métriques Succès v1.1.0

**Technique:**
- Zero crash related RevenueCat
- Restore purchases fonctionne 100%
- Offline fallback gracieux
- Build time <15min avec plugin RC

**Business (Phase Discovery M0-M3):**
- Trial start rate: >20% users
- D7 retention: >20%
- Paywall → trial: >30%

### Post-v1.1.0 (Roadmap Long Terme)

**v1.2.0 (M2) - Analytics & Optimization:**
- A/B testing framework custom
- Conversion funnel granulaire
- Pricing tiers experiments

**v1.3.0 (M3) - Premium Features:**
- Timer sequences (routines)
- Lock screen widget
- Apple Watch companion

**v1.4.0 (M4) - Advanced Monetization:**
- Rotation activités si conversion faible
- Student discount automation
- Stats & insights backend

**v2.0.0 (M6+) - MoodCycle Pivot:**
- Transfer learnings documented
- RevenueCat mastery validated
- Conversion benchmarks established
