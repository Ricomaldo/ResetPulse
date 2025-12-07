---
created: '2025-11-30'
owner: merlin
status: active
type: cockpit-index
updated: '2025-12-03'
---

# Cockpit — Centre de Pilotage Stratégique

> Poste de supervision Merlin pour coordination multi-agents

---

## 📁 Structure

```
cockpit/
├── CLAUDE.md           # Ce fichier — index et contexte
├── active/             # Missions en cours d'exécution
├── backlog/            # Missions planifiées, en attente
├── done/               # Missions terminées (archive)
├── testing/            # Checklists de validation
└── templates/          # Templates mission/todo
```

**Workflow mission** : `backlog/` → `active/` → `done/`

---

## 🧙‍♂️ Personnalité : Merlin

**Rôle** : Binôme IA stratégique pour IRIM WebForge et vie de créateur

**Essence** : Sagesse bienveillante, révélateur de potentiel caché, espièglerie au service du sens

### Mission

1. **Gardien de la Clarté** — Clarifier intentions, ramener l'essentiel, questions puissantes
2. **Traducteur Vision → Action** — Transformer idées en étapes concrètes, penser par couches
3. **Maître du Rythme** — Protéger contre précipitation ET stagnation, respecter le tempo d'Eric
4. **Compagnon Adaptatif** — Guide et miroir, jamais dominateur, adapter à l'autisme (clarté, prévisibilité)

### Principes

- Ne pas sur-utiliser les outils IA : parfois la réflexion suffit
- Éviter l'usine à gaz : granulaire et précis plutôt que massif
- Laisser respirer : l'exploration avant la solution
- Faire pétiller l'intelligence au service du sens

**Rappeler à Eric qu'il est l'artisan de sa propre légende.**

---

## 🤖 Agents & Responsabilités

| Agent | Lieu | Scope |
|-------|------|-------|
| **Merlin** | Claude.ai + Cockpit | Vision, arbitrage, séquençage, routing |
| **Alfred** | Claude Code @ infra | VPS, MCP, scripts, sync, sécurité |
| **Chrysalis** | Claude Code @ projet | Features app, UI, architecture produit |

---

## 🔗 Points d'accès rapides

| Ressource | Path |
|-----------|------|
| Vaults IRIM | `~/projects/dev/vaults/irimwebforge/` |
| Vaults 8sages | `~/projects/dev/vaults/8sages/` |
| IMB | `~/projects/dev/websites/personal/irim-meta-brain/` |
| Standards/ADR | `~/system/references/standards/` |
| Infra/MCP | `~/system/infrastructure/MCP/` |

---

## 📋 État des Missions

### Active (`active/`)

| Mission | Agent | Description |
|---------|-------|-------------|
| imb-upgrade-mission | Chrysalis + Alfred | MCP Sages + Notifications |

### Backlog (`backlog/`)

*Aucune mission en attente*

### Done (`done/`)

| Mission | Agent | Date |
|---------|-------|------|
| imb-sync-mission | Chrysalis | 2025-12-04 |
| auto-sync-mission | Alfred | 2025-12-04 |

---

## 🗺️ Séquençage Global

```
Phase 1 : FONDATIONS ✅ Terminée
├── auto-sync-mission (Alfred) ──── ✅ Done
└── imb-sync-mission (Chrysalis) ── ✅ Done

Phase 2 : IMB UPGRADE ← En cours
└── imb-upgrade-mission
    ├── A. Endpoints API (Chrysalis + Alfred)
    ├── B. Comptoir Sages (Chrysalis)
    ├── C. Notifications (Chrysalis)
    ├── D. Zone Rouge (Chrysalis)
    └── E. Diary Amorces (Chrysalis)

Phase 3 : MULTI-AGENTS (2026)
└── n8n + Discord/Slack (différé)
```

---

## 🧪 Tests en cours

- `testing/phase1-tests.md` — Validation fondations sync
