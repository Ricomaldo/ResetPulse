---
created: '2025-12-15'
updated: '2025-12-15'
status: active
type: session-bootstrap
scope: resetpulse
---

# .claude/context.md — ResetPulse Session Bootstrap

**You're here**: `~/dev/apps/resetpulse/` — Production React Native timer app (v1.2.3, App Store + Play Store).

---

## 🚀 Quick Start Path Selector

Choose based on available time:

| Path | Time | Know | Do This |
|------|------|------|---------|
| **Minimal** ⚡ | 2-5min | What's active right now | 1. Read this file / 2. Check `_internal/cockpit/workflow/active/current.md` / 3. Start coding |
| **Standard** 📖 | 15-20min | What am I building & why | 1. Read CLAUDE.md Tech Stack / 2. Read mission Quick Start / 3. Skim linked resources |
| **Deep** 🎓 | 1-2hr | How does everything work | 1. Read `~/dev/_ref/guides/agent-onboarding.md` / 2. Study architecture docs / 3. Set up dev environment |

---

## 📁 Key Local Paths

```
.                                    # Root
├── CLAUDE.md                         # Tech stack & conventions
├── README.md                         # Setup & build instructions
├── CHANGELOG.md                      # Version history
│
├── src/                              # Source code
│   ├── screens/TimerScreen.jsx       # Main app screen
│   ├── components/                   # Reusable components
│   ├── hooks/                        # Custom hooks (useTimer, usePremiumStatus)
│   ├── contexts/                     # React Context providers
│   ├── services/analytics.js         # Mixpanel integration
│   └── config/                       # Config (activities, palettes, RevenueCat)
│
├── __tests__/                        # Test suite
│   ├── __tests__/hooks/              # Hook tests (useTimer, useAnalytics)
│   └── README.md                     # Testing guide
│
└── _internal/                        # Project operations
    ├── cockpit/
    │   ├── CLAUDE.md                 # Mission state & active tracker
    │   ├── workflow/active/current.md # → Symlink to active mission
    │   ├── planning/mission-*.md      # Mission files with phases A/B/C
    │   └── done/                      # Completed missions
    │
    └── docs/
        ├── README.md                 # Docs index
        ├── decisions/ADR-*.md        # Architecture decisions
        ├── reports/                  # Architecture, performance, legal
        └── audits/audit-YYYY-MM-DD/  # Historical audit cycles
```

---

## 🎯 Current Mission

**Where to find it**:
```bash
cat _internal/cockpit/workflow/active/current.md
```

This symlink points to the active mission file. Mission files include:
- Objective & success metrics
- Phases (A, B, C, etc.) with time estimates
- Checklist of work items
- Linked resources (audit reports, architecture docs)
- Progress notes

---

## 🛠️ Essential Commands

```bash
# Development
npx expo start              # Start dev server
npm run ios                 # Launch iOS simulator
npm run android             # Launch Android emulator

# Testing
npm run test                # All tests
npm run test:hooks          # Hook tests only
npm run test:timer          # useTimer tests

# Versioning
npm run version:patch       # Bump patch (1.2.3 → 1.2.4)
npm run version:minor       # Bump minor (1.2.3 → 1.3.0)
npm run version:set 1.2.5   # Set specific version

# Validation
npm run lint                # ESLint check
npm run type-check          # TypeScript check (if enabled)

# Production builds
# iOS: Open ios/ResetPulse.xcworkspace in Xcode → Product > Archive
# Android: cd android && ./gradlew bundleRelease
```

---

## 📚 Framework Navigation

### Session Starters (Read First)
- **Momentum guide** (1page quick ref): `~/dev/_ref/guides/framework-momentum.md`
- **Agent onboarding** (3 paths, 2-2hr): `~/dev/_ref/guides/agent-onboarding.md`
- **Audit cycles** (methodology reference): `~/dev/_ref/guides/audit-cycles.md`

### Project Documentation
- **Tech stack & conventions**: `CLAUDE.md`
- **Mission state**: `_internal/cockpit/CLAUDE.md`
- **Active mission**: `_internal/cockpit/workflow/active/current.md` (symlink)
- **Architecture decisions**: `_internal/docs/decisions/`
- **Architecture reports** (current): `_internal/docs/reports/`
- **Audit archives** (historical): `_internal/docs/audits/audit-YYYY-MM-DD/`

### System Standards
- **ADR-01** (Architecture): `~/dev/_ref/standards/ADR-01-architecture-v2.md`
- **ADR-02** (Conventions): `~/dev/_ref/standards/ADR-02-conventions-nommage.md`
- **ADR-03** (Linking): `~/dev/_ref/standards/ADR-03-strategie-linking.md`
- **Cockpit Framework**: `~/dev/_ref/frameworks/cockpit.md`
- **Documentation Framework**: `~/dev/_ref/frameworks/documentation.md`

### Tooling & Validation
```bash
# Validate frontmatter across all files
~/dev/_infra/scripts/validate-frontmatter.sh

# Check all active missions (system-wide)
~/dev/_infra/scripts/check-missions.sh

# Scaffold new project
~/dev/_infra/scripts/new-project.sh [project-name]
```

---

## 💡 Common Tasks

| Task | Where | Command |
|------|-------|---------|
| Add new component | `src/components/` | Copy similar, follow naming (PascalCase) |
| Add new hook | `src/hooks/` + `__tests__/hooks/` | Copy existing pattern, add test |
| Update translations | `src/i18n/` | Edit language files, test with i18n key |
| Fix bug | Find in code | Write test first (`__tests__/`), fix, validate |
| Update config | `src/config/` | Edit config file, restart dev server |
| Check premium logic | `src/hooks/usePremiumStatus.js` | Core hook, well-tested |
| Add analytics | `src/services/analytics.js` + component | Use `useAnalytics()` hook |

---

## ⚡ Pro Tips

1. **Time box your reading**: Don't read everything. Use Minimal path for familiar work, Deep path only when needed.
2. **Interrupt learning to code**: Learn patterns while working, not before.
3. **Check symlink first**: `_internal/cockpit/workflow/active/current.md` is your mission source of truth.
4. **Test after each fix**: Don't batch changes. Use `npm run test` frequently.
5. **Update mission as you go**: Track progress in mission file's checklist.

---

## 🔗 Session Start Workflow

**Every session**:
1. ✅ Decide path (Minimal / Standard / Deep)
2. ✅ Read this file (you're here!)
3. ✅ Check active mission: `cat _internal/cockpit/workflow/active/current.md`
4. ✅ Read mission Quick Start section (if present)
5. ✅ Check dependencies: `npm install` (if needed)
6. ✅ Start dev: `npx expo start`
7. ✅ Begin work on next checklist item

---

**Created**: 2025-12-15
**Framework**: Documentation Framework + Cockpit Framework
**For**: Claude agents starting ResetPulse sessions
