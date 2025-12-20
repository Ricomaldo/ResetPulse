---
created: '2025-12-20'
updated: '2025-12-20'
status: active
report_type: audit
component: Modals & Conversion Logic
scope: monetization-implementation
---

# Rapport : Modales & Logique de Conversion/Retention

## 1. Vue d'ensemble

ResetPulse implémente un système modal **6-tier** intégré à une stratégie de conversion freemium basée sur ADR-monetization-v1.1.0 (€4.99 one-time purchase, 7-day trial, 2 free palettes + 4 free activities).

**Status**: ✅ Implémentation complète (SDK RevenueCat intégré, modales en place, gating logique en place)

---

## 2. Inventaire des modales

| Modal | Purpose | Trigger | Visibility | Primary CTA | Secondary CTA | Analytics |
|---|---|---|---|---|---|---|
| **PremiumModal** | Main paywall, 7-day trial offer | Premium feature tap, Discovery→Unlock | Both free & premium | "Try 7 days free" | "Maybe later" + "Restore" | paywall_viewed |
| **DiscoveryModal** | Generic template for premium discovery | N/A (base) | N/A (base) | Custom via prop | Custom via prop | discovery_modal_shown |
| **MoreColorsModal** | Preview premium palettes (13 total) | "+" button in PaletteCarousel OR Settings | Free users only | "Unlock everything - 7 days free" | "Maybe later" | discovery_modal_shown |
| **MoreActivitiesModal** | Preview premium activities (12 total) | "+" button in ActivityCarousel OR Settings | Free users only | "Unlock everything - 7 days free" | "Maybe later" | discovery_modal_shown |
| **TwoTimersModal** | Celebration + retention milestone | After 2nd timer completed | Both users | "Explore premium" | "Maybe later" | two_timers_modal_shown |
| **SettingsModal** | Modal hierarchy for settings (+ 5 sections) | Drawer/settings icon | Both users | N/A (settings) | N/A | N/A |
| **CreateActivityModal** | Custom activity creation (premium feature) | "+" button in settings | Both users | "Create" | "Cancel" | custom_activity_created |
| **EditActivityModal** | Edit/delete custom activities | Long-press on custom activity | Both users | "Save"/"Delete" | "Cancel" | custom_activity_modified |

---

## 3. Logique de déclenchement

### Timer-Based:
- **TwoTimersModal**: After user completes exactly 2 timers (tracked via `hasSeenTwoTimersModal` flag in TimerOptionsContext)
  - File: `/src/screens/TimerScreen.jsx:149-150`
  - Fires once per session
  - Only shown if `!hasSeenTwoTimersModal`

### Feature-Based (Premium Content Taps):

**PaletteCarousel (More Colors)**:
- File: `/src/components/carousels/PaletteCarousel.jsx:205-210`
- Trigger: User taps "+" (More Colors) button
- Flow: MoreColorsModal (discovery preview) → PremiumModal (purchase)
- Analytics: trackDiscoveryModalShown('colors') → trackPaywallViewed('colors')

**ActivityCarousel (Premium Activity)**:
- File: `/src/components/carousels/ActivityCarousel.jsx:130-135`
- Trigger: User taps premium activity (isPremium=true)
- Flow: Direct to PremiumModal
- Analytics: trackPaywallViewed('activities') + haptics.warning()

**Settings - More Activities/Palettes**:
- File: `/src/components/settings/FavoritesActivitySection.jsx` + `FavoritesPaletteSection.jsx`
- Trigger: "+" button in settings
- Flow: MoreColorsModal or MoreActivitiesModal → potentially PremiumModal
- Analytics: trackDiscoveryModalShown('colors'|'activities')

**Onboarding Paywall**:
- File: `/src/screens/onboarding/filters/Filter-090-paywall-discover.jsx`
- Trigger: End of discover onboarding path
- Flow: Direct to PremiumModal with trial CTA
- Analytics: trackPaywallViewed('onboarding')

