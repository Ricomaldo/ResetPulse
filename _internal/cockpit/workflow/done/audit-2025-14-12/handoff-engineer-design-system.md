---
created: '2025-12-14'
updated: '2025-12-14'
status: active
priority: P1
---

# Handoff: Design System Consolidation

> Réduire la duplication et améliorer la maintenabilité

## Context

Audit #8 Design System a identifié **4 problèmes P1** de duplication/incohérence dans les composants. Aucun problème visuel critique, mais dette technique à résorber.

---

## Task 1: Create Button Component Library (P1)

**Effort**: 3-4h

### Current State (Duplicated)

7 modals définissent des patterns identiques de boutons (~150 lignes dupliquées).

**Files affected**:
- `src/components/modals/PremiumModal.jsx`
- `src/components/modals/DiscoveryModal.jsx`
- `src/components/modals/CreateActivityModal.jsx`
- `src/components/modals/EditActivityModal.jsx`
- `src/components/modals/SettingsModal.jsx`
- `src/components/modals/MoreColorsModal.jsx`
- `src/components/modals/MoreActivitiesModal.jsx`

### Step 1: Create Button Component

**Create**: `src/components/buttons/Button.jsx`

```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export const PrimaryButton = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.brand.primary,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
        },
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.fixed.white} />
      ) : (
        <Text style={[
          styles.text,
          { color: theme.colors.fixed.white },
          textStyle
        ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export const SecondaryButton = ({
  label,
  onPress,
  disabled = false,
  style,
  textStyle
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.brand.primary,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
        },
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.text,
        { color: theme.colors.brand.primary },
        textStyle
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const DestructiveButton = ({
  label,
  onPress,
  disabled = false,
  style,
  textStyle
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.semantic.error,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
        },
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.text,
        { color: theme.colors.fixed.white },
        textStyle
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const TextButton = ({
  label,
  onPress,
  disabled = false,
  style,
  textStyle
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.textButton, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
    >
      <Text style={[
        styles.textButtonLabel,
        { color: theme.colors.text.secondary },
        disabled && styles.disabledText,
        textStyle
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  textButton: {
    padding: 8,
    alignItems: 'center',
  },
  textButtonLabel: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  disabledText: {
    opacity: 0.5,
  },
});
```

### Step 2: Create Index Export

**Create**: `src/components/buttons/index.js`

```javascript
export {
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  TextButton
} from './Button';
```

### Step 3: Update Modals

**Example** (PremiumModal.jsx):

```javascript
// Before
<TouchableOpacity style={styles.primaryButton} onPress={handlePurchase}>
  <Text style={{ color: '#FFFFFF' }}>{t('premium.unlock')}</Text>
</TouchableOpacity>

// After
import { PrimaryButton, TextButton } from '../buttons';

<PrimaryButton
  label={t('premium.unlock')}
  onPress={handlePurchase}
  loading={isLoading}
/>
<TextButton
  label={t('premium.restore')}
  onPress={handleRestore}
/>
```

### Step 4: Remove Duplicated Styles

Delete from each modal's StyleSheet:
- `primaryButton`
- `primaryButtonText`
- `secondaryButton`
- `secondaryButtonText`
- `deleteButton` / `destructiveButton`

### Verification

- [ ] All 7 modals use new Button components
- [ ] Button appearance identical to before
- [ ] Loading states work (PremiumModal)
- [ ] Disabled states work
- [ ] Theme switching still works

---

## Task 2: Fix Hardcoded White Color (P1)

**Effort**: 15 min

### Files to Update (12 instances)

Search and replace:

```javascript
// Before
color: '#FFFFFF'

// After
color: theme.colors.fixed.white
```

**Files**:
1. `PremiumModal.jsx` — Unlock button text
2. `DiscoveryModal.jsx` — Unlock button text
3. `CreateActivityModal.jsx` — Create button text
4. `EditActivityModal.jsx` — Save button text
5. `MoreColorsModal.jsx` — Button text
6. `MoreActivitiesModal.jsx` — Button text
7. `SettingsModal.jsx` — Various button texts (~6 instances)

**Note**: If Task 1 (Button component) is done first, this task becomes unnecessary as the Button component already uses the token.

---

## Task 3: Centralize Modal Overlay Color (P1)

**Effort**: 1h

### Step 1: Add to Theme

**Edit**: `src/theme/colors.js`

```javascript
// Add to colors object
export const colors = {
  // ... existing colors

  overlay: {
    ios: 'rgba(0, 0, 0, 0.4)',
    android: 'rgba(0, 0, 0, 0.5)',
  },
};
```

### Step 2: Update Modals

**8 files to update**:

```javascript
// Before (in each modal)
const overlayColor = Platform.select({
  ios: 'rgba(0, 0, 0, 0.4)',
  android: 'rgba(0, 0, 0, 0.5)',
});

// After
import { Platform } from 'react-native';

const overlayColor = Platform.select(theme.colors.overlay);
```

**Files**:
1. `PremiumModal.jsx:237-238`
2. `DiscoveryModal.jsx:54-55`
3. `EditActivityModal.jsx:137-138`
4. `CreateActivityModal.jsx:134-135`
5. `SettingsModal.jsx:114-115`
6. `TwoTimersModal.jsx:45`
7. `MoreColorsModal.jsx`
8. `MoreActivitiesModal.jsx`

### Verification

- [ ] All modals have consistent overlay opacity
- [ ] iOS appears slightly more transparent than Android
- [ ] Dark mode still works correctly

---

## Task 4: Standardize Border Radius (P2)

**Effort**: 2h

### Issue

Mixed approaches in same files:
- Token: `theme.borderRadius.lg` (12px)
- Responsive: `rs(16, "min")` or `rs(25, "min")`

### Decision Needed

**Option A**: All token-based (simpler)
```javascript
borderRadius: theme.borderRadius.lg  // Always 12px
```

**Option B**: All responsive (scales with device)
```javascript
borderRadius: rs(12, "min")  // Scales proportionally
```

**Option C**: Document intentional differences
- Tokens for UI elements (buttons, cards)
- Responsive for decorative elements (onboarding bubbles)

### Files to Audit

1. `PaletteCarousel.jsx` — Uses both approaches
2. `Filter-010-opening.jsx` — Uses `rs(25, "min")`
3. Other onboarding filters

### Recommendation

Choose **Option C** — document when each approach is appropriate:
- UI components (modals, buttons): Use `theme.borderRadius.*`
- Large decorative elements (onboarding): Use `rs()` for visual impact scaling

---

## Priority Order

1. **Task 1** (Button component) — Biggest impact, reduces 150 lines
2. **Task 3** (Overlay color) — Quick win, improves maintainability
3. **Task 2** (White color) — Likely resolved by Task 1
4. **Task 4** (Border radius) — Can defer, needs design decision

---

## Testing Checklist

### Visual Regression

- [ ] All modals open correctly
- [ ] Button styling unchanged
- [ ] Overlay darkness consistent
- [ ] Theme switching works (light/dark)
- [ ] Onboarding flow unchanged

### Functional

- [ ] Premium purchase flow works
- [ ] Activity create/edit works
- [ ] Settings toggles work
- [ ] Discovery modal triggers correctly

---

## References

- [Design System Report](../reports/design-system.md)
- Audit: `_internal/cockpit/knowledge/findings/2025-12-14_08-design-system.md`
- [Carousel Affordance Legacy](../legacy/decisions-carousel-affordance.md)

---

**Total Effort**: ~5-6h (P1 tasks)
**Impact**: Reduces ~150 lines duplication, improves maintainability
