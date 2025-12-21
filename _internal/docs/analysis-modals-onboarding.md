---
created: '2025-12-21'
updated: '2025-12-21'
status: active
type: analysis
---

# Modales & Onboarding Flow - Complete Mapping

> Analyse complète des modales et filtres onboarding: triggers, actions, contextes

---

## 📱 MODALES (src/components/modals/)

### 1. **PremiumModalContent.jsx**

**Purpose**: Premium paywall with RevenueCat integration

**Trigger Points**:
- `ActivityCarousel.jsx:124` - User taps "+" (show more activities)
- `PaletteCarousel.jsx:273` - User taps "+" (show more colors)
- `CreateActivityModalContent.jsx:96` - Non-premium user tries to create activity
- `DiscoveryModalContent.jsx:65` - User clicks "Unlock" in discovery
- `TimerScreen.jsx:156` - Two timers milestone → "Explore" clicked
- `Filter-090-paywall-discover.jsx:20` - Onboarding paywall triggered

**Actions**:
- ✅ `handlePurchase()` - Trigger RevenueCat purchase flow
- ✅ `handleRestorePurchases()` - Restore previous purchases
- ✅ `onClose()` - Dismiss modal
- 📊 `analytics.trackPaywallViewed(highlightedFeature)` - Track source

**Contexts Used**:
```javascript
- usePurchases()          // IAP logic (RevenueCat)
  ├─ purchaseProduct()
  ├─ restorePurchases()
  ├─ getOfferings()
  └─ isPurchasing

- useAnalytics()          // Mixpanel tracking
  └─ trackPaywallViewed()

- useTranslation()        // i18n

- useModalStack()         // Modal navigation (pop self)
```

**State Management**:
- `isPurchasing` - Purchase in progress
- `isRestoring` - Restore in progress
- `dynamicPrice` - RevenueCat dynamic price
- `purchaseAttempts` - Retry counter (max 3)

---

### 2. **DiscoveryModalContent.jsx**

**Purpose**: Generic premium feature preview (grid of activities/colors)

**Trigger Points**:
- `ActivityCarousel.jsx:177` - User swipes to last item → "View all" CTA
- `PaletteCarousel.jsx:273` - User swipes to last item → "View all" CTA

**Actions**:
- ✅ `handleUnlock()` - Push PremiumModal to stack
- ✅ `handleClose()` - Dismiss modal
- 🎯 Can display custom content via `children` prop

**Contexts Used**:
```javascript
- useModalStack()         // Push premium modal
  └─ push('premium', { ... })

- useTranslation()        // i18n + defaults for buttons
  ├─ t('discovery.defaultCta')
  └─ t('discovery.defaultDismiss')
```

**Props**:
```javascript
{
  title,                    // "Discover More Activities"
  subtitle,                 // Optional description
  tagline,                  // Optional italic tagline
  children,                 // Grid of premium items
  ctaText,                  // Custom "Unlock" text
  dismissText,              // Custom "Not now" text
  highlightedFeature,       // For analytics tracking
  modalId                   // For modal stack
}
```

---

### 3. **CreateActivityModalContent.jsx**

**Purpose**: Create custom activities (Premium feature)

**Trigger Points**:
- `ActivityCarousel.jsx:191` - User taps "Create Activity" button
- User form submission in modal

**Actions**:
- ✅ `handleCreate()` - Save custom activity
  - Validates emoji + name
  - Calls `createActivity(emoji, name, duration)`
  - Calls `onActivityCreated()` callback
  - Auto-gates Premium (shows paywall if free)
- ✅ `handleClose()` - Dismiss modal

**Contexts Used**:
```javascript
- usePremiumStatus()      // Check if user is premium
  └─ isPremium

- useCustomActivities()   // Custom activity CRUD
  └─ createActivity(emoji, name, duration)

- useTranslation()        // i18n

- useModalStack()         // Push premium on gate
  └─ push('premium', { highlightedFeature: 'customActivities' })

- useAnalytics()          // Track free user attempt
  └─ trackCustomActivityCreateAttemptFreeUser()
```

