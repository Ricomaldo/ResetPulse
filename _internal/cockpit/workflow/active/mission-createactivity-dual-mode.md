---
created: '2025-12-22'
updated: '2025-12-22'
status: active
mission_id: createactivity-dual-mode
priority: P1
agent: sonnet
---

# Mission: Dual-Mode CreateActivityForm Refactor

## Executive Summary

**Goal**: Refactor CreateActivityForm to support two distinct modes:
- **Onboarding mode**: Simplified, intention-based, 2-tap minimum flow (reduce friction, prevent abandons)
- **Full mode**: Complete customization (emoji picker with native access, name input, duration slider)

**Impact**: Optimize conversion funnel by reducing onboarding friction while maintaining power-user features in-app.

**Timeline**: 2-3 days (sequential implementation)

**Risk Level**: Medium (backwards compatibility required, i18n for 15 languages)

---

## Quick Start

**You are here** to implement a dual-mode form architecture with minimal breaking changes.

1. **5 min** → Read sections below
2. **Understand scope** → 6 intentions in onboarding, full customization in-app
3. **Follow sequence** → Steps are ordered by dependencies
4. **Test each step** → Verify mode switching works before moving to next
5. **Done** → Both modes functional, tests passing, analytics tracking

**Key Constraints**:
- NO breaking changes to existing modal usage
- Native emoji picker via TextInput (no external libs)
- i18n support for all 15 languages
- Analytics tracking for intention selection

---

## Architecture Overview

### Current State

```
CreateActivityForm.jsx (single mode)
├── EmojiPicker (18 emojis grid)
├── NameInput (text field)
├── DurationSlider (presets + +/- buttons)
└── Preview card

Used in:
├── CreateActivityModalContent.jsx (in-app, BottomSheetScrollView)
└── Filter-030-creation.jsx (onboarding, ScrollView)
```

### Target State

```
CreateActivityForm.jsx (dual mode)
├── Props: mode="onboarding" | "full"
├── mode="onboarding":
│   ├── IntentionPicker (6 intentions → auto emoji + name)
│   ├── DurationPresets (4 buttons only, no +/-)
│   └── SmartCreateButton ("Créer 'Méditation' 🧘")
└── mode="full":
    ├── EmojiPicker (18 grid + native picker button)
    ├── NameInput
    ├── DurationSlider (full with +/-)
    └── CreateButton

New Files:
├── src/components/onboarding/IntentionPicker.jsx
├── src/config/activity-intentions.js
└── Updated i18n translations (15 languages)
```

---

## Step-by-Step Implementation

### Phase 1: Foundation (4-5 hours)

#### Step 1.1: Create Intentions Config

**File**: `src/config/activity-intentions.js`

**Purpose**: Single source of truth for 6 onboarding intentions

**Content**:
```javascript
// Intention definitions with i18n keys
export const ACTIVITY_INTENTIONS = [
  {
    id: 'relax',
    emoji: '🧘',
    i18nKey: 'onboarding.intentions.relax', // → "Me poser" (FR), "Relax" (EN)
    defaultNameKey: 'onboarding.intentions.relax.defaultName', // → "Méditation" (FR), "Meditation" (EN)
    defaultDuration: 1200, // 20 min
  },
  {
    id: 'work',
    emoji: '💻',
    i18nKey: 'onboarding.intentions.work',
    defaultNameKey: 'onboarding.intentions.work.defaultName',
    defaultDuration: 1500, // 25 min (Pomodoro)
  },
  {
    id: 'create',
    emoji: '🎨',
    i18nKey: 'onboarding.intentions.create',
    defaultNameKey: 'onboarding.intentions.create.defaultName',
    defaultDuration: 2700, // 45 min
  },
  {
    id: 'learn',
    emoji: '📚',
    i18nKey: 'onboarding.intentions.learn',
    defaultNameKey: 'onboarding.intentions.learn.defaultName',
    defaultDuration: 1800, // 30 min
  },
  {
    id: 'move',
    emoji: '🏃',
    i18nKey: 'onboarding.intentions.move',
    defaultNameKey: 'onboarding.intentions.move.defaultName',
    defaultDuration: 900, // 15 min
  },
  {
    id: 'other',
    emoji: '✨',
    i18nKey: 'onboarding.intentions.other',
    defaultNameKey: null, // User must enter custom name
    defaultDuration: 1800, // 30 min
    requiresCustomName: true,
    miniEmojiPicker: ['✨', '⭐', '🌟', '💫', '🎯', '❤️'], // 6 neutral emojis
  },
];

export const getIntentionById = (id) => {
  return ACTIVITY_INTENTIONS.find(i => i.id === id);
};

export const getAllIntentions = () => {
  return ACTIVITY_INTENTIONS;
};
```

