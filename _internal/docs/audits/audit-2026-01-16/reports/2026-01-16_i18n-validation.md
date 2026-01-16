---
created: '2026-01-16'
updated: '2026-01-16'
status: active
audit_type: validation
domain: i18n
---

# i18n Audit Validation — ResetPulse (2026-01-16)

## Executive Summary

- **Total keys in FR**: 276
- **Total keys used in code**: 286
- **Missing keys (P0)**: 0
- **Obsolete keys (P2)**: 0
- **Duplicate values (P3)**: 3
- **Locale pollution (P1)**: 69
- **Production readiness**: ⚠️ **WARNING** (69 P1 locale pollution issues should be fixed)

## Findings by Severity

### P0 Critical Blockers (0 found)

✅ No missing keys detected.

### P1 High — Locale Pollution (69 found)

**Impact**: Wrong language displayed to users (French text in English/Spanish locales).

| Key | Locale | FR Value | Current Value |
|-----|--------|----------|---------------|
| `settings.about.appName` | en | ResetPulse | ResetPulse |
| `settings.about.version` | en | Version | Version |
| `settings.sections.configuration` | en | CONFIGURATION | CONFIGURATION |
| `settings.sections.keepAwake` | en | Keep Awake | Keep Awake |
| `settings.sections.ambiance` | en | AMBIANCE | AMBIANCE |
| `settings.sections.info` | en | INFO | INFO |
| `activities.yoga` | en | Yoga | Yoga |
| `activities.sport` | en | Sport | Sport |
| `palettes.softLaser` | en | Soft Laser | Soft Laser |
| `palettes.tropical` | en | Tropical | Tropical |
| `palettes.zen` | en | Zen | Zen |
| `palettes.darkLaser` | en | Dark Laser | Dark Laser |
| `sounds.microwave_ping` | en | Ping | Ping |
| `sounds.kitchen_timer` | en | Ding | Ding |
| `sounds.kitchen_timer_2` | en | Signal | Signal |
| `sounds.egg_timer` | en | Tilt | Tilt |
| `sounds.toaster_bell` | en | Pop | Pop |
| `customActivities.duration.minutes` | en | min | min |
| `timerMessages.work.startMessage` | en | Focus | Focus |
| `settings.about.appName` | es | ResetPulse | ResetPulse |
| `settings.sections.configuration` | es | CONFIGURATION | CONFIGURATION |
| `settings.sections.keepAwake` | es | Keep Awake | Keep Awake |
| `settings.sections.ambiance` | es | AMBIANCE | AMBIANCE |
| `settings.sections.info` | es | INFO | INFO |
| `activities.yoga` | es | Yoga | Yoga |
| `palettes.softLaser` | es | Soft Laser | Soft Laser |
| `palettes.tropical` | es | Tropical | Tropical |
| `palettes.zen` | es | Zen | Zen |
| `palettes.darkLaser` | es | Dark Laser | Dark Laser |
| `customActivities.duration.minutes` | es | min | min |
| `timerMessages.work.startMessage` | es | Focus | Focus |
| `settings.about.appName` | de | ResetPulse | ResetPulse |
| `settings.about.version` | de | Version | Version |
| `settings.sections.configuration` | de | CONFIGURATION | CONFIGURATION |
| `settings.sections.keepAwake` | de | Keep Awake | Keep Awake |
| `settings.sections.ambiance` | de | AMBIANCE | AMBIANCE |
| `settings.sections.info` | de | INFO | INFO |
| `activities.break` | de | Pause | Pause |
| `activities.yoga` | de | Yoga | Yoga |
| `activities.sport` | de | Sport | Sport |
| `palettes.softLaser` | de | Soft Laser | Soft Laser |
| `palettes.zen` | de | Zen | Zen |
| `palettes.darkLaser` | de | Dark Laser | Dark Laser |
| `customActivities.duration.minutes` | de | min | min |
| `timerMessages.work.startMessage` | de | Focus | Focus |
| `settings.about.appName` | it | ResetPulse | ResetPulse |
| `settings.sections.configuration` | it | CONFIGURATION | CONFIGURATION |
| `settings.sections.keepAwake` | it | Keep Awake | Keep Awake |
| `settings.sections.ambiance` | it | AMBIANCE | AMBIANCE |
| `settings.sections.info` | it | INFO | INFO |
| `activities.yoga` | it | Yoga | Yoga |
| `activities.sport` | it | Sport | Sport |
| `palettes.softLaser` | it | Soft Laser | Soft Laser |
| `palettes.zen` | it | Zen | Zen |
| `palettes.darkLaser` | it | Dark Laser | Dark Laser |
| `customActivities.duration.minutes` | it | min | min |
| `timerMessages.work.startMessage` | it | Focus | Focus |
| `settings.about.appName` | pt | ResetPulse | ResetPulse |
| `settings.sections.configuration` | pt | CONFIGURATION | CONFIGURATION |
| `settings.sections.keepAwake` | pt | Keep Awake | Keep Awake |
| `settings.sections.ambiance` | pt | AMBIANCE | AMBIANCE |
| `settings.sections.info` | pt | INFO | INFO |
| `activities.yoga` | pt | Yoga | Yoga |
| `palettes.softLaser` | pt | Soft Laser | Soft Laser |
| `palettes.tropical` | pt | Tropical | Tropical |
| `palettes.zen` | pt | Zen | Zen |
| `palettes.darkLaser` | pt | Dark Laser | Dark Laser |
| `customActivities.duration.minutes` | pt | min | min |
| `timerMessages.work.startMessage` | pt | Focus | Focus |

### P2 Medium — Obsolete Keys (0 found)

✅ No obsolete keys detected.

### P3 Low — Duplicate Values (3 found)

**Impact**: Redundancy, confusion. Consider consolidating to canonical keys.

| Value | Keys | Recommendation |
|-------|------|----------------|
| Marche | `activities.walking`, `timerMessages.walking.startMessage` | Consolidate to activities.walking |
| Respire | `timerMessages.meditation.startMessage`, `timerMessages.yoga.startMessage` | Consolidate to timerMessages.yoga.startMessage |
| Joue | `timerMessages.gaming.startMessage`, `timerMessages.music.startMessage` | Consolidate to timerMessages.music.startMessage |

## Dynamic Key Validation

**timerMessages**:
- ✅ All 34 timerMessages keys exist

**sounds**:
- ✅ All 10 sounds keys exist

## Statistics

- **Code coverage**: 100% (276/276 keys used)
- **Dead keys**: 0 (0%)
- **Locale completion**: FR/EN 100%, Others vary (see locales summary)

## Recommendations

2. **Fix 69 P1 locale pollution issues** (HIGH priority)
4. **Consider consolidating 3 P3 duplicate groups** (future optimization)

