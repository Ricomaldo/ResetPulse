---
created: '2026-01-16'
updated: '2026-01-16'
status: active
audit_type: validation
domain: i18n
---

# i18n Audit Validation — ResetPulse (2026-01-16)

## Executive Summary

- **Total keys in FR**: 300
- **Total keys used in code**: 286
- **Missing keys (P0)**: 0
- **Obsolete keys (P2)**: 24
- **Duplicate values (P3)**: 11
- **Locale pollution (P1)**: 74
- **Production readiness**: ⚠️ **WARNING** (74 P1 locale pollution issues should be fixed)

## Findings by Severity

### P0 Critical Blockers (0 found)

✅ No missing keys detected.

### P1 High — Locale Pollution (74 found)

**Impact**: Wrong language displayed to users (French text in English/Spanish locales).

| Key | Locale | FR Value | Current Value |
|-----|--------|----------|---------------|
| `onboarding.intentions.work.defaultName` | en | Focus | Focus |
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
| `onboarding.intentions.work.defaultName` | es | Focus | Focus |
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
| `onboarding.intentions.work.defaultName` | de | Focus | Focus |
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
| `onboarding.intentions.work.defaultName` | it | Focus | Focus |
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
| `onboarding.intentions.work.defaultName` | pt | Focus | Focus |
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

### P2 Medium — Obsolete Keys (24 found)

**Impact**: Dead code, bloat (~2KB). Safe to remove.

| Key | Value | Impact |
|-----|-------|--------|
| `onboarding.intentions.title` | C'est pour quoi ? | Dead code, bloat (~2KB) |
| `onboarding.intentions.relax.label` | Me poser | Dead code, bloat (~2KB) |
| `onboarding.intentions.relax.defaultName` | Méditation | Dead code, bloat (~2KB) |
| `onboarding.intentions.work.label` | Travailler | Dead code, bloat (~2KB) |
| `onboarding.intentions.work.defaultName` | Focus | Dead code, bloat (~2KB) |
| `onboarding.intentions.create.label` | Créer | Dead code, bloat (~2KB) |
| `onboarding.intentions.create.defaultName` | Création | Dead code, bloat (~2KB) |
| `onboarding.intentions.learn.label` | Apprendre | Dead code, bloat (~2KB) |
| `onboarding.intentions.learn.defaultName` | Étude | Dead code, bloat (~2KB) |
| `onboarding.intentions.move.label` | Bouger | Dead code, bloat (~2KB) |
| `onboarding.intentions.move.defaultName` | Sport | Dead code, bloat (~2KB) |
| `onboarding.intentions.other.label` | Autre | Dead code, bloat (~2KB) |
| `onboarding.intentions.other.defaultName` | Mon moment | Dead code, bloat (~2KB) |
| `onboarding.intentions.q1.focus` | Mieux me concentrer | Dead code, bloat (~2KB) |
| `onboarding.intentions.q1.launch` | M'aider à démarrer | Dead code, bloat (~2KB) |
| `onboarding.intentions.q1.breathe` | Prendre du temps pour moi | Dead code, bloat (~2KB) |
| `onboarding.intentions.q1.children` | Cadrer un moment avec mes enfants | Dead code, bloat (~2KB) |
| `onboarding.intentions.q1.other` | Autre chose... | Dead code, bloat (~2KB) |
| `onboarding.intentions.q2.starting` | Démarrer | Dead code, bloat (~2KB) |
| `onboarding.intentions.q2.finishing` | Aller au bout | Dead code, bloat (~2KB) |
| ... | _4 more keys_ | ... |

### P3 Low — Duplicate Values (11 found)

**Impact**: Redundancy, confusion. Consider consolidating to canonical keys.

| Value | Keys | Recommendation |
|-------|------|----------------|
| Méditation | `activities.meditation`, `onboarding.intentions.relax.defaultName` | Consolidate to activities.meditation |
| Focus | `onboarding.intentions.work.defaultName`, `timerMessages.work.startMessage` | Consolidate to timerMessages.work.startMessage |
| Créer | `customActivities.create.buttonCreate`, `onboarding.intentions.create.label` | Consolidate to onboarding.intentions.create.label |
| Étude | `activities.study`, `onboarding.intentions.learn.defaultName` | Consolidate to activities.study |
| Sport | `activities.sport`, `onboarding.intentions.move.defaultName` | Consolidate to activities.sport |
| Mon moment | `onboarding.intentions.other.defaultName`, `onboarding.launch.defaultActivity` | Consolidate to onboarding.launch.defaultActivity |
| Autre chose... | `onboarding.intentions.q1.other`, `onboarding.intentions.q2.other` | Consolidate to onboarding.intentions.q1.other |
| C'est-à-dire ? | `onboarding.intentions.q1.otherPlaceholder`, `onboarding.intentions.q2.otherPlaceholder` | Consolidate to onboarding.intentions.q1.otherPlaceholder |
| Marche | `activities.walking`, `timerMessages.walking.startMessage` | Consolidate to activities.walking |
| Respire | `timerMessages.meditation.startMessage`, `timerMessages.yoga.startMessage` | Consolidate to timerMessages.yoga.startMessage |
| Joue | `timerMessages.gaming.startMessage`, `timerMessages.music.startMessage` | Consolidate to timerMessages.music.startMessage |

## Dynamic Key Validation

**timerMessages**:
- ✅ All 34 timerMessages keys exist

**sounds**:
- ✅ All 10 sounds keys exist

## Statistics

- **Code coverage**: 92% (276/300 keys used)
- **Dead keys**: 24 (8%)
- **Locale completion**: FR/EN 100%, Others vary (see locales summary)

## Recommendations

2. **Fix 74 P1 locale pollution issues** (HIGH priority)
3. **Remove 24 P2 obsolete keys** (optional, cleanup)
4. **Consider consolidating 11 P3 duplicate groups** (future optimization)

