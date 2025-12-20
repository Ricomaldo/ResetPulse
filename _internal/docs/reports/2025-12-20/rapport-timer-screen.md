---
created: '2025-12-20'
updated: '2025-12-20'
status: active
report_type: architecture
component: TimerScreen.jsx
---

# Rapport d'Architecture : TimerScreen.jsx

## 1. Vue d'ensemble

**TimerScreen.jsx** est le point d'entrée principal de l'application ResetPulse. Il orchestre un système à deux zones (DialZone + AsideZone) avec une gestion d'état de minuteur basée sur trois états (`REST`, `RUNNING`, `COMPLETE`). La structure utilise un pattern wrapper où TimerScreen setup les providers (SafeAreaProvider + TimerOptionsProvider) et TimerScreenContent gère la logique interne. Le composant expose une interface de callback pour synchroniser l'état du minuteur avec les composants enfants tout en maintenant une séparation claire des responsabilités.

## 2. Composants principaux

| Composant | Rôle | Emplacement en hiérarchie | Props critique |
|-----------|------|---------------------------|-----------------|
| **TimerScreen** | Wrapper + Providers | Root | Aucun |
| **TimerScreenContent** | Logique principale | Child de SafeAreaProvider | Gère state & callbacks |
| **SafeAreaView** | Container sécurisé | Parent de zones | backgroundColor, edges |
| **DialZone** | Affichage dial (62% portrait, 100% landscape) | Sibling de AsideZone | onDialTap, onTimerRef, onTimerComplete, isLandscape |
| **AsideZone** | BottomSheet 3-snap (portrait uniquement) | Sibling de DialZone (portrait only) | timerState, displayMessage, onPlay, onReset, onStop |
| **TwoTimersModal** | Modale milestone après 2 timers | Overlay (transparent) | visible, onClose, onExplore |
| **PremiumModal** | Modale paywall IAP | Overlay (transparent) | visible, onClose, highlightedFeature |

## 3. Imports de composants enfants

| Import | Chemin | Description |
|--------|--------|-------------|
| **DialZone** | `src/components/layout/DialZone.jsx` | Zone dial centrée - contient TimeTimer + gesture handling |
| **AsideZone** | `src/components/layout/AsideZone.jsx` | BottomSheet persistent + MessageZone + FavoriteToolBox/ToolBox (3-snap) |
| **TwoTimersModal** | `src/components/modals/TwoTimersModal.jsx` | Modale celebration après 2 timers complétés (ADR-003) |
| **PremiumModal** | `src/components/modals/PremiumModal.jsx` | Modale paywall avec RevenueCat IAP (purchase + restore) |
| **useTheme()** | `src/theme/ThemeProvider.jsx` | Hook fournisseur thème (light/dark/auto mode) |
| **useTimerOptions()** | `src/contexts/TimerOptionsContext.jsx` | Context provider pour durée, activité, persistance |
| **useTimerKeepAwake()** | `src/hooks/useTimerKeepAwake.js` | Hook pour garder écran allumé durant timer |
| **useScreenOrientation()** | `src/hooks/useScreenOrientation.js` | Hook détection portrait/landscape avec useWindowDimensions |
| **useTranslation()** | `src/hooks/useTranslation.js` | Hook i18n (15 langues supportées) |
| **analytics** | `src/services/analytics.js` | Service Mixpanel pour tracking événements |
| **activityMessages** | `src/config/activityMessages.js` | Utility pour messages dynamiques par activité |

## 4. Props passées aux composants

### DialZone
```javascript
<DialZone
  onRunningChange={setIsTimerRunning}          // Callback: sync running state
  onTimerRef={(ref) => { timerRef.current = ref; }}  // Callback: expose timer methods
  onDialTap={handleDialTap}                   // Callback: REST→START, RUNNING→STOP, COMPLETE→RESET
  onTimerComplete={handleTimerComplete}       // Callback: trigger modales + analytics
  isLandscape={isLandscape}                   // Boolean: 62% height (portrait) vs 100% (landscape)
/>
```

**DialZone internals** (pour référence):
- Passe `onRunningChange`, `onTimerRef`, `onDialTap`, `onTimerComplete` à TimeTimer
- TimeTimer retourne un hook useTimer qui gère la logique de timer

