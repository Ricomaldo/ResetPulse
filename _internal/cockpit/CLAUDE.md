---
created: '2025-11-30'
updated: '2025-12-15'
status: active
type: cockpit-index
---

# Cockpit ResetPulse

Centre de commandement projet ResetPulse.

## 🚀 Quick Start (Eric)

**Où es-tu en ce moment?** Lis ci-dessous dans cet ordre:

1. **Current mission** → `workflow/active/current.md` (symlink to planning/)
2. **Audit summary** → `../docs/audits/audit-2025-14-12/INDEX.md` (10-audit recap)
3. **Next fix** → Choose Phase 2 section (A, B, or C) in planning/mission-post-audits-fix-sequence.md

**What you need**:
- Audit findings + architecture decisions: `../docs/audits/audit-2025-14-12/`
- Living architecture docs: `../docs/reports/` (NOT audit history)
- Execution plan: `planning/mission-post-audits-fix-sequence.md`

---

## Structure

```
_internal/cockpit/
├── CLAUDE.md           # Ce fichier — index et contexte
├── RULES.md            # Règles de tri cockpit vs docs
│
├── workflow/           # Workflow opérationnel
│   ├── active/        # Missions en cours (1-2 max)
│   ├── backlog/       # Missions planifiées
│   ├── done/          # Missions terminées
│   ├── paused/        # Missions en pause
│   └── inbox/         # Messages inter-agents
│
├── knowledge/         # Knowledge base personnelle
│   ├── devlog/        # Apprentissage, troubleshooting
│   ├── findings/      # Audits en cours, findings temporaires
│   └── guide/         # Guides de workflow personnel
│
├── planning/          # Vision stratégique
│   ├── roadmap/       # Timeline, milestones
│   └── templates/     # Templates mission/todo
│
└── testing/           # Checklists de validation
```

**Workflow mission** : `workflow/backlog/` → `workflow/active/` → `workflow/done/`

---

## Règles

- **1-2 missions actives max** par milestone
- Deux niveaux de granularité :
  - `mX-overview.md` — Suivi stratégique milestone (KPIs, liens missions)
  - `mission-[nom].md` — Exécution opérationnelle (tâches, code)
- Déplacer dans `done/` une fois terminé

---

## Références Système

| Document | Emplacement |
|----------|-------------|
| Framework Cockpit | `~/dev/_ref/frameworks/cockpit.md` |
| Index Références | `~/dev/_ref/LINKS.md` |

---

## État des Missions

### Active (`workflow/active/`)

| Fichier | Type | Description |
|---------|------|-------------|
| [current.md](workflow/active/current.md) | symlink → planning/ | 🔗 Post-Audits Fix Sequence (P0→P1→P2→P3) |

**Note**: `current.md` is a symlink to `planning/mission-post-audits-fix-sequence.md` (one source of truth)

### Backlog (`workflow/backlog/`)

| Fichier | Type | Description |
|---------|------|-------------|
| [mission-micro-celebrations.md](workflow/backlog/mission-micro-celebrations.md) | mission | Micro-célébrations fin timer |

### Done (`workflow/done/`)

| Fichier | Date | Description |
|---------|------|-------------|
| [mission-onboarding-v2.md](workflow/done/mission-onboarding-v2.md) | 2025-12-12 | Onboarding V2 (6 filtres) ✅ Merged to main |
| [mission-duration-popover.md](workflow/done/mission-duration-popover.md) | 2025-12-12 | Popover preset durée TimerScreen ✅ |

---

## 🗺️ Timeline ResetPulse

```
M1-M7.6  ████████████████████████████  Foundation → Production
M8       ████████░░░░░░░░░░░░░░░░░░░░  ← ICI (Optimisation Conversion)
M10      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Test Marketing
M11+     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Scaling ou Pivot
```

→ Détails : `planning/roadmap/timeline.md`
→ Source complète : `../docs/legacy/ROADMAP.md`

---

## 📍 Quick Navigation

- **Current Mission** → `workflow/active/current.md` (symlink to planning/)
- **All Missions** → `workflow/` (active, backlog, done)
- **Planning** → `planning/mission-post-audits-fix-sequence.md` (execution plan)
- **Audit Archive** → `../docs/audits/audit-2025-14-12/` (findings + references)

## Voir Aussi

- Projet : `../../CLAUDE.md` (tech stack, conventions)
- Documentation : `../docs/README.md` (guides, decisions, reports)
- Cockpit Rules : `RULES.md`
- Roadmap : `../docs/legacy/ROADMAP.md`
- Changelog : `../../CHANGELOG.md`
