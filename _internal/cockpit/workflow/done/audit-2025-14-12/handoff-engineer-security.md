---
created: '2025-12-14'
updated: '2025-12-14'
status: active
priority: P0-CRITICAL
---

# 🚨 Handoff: Security Remediation (P0 URGENT)

> **BLOCKING**: Ne pas déployer en production avant correction

## Context

Audit #3 Security a identifié des **clés API hardcodées** dans le code source. Risque CVSS 7.5 pour Mixpanel (exfiltration données, poisoning analytics).

---

## 🔴 Task 1: Move Mixpanel Token to Environment (P0)

**File**: `src/services/analytics.js:29`

### Current (INSECURE)
```javascript
const MIXPANEL_TOKEN = '4b1bd9b9a3be61afb7c19b40ad5a73de';
```

### Step 1: Create .env file
```bash
# Project root
echo "MIXPANEL_TOKEN=4b1bd9b9a3be61afb7c19b40ad5a73de" > .env
```

### Step 2: Add to .gitignore
```bash
echo ".env" >> .gitignore
```

### Step 3: Install react-native-dotenv
```bash
npm install react-native-dotenv
```

### Step 4: Configure babel.config.js
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      }]
    ]
  };
};
```

### Step 5: Update analytics.js
```javascript
// src/services/analytics.js
import { MIXPANEL_TOKEN } from '@env';

// Fallback for development
const token = MIXPANEL_TOKEN || process.env.MIXPANEL_TOKEN;
if (!token) {
  console.warn('MIXPANEL_TOKEN not configured');
}
```

### Verification
```bash
# Clear metro cache
npx expo start --clear

# Verify token loads
# Add temporary console.log in analytics.js
console.log('Token loaded:', !!MIXPANEL_TOKEN);
```

**Effort**: ~1h

---

## 🔴 Task 2: Secure RevenueCat Keys (P0)

**File**: `src/config/revenuecat.js:13-16`

### Current (INSECURE)
```javascript
export const REVENUECAT_CONFIG = {
  ios: { apiKey: "appl_NJoSzWzcoJXLiNDMTGKJShISApt" },
  android: { apiKey: "goog_URjPIqpNSxbyogfdststoCOmQRg" },
};
```

### Option A: Move to app.json extra (Recommended)

**app.json**:
```json
{
  "expo": {
    "extra": {
      "revenueCat": {
        "iosKey": "appl_NJoSzWzcoJXLiNDMTGKJShISApt",
        "androidKey": "goog_URjPIqpNSxbyogfdststoCOmQRg"
      }
    }
  }
}
```

**revenuecat.js**:
```javascript
import Constants from 'expo-constants';

const { revenueCat } = Constants.expoConfig?.extra || {};

export const REVENUECAT_CONFIG = {
  ios: { apiKey: revenueCat?.iosKey || '' },
  android: { apiKey: revenueCat?.androidKey || '' },
};

if (!revenueCat?.iosKey || !revenueCat?.androidKey) {
  console.warn('RevenueCat keys not configured in app.json extra');
}
```

### Option B: Use .env (Alternative)

Add to `.env`:
```
REVENUECAT_IOS_KEY=appl_NJoSzWzcoJXLiNDMTGKJShISApt
REVENUECAT_ANDROID_KEY=goog_URjPIqpNSxbyogfdststoCOmQRg
```

**revenuecat.js**:
```javascript
import { REVENUECAT_IOS_KEY, REVENUECAT_ANDROID_KEY } from '@env';

export const REVENUECAT_CONFIG = {
  ios: { apiKey: REVENUECAT_IOS_KEY },
  android: { apiKey: REVENUECAT_ANDROID_KEY },
};
```

**Effort**: ~30min

---

## 🔴 Task 3: Verify Git History (P0)

### Check for exposed secrets
```bash
cd /Users/irimwebforge/dev/apps/resetpulse

# Check Mixpanel token
git log --all --full-history -S "4b1bd9b9a3be61afb7c19b40ad5a73de" --oneline

# Check RevenueCat keys
git log --all --full-history -S "appl_NJoSzWzcoJXLiNDMTGKJShISApt" --oneline
```

### If found in history (cleanup required)

**Option A**: BFG Repo Cleaner (Recommended)
```bash
# Install BFG
brew install bfg

