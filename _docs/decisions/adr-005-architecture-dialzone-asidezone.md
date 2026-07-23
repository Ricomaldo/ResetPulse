---
status: superseded
superseded_by: 'adr-014-recentrage-signature.md'
updated: '2026-07-23'
---

# ADR-005 : Architecture DialZone / AsideZone

## Statut : VALIDÉ

**Date :** 18 décembre 2025 (mis à jour 19 décembre 2025)
**Décideurs :** Eric + Chrysalis

---

## Contexte

ResetPulse nécessite une UI où le timer reste visible en permanence, même pendant la configuration des options. L'architecture précédente avec drawer overlay masquait le dial.

---

## Décision

### Découpage écran en 3 zones (ratio ~Fibonacci)

```
┌─────────────────────────────────────┐
│  DIALZONE (62%)                     │
│  ├─ DigitalTimer mini (64px, haut)  │
│  │   - Mode mini : ⏱️ + emoji       │
│  │   - Tap : affiche heure complète │
│  │   - Long press : Easter egg (TBD)│
│  └─ Dial (flex:1, centré)           │
│      - Toujours visible             │
│      - Gestes : drag, tap centre    │
├─────────────────────────────────────┤
│  MESSAGE ZONE (variable)            │
│  - Message dynamique selon état     │
│  - Ex: "Focus...", "Accompli ✨"    │
│  - Toujours visible (hors sheet)    │
├─────────────────────────────────────┤
│  BOTTOMSHEET (3 snap points)        │
│                                     │
│  SNAP 15% — Favorite Tool           │
│  ━━━━ handle                        │
│  [ton jouet préféré]                │
│                                     │
│  SNAP 38% — Toolbox                 │
│  ━━━━ handle                        │
│  [5][15][30][60] [−]25:00[+] [▶][⊡][↻]│
│  [😀][💻][☕][🧘] →                 │
│  [🔴][🟢][🔵][🟡] →                 │
│                                     │
│  SNAP 90% — All Options             │
│  [Toolbox complète]                 │
│  [Paramètres]                       │
│  [À propos]                         │
└─────────────────────────────────────┘
```

### 3 Niveaux de Profondeur BottomSheet

| Snap    | Hauteur                 | Contenu                                                  | Comportement                                 |
| ------- | ----------------------- | -------------------------------------------------------- | -------------------------------------------- |
| **15%** | Handle + Favorite Tool  | commands / activities / colors / none (configurable)     | **Défaut repos** + **auto-collapse running** |
| **38%** | Toolbox standard        | ControlBar + Activités + Couleurs (ordre dynamique)      | Swipe up depuis 15%                          |
| **90%** | All Options scrollable  | Toolbox + Settings + About + autres                      | Swipe up depuis 38%                          |

### Favorite Tool — 4 Options

| Option         | Snap 15% affiche                    | Usage                                  |
| -------------- | ----------------------------------- | -------------------------------------- |
| **commands**   | ControlBar (presets/duration/run)   | Contrôles rapides du timer             |
| **activities** | Carrousel activités                 | Quick activity change                  |
| **colors**     | Carrousel couleurs                  | Quick color change                     |
| **none**       | Handle seul                         | Minimaliste absolu                     |

**Configuration** : Dans All Options (snap 90%), section "Favorite Tool"

### Contenu par Niveau

**Snap 15% — Favorite Tool** :

- Handle (5px)
- Contenu dynamique selon config :
  - ControlBar (si `commands`)
  - Carrousel activités (si `activities`)
  - Carrousel couleurs (si `colors`)
  - Vide (si `none`)

**Snap 38% — Toolbox** :

- **Ordre dynamique** : Favorite tool en premier pour continuité visuelle avec Layer1
  - Si favorite = commands : ControlBar → Activités → Couleurs
  - Si favorite = activities : Activités → ControlBar → Couleurs
  - Si favorite = colors : Couleurs → ControlBar → Activités
  - Si favorite = none : ControlBar → Activités → Couleurs (défaut)
- **ControlBar** (layout horizontal) :
  - Presets : [5] [15] [30] [60]
  - Durée : [ − ] 25:00 [ + ]
  - Actions : [▶ Play] [⊡ Fit] [↻ Rotate]
- **Activités** : carrousel horizontal (favoris en premier)
- **Couleurs** : carrousel horizontal (favoris en premier)

