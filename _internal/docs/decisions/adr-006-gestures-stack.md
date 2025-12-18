# ADR-006 : Stack Gestes & Animations

## Statut : PROPOSITION

**Date :** 18 décembre 2025

---

## Décision

Adopter le trio standard React Native pour gestes et animations :

```
react-native-gesture-handler
react-native-reanimated
@gorhom/bottom-sheet
```

---

## Gestes à implémenter

### DialZone

| Élément      | Geste             | Action                 |
| ------------ | ----------------- | ---------------------- |
| Dial         | Drag circulaire   | Ajuste durée           |
| Dial         | Tap centre        | Play/Pause             |
| Dial         | Long press centre | Reset                  |
| DigitalTimer | Tap               | Toggle mini/full       |
| DigitalTimer | Long press        | Easter egg (rotation?) |

### AsideZone (Drawer)

| Élément         | Geste                   | Action                         |
| --------------- | ----------------------- | ------------------------------ |
| Handle          | Swipe down              | Ferme drawer                   |
| Handle          | Swipe up                | Ouvre drawer                   |
| Carrousel       | Swipe horizontal lent   | Navigation item par item       |
| Carrousel       | Swipe horizontal rapide | Mode roulette (inertie + snap) |
| Incrémenteur    | Tap +/-                 | Ajuste durée                   |
| Incrémenteur    | Long press +/-          | Accélère                       |
| Affichage durée | Tap                     | Sync durée = cadran            |
| Bouton cadran   | Tap                     | Change échelle                 |

---

## Migration

| Priorité | Composant  | De                  | Vers                                  |
| -------- | ---------- | ------------------- | ------------------------------------- |
| P0       | Drawer     | PanResponder custom | @gorhom/bottom-sheet                  |
| P1       | Dial       | PanResponder        | GestureDetector                       |
| P2       | Carrousels | FlatList            | GestureDetector + Animated (roulette) |

---

## Prérequis

- [ ] Install `react-native-gesture-handler`
- [ ] Install `react-native-reanimated`
- [ ] Config Babel (`react-native-reanimated/plugin`)
- [ ] Rebuild natif (iOS + Android)
- [ ] Install `@gorhom/bottom-sheet`

---

## Références

- ADR-005 : Architecture DialZone / AsideZone
- https://docs.swmansion.com/react-native-gesture-handler/
- https://docs.swmansion.com/react-native-reanimated/
- https://gorhom.github.io/react-native-bottom-sheet/
