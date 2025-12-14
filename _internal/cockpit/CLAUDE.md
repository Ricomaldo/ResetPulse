---
created: '2025-11-30'
updated: '2025-12-14'
status: active
type: cockpit-index
---

# Cockpit ResetPulse

Centre de commandement projet ResetPulse.

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
| [current.md](workflow/active/current.md) | mission | Audits Post-Refacto Flow |

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

## Voir Aussi

- Projet : `../../CLAUDE.md`
- Documentation : `../docs/README.md`
- Règles de tri : `RULES.md`
- Roadmap : `../docs/legacy/ROADMAP.md`
- Changelog : `../../CHANGELOG.md`