**State Management**:
```javascript
selectedEmoji,            // Emoji picker selection
activityName,             // Text input
duration,                 // Slider (DEFAULT: 30 min = 1800s)
```

**Validation**:
- Emoji required
- Name required (max 20 chars)
- Duration optional (slider)

---

### 4. **EditActivityModalContent.jsx**

**Purpose**: Edit/delete custom activities

**Trigger Points**:
- `ActivityCarousel.jsx:202` - User taps activity edit icon
- User form submission in modal

**Actions**:
- ✅ `handleSave()` - Update custom activity
  - Validates emoji + name
  - Calls `updateActivity(id, emoji, name, duration)`
  - Calls `onActivityUpdated()` callback
- ✅ `handleDelete()` - Delete custom activity
  - Confirmation alert
  - Calls `deleteActivity(id)`
  - Calls `onActivityDeleted()` callback
- ✅ `handleClose()` - Dismiss modal

**Contexts Used**:
```javascript
- useCustomActivities()   // Custom activity CRUD
  ├─ updateActivity(id, emoji, name, duration)
  └─ deleteActivity(id)

- useTranslation()        // i18n

- useAnalytics()          // Track edit/delete
  ├─ trackCustomActivityUpdated()
  └─ trackCustomActivityDeleted()
```

**State Management**:
```javascript
selectedEmoji,            // Pre-loaded from activity.emoji
activityName,             // Pre-loaded from activity.label
duration,                 // Pre-loaded from activity.defaultDuration
```

**Special**: Form pre-fills from `activity` prop on mount

---

### 5. **TwoTimersModalContent.jsx**

**Purpose**: Celebration modal after completing 2 timers (ADR-003 milestone)

**Trigger Points**:
- `TimerScreen.jsx:147` - User completes 2nd timer
  - Calls `handleTimerComplete()`
  - Pushes `'twoTimers'` to modal stack

**Actions**:
- ✅ `handleExplore()` - Opens Premium modal
  - Analytics: `trackTwoTimersModalExploreClicked()`
  - Calls `onExplore?.()` callback
  - Closes modal
- ✅ `handleSkip()` - Dismiss
  - Analytics: `trackTwoTimersModalDismissed()`
  - Closes modal

**Contexts Used**:
```javascript
- useTranslation()        // i18n

- useAnalytics()          // Track interactions
  ├─ trackTwoTimersModalShown()
  ├─ trackTwoTimersModalExploreClicked()
  └─ trackTwoTimersModalDismissed()
```

**No State**: Pure presentational with analytics

---

### 6. **ModalStackRenderer.jsx**

**Purpose**: Central router for all modals (NOT a modal itself)

**Responsibility**:
- Maps modal type to component
- Handles BottomSheetModal wrapper
- Manages visible/hidden state
- Manages animation delays on close

**Modal Types Supported**:
```javascript
'premium'         → PremiumModalContent
'discovery'       → DiscoveryModalContent
'createActivity'  → CreateActivityModalContent
'editActivity'    → EditActivityModalContent
'twoTimers'       → TwoTimersModalContent
```

**Usage Pattern**:
```javascript
// In any component:
const modalStack = useModalStack();

// Push modal
modalStack.push('premium', {
  highlightedFeature: 'activity',
  onClose: () => { /* optional */ }
});

// Close modal (via onClose callback)
onClose();
```

---

## 🎬 ONBOARDING FLOW (src/screens/onboarding/)

### Structure

```
OnboardingFlow.jsx           # Main orchestrator (8 filters)
├─ Filter-010-opening       # Welcome animation
├─ Filter-020-needs         # User needs (work, break, meditation)
├─ Filter-030-creation      # Create custom activity
├─ Filter-040-test          # Test timer (play/stop demo)
├─ Filter-050-notifications # Ask notification permissions
├─ Filter-060-branch        # Branch to "Discover" or "Personalize"
├─ Filter-070-vision-discover    # Show premium features (discover branch)
├─ Filter-080-sound-personalize  # Sound preference selection
├─ Filter-090-paywall-discover   # Premium offer (discover branch only)
└─ Filter-100-interface-personalize  # Interface customization
```

