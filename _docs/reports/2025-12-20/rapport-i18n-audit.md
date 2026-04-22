---
created: '2025-12-20'
updated: '2025-12-20'
status: active
report_type: audit
component: i18n & Localization
scope: hardcoded-strings-audit
---

# Audit Report : Système i18n & Localization

## 1. Vue d'ensemble i18n

**Framework**: i18n-js 15.6.1
**Locales directory**: `/Users/irimwebforge/dev/apps/resetpulse/locales/`
**Supported languages**: 15 (EN, FR, DE, ES, IT, PT, NL, JA, KO, ZH-Hans, ZH-Hant, AR, RU, SV, NO)

**Setup Quality**: ✅ Excellent
- All UI text properly internationalized
- useTranslation() hook implemented everywhere
- Fallback to English enabled
- Auto-detection via expo-localization active

---

## 2. Structure des locales

### Hiérarchie des clés (11+ sections principales)

```
locales/
├── en.json (16.3 KB, ~343 clés)
│   ├── common.*           # Generic UI labels (OK, Cancel, Close, Settings, etc.)
│   ├── invitation         # Timer ready state: "Tap to start"
│   ├── welcome.*          # App intro screen
│   ├── onboarding.v2.*    # V2 funnel (10 filters) ✓ Complete
│   ├── onboarding.v3.*    # V3 funnel (revised) ✓ Complete
│   ├── timer.*            # Duration/time labels
│   ├── settings.*         # Settings modal (interface, timer, appearance, about, dev)
│   ├── premium.*          # IAP messaging & RevenueCat errors
│   ├── activities.*       # 18 activity labels
│   ├── palettes.*         # 15 palette names
│   ├── sounds.*           # 10 sound completion audio
│   ├── accessibility.*    # a11y descriptions & screen reader
│   ├── discovery.*        # Premium feature discovery modals
│   ├── twoTimers.*        # Milestone modal (after 2 timers)
│   ├── customActivities.* # Custom activity CRUD
│   └── timerMessages.*    # Activity-specific start/end messages
│
├── fr.json (15.3 KB, ~330 clés) - 96% complete
├── de.json (8.1 KB, ~180 clés) - 52% complete
├── es.json (8.1 KB, ~180 clés) - 52% complete
├── it.json (8.0 KB, ~180 clés) - 52% complete
├── pt.json (8.2 KB, ~180 clés) - 52% complete
├── nl.json (7.9 KB, ~150 clés) - 44% complete
├── ja.json (8.7 KB, ~200 clés) - 58% complete
├── ko.json (8.1 KB, ~180 clés) - 52% complete
├── zh-Hans.json (7.4 KB, ~140 clés) - 41% complete
├── zh-Hant.json (7.4 KB, ~140 clés) - 41% complete
├── ar.json (9.1 KB, ~200 clés) - 58% complete
├── ru.json (10.5 KB, ~250 clés) - 73% complete
├── sv.json (7.8 KB, ~150 clés) - 44% complete
└── no.json (7.7 KB, ~150 clés) - 44% complete
```

---

## 3. 🔴 CLÉS CRITIQUES MANQUANTES (Production Risk)

**Status**: BLOCKING - These keys cause runtime errors if purchase flow encounters issues

### 3 clés non définies dans ANY locale file:

#### 1. `common.retry`
- **Location**: `/src/components/modals/PremiumModal.jsx:186, 224`
- **Context**: Purchase retry button after network failure
- **Expected Values**: "Retry" (EN), "Réessayer" (FR), etc.
- **Impact**: HIGH - Retry button shows undefined text

#### 2. `premium.contactSupport`
- **Location**: `/src/components/modals/PremiumModal.jsx:192, 230`
- **Context**: Link text after 3 failed purchase attempts
- **Expected Values**: "Contact Support" (EN), "Contacter le support" (FR), etc.
- **Impact**: HIGH - Contact button shows undefined text

#### 3. `premium.tooManyAttempts`
- **Location**: `/src/components/modals/PremiumModal.jsx:204, 241`
- **Context**: Error message suffix when retries exhausted
- **Expected Values**: "Please contact support if the issue persists." (EN)
- **Impact**: CRITICAL - Error message incomplete in all languages

**Required Fix**: Add these 3 keys to ALL 15 locale files (see Action Plan section)

---

## 4. Statistiques de couverture par langue

| Language | File Size | Key Count | Completion % | Status |
|----------|-----------|-----------|---|---|
| **en.json** | 16.3 KB | ~343 | 100% | ✅ Reference |
| **fr.json** | 15.3 KB | ~330 | 96% | ⚠️ Almost complete |
| **de.json** | 8.1 KB | ~180 | 52% | ❌ 52% |
| **es.json** | 8.1 KB | ~180 | 52% | ❌ 52% |
| **it.json** | 8.0 KB | ~180 | 52% | ❌ 52% |
| **pt.json** | 8.2 KB | ~180 | 52% | ❌ 52% |
| **nl.json** | 7.9 KB | ~150 | 44% | ❌ 44% |
| **ja.json** | 8.7 KB | ~200 | 58% | ❌ 58% |
| **ko.json** | 8.1 KB | ~180 | 52% | ❌ 52% |
| **zh-Hans.json** | 7.4 KB | ~140 | 41% | ❌ 41% |
| **zh-Hant.json** | 7.4 KB | ~140 | 41% | ❌ 41% |
| **ar.json** | 9.1 KB | ~200 | 58% | ❌ 58% |
| **ru.json** | 10.5 KB | ~250 | 73% | ⚠️ 73% |
| **sv.json** | 7.8 KB | ~150 | 44% | ❌ 44% |
| **no.json** | 7.7 KB | ~150 | 44% | ❌ 44% |