---

## 4. CTA Strategy & Messaging

### Primary CTAs (Call-to-Action):

1. **PremiumModal Primary**: "Try 7 days free"
   - **Psychology**: Urgency (time-limited) + Accessibility (no commitment)
   - **Charm pricing**: "Then €4.99 once. Yours forever."
   - **Location**: PremiumModal.jsx line 516
   - **Variant**: Dynamic price from RevenueCat (fetched on modal open)
   - **Implementation**: `purchaseProduct(packageId)` in PurchaseContext

2. **DiscoveryModal Primary**: "Unlock everything - 7 days free"
   - **Generic CTA**: Overridable per instance
   - **Used by**: MoreColorsModal + MoreActivitiesModal
   - **Flow**: Taps CTA → PremiumModal opens

3. **TwoTimersModal Primary**: "Explore premium"
   - **Psychology**: Milestone celebration (2 timers = proof of concept)
   - **Message**: "You've created 2 moments! Want to explore more colors and activities?"
   - **Tone**: Soft, exploratory (not aggressive)

### Secondary CTAs (Escape Routes):

1. **"Maybe later"**: Non-committal dismiss
   - Removes guilt/pressure
   - Low friction exit
   - Sets flag to allow re-showing later

2. **"Restore my purchases"**: Subtle recovery CTA
   - For users on new device/account
   - RevenueCat handles restore flow

### Copy Philosophy:
- **Transparent**: "All the colors. All the activities. Your maximum comfort."
- **Value-focused**: Not "buy more" but "complete your experience"
- **Creator-connected**: "Your maximum comfort" vs generic upsell

---

## 5. Funnel Conversion (Free → Trial → Premium)

### Step-by-Step Flow:

```
STEP 1: Free User Hits Premium Feature
├─ User selects premium activity (isPremium: true)
├─ OR user taps "+" in carousel/settings
└─ OR user completes 2 timers

STEP 2: Discovery Modal (Optional)
├─ MoreColorsModal shows grid of 13 premium palettes
├─ OR MoreActivitiesModal shows grid of 12 premium activities
├─ CTA: "Unlock everything - 7 days free"
└─ Analytics: trackDiscoveryModalShown('colors'|'activities')

STEP 3: Premium Modal (Paywall)
├─ Full trial offer display
├─ 7-day free trial prominently featured
├─ Dynamic price from RevenueCat
├─ Analytics: trackPaywallViewed(source)
└─ Source tracked: 'activities' | 'colors' | 'unknown' | 'onboarding'

STEP 4: Purchase Initiation
├─ User taps "Try 7 days free"
├─ RevenueCat.purchaseProduct() called (PurchaseContext line 146)
├─ Offline handling + network retry (max 3 attempts)
└─ Trial period starts immediately

STEP 5: Trial Status (7 days)
├─ RevenueCat manages 7-day window
├─ Entitlement: premium_access becomes active
├─ PurchaseContext caches status (24h TTL)
├─ Analytics: trackTrialStarted(packageId)

STEP 6: Trial Expiry → Purchase Conversion
├─ Day 7 approaches: Apple/Google send system notification
├─ In-app: Users continue using premium features
├─ 1-click purchase: "Complete your purchase" when trial ends
├─ OR restore: "Restore my purchases" button always available
└─ Analytics: trackPurchaseCompleted() or trackPurchaseFailed()

STEP 7: Post-Purchase
├─ Welcome alert: "Welcome Premium! 🎉"
├─ All 15 palettes + 16 activities unlocked
├─ Custom activities enabled
└─ Analytics: trackPurchaseCompleted(packageId, price, transactionId)
```

---

## 6. Frequency Caps & Behavioral Gates

### One-Time Events:
- **TwoTimersModal**: Shows once per session (tracked: `hasSeenTwoTimersModal`)
  - TimerOptionsContext persists this flag
  - Reset on app reload/logout

