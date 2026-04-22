---
created: '2025-12-14'
updated: '2025-12-14'
status: active
---

# Security Report — ResetPulse

> État de la sécurité applicative et conformité

## Quick Status

| Aspect | Grade | Status | Notes |
|--------|-------|--------|-------|
| **Overall** | **B** | ⚠️ P0 Blocker | Downgraded from A due to API key exposure |
| **Credentials** | D | 🔴 CRITICAL | Hardcoded API keys in source |
| **OWASP Top 10** | B+ | ⚠️ 8/10 pass | Fails A2 (Cryptographic) |
| **Code Patterns** | A | ✅ Clean | No eval/injection vectors |
| **Permissions** | A+ | ✅ Minimal | Single alarm permission |
| **Network** | A | ✅ HTTPS | All calls encrypted |

---

## 🔴 P0 — CRITICAL (Blocking)

### Hardcoded API Keys in Source Code

**Files**:
- `src/services/analytics.js:29` — Mixpanel token
- `src/config/revenuecat.js:13-16` — RevenueCat keys iOS/Android

**Risk**: Exposed credentials in git history + source code

| Credential | Risk Level | Impact |
|------------|-----------|--------|
| Mixpanel Token | 🔴 CRITICAL (CVSS 7.5) | Attackers can poison analytics, exfiltrate behavior data |
| RevenueCat Keys | 🟠 MEDIUM (CVSS 4.0) | Product ID enumeration (server-side protected) |

**Status**: 🚨 **BLOCKING FOR PRODUCTION**

→ See [handoff-engineer-security.md](../guides/handoff-engineer-security.md) for remediation steps

---

## 🟠 P1 — High Priority

### 1. npm Audit Vulnerabilities (Pending)

**Status**: Manual verification required
```bash
npm audit
npm audit fix
```

**Expected**: ~5 vulnerabilities flagged

### 2. Unvalidated JSON.parse() Calls

**Files** (5 locations):
- `src/contexts/TimerOptionsContext.jsx:44`
- `src/contexts/TimerPaletteContext.jsx`
- `src/contexts/PurchaseContext.jsx`
- `src/hooks/usePersistedState.js`
- `src/utils/logger.js`

**Risk**: Malformed JSON causes app crash (low severity)

**Fix**: Wrap in try-catch with fallback defaults

---

## 🟡 P2 — Medium Priority

### 1. AsyncStorage Unencrypted

**Assessment**: ACCEPTABLE
- No passwords, tokens, or PII stored
- Premium status is public to device owner
- Error logs are local-only

### 2. Error Logging Context

**Location**: `src/utils/logger.js`

**Risk**: Error context might leak app state details

**Fix**: Sanitize PII patterns before storing

---

## Security Scorecard

| Category | Grade | Notes |
|----------|-------|-------|
| Credentials Management | **D** | Hardcoded keys (P0) |
| API Security (HTTPS) | **A** | All encrypted |
| Permissions Model | **A+** | Single alarm permission |
| Code Patterns | **A** | No eval/injection |
| Data Storage | **B** | Unencrypted but low-risk data |
| Input Validation | **A** | Proper bounds, React Native escapes |
| Dependencies | **B** | Pending npm audit |
| Logging | **B** | Could sanitize further |
| OWASP Compliance | **B+** | 8/10 pass |

---

## OWASP Top 10 (2021)

| # | Category | Status |
|---|----------|--------|
| A1 | Broken Access Control | ✅ Pass |
| A2 | Cryptographic Failures | ⚠️ **FAIL** (hardcoded keys) |
| A3 | Injection | ✅ Pass |
| A4 | Insecure Design | ✅ Pass |
| A5 | Security Misconfiguration | ✅ Pass |
| A6 | Vulnerable Components | ⚠️ Pending audit |
| A7 | Auth Failures | ✅ Pass |
| A8 | Data Integrity | ✅ Pass |
| A9 | Logging & Monitoring | ⚠️ Could improve |
| A10 | SSRF | N/A (client app) |

---

## Compliance

### GDPR
- ✅ Mixpanel EU servers (data residency)
- ✅ No PII collection beyond app usage
- ⚠️ **Privacy Policy OUTDATED** — claims no analytics

### COPPA
- ✅ No data from users <13
- ✅ No advertising networks

### App Store / Google Play
- ✅ Minimal permissions
- ✅ Privacy policy provided
- ✅ No suspicious network activity

---

## ⚠️ Legal Alert: Privacy Policy Outdated

**File**: `_internal/docs/legacy/legal-PRIVACY_POLICY.md`

**Claims**:
> "We do not collect usage analytics or tracking data"
> "does not integrate with third-party services"

**Reality**:
- Mixpanel analytics integrated
- RevenueCat IAP service integrated

**Action Required**: Update privacy policy to disclose:
1. Analytics collection (Mixpanel)
2. In-app purchase service (RevenueCat)
3. Data sent to these services

---

## Remediation Timeline

| Priority | Task | Effort | Deadline |
|----------|------|--------|----------|
| **P0** | Move API keys to env | 2h | Before ANY deploy |
| **P0** | Rotate Mixpanel token | 30min | After code fix |
| **P1** | npm audit + fix | 1h | 1 week |
| **P1** | JSON.parse try-catch | 2h | 1 week |
| **P2** | Sanitize error logs | 2h | 1 month |
| **Legal** | Update Privacy Policy | 1h | ASAP |

---

## Grade Trajectory

```
Current:  B  (P0 blocks A grade)
Target:   A- (after P0/P1 fixes)
Timeline: 1-2 weeks post-fix
```

---

## References

- [Handoff: Security Remediation](../guides/handoff-engineer-security.md) — P0 fix instructions
- [Legacy: Privacy Policy](../legacy/legal-PRIVACY_POLICY.md) — Needs update
- Audit source: `_internal/cockpit/knowledge/findings/2025-12-14_03-security.md`

---

**Last Audit**: 2025-12-14 (Claude-Discovery)
**Next Audit**: After P0/P1 remediation
