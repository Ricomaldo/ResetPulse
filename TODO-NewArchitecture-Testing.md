# TODO - New Architecture Testing Plan

## 🎯 Objectif
Valider le bon fonctionnement de ResetPulse avec React Native New Architecture + expo-audio

## ✅ Étapes de Test Prioritaires

### 1. Démarrage et Stabilité
- [ ] L'app se lance correctement avec New Architecture
- [ ] Aucun crash au démarrage
- [ ] Temps de démarrage acceptable vs ancien SDK
- [ ] Interface utilisateur s'affiche correctement

### 2. Système Audio (expo-audio)
- [ ] Le son se joue à la fin du timer
- [ ] Compatible avec mode silencieux iOS
- [ ] Pas de conflits avec autres apps audio
- [ ] Performance audio fluide (pas de lag)
- [ ] Test avec casque/haut-parleurs

### 3. Interactions Utilisateur
- [ ] Timer démarre/pause/reset correctement
- [ ] Gestes tactiles responsifs (New Architecture)
- [ ] Sélection des durées fonctionne
- [ ] Navigation entre écrans fluide

### 4. Performances New Architecture
- [ ] Animations Reanimated plus fluides
- [ ] Gestes react-native-gesture-handler optimisés
- [ ] Interface responsive (60fps)
- [ ] Utilisation mémoire optimisée

### 5. Tests de Non-Régression
- [ ] Tous les timers fonctionnent (1-25 min)
- [ ] Sauvegarde des préférences OK
- [ ] Couleurs et thèmes conservés
- [ ] Comportement écran verrouillé inchangé

### 6. Edge Cases
- [ ] App en arrière-plan pendant timer
- [ ] Interruption par appel téléphonique
- [ ] Basculement vers autres apps
- [ ] Rotation écran (si supportée)

## 🔧 Commandes de Test

```bash
# Lancer l'app
npx expo run:ios

# Tests unitaires (à réparer si nécessaire)
npm test

# Vérifier les performances
# Observer dans Instruments/DevTools
```

## 📊 Métriques à Observer

- **Temps de démarrage** : < 3 secondes
- **Frame rate** : 60fps constant
- **Mémoire** : Stable, pas de fuites
- **Audio latency** : < 100ms

## 🚨 Problèmes Potentiels

- Incompatibilités Fabric avec composants custom
- Changements API expo-audio vs expo-av
- Performance différente sur ancien matériel
- Problèmes CocoaPods/build natif

## ✨ Améliorations Attendues

- Animations plus fluides (Fabric)
- Interactions gestuelles optimisées
- API audio plus moderne et stable
- Meilleure intégration système iOS

---
*Plan créé après migration SDK 54 + New Architecture*
*Commit: 10da62a - feat: Enable New Architecture + migrate to expo-audio SDK 54*