# Create secrets.txt with patterns to remove
echo "4b1bd9b9a3be61afb7c19b40ad5a73de" > secrets.txt
echo "appl_NJoSzWzcoJXLiNDMTGKJShISApt" >> secrets.txt
echo "goog_URjPIqpNSxbyogfdststoCOmQRg" >> secrets.txt

# Run BFG
bfg --replace-text secrets.txt

# Cleanup
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push (CAREFUL - coordinate with team)
git push --force
```

**Option B**: git filter-branch (Alternative)
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/services/analytics.js src/config/revenuecat.js" \
  --prune-empty --tag-name-filter cat -- --all
```

**Effort**: ~1h (if history cleanup needed)

---

## 🔴 Task 4: Rotate Mixpanel Token (P0)

**After code fix is deployed**:

1. Go to Mixpanel Dashboard → Settings → Project Settings
2. Generate new API token
3. Update `.env` with new token
4. Delete/revoke old token
5. Deploy updated app

**Note**: RevenueCat keys are public SDK keys (cannot be rotated), but monitor for abuse.

**Effort**: ~30min

---

## 🟠 Task 5: npm Audit (P1)

```bash
cd /Users/irimwebforge/dev/apps/resetpulse

# Run audit
npm audit

# Auto-fix what's possible
npm audit fix

# For breaking changes (careful)
npm audit fix --force

# Check results
npm audit
```

**Document any unfixable vulnerabilities** with justification.

**Effort**: ~1h

---

## 🟠 Task 6: JSON.parse Error Handling (P1)

Add try-catch to these 5 locations:

### Pattern to apply
```javascript
// BEFORE
const storedValue = await AsyncStorage.getItem(key);
const parsedValue = JSON.parse(storedValue);

// AFTER
const storedValue = await AsyncStorage.getItem(key);
let parsedValue = defaultValue;
try {
  if (storedValue) {
    parsedValue = JSON.parse(storedValue);
  }
} catch (error) {
  console.warn(`JSON parse failed for ${key}:`, error.message);
  // Keep default value
}
```

### Files to update

1. **`src/contexts/TimerOptionsContext.jsx:44`**
2. **`src/contexts/TimerPaletteContext.jsx`** (find JSON.parse)
3. **`src/contexts/PurchaseContext.jsx`** (find JSON.parse)
4. **`src/hooks/usePersistedState.js`** (find JSON.parse)
5. **`src/utils/logger.js`** (find JSON.parse)

**Effort**: ~2h

---

## Verification Checklist

### P0 Complete?
- [ ] Mixpanel token removed from source code
- [ ] RevenueCat keys moved to app.json extra or .env
- [ ] .env added to .gitignore
- [ ] Git history cleaned (if exposed)
- [ ] App runs correctly with new config
- [ ] Mixpanel events still tracking
- [ ] RevenueCat purchases still working

### P1 Complete?
- [ ] npm audit shows 0 critical/high vulnerabilities
- [ ] All JSON.parse calls have try-catch

---

## Testing

### Verify Mixpanel
```javascript
// Temporary test in analytics.js
console.log('Mixpanel token loaded:', !!MIXPANEL_TOKEN);

// Check Mixpanel dashboard for incoming events after app restart
```

### Verify RevenueCat
```javascript
// Check PurchaseContext initialization
// Premium status should load correctly
// Test purchase flow (sandbox)
```

### Verify No Secrets in Bundle
```bash
# Build release bundle
npx expo export --platform ios

# Search for secrets in output
grep -r "4b1bd9b9a3be61afb7c19b40ad5a73de" dist/
# Should return nothing
```

---

## Priority Order

1. **FIRST**: Tasks 1-2 (Move keys) — Cannot deploy without this
2. **THEN**: Task 3 (Git history check)
3. **AFTER DEPLOY**: Task 4 (Rotate Mixpanel token)
4. **PARALLEL**: Tasks 5-6 (npm audit, JSON.parse)

---

## References

- [Security Report](../reports/security.md)
- Audit: `_internal/cockpit/knowledge/findings/2025-12-14_03-security.md`
- [react-native-dotenv docs](https://github.com/goatandsheep/react-native-dotenv)
- [Expo Constants.extra](https://docs.expo.dev/versions/latest/sdk/constants/)

---

**Total Effort**: ~4-6h (P0: 2-3h, P1: 2-3h)
**Deadline**: P0 before ANY production deployment
