---
created: '2025-09-28'
updated: '2025-10-18'
status: active
milestone: M3-M6
confidence: high
---

# 🧪 Testing - ResetPulse

> Documentation unifiée de la stratégie de tests pour ResetPulse

## 🎯 Vue d'ensemble

Cette section centralise toute la stratégie de testing du projet ResetPulse, incluant les tests unitaires, d'intégration et de validation critique.

## 📋 Documents de Testing

### Tests Critiques Actifs
- **[Audio System Test](audio-system-test.md)** - Validation critique du système audio (mode silencieux, arrière-plan)

### Docs Archivées
- **Testing Strategy** → Archivé (stratégie établie et stable)
- **Testing Patterns** → Archivé (patterns React Native documentés)


## 🔧 Configuration Actuelle

### Jest SDK 54
- **Configuration minimaliste** compatible avec Expo SDK 54
- **react-test-renderer** au lieu de @testing-library/react-native
- **Tests archivés** dans `src/hooks/__tests__/archive-sdk51/` pour référence

### Coverage Actuel
- **Tests totaux :** 64
- **Pass rate :** 89% (57/64)
- **useDialOrientation :** 100% (27/27)
- **useTimer :** 81% (30/37)

## ⚡ Commandes Rapides

```bash
# Test sans coverage
npm test -- --no-coverage

# Test avec watch
npm test -- --watch

# Test critique uniquement
npm run test:critical

# Test par module
npm run test:timer
npm run test:hooks
```

## 🎯 Priorités de Test

### Priorité 1 - Critical Path ✅
- Démarrage/arrêt timer (100% testé)
- Reset à zéro (100% testé)
- Conversions angle/minutes (100% testé)
- Modes 25/60 min (100% testé)

### Priorité 2 - Edge Cases ✅
- Timer à 0 → Start (testé)
- Changements rapides d'état (testé)
- Valeurs limites (angles négatifs, >360°) (testé)

### Priorité 3 - Integration
- [ ] Gestures pan
- [ ] Haptic feedback (mocké)
- [ ] Persistence state

## 🔄 Maintenance

### Hebdomadaire
- Vérifier les warnings de tests
- Update dependencies de test si nécessaire

### Mensuel
- Réviser les tests flaky
- Audit complet coverage

### Par Release
- Performance des tests
- Documentation mise à jour

---

*Documentation testing maintenue à jour avec les tests. Dernière révision : 2025-10-02*