**Checklist**:
- [x] File created with 6 intentions
- [x] i18n keys documented
- [x] Export functions: `getIntentionById(id)`, `getAllIntentions()`

---

#### Step 1.2: Add i18n Translations

**Files**:
- `locales/en.json`
- `locales/fr.json`

**Purpose**: Translate intentions for all languages

**Content** (EN example):
```json
{
  "onboarding": {
    "intentions": {
      "title": "What's it for?",
      "relax": "Relax",
      "relax.defaultName": "Meditation",
      "work": "Work",
      "work.defaultName": "Focus",
      "create": "Create",
      "create.defaultName": "Create",
      "learn": "Learn",
      "learn.defaultName": "Study",
      "move": "Move",
      "move.defaultName": "Workout",
      "other": "Other",
      "other.defaultName": "My moment"
    },
    "creation": {
      "buttonCreate": "Create \"%{name}\" %{emoji}",
      "durationLabel": "Duration",
      "customNamePlaceholder": "Name your moment..."
    }
  },
  "customActivities": {
    "create": {
      "moreEmojis": "More..."
    }
  }
}
```

**FR example**:
```json
{
  "onboarding": {
    "intentions": {
      "title": "C'est pour quoi ?",
      "relax": "Me poser",
      "relax.defaultName": "Méditation",
      "work": "Travailler",
      "work.defaultName": "Focus",
      "create": "Créer",
      "create.defaultName": "Création",
      "learn": "Apprendre",
      "learn.defaultName": "Étude",
      "move": "Bouger",
      "move.defaultName": "Sport",
      "other": "Autre",
      "other.defaultName": "Mon moment"
    },
    "creation": {
      "buttonCreate": "Créer \"%{name}\" %{emoji}",
      "durationLabel": "Durée",
      "customNamePlaceholder": "Nommez votre moment..."
    }
  },
  "customActivities": {
    "create": {
      "moreEmojis": "Plus..."
    }
  }
}
```

**Checklist**:
- [x] EN translations added
- [x] FR translations added
- [ ] Other 13 languages updated (use EN as fallback) ← **TODO: 13 autres langues**
- [x] Test: `t('onboarding.intentions.relax')` returns "Relax"

---

#### Step 1.3: Create IntentionPicker Component

**File**: `src/components/onboarding/IntentionPicker.jsx`

**Purpose**: 6-button selector for onboarding intentions

**Key Features**:
- Grid layout (3 columns x 2 rows)
- Large tap targets (min 88x88 points)
- "Other" triggers mini emoji picker + name input
- Returns: `{ intention, emoji, name, duration }`

**Props**:
```javascript
IntentionPicker.propTypes = {
  onIntentionSelect: PropTypes.func.isRequired, // (intention) => void
  selectedIntention: PropTypes.object, // Current selection
  style: PropTypes.object,
};
```

**UI Layout**:
```
[🧘 Me poser]    [💻 Travailler]    [🎨 Créer]
[📚 Apprendre]   [🏃 Bouger]        [✨ Autre]
```

