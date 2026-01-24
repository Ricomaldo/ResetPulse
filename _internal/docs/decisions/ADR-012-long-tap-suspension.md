---
created: '2026-01-23'
updated: '2026-01-23'
status: active
tags: [adr, ux, interaction, pulse-button, long-tap, suspension]
---

# ADR-012: Suspension Temporaire de la Feature Long Tap

## Status
**Active** — Suspended in v2.1.6

## Context

ResetPulse intègre depuis v2.1.0+ une feature permettant de personnaliser les interactions du PulseButton via deux settings :
- **Long Press Start** : Démarrer le timer avec un long tap au lieu d'un simple tap
- **Long Press Stop** : Arrêter le timer avec un long tap au lieu d'un simple tap

### Problèmes identifiés (v2.1.5)

Tentative de correction du comportement long tap dans le build 2.1.5, mais **échec** :
- Comportement instable du long press
- Interactions incohérentes entre simple tap et long tap
- Feedback utilisateur négatif sur la fiabilité
- Conflits potentiels avec d'autres gestures (drag du dial, etc.)

### Contraintes temporelles

- **Timeline projet** : Position actuelle M8
- **Priorité** : Stabilité > Features expérimentales
- **Besoin** : Release 2.1.6 rapide pour corriger autres bugs critiques
- **Ressources** : Pas de temps disponible pour debugging approfondi du long tap

---

## Decision

### Suspension immédiate de la feature

**Décision prise** : Désactivation temporaire de la feature long tap en **v2.1.6** pour :
1. **Stabiliser l'app** : Retour à un comportement simple tap fiable
2. **Éviter confusion utilisateur** : Pas de feature partiellement fonctionnelle
3. **Prioriser releases critiques** : Focus sur bugs bloquants

### Implémentation de la suspension

**Changements appliqués** :

| Composant | Action | Rationale |
|-----------|--------|-----------|
| **SettingsPanel** | Désactivation (commentaires) des switches Long Press Start/Stop | Masquer les settings inutilisables |
| **OnboardingFlow** | **Pas de changement** (settings jamais configurés en onboarding) | Pas de cleanup nécessaire |
| **PulseButton** | **Pas de changement** (simple tap par défaut) | Comportement par défaut stable |

**Code Pattern** (SettingsPanel.jsx) :

```javascript
// ❌ SUSPENDED in v2.1.6 - ADR-012
// Feature Long Tap instable, désactivée temporairement
// Voir ADR-012 pour contexte et plan de réactivation

/* Long Press Start - COMMENTED OUT
<View style={styles.optionRow}>
  <View style={{ flex: 1 }}>
    <Text style={styles.optionLabel}>{t('settings.timer.longPressStart')}</Text>
    <Text style={styles.optionDescription}>
      {customStartLongPress
        ? t('settings.timer.longPressStartDescriptionOn')
        : t('settings.timer.longPressStartDescriptionOff')}
    </Text>
  </View>
  <Switch
    value={customStartLongPress}
    onValueChange={(value) => {
      haptics.switchToggle().catch(() => {});
      setCustomInteraction(value, customStopLongPress);
    }}
    {...theme.styles.switch(customStartLongPress)}
  />
</View>
*/

/* Long Press Stop - COMMENTED OUT
<View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
  <View style={{ flex: 1 }}>
    <Text style={styles.optionLabel}>{t('settings.timer.longPressStop')}</Text>
    <Text style={styles.optionDescription}>
      {customStopLongPress
        ? t('settings.timer.longPressStopDescriptionOn')
        : t('settings.timer.longPressStopDescriptionOff')}
    </Text>
  </View>
  <Switch
    value={customStopLongPress}
    onValueChange={(value) => {
      haptics.switchToggle().catch(() => {});
      setCustomInteraction(customStartLongPress, value);
    }}
    {...theme.styles.switch(customStopLongPress)}
  />
</View>
*/
```

### Comportement post-suspension