**Snap 90% — All Options** (scrollable) :

- **Toolbox** (identique snap 38%)
- **Favorite Tool Config** :
  - [ ] Couleur / Activité / Presets / Controls / Rien
- **Settings** :
  - [ ] Afficher incrémenteur durée
  - [ ] Afficher boutons cadran
  - [ ] Afficher activités
  - [ ] Afficher couleurs
  - Sélection favoris (activités, couleurs)
  - Options dial (emoji, pulse)
  - Sons, thème, général
- **About** :
  - Version, crédits, legal

---

## Justification

### Timer stable + 3 niveaux de profondeur

- **DialZone** = contemplation permanente, le timer ne bouge jamais
- **Message Zone** = feedback immédiat, toujours visible
- **BottomSheet 3-snap** = progressive disclosure, de minimaliste à expert
- Le dial reste visible même sheet à 90% → changements visibles en direct

### Simplification radicale vs architecture précédente

**Avant** : CommandBar vs CarouselBar vs "que rendre visible par défaut ?"

**Après** : 3 niveaux clairs :

1. **Favorite Tool (15%)** — 1 outil au choix (commands / activities / colors / none)
2. **Toolbox (38%)** — les 3 outils standard (CommandsPanel, activités, couleurs) ordre fixe
3. **All Options (90%)** — tout le reste (settings, about, config avancée)

→ Plus de débat "où mettre quoi". User choisit son niveau de profondeur.

### Message Zone permanente

**Décision clé** : Message Zone hors du sheet (fixe entre Dial et BottomSheet).

**Pourquoi** :

- Feedback immédiat visible quel que soit le snap (15%/38%/90%)
- Timer running → Message "Focus..." toujours là, même si sheet à 15%
- Cohérence visuelle (zone stable comme le Dial)

### Ratio Fibonacci

62/38 ≈ 1.618 (nombre d'or). Équilibre visuel naturel. BottomSheet applique aussi Fibonacci dans ses snaps (15% → 38% → 90%).

---

## Conséquences

### Positives

- Dial toujours visible (62% écran)
- Message Zone permanente (feedback immédiat)
- Progressive disclosure (15% → 38% → 90%)
- Minimaliste par défaut (15% = Favorite Tool uniquement)
- Personnalisable (user choisit son Favorite Tool)
- Settings intégrés (plus de modal séparée)
- Architecture simple (3 zones, 1 sheet, 3 snaps)

### Négatives

- Gestes sheet vs carrousels à gérer (simultaneousHandlers requis)
- Snap 15% hauteur à tester (wrapper dev pour mesurer)
- Migration complexe (AsideZone legacy → BottomSheet)

### Fichiers impactés

**Renommages** :

- `AsideZone.jsx` → `AsideZone.legacy.jsx` (backup M1)
- `Drawer.jsx` → `Drawer2.legacy.jsx` (backup M1)

**Nouveaux** :

- `AsideZone.bottomsheet.jsx` → BottomSheet 3-snap (M1.5)
- `AllOptionsSection.jsx` → Contenu snap 90% (Settings + About inline)
- `FavoriteToolSection.jsx` → Contenu snap 15% (dynamique selon config)

**Supprimés** :

- `SettingsModal.jsx` → contenu migre dans AllOptionsSection (snap 90%)

**Modifiés** :

- `TimerScreen.jsx` → découpage Dial (62%) / Message Zone / BottomSheet
- `ControlBar.jsx` → nouveau composant horizontal (presets + duration + actions)
- `Layer1.jsx` / `Layer2.jsx` → orchestration snap 15% et 38%

---

## Références

- ADR-004 : Mécanisme Durée / Cadran
- ADR-006 : Stack Gestes (@gorhom/bottom-sheet migration)
- Session Chrysalis-Eric 18 décembre 2025 (version initiale 2-zones)
- Session Chrysalis-Eric 19 décembre 2025 (révision 3-zones + BottomSheet 3-snap)
- Session Chrysalis-Eric 19 décembre 2025 (ControlBar layout horizontal)
- Research doc : `_internal/cockpit/knowledge/findings/2025-12-19_gorhom-bottomsheet-doc-research.md`
- Migration plan : `_internal/cockpit/knowledge/findings/2025-12-18_drawer-bottomsheet-migration-plan.md`
