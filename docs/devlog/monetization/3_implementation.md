⏺ Architecture actuelle

- Expo SDK 54 + React Native 0.81.4
- Architecture de limitation: isTestPremium() dans testMode.js
- Palettes: 2 gratuites (classique, softLaser) + 12 premium
- Activités: 4 gratuites (none, work, break, reading) + 12 premium
- Contextes: TimerPaletteContext, TimerOptionsContext

---

PHASE 1 - PRÉPARATION (15 min)

1.1 Installation SDK

npx expo install react-native-purchases

1.2 Configuration app.json

- Ajouter plugin RevenueCat avec clés API iOS/Android
- Attention: nécessite rebuild natif (eas build)

  1.3 Structure dossiers

src/
contexts/
PurchaseContext.jsx [CRÉER]
hooks/
usePurchases.js [CRÉER]
config/
revenuecat.js [CRÉER]
testMode.js [MODIFIER - garder logique test]
components/
PremiumModal.jsx [CRÉER]
PremiumBadge.jsx [CRÉER - optionnel]

Tests: Vérifier installation via npx expo prebuild --clean (sans lancer)

---

PHASE 2 - CORE REVENUECAT (30 min)

2.1 Configuration (src/config/revenuecat.js)

- Clés API iOS/Android (variables d'environnement)
- Produits: premium_monthly, premium_yearly, premium_lifetime
- Entitlements: "premium_access"
- Piège: Ne jamais hardcoder les clés, utiliser app.config.js

  2.2 Context Provider (src/contexts/PurchaseContext.jsx)

Responsabilité: État global premium, méthodes achat/restore

- isPremium (boolean)
- isLoading (boolean)
- products (array)
- purchaseProduct(productId)
- restorePurchases()
- offerings (RevenueCat)
  Pièges:
- Gérer PurchasesErrorCode.userCancelledError
- Listener Purchases.addCustomerInfoUpdateListener() pour sync temps réel
- Cleanup listener dans useEffect

  2.3 Hook utilitaire (src/hooks/usePurchases.js)

Responsabilité: Wrapper du contexte + helpers

- usePurchases() → { isPremium, purchaseProduct, ... }
- checkPremiumAccess(item) → boolean

Dépendance: Hook dépend de Context (créer Context d'abord)

Tests:

1. Logger customerInfo au mount
2. Vérifier entitlement premium_access dans console
3. Tester mode sandbox iOS/Android

---

PHASE 3 - MVP FONCTIONNEL (20 min)

3.1 Intégration testMode.js [MODIFIER]

// Nouvelle logique
export const isTestPremium = () => {
if (TEST_MODE) return true;
return false; // RevenueCat vérifiera en production
};

export const useIsPremium = () => {
const { isPremium } = usePurchases();
return TEST_MODE || isPremium;
};

3.2 Wrapper App.js [MODIFIER App.js:65]

  <ErrorBoundary>
    <PurchaseProvider>  {/* AJOUTER ici */}
      <ThemeProvider>
        <OnboardingProvider>
          <AppContent />
  Ordre crucial: PurchaseProvider avant ThemeProvider pour disponibilité
  globale

3.3 Mise à jour composants existants

ActivityCarousel.jsx:27 [MODIFIER]
// Remplacer
const isPremiumUser = isTestPremium();
// Par
const isPremiumUser = useIsPremium(); // du hook

PaletteCarousel.jsx:31 [MODIFIER - même changement]

Points d'attention:

- Garder la logique isLocked actuelle (lignes 278, 214)
- Conserver animations/haptics warning existantes
- NE PAS changer les TODOs "Show premium modal" (ligne 111)

Tests MVP:

1. TEST_MODE=true → tout débloqué
2. TEST_MODE=false + sandbox → vérifier locks
3. Clic activité verrouillée → haptic warning

---

PHASE 4 - MODAL PREMIUM (25 min)

4.1 Composant PremiumModal.jsx [CRÉER]

Responsabilité: Paywall avec Offerings RevenueCat
Props: visible, onClose, highlightedFeature
Features:

- Liste produits avec prix dynamiques (offerings.current)
- Bouton achat par produit
- Bouton restore
- Design: réutiliser thème/responsive existant
  Pièges:
- Gérer états: loading, purchasing, error
- Afficher product.priceString (pas de prix hardcodé)
- Accessibility labels

  4.2 Intégration ActivityCarousel.jsx [MODIFIER ligne 111]

const [showPremium, setShowPremium] = useState(false);

// Dans handleActivityPress
if (activity.isPremium && !isPremiumUser) {
haptics.warning();
setShowPremium(true); // Au lieu de TODO
return;
}

// Fin du composant
<PremiumModal
visible={showPremium}
onClose={() => setShowPremium(false)}
highlightedFeature={`Activité ${activity.label}`}
/>

PaletteCarousel.jsx [MODIFIER ligne 86]
// Dans handleScrollEnd (après scroll back)
setShowPremium(true);

Tests:

1. Clic palette premium → modal apparaît
2. Vérifier prix réels Sandbox
3. Achat test → modal ferme + débloque contenu
4. Restore → restaure achats existants

---

PHASE 5 - EDGE CASES (15 min)

5.1 Offline/Network errors

// Dans PurchaseContext
try {
await Purchases.purchaseProduct(productId);
} catch (e) {
if (e.code === PurchasesErrorCode.networkError) {
Alert.alert("Pas de connexion", "Réessayez");
}
}

5.2 Race conditions

- Ajouter isLoading pendant fetch offerings
- Désactiver boutons pendant purchasing

  5.3 Persistence locale (fallback)

// Dans PurchaseContext
useEffect(() => {
AsyncStorage.setItem('@premium', isPremium.toString());
}, [isPremium]);

5.4 Premium déjà acquis

- Vérifier customerInfo au premier lancement
- Auto-débloquer si entitlement actif

Tests:

1. Mode avion → message erreur réseau
2. Double-clic achat → bouton désactivé
3. Kill app pendant achat → restore fonctionne
4. Nouvel install avec compte → restore auto

---

PHASE 6 - TESTING SANDBOX (20 min)

6.1 Configuration Sandbox

- iOS: StoreKit Configuration file + Sandbox tester
- Android: License Testing (Google Play Console)

  6.2 Scénarios critiques

1. Achat mensuel → vérifie déblocage immédiat
2. Annulation → contenu reste verrouillé
3. Restore → compte avec achat actif
4. Expiration → abonnement test expiré (RevenueCat accélère)
5. Refund → révocation accès

6.3 Logs RevenueCat

Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG); // Dev only

Tests manuels:

- Console Xcode/Logcat pour transactions
- Dashboard RevenueCat → vérifier événements
- Tester sur device physique (simulateur limité)

---

MVP MINIMAL TESTABLE

Étapes 1-3 = Base fonctionnelle (1h)

- Achat basique fonctionne
- Locks visuels activés
- Test mode opérationnel

Validation: Sandbox purchase → contenu débloqué

---

ORDRE D'IMPLÉMENTATION

1. Phase 1.1-1.2 (installation + config)
2. Phase 2.1 (config RevenueCat)
3. Phase 2.2 (PurchaseContext)
4. Phase 2.3 (hook)
5. Phase 3 (intégration MVP)
6. Phase 6 (test sandbox - AVANT modal)
7. Phase 4 (modal premium)
8. Phase 5 (edge cases)

Rationale: Tester achat programmatique avant UI complexe

---

PIÈGES SPÉCIFIQUES REVENUECAT

1. Produits non chargés: Toujours check offerings !== null
2. CustomerInfo stale: Forcer getCustomerInfo() après restore
3. iOS Receipt validation: Nécessite build signé (pas Expo Go)
4. Android obfuscation: Configurer ProGuard rules
5. Entitlement vs Product: Toujours checker entitlement (pas productId)

---

ROLLBACK SAFETY

Garder testMode.js fonctionnel pour:

- Désactiver RevenueCat si problème production
- Tests internes sans achats réels
- Demo clients

const FORCE_PREMIUM = **DEV** && TEST_MODE;
return FORCE_PREMIUM || isPremium;

---

## Configuration Spécifique Android

### Google Play Service Account (Post-Mai 2024)

**IMPORTANT**: Pour les comptes Google Play créés après Mai 2024, l'ancienne méthode "Link service account" dans API access ne fonctionne plus.

**Méthode correcte**:

1. **Google Play Console** → Users & Permissions
2. **Invite User** (PAS "Link service account")
3. **Email**: revenuecat-service-account@revenuecat-474510.iam.gserviceaccount.com
4. **Permissions requises**:
   - View app information and download bulk reports (read-only)
   - View financial data, orders, and cancellation survey responses
   - Manage orders and subscriptions

**Statut**: Configuration fonctionnelle

**Clé d'apprentissage**: Documentation RevenueCat ancienne référence l'ancienne API. Pour les comptes récents, inviter directement le service account comme utilisateur standard.

### ProGuard Rules Android

**CRITIQUE**: Ajouter les règles ProGuard suivantes pour éviter crashes en production

**Fichier**: `android/app/proguard-rules.pro`

```proguard
# RevenueCat SDK
-keep class com.revenuecat.purchases.** { *; }
-keep interface com.revenuecat.purchases.** { *; }

# Google Play Billing
-keep class com.android.billingclient.** { *; }
-keep interface com.android.billingclient.** { *; }
```

**Raison**: ProGuard peut obfusquer les classes billing RevenueCat et causer des crashes en production avec `minifyEnabled=true`

### Test Build Android Release

**Commandes**:
```bash
cd android
./gradlew clean
./gradlew bundleRelease

# Vérifier que le AAB est généré
ls -lh app/build/outputs/bundle/release/app-release.aab
```

**Important**: Tester sur device physique après l'ajout des ProGuard rules pour vérifier qu'aucun crash ne survient.

---

## Checklist Pré-Production Android

- [ ] ProGuard rules ajoutées (RevenueCat + Billing)
- [ ] TEST_MODE = false dans build production
- [ ] Build release testé avec ProGuard activé
- [ ] Purchase flow testé sur device physique Android
- [ ] Google Play Service Account invité dans Users & Permissions
- [ ] License testing configuré dans Play Console

```</parameter>
</invoke>
```