### No Explicit Frequency Caps For:
- **MoreColorsModal**: Can be shown multiple times
- **MoreActivitiesModal**: Can be shown multiple times
- **PremiumModal**: Can be shown unlimited times

**Potential UX Friction**:
- User could see MoreColorsModal → close → tap "+" again → show again
- No "don't show again" option
- Design intent: Light touch (not aggressive re-targeting)

---

## 7. Analytics & Conversion Metrics

### Events Fired (src/services/analytics/conversion-events.js):

| Event | Trigger | KPI Target |
|---|---|---|
| `paywall_viewed` | PremiumModal opens (any source) | Baseline reach |
| `trial_started` | User accepts trial offer | >18% of paywall viewers |
| `purchase_completed` | Trial auto-converts OR manual purchase | Revenue tracking |
| `purchase_failed` | Any error during purchase | Friction debugging |
| `purchase_restored` | User restores via "Restore my purchases" | Account recovery |
| `two_timers_milestone` | User completes 2nd timer | >40% milestone reach |
| `two_timers_modal_shown` | TwoTimersModal displayed | Confirms trigger |
| `two_timers_modal_explore_clicked` | User clicks "Explore premium" | >15% conversion |
| `discovery_modal_shown` | MoreColorsModal or MoreActivitiesModal shown | Ongoing engagement |
| `discovery_modal_unlock_clicked` | User taps "Unlock everything" in discovery | >20% conversion |

### Conversion Funnel KPIs (from ADR-monetization-v11.md):
- Paywall → Trial: >30%
- Trial start rate: >20% of users
- Trial → Premium: >25%
- Overall free→premium: 3-5%
- D7 retention: >20%

---

## 8. Freemium Gating Logic

### Free Activities (4):
- `none` (Basic timer)
- `work` (Pomodoro 25min)
- `break` (Pause 15min)
- `meditation` (Mindfulness 20min)
- `creativity` (Creative 45min)

### Premium Activities (12):
- `reading`, `study`, `yoga`, `sport`, `walking`, `cooking`, `gaming`, `homework`, `music`, `cleaning`, `nap`, `writing`

### Free Palettes (2):
- `serenity`
- `earth`

### Premium Palettes (13):
- `softLaser`, `zen`, `classic`, `tropical`, `dusk`, `darkLaser`, `autumn`, `dawn`, `forest`, `ocean`, `lavender`, `teal`, `lightMint`

### All Features Free:
- Audio (10 sounds)
- Dark theme
- Pulse animation
- Clockwise/counter-clockwise
- Custom activities (requires premium)

### Gating Implementation:
```javascript
// ActivityCarousel.jsx:131
if (activity.isPremium && !isPremiumUser) {
  haptics.warning();
  setShowPremiumModal(true);
  return;
}

// PaletteCarousel.jsx:40-41
const FREE_PALETTE_NAMES = getFreePalettes();
const ALL_PALETTE_NAMES = useMemo(() => Object.keys(TIMER_PALETTES), []);
const basePalettes = isPremiumUser ? ALL_PALETTE_NAMES : FREE_PALETTE_NAMES;
```

---

## 9. Retention & Re-engagement Mechanics

### Win-Back/Celebration Mechanism:
- **TwoTimersModal**: "You've created 2 moments!"
  - Psychology: Milestone achievement (proof of engagement)
  - Timing: Early (2nd timer = ~10-30min of app time)
  - Purpose: Soft introduction to premium during high engagement

### Feature Discovery (Ongoing):
- Every tap on "+" carousel button shows discovery preview
- Carousel pagination encourages browsing
- Multiple exposures normalize premium existence

### Notifications (Future):
- ADR-monetization mentions: "v1.2.0 if data shows confusion"
- Currently: Apple/Google handle trial expiry notifications

---

## 10. Premium Status Checking

