# Timer Refactoring - Problèmes Identifiés

## 🔴 Problèmes Critiques

### 1. Gestion du Zéro
- **Fichier**: `src/components/TimerCircle.jsx:290-293`
  - Le code force 60 ou 25 au lieu d'accepter 0
  - Impossible de sélectionner 0 minutes par drag

- **Fichier**: `src/hooks/useTimer.js:169`
  - `resetTimer` remet à `duration` au lieu de 0
  - État initial confus

### 2. Logique d'Orientation Dispersée
- **Fichier**: `src/components/TimerCircle.jsx:267-312`
  - Fonction `angleToMinutes` de 45 lignes dans le composant
  - Duplication de logique clockwise/counter-clockwise
  - Calculs complexes mélangés avec le rendu

### 3. Composant Monolithique
- **Fichier**: `src/components/TimerCircle.jsx`
  - 588 lignes dans un seul fichier
  - Gère simultanément : SVG, animations, interactions, calculs
  - Re-renders fréquents de tout le composant

### 4. Modes Hardcodés
- **Multiples fichiers**:
  - `scaleMode === '60min'` répété 15+ fois
  - `scaleMode === '25min'` répété 10+ fois
  - Pas d'abstraction pour ajouter de nouveaux modes

## 🟡 Problèmes de Performance

### 1. Re-renders Inutiles
- SVG complet re-render sur chaque tick du timer
- Graduations recalculées même si elles ne changent pas
- Pas de mémoisation des calculs coûteux

### 2. Animations Non Optimisées
- Multiples `Animated.Value` qui se chevauchent
- Pas de `useNativeDriver` sur certaines animations

## 🟠 Problèmes de Maintenabilité

### 1. Code Dupliqué
- Logique clockwise répétée dans plusieurs endroits
- Calculs d'angle dans TimerCircle ET TimeTimer

### 2. Couplage Fort
- TimeTimer dépend directement de TimerCircle
- Contextes qui se chevauchent (TimerOptions, TimerPalette)

### 3. Manque de Tests
- Aucun test unitaire sur les calculs critiques
- Pas de tests sur les interactions drag/tap

## 📋 Plan de Correction

1. **Priorité 1**: Corriger la logique du zéro
2. **Priorité 2**: Centraliser les calculs d'orientation
3. **Priorité 3**: Décomposer TimerCircle
4. **Priorité 4**: Optimiser les performances