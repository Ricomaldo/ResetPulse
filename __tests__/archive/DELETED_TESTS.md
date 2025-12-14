# Deleted Tests Documentation

## Archived on: 2024-12-14

## Reason for Archival

Tests were refactored as part of ResetPulse v2.0.0-rc2 test suite overhaul.

### OnboardingFlow.test.js
**Location:** `__tests__/unit/screens/onboarding/OnboardingFlow.test.js`
**Reason:** Tests were written for Onboarding V2 flow which has been replaced by V3.
- V2 had 6 filters: opening, needs, creation, test, vision, paywall
- V3 has 10 filters with branching logic: opening, needs, creation, test, notifications, branch, vision/sound, paywall/interface
- Theme mock was incomplete (missing `colors.brand.primary`)
- Filter mocks did not match current component signatures

### onboardingConstants.test.js (partial)
**Location:** `__tests__/unit/screens/onboarding/onboardingConstants.test.js`
**Reason:** STEP_NAMES tests expected 6 steps but V3 has 10 steps.
- Updated to reflect V3 step structure

### sdk51 directory
**Location:** `__tests__/archive/sdk51/`
**Reason:** Tests from SDK 51, no longer compatible with SDK 54.

---

## Current Test Structure (v2.0.0-rc2)

```
__tests__/
├── archive/                      # Archived/deleted tests
│   ├── sdk51/                   # Old SDK 51 tests
│   └── DELETED_TESTS.md         # This file
├── hooks/
│   ├── useCustomActivities.test.js  # P0 - Custom activities hook
│   ├── useTimer.test.js             # P0 - Timer hook
│   ├── useTranslation.test.js       # P2 - i18n hook
│   └── useDialOrientation.test.js   # Existing - dial orientation
├── contexts/
│   └── TimerOptionsContext.test.js  # P1 - Timer options
├── services/
│   └── analytics.test.js            # P1 - Analytics service
├── test-utils.js                    # Shared test utilities
└── simple.test.js                   # Basic sanity check
```

## Priority Matrix

| Priority | Test | Coverage Target |
|----------|------|-----------------|
| P0 | useCustomActivities | >80% |
| P0 | useTimer | >80% |
| P1 | TimerOptionsContext | >75% |
| P1 | Analytics | >60% |
| P2 | useTranslation | >70% |