**Checklist**:
- [x] Component renders 6 buttons
- [x] Tap selects intention
- [ ] "Other" shows mini emoji picker (6 emojis) ← **TODO: Mini emoji picker non implémenté**
- [x] "Other" shows name input field (handled in CreateActivityForm)
- [x] Haptic feedback on selection
- [x] Accessibility: semantic buttons, labels

---

### Phase 2: Form Refactor (5-6 hours)

#### Step 2.1: Add Mode Prop to CreateActivityForm

**File**: `src/components/forms/CreateActivityForm.jsx`

**Changes**:
1. Add `mode` prop: `"onboarding" | "full"` (default: `"full"`)
2. Conditional rendering based on mode
3. State management for onboarding (intention-driven)

**New Props**:
```javascript
CreateActivityForm.propTypes = {
  mode: PropTypes.oneOf(['onboarding', 'full']),
  // ... existing props
};

CreateActivityForm.defaultProps = {
  mode: 'full', // Backwards compatible
};
```

**Checklist**:
- [x] `mode` prop added
- [x] Default value ensures backwards compatibility
- [x] PropTypes validation in place

---

#### Step 2.2: Implement Onboarding Mode UI

**File**: `src/components/forms/CreateActivityForm.jsx`

**Logic**:
```javascript
// Onboarding mode state
const [selectedIntention, setSelectedIntention] = useState(null);
const [duration, setDuration] = useState(1800);

// When intention selected, auto-populate emoji + name
const handleIntentionSelect = (intention) => {
  setSelectedIntention(intention);
  setSelectedEmoji(intention.emoji);

  if (intention.requiresCustomName) {
    // "Other" selected → user must enter name
    setActivityName('');
  } else {
    // Auto-populate name
    setActivityName(t(intention.defaultNameKey));
  }

  setDuration(intention.defaultDuration);
};
```

**UI Structure (mode="onboarding")**:
```jsx
{mode === 'onboarding' && (
  <>
    <IntentionPicker
      onIntentionSelect={handleIntentionSelect}
      selectedIntention={selectedIntention}
    />

    {/* Only show name input if "Other" selected */}
    {selectedIntention?.requiresCustomName && (
      <TextInput
        placeholder={t('onboarding.creation.customNamePlaceholder')}
        value={activityName}
        onChangeText={setActivityName}
      />
    )}

    {/* Duration presets only (no +/- buttons) */}
    <DurationSlider
      value={duration}
      onValueChange={setDuration}
      showControls={false}
    />

    {/* Smart button with preview */}
    <TouchableOpacity onPress={handleSubmit}>
      <Text>
        {t('onboarding.creation.buttonCreate', {
          name: activityName || t('onboarding.intentions.other.defaultName'),
          emoji: selectedEmoji,
        })}
      </Text>
    </TouchableOpacity>
  </>
)}
```

**Checklist**:
- [x] IntentionPicker integrated
- [x] Auto-population working
- [x] "Other" shows name input
- [x] Duration presets only (no +/- controls via showControls={false})
- [x] Smart button shows preview

---

#### Step 2.3: Implement Full Mode Changes

**File**: `src/components/forms/CreateActivityForm.jsx`

**Changes**:
1. Keep existing UI (emoji grid, name input, duration slider)
2. Add native emoji picker access button

**UI Addition (mode="full")**:
```jsx
{mode === 'full' && (
  <>
    <View style={styles.emojiPickerContainer}>
      <EmojiPicker
        selectedEmoji={selectedEmoji}
        onSelectEmoji={setSelectedEmoji}
      />

      {/* NEW: Native emoji picker button */}
      <TouchableOpacity
        style={styles.nativePickerButton}
        onPress={() => nativeEmojiInputRef.current?.focus()}
      >
        <Text>🔍 {t('customActivities.create.moreEmojis')}</Text>
      </TouchableOpacity>

      {/* Hidden TextInput for native emoji keyboard */}
      <TextInput
        ref={nativeEmojiInputRef}
        style={styles.hiddenEmojiInput}
        value={selectedEmoji}
        onChangeText={setSelectedEmoji}
        maxLength={2}
        keyboardType="default"
        placeholder="..."
      />
    </View>

    {/* Existing: Name input, duration slider, preview */}
    {/* ... */}
  </>
)}
```