### usePremiumStatus Hook Flow:
```javascript
// src/hooks/usePremiumStatus.js
const usePremiumStatus = () => {
  const { isPremium: revenueCatPremium, isLoading } = usePurchases();
  const devContext = useContext(DevPremiumContext);

  if (DEV_MODE && devContext?.devPremiumOverride !== null) {
    return { isPremium: devContext.devPremiumOverride, isLoading: false };
  }
  return { isPremium: revenueCatPremium, isLoading };
};
```

### Cache Strategy:
- 24-hour TTL via AsyncStorage
- Fallback: Use cache if network fails
- Invalidated before purchase (ensures fresh data after)

---

## 11. Alignment avec ADR-Monetization V1.1.0

### ✅ Strategy Match:
- **Freemium Config**: 2 free palettes + 4 free activities exactly as planned
- **Pricing**: €4.99 one-time (RevenueCat configured)
- **Trial**: 7 days free (RevenueCat native)
- **Messaging**: "All the colors. All the activities" → value focus
- **No Dark Patterns**: No usage limits, no nag screens, light CTAs
- **Features**: All free (audio, dark theme, animations)

### Implementation Status:
- ✅ RevenueCat SDK integrated (PurchaseContext)
- ✅ Modal UI complete (PremiumModal, DiscoveryModal)
- ✅ Analytics tracked (conversionEvents.js)
- ✅ Gating logic in place (ActivityCarousel, PaletteCarousel)
- ✅ Cache + offline handling
- ⚠️ Trial start notification: Min approach (relies on system)

---

## 12. Key Files & Code Locations

### Core Modal Files:
- `/src/components/modals/PremiumModal.jsx` - Main paywall
- `/src/components/modals/DiscoveryModal.jsx` - Template
- `/src/components/modals/MoreColorsModal.jsx` - Palette discovery
- `/src/components/modals/MoreActivitiesModal.jsx` - Activity discovery
- `/src/components/modals/TwoTimersModal.jsx` - Milestone celebration

### Conversion Logic:
- `/src/contexts/PurchaseContext.jsx` - RevenueCat integration, purchase flow (line 1-356)
- `/src/contexts/ModalStackContext.jsx` - Modal stacking (handles nested modals)
- `/src/hooks/usePremiumStatus.js` - Premium status check
- `/src/screens/TimerScreen.jsx:146-150` - TwoTimersModal trigger

### Analytics:
- `/src/services/analytics.js` - Main analytics service
- `/src/services/analytics/conversion-events.js` - All conversion events
- `/src/config/revenuecat.js` - RevenueCat SDK config

### Config:
- `/src/config/activities.js` - Activity definitions (isPremium flag)
- `/src/config/timer-palettes.js` - Palette definitions (isPremium flag)
- `/src/config/test-mode.js` - DEV_MODE for testing

### Triggers:
- `/src/components/carousels/ActivityCarousel.jsx:130-135` - Premium activity tap
- `/src/components/carousels/PaletteCarousel.jsx:205-210` - More colors tap
- `/src/components/settings/SettingsPanel.jsx:50-51` - Settings modals

---

## 13. Recommandations

### Quick Wins:
1. **Add progress indicator** (15min): Show "X/2" on TwoTimersModal for gamification
2. **Enhance MoreColorsModal preview** (30min): Show color swatches + names before unlock CTA
3. **A/B test paywall copy** (1h): Test "All the colors" vs "Unlimited colors" vs "Complete Set"

### Medium Improvements:
4. **Add re-engagement campaign** (4h): Show paywall after 7-day idle
5. **Custom activity premium gate messaging** (2h): Explain why custom activities require premium
6. **Win-back notification** (3h): "You loved [activity], now available with premium"

### Long-term:
7. **Seasonal promotions** (6h): Holiday discount events with limited-time paywall variants
8. **Subscription alternative** (8h): For comparison testing vs one-time purchase

---

**Report Generated**: 2025-12-20
**Status**: Implementation complete, ready for conversion optimization
