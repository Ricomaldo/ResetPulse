---
created: '2025-12-14'
updated: '2025-12-14'
status: active
---

# Analytics Report — ResetPulse

> État de l'implémentation Mixpanel et tracking des événements

## Quick Status

| Aspect | Score | Status |
|--------|-------|--------|
| **Overall Grade** | **A- (85/100)** | ✅ Production-ready |
| **Event Coverage** | 90% | ✅ Comprehensive |
| **Test Coverage** | 85% | ✅ Good |
| **Security** | 100% | ✅ Token in .env |
| **Documentation** | 75% | ⚠️ Missing catalog |
| **GDPR Compliance** | 100% | ✅ EU servers |

**P0 Issues**: 0 🎉

---

## Event Inventory (38 Events)

| Module | Events | Coverage |
|--------|--------|----------|
| **Onboarding** | 11 | ✅ Complete flow |
| **Conversion** | 11 | ✅ Full funnel |
| **Custom Activities** | 6 | ✅ CRUD tracked |
| **Timer** | 3 | ✅ Core flow |
| **Settings** | 1 (7 props) | ✅ Preferences |
| **Lifecycle** | 1 | ✅ app_opened |

### Key Conversion Funnel

```
app_opened → onboarding_completed → paywall_viewed → trial_started → purchase_completed
```

All 6 original M7.5 events + 32 additional events implemented.

---

## Architecture

### Modular Design ✅

```
src/services/analytics/
├── index.js           # Main Analytics class
├── onboarding-events.js
├── conversion-events.js
├── timer-events.js
├── settings-events.js
└── custom-activities-events.js
```

### Security ✅

- Token in `.env` (gitignored)
- Loaded via `@env` babel plugin
- EU GDPR: `api-eu.mixpanel.com`

### Error Handling ✅

- Non-blocking failures
- Graceful Expo Go fallback
- Dev mode logging

---

## 🟠 P1 — Improvements (5)

| Issue | Effort | Impact |
|-------|--------|--------|
| Missing `paywall_dismissed` event | 30min | Funnel dropout |
| User identification not called | 1h | D1/D7 retention |
| No error/crash tracking | 2h | Stability metrics |
| No event catalog doc | 3h | Developer DX |
| Super properties incomplete | 1h | Segmentation |

**Total P1 effort**: ~8h

---

## 🟡 P2 — Nice-to-Have (4)

- Property naming standardization (snake_case)
- Orphaned `trackCustomActivitiesExported` method
- Session tracking (start/end)
- TypeScript definitions

---

## Test Coverage

- `analytics.test.js`: 467 lines
- `useAnalytics.test.js`: 217 lines
- **Total**: 684 lines, 22 test cases

---

## Tracked User Flows

### ✅ Fully Tracked

1. **Onboarding Journey** — started, steps, completed, abandoned
2. **Conversion Funnel** — paywall, trial, purchase, fail
3. **Timer Usage** — started, completed, abandoned
4. **Custom Activities** — CRUD operations
5. **Settings Changes** — 7 preferences tracked
6. **Discovery Modals** — shown, clicked, dismissed
7. **Two Timers Milestone** — ADR-003 trigger

### ❌ Not Tracked

- App crashes/errors
- Session duration
- Individual activity/palette selection
- SettingsModal open/close

---

## Legacy Reference

| Doc | Status | Notes |
|-----|--------|-------|
| [guides-MIXPANEL_IMPLEMENTATION.md](../legacy/guides-MIXPANEL_IMPLEMENTATION.md) | 📌 Kept | M7.5 setup guide, historically valid |
| [decisions-analytics-strategy.md](../legacy/decisions-analytics-strategy.md) | 📌 Kept | Strategic rationale, still valid |

**Evolution**: Original 6 events → 38 events implemented. Strategy exceeded.

---

## Recommendations

### Short-Term (~8h)

1. Add `paywall_dismissed` event
2. Implement user identification (RevenueCat ID)
3. Add error boundary tracking
4. Create event catalog documentation
5. Set `is_premium` super property

### Medium-Term

6. Add session tracking
7. Standardize property naming
8. Remove orphaned events

---

## References

- Audit: `_internal/cockpit/knowledge/findings/2025-12-14_09-analytics.md`
- [Legacy: Mixpanel Implementation](../legacy/guides-MIXPANEL_IMPLEMENTATION.md)
- [Legacy: Analytics Strategy](../legacy/decisions-analytics-strategy.md)

---

**Last Audit**: 2025-12-14 (Claude-Discovery)
**Next Review**: After P1 items completed