**PulseButton** :
- Simple tap pour **start/stop** (comportement par défaut)
- Long tap **désactivé** (settings masqués)
- Pas de changement dans la logique du hook `useTimer` (simple tap prioritaire)

---

## Consequences

### ✅ Positives

1. **Stabilité immédiate** : Retour à un comportement fiable et testé
2. **Pas de régression** : Simple tap fonctionne correctement depuis toujours
3. **Code préservé** : Settings commentés (pas supprimés), facile à réactiver
4. **Release rapide** : Pas de debugging approfondi nécessaire
5. **Focus clair** : Équipe peut se concentrer sur bugs critiques

### ⚠️ Trade-offs

1. **Feature perdue temporairement** : Utilisateurs qui utilisaient long tap doivent revenir à simple tap
   - **Mitigation** : Feature était instable (peu d'utilisateurs affectés)

2. **Debt technique** : Code commenté dans SettingsPanel
   - **Acceptable** : Solution temporaire claire (ADR-012 documente)
   - **Plan** : Réactivation future avec fix proper (voir "Future Work")

3. **i18n keys orphelines** : Clés de traduction pour long tap non utilisées
   - **Acceptable** : Pas de pollution critique (3-4 keys x 15 locales)
   - **Plan** : Conserver pour réactivation future

### 🚫 Alternatives considérées

**Alternative 1** : Fixer le bug avant release 2.1.6
- ❌ **Rejeté** : Trop de temps nécessaire, timeline serrée

**Alternative 2** : Supprimer complètement le code long tap
- ❌ **Rejeté** : Perte de travail, réactivation future plus difficile

**Alternative 3** : Garder settings visibles mais disabled
- ❌ **Rejeté** : Confusion utilisateur ("pourquoi c'est grisé ?")

---

## Related

- **ADR-007** : Timer States & Gestures (initial implementation)
- **Component** : `src/components/settings/SettingsPanel.jsx`
- **Component** : `src/components/timer/PulseButton.jsx`
- **Hook** : `src/hooks/useTimer.js`
- **Context** : `src/contexts/TimerConfigContext.jsx` (interaction.customStartLongPress/customStopLongPress)

---

## Future Work

### Plan de réactivation (post-v2.1.6)

**Quand la feature sera fixée** :

1. **Debugging approfondi** :
   - Identifier root cause de l'instabilité long tap
   - Tester interactions avec gestures dial (drag, tap graduations)
   - Valider comportement sur iOS ET Android

2. **Tests exhaustifs** :
   - Unit tests pour PulseButton states
   - Integration tests pour interactions croisées
   - QA manuelle sur devices réels

3. **Réactivation progressive** :
   - Décommenter settings dans SettingsPanel
   - Ajouter feature flag pour testing beta
   - Release progressive (beta → production)

### Critères de réactivation

**La feature peut être réactivée quand** :
- [ ] Long tap fonctionne de manière stable sur iOS et Android
- [ ] Pas de conflit avec drag dial
- [ ] Tests automatisés couvrent les edge cases
- [ ] QA validée sur 3+ devices réels
- [ ] Beta testeurs confirment stabilité

---

## Implementation Notes

### Files Modified (v2.1.6)

1. **src/components/settings/SettingsPanel.jsx**
   - Ligne 263-301 : Settings Long Press Start/Stop **commentés**
   - Ajout commentaires ADR-012 pour traçabilité

2. **CHANGELOG.md**
   - Section v2.1.6 : Documente suspension temporaire
   - Lien vers ADR-012 pour contexte

3. **_internal/docs/decisions/ADR-012-long-tap-suspension.md** (NEW)
   - Ce document

### Code Cleanup (NOT done)

**Intentionnellement NON supprimés** :
- i18n keys `settings.timer.longPressStart*` et `settings.timer.longPressStop*`
- Context properties `customStartLongPress` / `customStopLongPress`
- Hook logic dans `useTimer` pour long tap

**Rationale** : Suspension temporaire, pas suppression définitive.

---

**Auteur** : Claude Sonnet 4.5
**Date** : 2026-01-23
**Version** : ResetPulse v2.1.6
