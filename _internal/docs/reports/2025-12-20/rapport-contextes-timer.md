---
created: '2025-12-20'
updated: '2025-12-20'
status: active
report_type: architecture
component: Timer-related Contexts
---

# Rapport d'Architecture : Contextes Timer & Préférences

## 1. Vue d'ensemble

ResetPulse utilise **5 contextes React** organisés en deux catégories :

### Contextes Timer
1. **TimerOptionsContext** - Gestion complète des options du timer (durée, activité, interactivité)
2. **TimerPaletteContext** - Gestion des palettes de couleurs du timer

### Contextes Préférences & UI
3. **UserPreferencesContext** - Préférences utilisateur (outil favori sélectionné)
4. **PurchaseContext** - Gestion des achats premium via RevenueCat
5. **ModalStackContext** - Gestion de la pile de modales imbriquées

**Fichiers source** : `/Users/irimwebforge/dev/apps/resetpulse/src/contexts/`

---

## 2. TimerOptionsContext

### 2.1 Définition du contexte

**Fichier** : `src/contexts/TimerOptionsContext.jsx` (309 lignes)

**Responsabilité** : Gestion centralisée de toutes les options du timer, avec persistence via AsyncStorage et support du mode développement.

**Structure du contexte** :

```typescript
{
  // États transients (non persistés)
  timerRemaining: number,
  setTimerRemaining: (val: number) => void,
  flashActivity: Activity | null,
  setFlashActivity: (activity: Activity | null) => void,
  handleActivitySelect: (activity: Activity) => void,

  // États persistés
  shouldPulse: boolean,
  showDigitalTimer: boolean,
  showActivityEmoji: boolean,
  keepAwakeEnabled: boolean,
  clockwise: boolean,
  scaleMode: string,                    // '25min' | '50min' | '90min'
  currentActivity: Activity,
  currentDuration: number,              // durée en secondes
  favoriteActivities: string[],
  favoritePalettes: string[],
  selectedSoundId: string,
  activityDurations: { [activityId]: number },
  completedTimersCount: number,
  hasSeenTwoTimersModal: boolean,
  commandBarConfig: any[],
  carouselBarConfig: any[],
  longPressConfirmDuration: number,    // 1000-5000ms (ADR-007)
  longPressStartDuration: number,      // 1000-5000ms (ADR-007)
  startAnimationDuration: number,      // 300-2000ms
  showTime: boolean,                   // Eye toggle pour DigitalTimer
  interactionProfile: string,          // 'impulsif' | 'abandonniste' | 'ritualiste' | 'veloce'

  // Setters
  setShouldPulse: (val: boolean) => void,
  setShowDigitalTimer: (val: boolean) => void,
  setShowActivityEmoji: (val: boolean) => void,
  setKeepAwakeEnabled: (val: boolean) => void,
  setClockwise: (val: boolean) => void,
  setScaleMode: (val: string) => void,
  setCurrentActivity: (val: Activity) => void,
  setCurrentDuration: (val: number) => void,
  setFavoriteActivities: (val: string[]) => void,
  setFavoritePalettes: (val: string[]) => void,
  setSelectedSoundId: (val: string) => void,
  setActivityDurations: (val: {}) => void,
  setCompletedTimersCount: (val: number) => void,
  setHasSeenTwoTimersModal: (val: boolean) => void,
  setCommandBarConfig: (val: any[]) => void,
  setCarouselBarConfig: (val: any[]) => void,
  setShowTime: (val: boolean) => void,
  setLongPressConfirmDuration: (val: number) => void,  // Clamped 1000-5000ms
  setLongPressStartDuration: (val: number) => void,    // Clamped 1000-5000ms
  setStartAnimationDuration: (val: number) => void,    // Clamped 300-2000ms
  setInteractionProfile: (val: string) => void,

  // Helpers
  saveActivityDuration: (activityId: string, duration: number) => void,
  incrementCompletedTimers: () => number,
  toggleFavoritePalette: (paletteId: string) => void,

  isLoading: boolean,
}
```

### 2.2 Valeurs par défaut

