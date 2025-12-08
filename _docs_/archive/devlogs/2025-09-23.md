---
created: '2025-09-23'
updated: '2025-09-23'
status: archived
milestone: M2
confidence: high
---

## je reprends le dev sur la base core.

CHANGELOG-version actuelle : 
# Changelog

All notable changes to ResetPulse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-09-23
- Data persistence with AsyncStorage for user preferences
- usePersistedState and usePersistedObject hooks for automatic state persistence
- Palette carousel with horizontal swipe navigation between 8 color palettes
- Animated palette name display when switching palettes
- Visual indicators (dots) showing current palette position
- Automatic color validation when switching palettes
- Premium-ready palette system (infrastructure for future premium features)

### Changed - 2025-09-23
- Enhanced TimeTimer UI with improved layout and controls
- Timer default duration changed from 4 to 5 minutes
- Added increment/decrement buttons (±1 minute) for duration adjustment
- Redesigned preset buttons in 2x2 grid layout (5m, 15m, 30m, 45m)
- Improved ColorSwitch with larger touch targets and better visual feedback
- Enhanced TimerCircle with refined stroke width and gradient center dot
- Color switch container now has background and shadow for better visibility

### Fixed - 2025-09-23
- User preferences now persist across app restarts (palette, color, timer options)
- Color selection resets to default when switching to incompatible palette

### Added - 2025-09-22
- Settings modal with native iOS-style interface
- Palette selector with visual preview (8 palettes: terre, classique, laser, douce, pastel_girly, verts, bleus, canard)
- TimerOptions context for managing timer display settings
- Cadran toggle (60min mode vs Full duration mode)
- Rotation toggle (Clockwise vs Counter-clockwise)
- Settings icon in top-right corner
- PalettePreview component for visual color display
- Clean, minimal main screen layout (timer + color selector at thumb height)

### Changed
- Moved timer options to settings modal for cleaner UI
- Repositioned color selector below timer for better thumb accessibility (bottom: 120px)
- Removed PaletteSelector from main screen (now in settings)
- Simplified TimerScreen layout to focus on core timer functionality

### Added - Initial
- Initial React Native/Expo project setup
- Core timer functionality with useTimer hook (requestAnimationFrame-based for precision)
- TimerCircle component with SVG-based circular progress visualization
- TimeTimer component with preset durations (4m, 20m)
- ThemeProvider with Context API for theming
- Golden ratio-based design system (1.618 proportions)
- Responsive layout utilities for iPhone sizes (SE, 12/13/14, Pro Max)
- Laser color palette (green, cyan, magenta, yellow)
- French timer messages ("C'est parti", "C'est reparti", "C'est fini", "Pause")
- Play/Pause/Reset controls
- Color selector for timer visualization (4 laser colors)
- Dynamic preset button styling (colored background matching selected color)

### Technical
- React Native 0.81.4
- Expo SDK 54
- React Native SVG for circular timer graphics
- Folder structure: components, screens, styles, hooks, utils
- Theme system with colors, spacing, borders, shadows
- Responsive sizing based on device width


## J'ai cette idée que je veux implémmenter qui est nouvelle :

# Feature: Emoji Activités Timer

## Concept
Ajout d'un carrousel d'emojis au-dessus du timer pour contextualiser l'activité en cours. L'emoji sélectionné s'affiche dans le cercle du timer avec une animation pulse pendant le décompte pour favoriser l'ancrage attentionnel.

## Interface
- **Position carousel**: Au-dessus du timer
- **Emoji dans timer**: Centre ou partie basse du cercle
- **Animation**: Pulse/halo vibrant pendant le timer actif
- **Sélection**: Tap sur emoji pour changer d'activité

## Activités Core (Gratuites)
| Emoji | Activité | Usage Principal |
|-------|----------|----------------|
| 🧘 | Méditation | Sessions 20min |
| 📖 | Lecture | Focus lecture |
| 🌬️ | Respiration | Ancrage 4min |
| 💼 | Travail | Pomodoro technique |

## Extensions Premium
| Emoji | Activité | Cas d'usage |
|-------|----------|-------------|
| 💪 | Sport | Étirements, exercices courts |
| 🎨 | Créativité | Dessin, écriture libre |
| ☕ | Pause | Vraie déconnexion |
| 🚶 | Marche | Mouvement mindful |

## Stratégie Freemium
- **Gratuit**: 4 activités core
- **Premium**: Pack "Focus étendu" avec activités supplémentaires
- **Logique commerciale**: Activités de base couvrent usages principaux, premium pour diversification

## Questions Techniques à Résoudre
1. **Position emoji**: Centre vs bas du cercle (lisibilité vs intrusion)
2. **Timing animation**: Rythme cardiaque (60-80 bpm) vs plus lent pour méditation
3. **Persistance**: Emoji visible en permanence ou juste au début
4. **Taille**: Équilibre visibilité/encombrement

## Impact UX
- **Ancrage contextuel**: Aide à maintenir focus sur l'activité
- **Personnalisation**: Adaptation du timer au type d'activité
- **Motivation**: Aspect ludique et engagement utilisateur