---
created: '2025-09-24'
updated: '2025-09-24'
status: active
milestone: M2
confidence: high
---

# 🎯 NOUVEAU BRIEF AUDIT - CROSS-PLATFORM

## Objectif Stratégique
**iOS-FIRST avec Android-READY architecture**

App simple = opportunité parfaite pour maîtriser le cross-platform intelligent sans compromis qualité.

---

## 🔄 APPROCHE DEMANDÉE

### Platform-Adaptive Design (pas Platform-Specific)

**PRINCIPE** : Même expérience utilisateur, expression native sur chaque plateforme

- **iOS** : Respect total iOS HIG (shadows subtiles, SF Symbols, haptics, vibrancy)
- **Android** : Respect Material Design (elevation, ripples, FAB si pertinent, system icons)
- **Commun** : Logique UX, couleurs, spacing, typography, interactions core

---

## 🛠️ IMPLÉMENTATION CROSS-PLATFORM

### 1. Architecture Conditionnelle Intelligente
```js
// styles/platformStyles.js
const styles = StyleSheet.create({
  button: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
```

### 2. Composants Adaptatifs (pas Dupliqués)
- **ButtonPrimary** : Même logique, rendu natif selon Platform.OS
- **Card** : shadow iOS vs elevation Android
- **Modal** : vibrancy iOS vs overlay Android
- **Icons** : SF Symbols iOS vs Material Android

### 3. Tokens Design Communs
- Couleurs Reset Pulse identiques partout
- Spacing system unifié  
- Typography cohérente
- Interactions (haptics) cross-platform

---

## ⚡ DELIVRABLES ATTENDUS

1. **Audit cross-platform** (pas iOS-only)
2. **Plan d'implémentation** avec conditions Platform.OS
3. **Composants adaptatifs** qui respectent les deux ecosystèmes
4. **Design tokens unifiés** avec variations natives

---

## 🎨 PHILOSOPHIE

**"Native feel, unified experience"**

L'utilisateur iOS doit avoir une app qui respire iOS.  
L'utilisateur Android doit avoir une app qui respire Android.  
Mais les deux doivent reconnaître Reset Pulse instantanément.

**PAS** : App iOS déguisée en Android  
**OUI** : Reset Pulse qui s'exprime nativement sur chaque plateforme