| Propriété | Valeur | Notes |
|-----------|--------|-------|
| `shouldPulse` | `false` | Animation pulsante du center |
| `showDigitalTimer` | `false` | Affichage du texte numérique |
| `showActivityEmoji` | `true` | Affichage de l'emoji de l'activité |
| `keepAwakeEnabled` | `true` | Maintien de l'écran allumé |
| `clockwise` | `false` | Rotation du cadran |
| `scaleMode` | `'25min'` (prod) | Par défaut 25 min Pomodoro |
| `currentActivity` | `getDefaultActivity()` | 'work' (Travail, 25min) |
| `currentDuration` | `1500` (prod) | 25 minutes en secondes |
| `favoriteActivities` | `['work', 'break', 'meditation']` | 3 activités gratuites par défaut |
| `favoritePalettes` | `[]` | Aucune palette favorite par défaut |
| `selectedSoundId` | `'bell_classic'` | Son de cloche classique |
| `activityDurations` | `{}` | Cache des durées par activité |
| `completedTimersCount` | `0` | Compteur de timers complétés |
| `hasSeenTwoTimersModal` | `false` | Flag pour modale milestone |
| `commandBarConfig` | `[]` | Configuration des commandes rapides |
| `carouselBarConfig` | `[]` | Configuration du carousel |
| `longPressConfirmDuration` | `2500` | 2.5s pour confirmer l'arrêt (ADR-007) |
| `longPressStartDuration` | `3000` | 3s pour démarrage délibéré (ADR-007) |
| `startAnimationDuration` | `1200` | 1.2s pour animation de démarrage |
| `showTime` | `true` | Eye toggle persiste entre FavoriteToolBox/ToolBox |
| `interactionProfile` | `'ritualiste'` | Persona utilisateur par défaut |

**Mode développement** : Les valeurs par défaut peuvent être surchargées si `DEV_MODE=true` et `DEV_DEFAULT_TIMER_CONFIG` défini (ex: 20min méditation).

### 2.3 Méthodes de mise à jour

#### Setter standard
Chaque propriété persistée a un setter associé :
```javascript
setShouldPulse(val: boolean)
setShowDigitalTimer(val: boolean)
setCurrentActivity(activity: Activity)
// ... etc
```

**Implémentation** : Chaque setter appelle `updateValue(key, val)` du hook `usePersistedObject`, qui :
1. Met à jour l'état React immédiatement
2. Persiste dans AsyncStorage avec clé `@ResetPulse:timerOptions`

#### Setters avec validation

**`setLongPressConfirmDuration(val: number)`**
- Clamps la valeur entre 1000-5000ms (ADR-007)
- `const clamped = Math.max(1000, Math.min(5000, val))`

**`setLongPressStartDuration(val: number)`**
- Clamps la valeur entre 1000-5000ms (ADR-007)

**`setStartAnimationDuration(val: number)`**
- Clamps la valeur entre 300-2000ms

**`setInteractionProfile(val: string)`**
- Valide contre liste : `['impulsif', 'abandonniste', 'ritualiste', 'veloce']`

#### Helpers spécialisés

**`saveActivityDuration(activityId: string, duration: number)`**
- Sauvegarde la durée spécifique d'une activité dans `activityDurations`
- Persiste automatiquement

