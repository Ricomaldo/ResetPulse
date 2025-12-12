---
created: '2025-11-30'
updated: '2025-12-12'
status: active
type: cockpit-index
---

# Cockpit ResetPulse

Centre de commandement projet ResetPulse.

---

## Structure

```
cockpit/
├── CLAUDE.md           # Ce fichier — index et contexte
├── inbox/              # Messages inter-agents
├── active/             # Missions en cours (1-2 max)
├── backlog/            # Missions planifiées
├── done/               # Missions terminées
├── roadmap/            # Vision long terme
├── testing/            # Checklists de validation
└── templates/          # Templates mission/todo
```

**Workflow mission** : `backlog/` → `active/` → `done/`

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

### Active (`active/`)

| Fichier | Type | Description |
|---------|------|-------------|
| [m8-overview.md](active/m8-overview.md) | milestone | M8 Optimisation Conversion |

### Backlog (`backlog/`)

| Fichier | Type | Description |
|---------|------|-------------|
| [mission-micro-celebrations.md](backlog/mission-micro-celebrations.md) | mission | Micro-célébrations fin timer |

### Done (`done/`)

| Fichier | Date | Description |
|---------|------|-------------|
| [mission-onboarding-v2.md](done/mission-onboarding-v2.md) | 2025-12-12 | Onboarding V2 (6 filtres) ✅ Merged to main |
| [mission-duration-popover.md](done/mission-duration-popover.md) | 2025-12-12 | Popover preset durée TimerScreen ✅ |

---

## 🗺️ Timeline ResetPulse

```
M1-M7.6  ████████████████████████████  Foundation → Production
M8       ████████░░░░░░░░░░░░░░░░░░░░  ← ICI (Optimisation Conversion)
M10      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Test Marketing
M11+     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Scaling ou Pivot
```

→ Détails : `roadmap/timeline.md`
→ Source complète : `docs/ROADMAP.md`

---

## Voir Aussi

- Projet : `../CLAUDE.md`
- Roadmap : `../docs/ROADMAP.md`
- Changelog : `../CHANGELOG.md`