### 1. **OnboardingFlow.jsx** (Main Orchestrator)

**Purpose**: Manage 8-filter funnel with branch logic

**Key State**:
```javascript
currentFilter,              // Current step (0-8)
needs,                      // Selected user needs
timerConfig,                // Chosen timer settings
branch,                     // 'discover' | 'personalize'
notificationPermission,     // Permission status
shouldRequestPermissionLater, // Defer notification ask
soundConfig,                // Sound preference
interfaceConfig             // Interface settings
```

**Navigation**:
- `goToNextFilter()` - Move to next step (with analytics)
- `goToPreviousFilter()` - Move back one step
- `jumpToFilter(n)` - Jump to specific step (dev only)
- `reset()` - Reset entire flow

**Analytics Events**:
```javascript
trackOnboardingStarted()
trackOnboardingStepViewed(filter, stepName)
trackOnboardingStepCompleted(filter, stepName)
trackOnboardingAbandoned(filter, stepName)  // App goes background
```

**Data Persistence**:
- Passes data to each Filter component via props
- `onComplete` callback returns final config

---

### 2. **Filter-010-opening.jsx**

**Type**: Welcome/Breathing animation

**Behavior**:
- 5 breathing cycles (1.5s each = 7.5s total)
- Auto-advances to Filter-020
- User can tap to skip animation

**Props**: `{ onContinue }`

**No State**: Pure animation

---

### 3. **Filter-020-needs.jsx**

**Type**: Multi-select user needs

**Options**:
- Work (💻)
- Break (☕)
- Meditation (🧘)
- Creativity (🎨)
- Study (📚)
- Fitness (💪)
- Sleep (😴)
- Health (🏥)

**Actions**:
- Select 1+ needs
- `onSave()` - Save selections to parent state
- `onBack()` - Return to Filter-010

**State Collected**:
```javascript
needs: ['work', 'meditation', ...]  // Selected activity IDs
```

---

### 4. **Filter-030-creation.jsx**

**Type**: Custom activity creation (simplified, onboarding-specific)

**Fields**:
- Emoji picker
- Activity name (text input)
- Duration slider

**Actions**:
- Create custom activity
- Skip this step
- Back button

**State Collected**:
```javascript
timerConfig: {
  activity: { id, emoji, name, duration },
  ...
}
```

---

### 5. **Filter-040-test.jsx**

**Type**: Interactive timer test

**Behavior**:
- Play button starts 10s demo timer
- Stop button stops timer
- Visual feedback with animations
- Shows "Feel the rhythm" message

**Actions**:
- Play/Stop demo
- Continue to next filter
- Back button

**No State Saved**: Demo only

---

### 6. **Filter-050-notifications.jsx**

**Type**: Notification permission request

**Behavior**:
- Ask to enable notifications
- Option to "Ask Later"
- Option to "Skip"

**Actions**:
- `requestNotificationPermission()` - Triggers iOS/Android permissions
- Skip/Ask Later

**State Collected**:
```javascript
notificationPermission: true | false
shouldRequestPermissionLater: boolean
```

---

### 7. **Filter-060-branch.jsx**

**Type**: Branch decision point

**Options**:
- "Discover Premium" → discover branch
- "Personalize Interface" → personalize branch

**Sets**:
```javascript
branch: 'discover' | 'personalize'
```

**Router**:
- discover → Filter-070 → Filter-080 → Filter-090 → Filter-100 → Done
- personalize → Filter-080 → Filter-100 → Done

---

### 8. **Filter-070-vision-discover.jsx** (Discover Branch Only)

**Type**: Premium features preview