**Average Coverage**: 54% (excluding EN & FR)

---

## 5. Analyse des clés manquantes par section

### French (fr.json): 96% complete
**Missing:**
- ✓ Mostly complete
- ⚠️ discovery.* section (premium feature discovery)
- ⚠️ twoTimers.* section (milestone modal)
- ⚠️ timerMessages.* section (activity-specific messages)
- ⚠️ customActivities.* section (partially)

### German, Spanish, Italian, Portuguese, Dutch, Korean, Chinese, Swedish, Norwegian: 41-73% complete

**Missing (all these languages):**
- ❌ onboarding.v2.* (Filter 010-100) - 50+ keys
- ❌ onboarding.v3.* (if exists) - 50+ keys
- ❌ customActivities.* - 20+ keys
- ❌ discovery.* - 25+ keys
- ❌ twoTimers.* - 15+ keys
- ❌ timerMessages.* - 40+ keys
- ❌ accessibility.timer.* subsection

**Total Missing Keys Per Language**: ~200-220 keys (52-59% of English)

---

## 6. Hardcoded Strings Inventory

### UI Hardcoded Strings:
**Status**: ✅ NONE FOUND

All user-facing text properly uses `t()` function via `useTranslation()` hook.

**Code Quality**: Excellent - no hardcoded UI strings in src/

### Console/Debug Messages (Not Internationalized - Expected):
- Logger prefixes: `[RevenueCat]`, `[Timer]`, `[Onboarding]`, etc.
- Development warnings: "DEV MODE ENABLED", "Timer not found", etc.
- Error traces: Debug logging for troubleshooting

**Assessment**: Proper implementation - console messages should NOT be i18n

---

## 7. Clés complètement manquantes (Tous les langages)

### Section: `onboarding.v2.*`
**Status**: Complete in EN/FR only, missing in 13 others

**Keys** (example structure):
```
onboarding.v2.filter010.title
onboarding.v2.filter020.title
... (Filter 010-100)
onboarding.v2.filter100.title
```

**Count**: 50+ keys
**Impact**: Onboarding v2 funnel not usable in non-EN/FR languages

### Section: `customActivities.*`
**Status**: Complete in EN only, partial in FR, missing in 13 others

**Keys**:
```
customActivities.create.title: "Create Activity"
customActivities.create.nameLabel: "Name"
customActivities.create.durationLabel: "Duration"
customActivities.create.emojiLabel: "Choose emoji"
customActivities.create.submit: "Create"
customActivities.create.cancel: "Cancel"
customActivities.edit.title: "Edit Activity"
customActivities.edit.delete: "Delete Activity"
customActivities.edit.submit: "Save"
... (12 keys total)
```

**Count**: 12 keys
**Impact**: Custom activity creation modal shows undefined text in non-EN languages

### Section: `discovery.*`
**Status**: Complete in EN only, missing in 14 others

**Keys**:
```
discovery.moreColors.title: "All the colors"
discovery.moreColors.description: "Unlock 13 premium palettes"
discovery.moreColors.cta: "Unlock everything - 7 days free"
discovery.moreActivities.title: "All the activities"
discovery.moreActivities.description: "Unlock 12 premium activities"
discovery.moreActivities.cta: "Unlock everything - 7 days free"
... (8 keys total)
```

**Count**: 8 keys
**Impact**: Premium feature discovery modals not localized

### Section: `twoTimers.*`
**Status**: Complete in EN only, missing in 14 others

**Keys**:
```
twoTimers.title: "You've created 2 moments!"
twoTimers.message: "Want to explore more colors and activities?"
twoTimers.ctaExplore: "Explore premium"
twoTimers.ctaDismiss: "Maybe later"
```

**Count**: 4 keys
**Impact**: Milestone celebration modal not localized

### Section: `timerMessages.*`
**Status**: Complete in EN only, missing in 14 others

**Keys** (activity-specific messages):
```
timerMessages.work.start: "Focus"
timerMessages.work.end: "Work session complete!"
timerMessages.meditation.start: "Be present"
timerMessages.meditation.end: "Well done!"
... (30+ keys for all 18 activities)
```

**Count**: 30+ keys
**Impact**: Timer completion messages not localized

---

## 8. Matrice de complétude des clés