### AsideZone (Portrait uniquement - conditionnel)
```javascript
<AsideZone
  timerState={timerState}                     // String: 'REST' | 'RUNNING' | 'COMPLETE' (source of truth animations)
  displayMessage={displayMessage}             // String: Message dynamique activity-based
  isCompleted={isTimerCompleted}             // Boolean: Timer completed?
  flashActivity={flashActivity}               // Activity obj ou null: Flash feedback quand activity sélectionnée
  isTimerRunning={isTimerRunning}            // Boolean: Currently running?
  isTimerCompleted={isTimerCompleted}        // Boolean: Currently completed?
  onPlay={handlePlayPause}                    // Callback: REST→START, RUNNING→STOP, COMPLETE→RESET
  onReset={handleReset}                       // Callback: COMPLETE→REST
  onStop={handleStop}                         // Callback: RUNNING→REST via rewind animation
  onOpenSettings={() => setSettingsModalVisible(true)}  // Deprecated callback (not used)
  onSnapChange={() => setDisplayMessage('')} // Callback: Clears message quand snap change
/>
```

**AsideZone Structure** (pour référence):
- BottomSheet 3-snap: 15% (FavoriteToolBox), 38% (ToolBox), 90% (SettingsPanel)
- MessageZone overlay à ~28% du bottom
- SheetContent: rendu des layers avec Animated.View (fade opacity based on snap index)

### TwoTimersModal
```javascript
<TwoTimersModal
  visible={twoTimersModalVisible}    // Boolean: Affiche modale?
  onClose={() => setTwoTimersModalVisible(false)}  // Callback: Ferme modale
  onExplore={() => setPremiumModalVisible(true)}   // Callback: Ouvre PremiumModal
/>
```

### PremiumModal
```javascript
<PremiumModal
  visible={premiumModalVisible}      // Boolean: Affiche modale?
  onClose={() => setPremiumModalVisible(false)}    // Callback: Ferme modale
  highlightedFeature="toutes les couleurs et activités"  // String: Feature text for tracking
/>
```

## 5. Logique de rendu principale

### State Management (7 states + 1 ref)
```javascript
// Timer state
const [isTimerRunning, setIsTimerRunning] = useState(false);
const [isTimerCompleted, setIsTimerCompleted] = useState(false);
const [timerState, setTimerState] = useState('REST'); // 'REST' | 'RUNNING' | 'COMPLETE'

// UI state
const [settingsModalVisible, setSettingsModalVisible] = useState(false);
const [twoTimersModalVisible, setTwoTimersModalVisible] = useState(false);
const [premiumModalVisible, setPremiumModalVisible] = useState(false);
const [displayMessage, setDisplayMessage] = useState('');

// Refs
const timerRef = useRef(null);  // Expose timer methods to handlers
```

### Conditional Rendering Logique

**Portrait vs Landscape** (lines 173-187):
```javascript
{!isLandscape && (
  <AsideZone {...props} />  // AsideZone hidden in landscape (zen mode)
)}
```
- Portrait (width <= height): AsideZone visible + DialZone 62% height
- Landscape (width > height): DialZone 100% height, AsideZone hidden

