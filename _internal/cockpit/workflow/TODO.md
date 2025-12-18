---
created: '2025-12-17'
updated: '2025-12-17'
status: active
---

# TODO - ResetPulse Workflow

## Layout Refactoring

### Dial Container Architecture (Technical Debt)
**Issue:** TimerDial SVG déborde intentionnellement de son container parent (`timerWrapper`)
- `timerWrapper` = `circleSize` (juste le cercle, ~370px)
- SVG rendu = `circleSize + TIMER_SVG.PADDING` (~420px)
- Nombres positionnés avec `NUMBER_RADIUS` = encore +18px hors du cercle

**Impact:**
- `showNumbers={true/false}` fait bouger le cadran (pas prévisible)
- Les contraintes de layout parent n'englobent pas les éléments visuels complets
- Architecture tordue : SVG sort de sa div parent

**Solution recommandée:**
1. Refactoriser `TimeTimer.timerWrapper` pour englober le SVG complet incluant les nombres
2. Calculer taille container = `circleSize + TIMER_SVG.PADDING + (2 * NUMBER_RADIUS)`
3. Garantir que `dialContainer` parent sait toujours la taille exacte qu'il héberge

**Files concernés:**
- `src/components/dial/TimeTimer.jsx` (ligne 95-111)
- `src/components/dial/TimerDial.jsx` (ligne 71, 99)
- `src/components/dial/timerConstants.js` (TIMER_SVG.PADDING, TIMER_PROPORTIONS.NUMBER_RADIUS)

**Priorité:** Medium (fonctionnel mais pas clean architecturalement)

---

## Notes
- Quick-win actuel : Dial libéré sans contraintes de width, comportement zen original restauré
- Cette refacto peut attendre stabilisation du layout global