| Section | EN | FR | DE | ES | IT | PT | NL | JA | KO | ZH-Hans | ZH-Hant | AR | RU | SV | NO |
|---------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:---:|:---:|:--:|:--:|:--:|:--:|
| common.* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| invitation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| welcome.* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| timer.* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| settings.* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| premium.* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| activities.* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| sounds.* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| palettes.* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| onboarding.v2.* | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| onboarding.v3.* | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| customActivities.* | ✓ | ⚠️ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| discovery.* | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| twoTimers.* | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| timerMessages.* | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| accessibility.timer.* | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 9. Plan d'action & Recommendations

### 🔴 PRIORITY 1 (IMMEDIATE - Production Risk)
**Action**: Add 3 critical keys to ALL 15 locale files
**Effort**: 30 minutes
**Impact**: CRITICAL - Unblocks purchase error handling

**Keys to add**:
1. `common.retry`: "Retry" (EN)
2. `premium.contactSupport`: "Contact Support" (EN)
3. `premium.tooManyAttempts`: "Please contact support if the issue persists." (EN)

**Translation targets**: All 15 languages (see attached translations.md)

### 🟠 PRIORITY 2 (High - Feature Complete)
**Action**: Complete translation of onboarding.v2.* and onboarding.v3.*
**Effort**: 2-3 hours
**Impact**: HIGH - Onboarding usable in all 15 languages

**Languages to complete**: DE, ES, IT, PT, NL, JA, KO, ZH-Hans, ZH-Hant, AR, RU, SV, NO (13 languages)
**Keys**: 100+ keys
**Strategy**:
1. Extract all onboarding.v2.* keys from en.json
2. Auto-translate using i18n service (Google Translate API, DeepL, etc.)
3. Manual review by native speakers (if available)
4. Validate keys match en.json structure

### 🟡 PRIORITY 3 (Medium - Completeness)
**Action**: Translate discovery.*, twoTimers.*, timerMessages.*, customActivities.* sections
**Effort**: 4-5 hours
**Impact**: MEDIUM - Improves user experience across all features

**Sections**:
- `discovery.*` (8 keys)
- `twoTimers.*` (4 keys)
- `customActivities.*` (12 keys)
- `timerMessages.*` (30+ keys)
- `accessibility.timer.*` (10+ keys)

**Total Keys**: ~65 keys
**Languages**: All 14 non-English languages

### 🟢 PRIORITY 4 (Low - Polish)
**Action**: Manual review of auto-translated sections
**Effort**: 8-10 hours
**Impact**: LOW - Quality improvement

**Focus areas**:
- Context-specific terminology (e.g., "timer" vs "chrono" vs "cuenta regresiva")
- RTL language support (Arabic)
- CJK formatting (Japanese, Chinese, Korean)
- Accent marks and special characters (French, Portuguese, Spanish)

---

## 10. Checklist d'implémentation

### Étape 1: Fix Critical Keys (Today)
- [ ] Add 3 keys to en.json
- [ ] Translate to 14 other languages (see translations reference)
- [ ] Validate JSON syntax
- [ ] Test in-app with purchase error flow

### Étape 2: Complete Onboarding Translations (This week)
- [ ] Extract onboarding.v2.* keys from en.json
- [ ] Auto-translate to 13 languages
- [ ] Manual review (focus on onboarding UX)
- [ ] Validate keys match Filter 010-100 usage
- [ ] Test onboarding flow in multiple languages

### Étape 3: Feature Translations (Next week)
- [ ] Translate discovery.*, twoTimers.*, customActivities.*
- [ ] Translate timerMessages.* for all activities
- [ ] Add accessibility.timer.* subsection
- [ ] Auto-translate to all non-EN languages
- [ ] Validate screen reader labels

### Étape 4: Quality Review (Ongoing)
- [ ] Set up translation review process
- [ ] Document RTL language requirements (Arabic)
- [ ] Create glossary for technical terms
- [ ] Establish native speaker review workflow

---

## 11. Clés clés pour développement futur

**Usage Pattern Correct:**
```javascript
// ✓ Everywhere in codebase
const t = useTranslation();
<Text>{t('section.key')}</Text>
<Text>{t('section.key', { var: value })}</Text>
Alert.alert(t('section.title'), t('section.message'));
```

**Files Using i18n:**
- `/src/screens/onboarding/filters/Filter-*.jsx` (all 10 filters)
- `/src/screens/TimerScreen.jsx`
- `/src/components/modals/*.jsx` (all modals)
- `/src/components/settings/SettingsPanel.jsx`
- `/src/components/carousels/*.jsx`

**i18n Configuration:**
- `/src/i18n/index.js` - i18n-js setup
- `/src/hooks/useTranslation.js` - Custom hook wrapper
- `/locales/*.json` - Translation files

---

## 12. TODO Tracker

Known incomplete sections tracked in `/src/i18n/TODO.md`:

Components with pending translations:
- DiscoveryModal.jsx - Premium CTAs
- MoreActivitiesModal.jsx - Activity preview
- MoreColorsModal.jsx - Palette preview
- OnboardingV2Prototype.jsx - New funnel
- ActivityCarousel.jsx - Toast messages
- PaletteCarousel.jsx - Toast messages

---

**Audit Report Generated**: 2025-12-20
**Status**: Implementation Ready
**Next Step**: Execute Priority 1 (3 critical keys) + Priority 2 (onboarding translations)