**`incrementCompletedTimers()`**
- Incrémente le compteur de timers complétés
- Retourne le nouvel count (permet trigger immédiat sans dépendance d'effet)

**`toggleFavoritePalette(paletteId: string)`**
- Ajoute/retire une palette des favoris (max 4)
- Ne fait rien si on atteint la limite de 4 favoris

**`handleActivitySelect(activity: Activity)`**
- Affiche un flash de feedback de l'activité sélectionnée pendant 2 secondes
- Utilisé pour le feedback visuel dans les carrousels

### 2.4 Options configurables

| Option | Type | Plage/Valeurs | ADR/Notes |
|--------|------|----------------|-----------|
| **Pulse Animation** | boolean | `false` \| `true` | Feedback visuel pulsant |
| **Digital Timer** | boolean | `false` \| `true` | Affichage numérique du temps restant |
| **Activity Emoji** | boolean | `false` \| `true` | Icône d'activité visible |
| **Keep Awake** | boolean | `false` \| `true` | Maintien de l'écran allumé |
| **Clockwise** | boolean | `false` \| `true` | Direction de rotation du cadran |
| **Scale Mode** | string | `'25min'` \| `'50min'` \| `'90min'` | Pré-réglages de durée Pomodoro |
| **Current Duration** | number | 1-7200 secondes | Durée du timer actuel |
| **Sound ID** | string | Ex: `'bell_classic'`, `'ding_soft'` | Identifiant du son de notification |
| **Favorite Activities** | string[] | IDs d'activités | Activités affichées en carousel |
| **Favorite Palettes** | string[] | IDs de palettes | Palettes affichées (max 4) |
| **Long Press Confirm** | number | 1000-5000ms | Durée pour confirmer l'arrêt (ADR-007) |
| **Long Press Start** | number | 1000-5000ms | Durée pour démarrage délibéré (ADR-007) |
| **Start Animation** | number | 300-2000ms | Durée animation démarrage |
| **Show Time Toggle** | boolean | `false` \| `true` | État du eye toggle pour digital timer |
| **Interaction Profile** | string | `'impulsif'` \| `'abandonniste'` \| `'ritualiste'` \| `'veloce'` | Persona utilisateur pour adaptation du comportement |

---

## 3. UserPreferencesContext

### 3.1 Définition du contexte

**Fichier** : `src/contexts/UserPreferencesContext.jsx` (78 lignes)

**Responsabilité** : Gestion des préférences utilisateur simples, actuellement limitées à la sélection de l'outil favori dans AsideZone Layer 1.

**Structure du contexte** :

```typescript
{
  favoriteToolMode: string,              // 'activities' | 'colors' | 'commands' | 'none'
  setFavoriteToolMode: (mode: string) => Promise<void>,
  isLoaded: boolean,
}
```

### 3.2 Valeurs par défaut

| Propriété | Valeur | Notes |
|-----------|--------|-------|
| `favoriteToolMode` | `'commands'` | Outil par défaut : barre de commandes rapides |
| `isLoaded` | `false` (initialement) | Flag de chargement AsyncStorage |

**AsyncStorage** : Clé `@ResetPulse:favoriteToolMode`

### 3.3 Méthodes de mise à jour

**`setFavoriteToolMode(newMode: string)`**
```javascript
const setFavoriteToolMode = async (newMode) => {
  try {
    setFavoriteToolModeState(newMode);
    await AsyncStorage.setItem(STORAGE_KEY, newMode);
  } catch {
    // Silently fail
  }
};
```

- Met à jour l'état local immédiatement
- Persiste dans AsyncStorage de façon asynchrone
- Les erreurs sont ignorées silencieusement

### 3.4 Options configurables

| Option | Type | Valeurs | Description |
|--------|------|---------|-------------|
| **Favorite Tool Mode** | string | `'activities'` \| `'colors'` \| `'commands'` \| `'none'` | Quel outil favori afficher dans AsideZone Layer 1 |

**Comportement** :
- `'activities'` : Affiche carousel d'activités favorites
- `'colors'` : Affiche sélecteur de couleurs
- `'commands'` : Affiche barre de commandes rapides
- `'none'` : Cache l'outil favori

---

## 4. TimerPaletteContext

### 4.1 Définition du contexte

**Fichier** : `src/contexts/TimerPaletteContext.jsx` (142 lignes)

**Responsabilité** : Gestion isolée des palettes de couleurs du timer (séparée du thème global pour flexibilité).

**Structure du contexte** :

```typescript
{
  // État de la palette
  currentPalette: string,                // Clé de palette (ex: 'serenity', 'terra')
  paletteInfo: {
    name: string,
    isPremium: boolean,
    colors: string[],
  },
  paletteColors: string[],              // Array de 4 couleurs
  timerColors: {
    energy: string,
    focus: string,
    calm: string,
    deep: string,
  },
  selectedColorIndex: number,           // 0-3
  currentColor: string,

  // Setters
  setPalette: (paletteName: string) => void,
  setColorIndex: (index: number) => void,
  setColorByType: (type: 'energy' | 'focus' | 'calm' | 'deep') => void,

  // Helpers
  isCurrentPalettePremium: () => boolean,
  getAvailablePalettes: (isPremiumUser?: boolean) => string[],
}
```

### 4.2 Valeurs par défaut

| Propriété | Valeur | Notes |
|-----------|--------|-------|
| `currentPalette` | `'serenity'` | Palette par défaut |
| `selectedColorIndex` | `0` | Première couleur (corail rosé) |
| `paletteInfo` | Palette 'serenity' | Récupérée de `TIMER_PALETTES` |
| `paletteColors` | 4 couleurs | Selon palette sélectionnée |

### 4.3 Méthodes de mise à jour

**`setPalette(paletteName: string)`**
- Valide que la palette existe dans `TIMER_PALETTES`
- Réinitialise `selectedColorIndex` à 0

**`setColorIndex(index: number)`**
- Valide index entre 0-3
- Met à jour la couleur sélectionnée

**`setColorByType(type: string)`**
- Mappe type (`'energy'`, `'focus'`, `'calm'`, `'deep'`) à index
- Utilise `setColorIndex` en interne

### 4.4 Options configurables

| Option | Type | Valeurs | Description |
|--------|------|---------|-------------|
| **Current Palette** | string | IDs de palettes (ex: 'serenity', 'terra', 'softLaser') | Palette active |
| **Selected Color Index** | number | 0-3 | Quelle couleur de la palette est sélectionnée |

**Helpers** :
- `isCurrentPalettePremium()` : Vérifie si la palette actuelle est premium
- `getAvailablePalettes(isPremiumUser)` : Retourne palettes disponibles selon statut

---

## 5. PurchaseContext

### 5.1 Définition du contexte

**Fichier** : `src/contexts/PurchaseContext.jsx` (356 lignes)

**Responsabilité** : Gestion complète des achats premium via RevenueCat avec caching intelligent et fallback réseau.

**Structure du contexte** :

```typescript
{
  isPremium: boolean,
  isLoading: boolean,
  isPurchasing: boolean,                // Prevent double-purchase
  customerInfo: RevenueCatCustomerInfo | null,

  // Actions
  purchaseProduct: (productIdentifier: string) => Promise<{
    success: boolean,
    error?: string,
    cancelled?: boolean,
    isNetworkError?: boolean,
    isStoreError?: boolean,
    isPaymentPending?: boolean,
  }>,

  restorePurchases: () => Promise<{
    success: boolean,
    hasPremium?: boolean,
    error?: string,
    isNetworkError?: boolean,
  }>,

  getOfferings: () => Promise<RevenueCatOffering | { error: string, message: string }>,
}
```

### 5.2 Valeurs par défaut

| Propriété | Valeur | Notes |
|-----------|--------|-------|
| `isPremium` | `false` | Assume utilisateur gratuit par défaut |
| `isLoading` | `true` | En cours de chargement initial |
| `isPurchasing` | `false` | Pas d'achat en cours |
| `customerInfo` | `null` | Données RevenueCat |

**Cache** :
- Clé : `revenuecat_customer_info`
- TTL : 24 heures
- Permet UI rapide au relancement

### 5.3 Méthodes de mise à jour

**`purchaseProduct(productIdentifier: string)`**
```javascript
purchaseProduct(productIdentifier) => Promise<{ success, error?, ... }>
```

Workflow :
1. Vérifie `isPurchasing` pour éviter double-achat
2. Invalide le cache
3. Essaie d'obtenir le package via `getOfferings()`
4. Utilise `purchasePackage()` (préféré) ou fallback `purchaseProduct()`
5. Récupère les détails de transaction
6. Enregistre auprès de Mixpanel (M7.5)
7. Gère erreurs réseau/store/paiement

**Gestion d'erreurs** :
- `PURCHASE_CANCELLED_ERROR` : Retourne `{ success: false, cancelled: true }`
- `NETWORK_ERROR` : Retourne message en FR, flag `isNetworkError`
- `STORE_PROBLEM_ERROR` : Retourne flag `isStoreError`
- `PAYMENT_PENDING_ERROR` : Retourne flag `isPaymentPending`

**`restorePurchases()`**
- Force refresh depuis serveur RevenueCat (ignore cache)
- Retourne `{ success, hasPremium }`
- Gère erreurs réseau

**`getOfferings()`**
- Récupère les offres disponibles depuis RevenueCat
- Debug logging détaillé pour troubleshooting
- Retourne `offerings.current` ou `{ error, message }`

### 5.4 Caching & Persistence

**Cache Strategy** :

```
Initialization Flow:
1. Check cache (24h TTL) → Set UI immediately
2. Configure SDK + fetch fresh data in background
3. Update UI with fresh data
4. Save fresh data to cache
5. Fallback to cache if network fails
```

**Clé de cache** : `revenuecat_customer_info`
**Structure** : `{ isPremium: boolean, timestamp: number }`
**TTL** : 24 heures

---

## 6. ModalStackContext

### 6.1 Définition du contexte

**Fichier** : `src/contexts/ModalStackContext.jsx` (101 lignes)

**Responsabilité** : Gestion d'une pile de modales imbriquées (FIFO) pour résoudre les problèmes de deadlock modal (U6).

**Structure du contexte** :

```typescript
{
  // État
  modalStack: Array<{
    id: string,
    Component: React.ComponentType,
    props: Record<string, any>,
  }>,

  // Actions
  push: (Component: React.ComponentType, props?: {}) => string,  // Retourne ID
  pop: () => void,                    // Pop le top
  popById: (modalId: string) => void,
  clear: () => void,                 // Clear tout

  // Queries
  depth: number,
  isEmpty: boolean,
}
```

### 6.2 Valeurs par défaut

| Propriété | Valeur | Notes |
|-----------|--------|-------|
| `modalStack` | `[]` | Pile vide initialement |
| `depth` | `0` | Nombre de modales |
| `isEmpty` | `true` | Pas de modales |

### 6.3 Méthodes de mise à jour

**`push(Component, props)`**
- Génère ID unique : `modal-{timestamp}-{random}`
- Ajoute modale à la pile
- Retourne l'ID pour fermeture ultérieure

**`pop()`**
- Supprime la modale du top (LIFO)
- Warn si pile vide

**`popById(modalId)`**
- Supprime modale spécifique par ID
- Permet fermeture depuis la modale elle-même

**`clear()`**
- Vide toute la pile

---

## 7. Relations entre contextes

### Hiérarchie de Providers

**App.js** :

```
App (DEV_MODE check)
├─ UserPreferencesProvider
│  └─ DevPremiumProvider
│     └─ GestureHandlerRootView
│        └─ ErrorBoundary
│           └─ ThemeProvider
│              └─ PurchaseProvider
│                 └─ ModalStackProvider
│                    └─ AppContent
│                       └─ TimerPaletteProvider
│                          └─ (OnboardingFlow | TimerScreen)
│                             └─ ModalStackRenderer
```

**Note** : `TimerOptionsProvider` est wrapped dans `TimerScreen` component

### Dépendances entre contextes

| Source | Dépend de | Notes |
|--------|-----------|-------|
| **TimerOptionsContext** | AsyncStorage | Persistence |
| **UserPreferencesContext** | AsyncStorage | Persistence simple |
| **TimerPaletteContext** | AsyncStorage, TIMER_PALETTES config | Persistence + validation |
| **PurchaseContext** | RevenueCat SDK, AsyncStorage | Cache intelligent |
| **ModalStackContext** | (aucune) | Indépendant |
| **usePremiumStatus hook** | PurchaseContext, DevPremiumContext | Merge RevenueCat + dev override |

---

## 8. AsyncStorage Schema

**Clés de persistence** :

| Clé | Contexte | Type | Notes |
|-----|----------|------|-------|
| `@ResetPulse:timerOptions` | TimerOptionsContext | JSON object | Toutes les options persistées |
| `@ResetPulse:favoriteToolMode` | UserPreferencesContext | string | Outil favori (simple) |
| `@ResetPulse:timerPalette` | TimerPaletteContext | string | ID de palette |
| `@ResetPulse:selectedColor` | TimerPaletteContext | number | Index de couleur (0-3) |
| `revenuecat_customer_info` | PurchaseContext | JSON | `{ isPremium, timestamp }` |
| `user_timer_config` | Onboarding → TimerOptionsContext | JSON | Temp, supprimée après lecture |
| `user_sound_config` | Onboarding → TimerOptionsContext | JSON | Temp, supprimée après lecture |
| `user_interface_config` | Onboarding → TimerOptionsContext | JSON | Temp, supprimée après lecture |

---

**Report Generated**: 2025-12-20
**Source**: Codebase exploration of Timer-related Contexts
**Scope**: Context definitions, defaults, update methods, persistence, dependencies