**Shows**:
- Premium activities grid
- Premium colors grid
- Feature descriptions

**Actions**:
- Continue to Filter-080
- Back to Filter-060 (branch re-select)

**No Purchase**: Discovery only (paywall is Filter-090)

---

### 9. **Filter-080-sound-personalize.jsx**

**Type**: Sound preference selection

**Options**:
- Bell (🔔)
- Chime (🎵)
- Silence (🔇)
- Custom upload (if premium)

**State Collected**:
```javascript
soundConfig: {
  selectedSound: 'bell' | 'chime' | 'silence'
}
```

---

### 10. **Filter-090-paywall-discover.jsx** (Discover Branch Only)

**Type**: Premium paywall (soft offer)

**Behavior**:
```javascript
handleTrial() {
  modalStack.push('premium', {
    highlightedFeature: 'onboarding_paywall',
    onClose: () => {
      onComplete('trial')  // Continue with premium status
    }
  });
}

handleSkip() {
  onComplete('skipped')  // Continue as free user
}
```

**Important**: Opens `PremiumModalContent` via modal stack!

---

### 11. **Filter-100-interface-personalize.jsx**

**Type**: UI customization

**Options**:
- Show/hide time display
- Show/hide emoji
- Pulsing animation toggle
- Color scheme selection

**State Collected**:
```javascript
interfaceConfig: {
  showTime: boolean,
  showEmoji: boolean,
  shouldPulse: boolean,
  colorScheme: 'light' | 'dark' | 'auto'
}
```

**Final Step**: Calls `onComplete(data)` with full config

---

## 📊 Context Usage Summary

### Modales

| Context | Used In |
|---------|---------|
| `useModalStack()` | Premium, Discovery, CreateActivity, EditActivity |
| `usePurchases()` | Premium (RevenueCat) |
| `useCustomActivities()` | CreateActivity, EditActivity |
| `usePremiumStatus()` | CreateActivity (premium gate) |
| `useAnalytics()` | Premium, TwoTimers, CreateActivity, EditActivity |
| `useTranslation()` | All modales |
| `useTheme()` | All modales |

### Onboarding

| Context | Used In |
|---------|---------|
| `useModalStack()` | Filter-090 (paywall) |
| `useAnalytics()` | OnboardingFlow (all steps) |
| `useTranslation()` | All filters |
| `useTheme()` | All filters |
| `useNotifications()` | Filter-050 |

---

## 🔄 Flow Diagrams

### Premium Modal Flow

```
ActivityCarousel ("+")
    ↓
DiscoveryModal ("Unlock")
    ↓
PremiumModal
    ├─ Purchase ✅ → Close → Update PurchaseContext
    ├─ Restore ✅ → Close → Update PurchaseContext
    └─ Close ✗ → Dismiss
```

### Custom Activity Flow

```
ActivityCarousel ("Create")
    ↓
CreateActivityModal
    ├─ Premium? YES → Continue create
    │   ├─ Create ✅ → Close → Refresh ActivityCarousel
    │   └─ Cancel ✗ → Close
    └─ Premium? NO → Push PremiumModal
        └─ Purchase → Back to CreateActivityModal
```

### Onboarding Branch Flow

```
Filter-020 (Needs)
    ↓
Filter-030 (Creation)
    ↓
Filter-040 (Test)
    ↓
Filter-050 (Notifications)
    ↓
Filter-060 (Branch Decision)
    ├─ "Discover" → Filter-070 → Filter-080 → Filter-090 (Paywall) → Filter-100 → Done
    └─ "Personalize" → Filter-080 → Filter-100 → Done
```

---

## ✅ Validation Checklist

- [x] All 5 modal content files identified
- [x] All 10 onboarding filter files identified
- [x] Triggers documented for each modal
- [x] Actions (buttons/callbacks) documented
- [x] Contexts and hooks mapped
- [x] State management documented
- [x] Flow diagrams created
- [x] Premium gate logic identified
- [x] Analytics tracking points documented

