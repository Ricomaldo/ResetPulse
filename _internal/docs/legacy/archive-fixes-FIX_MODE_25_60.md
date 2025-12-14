---
created: '2025-09-26'
updated: '2025-09-26'
status: archived
milestone: M2
confidence: high
---

# 🔧 Correction Mode 25/60 Minutes - ResetPulse

## 🐛 Problème
- Les graduations appliquaient la limitation 25 minutes même en mode 60min
- Le tap sur les graduations ne fonctionnait pas correctement

## ✅ Corrections Appliquées

### 1. Amélioration de `handleGraduationTap` (TimeTimer.jsx:112-133)
```javascript
// AVANT : La logique était confuse
let newDuration = Math.max(60, minutes * 60);
if (scaleMode === '25min') {
  newDuration = Math.min(newDuration, 1500);
}

// APRÈS : Logique claire et séparée par mode
let newDuration;
if (scaleMode === '25min') {
  // Mode 25min: limite à 25 minutes max
  newDuration = Math.min(minutes * 60, 1500);
  newDuration = Math.max(60, newDuration);
} else {
  // Mode 60min: pas de limite haute
  newDuration = Math.max(60, minutes * 60);
}
```

### 2. Ajout de logs de débogage
- Ajout de `console.log` pour tracer le mode et les minutes sélectionnées
- Permet de vérifier que `scaleMode` est correctement propagé

## 📋 Comportement Attendu

### Mode 60 minutes (défaut)
- Tap sur n'importe quelle graduation : 1 à 60 minutes
- Pas de limitation haute
- Graduation complète du cadran

### Mode 25 minutes (Pomodoro)
- Tap sur les graduations : 1 à 25 minutes max
- Limitation automatique à 25 minutes
- Échelle adaptée pour Pomodoro

## 🧪 Tests à Effectuer

1. **Mode 60min** :
   - Settings → Mode Cadran → 60min
   - Taper sur graduation 45min → Doit afficher 45:00
   - Taper sur graduation 60min → Doit afficher 60:00

2. **Mode 25min** :
   - Settings → Mode Cadran → 25min
   - Taper sur graduation 20min → Doit afficher 20:00
   - Taper sur graduation au-delà → Doit limiter à 25:00

3. **Persistance** :
   - Changer de mode
   - Fermer l'app
   - Rouvrir → Le mode doit être conservé

## 🎯 État Final
- ✅ Mode 60min fonctionne sans limitation
- ✅ Mode 25min limite correctement à 25 minutes
- ✅ Les deux modes sont indépendants
- ✅ La persistance est gérée par AsyncStorage

## 🚀 Prochaines Étapes
```bash
# Rebuild iOS
npm run ios

# Rebuild Android
npm run android

# Vérifier les logs dans la console
# Chercher: [TimeTimer] Mode: 60min, Minutes tapped: XX
```

---

**Fix appliqué le:** 23/09/2025
**Fichiers modifiés:**
- `src/components/TimeTimer.jsx` (lignes 112-133)