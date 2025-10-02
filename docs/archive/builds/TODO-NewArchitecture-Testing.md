# TODO - New Architecture Testing Plan

## 🎯 Objectif
Valider le bon fonctionnement de ResetPulse avec React Native New Architecture + expo-audio

## 📋 Approche Structurée

### Phase 1: Préparation (5 min)
1. **Vérifier l'environnement**
   ```bash
   # Vérifier que tout est OK
   npx expo-doctor

   # S'assurer que les dépendances sont à jour
   npm ls expo react-native
   ```

2. **Nettoyer les caches** (si problèmes)
   ```bash
   # Nettoyer tous les caches
   npx expo start --clear
   rm -rf node_modules/.cache
   ```

### Phase 2: Tests Fonctionnels (15 min)

#### 🚀 Test 1 - Démarrage Initial
**Comment tester:**
1. Lancer l'app: `npx expo run:ios` ou `npx expo run:android`
2. Observer le temps de démarrage (chronomètre)
3. Vérifier l'absence d'écran blanc prolongé

**Ce qu'on vérifie:**
- [ ] Démarrage < 3 secondes
- [ ] Pas de crash immédiat
- [ ] Interface s'affiche correctement
- [ ] Logo et splash screen OK

#### 🔊 Test 2 - Système Audio
**Comment tester:**
1. Démarrer un timer de 1 minute
2. Attendre la fin
3. Vérifier que le son se déclenche

**Variations à tester:**
- [ ] Mode silencieux activé → son doit jouer
- [ ] Avec écouteurs branchés
- [ ] Volume au minimum puis au maximum
- [ ] Pendant qu'une autre app joue de la musique

#### ⏱️ Test 3 - Fonctionnalités Timer
**Comment tester chaque durée:**
1. Sélectionner une durée (1, 3, 5, 10, 15, 20, 25 min)
2. Démarrer → Vérifier que ça compte
3. Pause → Vérifier que ça s'arrête
4. Reprendre → Vérifier que ça continue
5. Reset → Vérifier retour à zéro

**Checklist rapide:**
- [ ] Timer 1 min (test rapide complet)
- [ ] Timer 5 min (avec pause/reprise)
- [ ] Timer 25 min (lancer et annuler)

### Phase 3: Tests Performance (10 min)

#### 📊 Test 4 - Fluidité Interface
**Comment mesurer:**
1. Ouvrir les DevTools React Native (shake device ou Cmd+D)
2. Activer "Show Perf Monitor"
3. Interagir avec l'app pendant 2 min

**Métriques cibles:**
- [ ] UI: 60 fps constant (pas de chutes)
- [ ] JS: 60 fps (pas de lag)
- [ ] RAM: Stable (pas d'augmentation continue)

#### 🎨 Test 5 - Animations
**Comment tester:**
1. Observer les transitions entre états du timer
2. Tester les gestes tactiles (swipe, tap)
3. Vérifier la fluidité des changements de couleur

**Points d'attention:**
- [ ] Pas de saccades dans les animations
- [ ] Réactivité immédiate au toucher
- [ ] Transitions douces entre états

### Phase 4: Tests Stabilité (10 min)

#### 💪 Test 6 - Résistance
**Scénarios à reproduire:**

1. **Background/Foreground**
   - Démarrer timer 5 min
   - Mettre app en arrière-plan (Home)
   - Revenir après 2 min
   - [ ] Timer continue correctement

2. **Interruption téléphone**
   - Démarrer timer
   - Simuler appel (autre téléphone)
   - [ ] App survit à l'interruption

3. **Multi-tasking intensif**
   - Démarrer timer
   - Ouvrir 5 autres apps
   - Revenir à ResetPulse
   - [ ] App toujours fonctionnelle

### Phase 5: Validation Finale (5 min)

#### ✅ Checklist Rapide Final
**Test "Tour complet" en 5 minutes:**
1. [ ] Lancer app → OK
2. [ ] Sélectionner 1 min → OK
3. [ ] Démarrer → Compte bien
4. [ ] Pause → S'arrête
5. [ ] Resume → Reprend
6. [ ] Fin → Son joué
7. [ ] Reset → Retour à zéro
8. [ ] Changer durée → Fonctionne
9. [ ] Quitter et relancer → Préférences sauvées

## 🛠️ Commandes Utiles

```bash
# Phase 1 - Préparation
npx expo-doctor                    # Vérifier la santé du projet
npm test                           # Lancer les tests unitaires

# Phase 2 - Lancement
npx expo run:ios                  # iOS Simulator
npx expo run:android              # Android Emulator
npx expo start                    # Expo Go (dev rapide)

# Phase 3 - Debug si problèmes
npx expo start --clear            # Reset tous les caches
npm run ios -- --reset-cache      # Reset Metro bundler
adb logcat | grep -i crash        # Logs Android crashes

# Phase 4 - Performance
instruments -s devices            # Liste devices iOS
xcrun simctl list devices         # Simulateurs disponibles
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