**Modal Visibility** (lines 189-201):
- TwoTimersModal: visible si `twoTimersModalVisible` (triggered par handleTimerComplete)
- PremiumModal: visible si `premiumModalVisible` (triggered par TwoTimersModal's onExplore OR other sources)

### Message Display Logic (lines 40-50, 79-84)
```javascript
const computeDisplayMessage = useCallback((running, isComplete) => {
  const activityId = currentActivity?.id || 'none';

  if (isComplete) {
    return getActivityEndMessage(activityId, t);      // "Timer finished"
  }
  if (running) {
    return getActivityStartMessage(activityId, t);    // "Focus"
  }
  return t('invitation');                              // "Tap to start"
}, [currentActivity, t]);
```

Message sync via 50ms interval (lines 53-66):
- Poll timerRef.current state every 50ms
- Recompute message freshly to avoid stale translations
- Clears on flashActivity change (lines 80-84)

### Timer State Derivation (lines 68-77)
```javascript
// Update timerState based on isTimerRunning + isTimerCompleted
useEffect(() => {
  if (isTimerCompleted) {
    setTimerState('COMPLETE');
  } else if (isTimerRunning) {
    setTimerState('RUNNING');
  } else {
    setTimerState('REST');
  }
}, [isTimerRunning, isTimerCompleted]);
```
**Source of truth**: timerState drives animations in AsideZone

### Handler Logic

**handleDialTap** (lines 94-111):
- COMPLETE → resetTimer()
- RUNNING → stopTimer()
- REST → startTimer()

**handlePlayPause** (lines 114-129):
- Same as handleDialTap (dual control)

**handleReset** (lines 132-136):
- COMPLETE → resetTimer()

**handleStop** (lines 139-143):
- RUNNING → stopTimer() (via long press)

**handleTimerComplete** (lines 146-154):
- Increment completed timers count
- Show TwoTimersModal après 2 timers si !hasSeenTwoTimersModal
- Track milestone in Mixpanel

## 6. Context/State usage

### TimerOptionsContext (Provider + Consumer)
```javascript
import { TimerOptionsProvider, useTimerOptions } from '../contexts/TimerOptionsContext';

const {
  incrementCompletedTimers,      // Function: increment completed count
  hasSeenTwoTimersModal,         // Boolean: persist modal visibility
  setHasSeenTwoTimersModal,      // Function: set seen flag
  flashActivity,                 // Activity obj: feedback flash state
  currentActivity,               // Activity obj: current selected activity
} = useTimerOptions();
```

**Provider Wrapper** (lines 209-211): TimerScreenContent wrapped by TimerOptionsProvider

### ThemeProvider (useTheme hook)
```javascript
const theme = useTheme();
// Usage: theme.colors.background (SafeAreaView backgroundColor)
```

### useTranslation (i18n hook)
```javascript
const t = useTranslation();
// Returns callback: t(key, options?)
// Usage: t('invitation'), getActivityStartMessage(id, t)
```

### useScreenOrientation (custom hook)
```javascript
const { isLandscape } = useScreenOrientation();
// Detects width > height via useWindowDimensions
```

### useTimerKeepAwake (custom hook)
```javascript
useTimerKeepAwake();
// Activates expo-keep-awake conditionally based on isRunning + context setting
```

## 7. Technical Notes

### Architecture Pattern
- **Two-Zone Layout**: DialZone (always) + AsideZone (portrait only)
- **Callback-Driven State Sync**: timerRef.current exposes methods; callbacks sync state to parent
- **Modal Stack**: TwoTimersModal → PremiumModal chaining (onExplore callback)

### Critical Data Flows
1. **Timer State**: timerRef.current (running, isCompleted) → local state (50ms poll) → timerState
2. **Activity Message**: currentActivity + timer state → computeDisplayMessage → displayMessage
3. **Modal Trigger**: completedTimers == 2 → TwoTimersModal → onExplore → PremiumModal

### Performance Considerations
- **useCallback** on computeDisplayMessage to stabilize dependency array
- **50ms interval** for timer state polling (balance responsiveness vs. performance)
- **Ref-based timer access** avoids stale timer object issues

### Accessibility
- SafeAreaView respects top/bottom safe areas
- Modal accessibility props (accessibilityViewIsModal, accessibilityLabel, etc.)

### File Structure
```
src/
├── screens/
│   └── TimerScreen.jsx          ← You are here
├── components/
│   ├── layout/
│   │   ├── DialZone.jsx
│   │   └── AsideZone.jsx
│   └── modals/
│       ├── TwoTimersModal.jsx
│       └── PremiumModal.jsx
├── contexts/
│   └── TimerOptionsContext.jsx
├── hooks/
│   ├── useTimerKeepAwake.js
│   ├── useScreenOrientation.js
│   └── useTranslation.js
├── theme/
│   └── ThemeProvider.jsx
├── config/
│   └── activityMessages.js
└── services/
    └── analytics.js
```

---

**Report Generated**: 2025-12-20
**Source**: Codebase exploration of TimerScreen.jsx
**Scope**: Component structure, props flow, state management, rendering logic