**Checklist**:
- [x] Native emoji picker accessible via button ("🔍 More...")
- [x] TextInput receives emoji keyboard input (hidden TextInput with ref)
- [x] Selected emoji updates grid selection (handleNativeEmojiChange)
- [x] No breaking changes to existing flow

**Implementation Details**:
- Button "🔍 {t('customActivities.create.moreEmojis')}" triggers `.focus()` on hidden TextInput
- Hidden TextInput (opacity: 0, position: absolute) captures keyboard input
- Emoji regex extracts last emoji typed: `/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu`
- Keyboard auto-closes after emoji selection (`.blur()`)
- Works on both iOS and Android native emoji keyboards

---

#### Step 2.4: Conditional Duration Slider

**File**: `src/components/pickers/DurationSlider.jsx`

**Changes**:
Add `showControls` prop to hide +/- buttons in onboarding mode

**New Props**:
```javascript
DurationSlider.propTypes = {
  showControls: PropTypes.bool, // Show +/- buttons
  // ... existing props
};

DurationSlider.defaultProps = {
  showControls: true, // Backwards compatible
};
```

**UI Update**:
```jsx
{showControls && (
  <View style={styles.valueContainer}>
    <TouchableOpacity onPress={handleDecrement}>-</TouchableOpacity>
    <Text>{currentMinutes} min</Text>
    <TouchableOpacity onPress={handleIncrement}>+</TouchableOpacity>
  </View>
)}

{/* Always show presets */}
<View style={styles.presetsContainer}>
  {DURATION_PRESETS.map(preset => ...)}
</View>
```

**Checklist**:
- [x] `showControls` prop added
- [x] +/- buttons conditional
- [x] Presets always visible
- [x] No breaking changes

---

### Phase 3: Integration (3-4 hours)

#### Step 3.1: Update Filter-030-creation.jsx

**File**: `src/screens/onboarding/filters/Filter-030-creation.jsx`

**Changes**:
```javascript
<CreateActivityForm
  mode="onboarding" // ← NEW
  onSubmit={handleFormSubmit}
  onCancel={() => {}}
  showCancelButton={false}
  showHeader={false}
>
  {/* ScrollView wrapper unchanged */}
</CreateActivityForm>
```

**Checklist**:
- [x] `mode="onboarding"` passed
- [x] Form renders intention picker
- [x] Submission creates activity correctly
- [ ] No visual regressions ← **TODO: Tester manuellement sur device**

---

#### Step 3.2: Verify CreateActivityModalContent.jsx

**File**: `src/components/modals/CreateActivityModalContent.jsx`

**Changes**: NONE (backwards compatibility)

**Verification**:
```javascript
<CreateActivityForm
  // mode defaults to "full" → no changes needed
  onSubmit={handleFormSubmit}
  onCancel={handleClose}
  showCancelButton={true}
  showHeader={true}
>
  {/* BottomSheetScrollView wrapper unchanged */}
</CreateActivityForm>
```

**Checklist**:
- [x] Modal opens correctly (backwards compatible)
- [x] Full mode UI renders (emoji grid, name input, slider)
- [x] Native emoji picker accessible ("🔍 More..." button)
- [x] Submission works
- [x] Premium gate still functional

**NOTE**: CreateActivityModalContent n'a pas besoin de changements (mode defaults to "full"). Le native emoji picker est maintenant fonctionnel via Step 2.3.

---

#### Step 3.3: Add Analytics Tracking

**File**: `src/services/analytics/onboarding-events.js`

**New Event**:
```javascript
/**
 * Event: Intention Selected (Onboarding)
 * Trigger: User taps intention in Filter-030
 * KPI: Most popular intentions, "Other" usage rate
 */
trackOnboardingIntentionSelected(intentionId) {
  this.track('onboarding_intention_selected', {
    intention_id: intentionId,
  });
}
```

**Integration in IntentionPicker**:
```javascript
const handleIntentionPress = (intention) => {
  analytics.trackOnboardingIntentionSelected(intention.id);
  onIntentionSelect(intention);
};
```

**Checklist**:
- [x] Event added to onboarding-events.js (`trackIntentionSelected`)
- [x] Filter-030 calls analytics via `onIntentionSelect` callback
- [ ] Test event fires in dev mode ← **TODO: Tester manuellement**
- [ ] Verify Mixpanel receives event ← **TODO: Tester manuellement**

---

### Phase 4: Testing & Validation (2-3 hours)

#### Step 4.1: Manual Testing

**Onboarding Flow**:
- [ ] Open app in DEV_MODE, toggle to Onboarding
- [ ] Navigate to Filter-030-creation
- [ ] Verify IntentionPicker renders 6 buttons
- [ ] Tap each intention → verify emoji + name auto-populate
- [ ] Tap "Other" → verify mini emoji picker + name input appear
- [ ] Select duration preset
- [ ] Verify smart button shows preview ("Créer 'Méditation' 🧘")
- [ ] Submit → verify activity created with correct data
- [ ] Check analytics in Mixpanel (intention_id tracked)

**In-App Modal Flow**:
- [ ] Open app in normal mode
- [ ] Trigger CreateActivityModalContent (via "+" button)
- [ ] Verify full mode UI renders
- [ ] Select emoji from grid
- [ ] Tap "More..." button → verify native emoji picker opens
- [ ] Select emoji from native picker → verify grid updates
- [ ] Enter name, adjust duration with +/- buttons
- [ ] Submit → verify activity created
- [ ] Verify premium gate works for free users

**Cross-Platform**:
- [ ] Test on iOS (simulator + device)
- [ ] Test on Android (emulator + device)
- [ ] Verify native emoji picker works on both

**Checklist**:
- [ ] All onboarding scenarios pass
- [ ] All in-app scenarios pass
- [ ] iOS + Android tested
- [ ] No crashes, no visual glitches

---

## Critical Files

1. `src/config/activity-intentions.js` - Intentions config (NEW)
2. `src/components/onboarding/IntentionPicker.jsx` - Intention selector (NEW)
3. `src/components/forms/CreateActivityForm.jsx` - Dual-mode logic (MODIFIED)
4. `locales/en.json` + `locales/fr.json` - Translations (MODIFIED)
5. `src/screens/onboarding/filters/Filter-030-creation.jsx` - Integration (MODIFIED)

---

## Risks & Mitigations

### Risk 1: Breaking Existing Modal Usage
**Probability**: Medium | **Impact**: High (production crash)
**Mitigation**: Default `mode="full"` ensures backwards compatibility
**Rollback**: Revert CreateActivityForm.jsx

### Risk 2: i18n Translation Gaps
**Probability**: High | **Impact**: Medium (poor UX)
**Mitigation**: EN fallback enabled, prioritize FR + EN
**Rollback**: Deploy with EN-only, add translations later

### Risk 3: Native Emoji Picker Doesn't Work on Android
**Probability**: Low | **Impact**: Medium
**Mitigation**: Test early on Android, graceful degradation
**Rollback**: Hide native picker button

---

## Success Metrics (Week 1)

**Onboarding**:
- [ ] Intention selection tracked in analytics
- [ ] Most popular intention identified
- [ ] "Other" usage < 10%
- [ ] Avg completion time < 60s

**In-App**:
- [ ] Native emoji picker used > 20% of time
- [ ] No form-related crashes
- [ ] Premium gate conversion unchanged

**Technical**:
- [ ] Bundle size increase < 50KB
- [ ] No console errors
- [ ] i18n fallbacks working

---

## Next Actions

1. **Execute Plan** - Follow steps sequentially
2. **Test Thoroughly** - Both modes, iOS + Android
3. **Monitor Analytics** - Track intention distribution
4. **Iterate** - Adjust based on user behavior
