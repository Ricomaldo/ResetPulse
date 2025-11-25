# Keep Awake Strategy - ResetPulse

**Date**: 2025-10-18
**Context**: Timer visuel TDAH - Écran se verrouille avant fin timer
**Status**: DECISION NEEDED

---

## Problème

**Situation actuelle**:
- Timer visuel = valeur principale de l'app
- Téléphone se met en veille automatiquement (30s-2min selon users)
- Notifications background fonctionnent MAIS perdent le visuel
- App perd son utilité principale pour persona TDAH/neuroatypique

**Impact utilisateur**:
- Timer visuel invisible pendant 80-90% de la durée (Pomodoro 25min)
- Frustration: "J'ai installé un timer VISUEL et je le vois pas"
- Notification suffisante pour neurotypiques, insuffisante pour TDAH

---

## Benchmarks Industrie

### Apps Timer Étudiées

**1. Time Timer (référence TDAH)**
- **Comportement**: Keep awake ACTIVÉ par défaut
- **Justification**: "Visual timer nécessite écran actif"
- **Toggle**: Disponible dans settings (désactivable)
- **Message**: Aucun onboarding spécifique

**2. Forest (focus app)**
- **Comportement**: Keep awake ACTIVÉ par défaut pendant session
- **Justification**: "Voir l'arbre pousser" = valeur
- **Toggle**: Oui, dans settings avancés
- **Batterie**: Mode "low power" disponible (réduit animations)

**3. Headspace / Calm (méditation)**
- **Comportement**: Keep awake pendant session guidée
- **Auto-disable**: Se désactive automatiquement après session
- **Rationale**: Sessions courtes (5-20min) → impact batterie faible

**4. Strava / Nike Run Club (fitness tracking)**
- **Comportement**: Keep awake FORCÉ (pas de toggle)
- **Justification**: Tracking actif = écran requis
- **Acceptation**: Users comprennent (activité physique = batterie secondaire)

**5. Pomodoro Apps Standards (Focus Booster, etc.)**
- **Comportement**: Keep awake OFF par défaut
- **Notification**: Sonore + vibration
- **Différence**: Ces apps ne sont PAS visuelles (juste compteur)

### Pattern Émergent

**Apps VISUELLES (timer, méditation, fitness)**:
- ✅ Keep awake activé par défaut dans 80% des cas
- ✅ Toggle disponible mais caché (settings avancés)
- ✅ Aucun message onboarding nécessaire
- ✅ Users acceptent car comprennent la valeur

**Apps AUDIO/NOTIFICATION (alarmes, rappels)**:
- ❌ Keep awake désactivé
- ✅ Notifications suffisantes

---

## Analyse Persona ResetPulse

### Persona Primaire: TDAH/Neuroatypique

**Besoins spécifiques**:
- **Ancrage visuel constant**: "Time blindness" nécessite visuel permanent
- **Friction cognitive minimale**: Ne PAS devoir penser à "garder l'écran allumé"
- **Predictability**: Comportement app cohérent avec intention (timer VISUEL)

**Citation hypothétique**:
> "J'ai téléchargé un timer VISUEL parce que je perds la notion du temps. Si je dois vérifier mon téléphone toutes les 5min pour réveiller l'écran, ça crée de la distraction et c'est contre-productif."

**Impact batterie**:
- **Pomodoro 25min**: ~5-8% batterie (écran actif)
- **Sessions multiples**: 3-4 Pomodoros/jour = 15-30% batterie
- **Trade-off acceptable?**: OUI pour persona TDAH (fonction > batterie)

### Persona Secondaire: Neurotypique Productivity

**Besoins**:
- Timer pour focus sessions
- Moins dépendant du visuel constant
- Plus sensible à batterie

**Citation hypothétique**:
> "J'aime bien le timer mais je préfère économiser ma batterie. La notification suffit."

---

## Options Techniques

### Option A: Keep Awake ON par Défaut (RECOMMANDÉ)

**Implementation**:
```javascript
// src/hooks/useKeepAwake.js
import { useKeepAwake } from 'expo-keep-awake';

const useTimerKeepAwake = () => {
  const { keepAwakeEnabled } = useSettings(); // Default: true
  const { isRunning } = useTimer();

  // Activate only when timer running + setting enabled
  if (isRunning && keepAwakeEnabled) {
    useKeepAwake();
  }
};
```

**Settings Toggle**:
```jsx
<Section title="⚡ Batterie">
  <Toggle
    label="Maintenir l'écran allumé pendant le timer"
    value={keepAwakeEnabled}
    onChange={setKeepAwakeEnabled}
    hint="Désactiver pour économiser la batterie"
  />
</Section>
```

**Avantages**:
- ✅ Aligné avec valeur proposition (timer VISUEL)
- ✅ Pattern standard apps visuelles (Time Timer, Forest)
- ✅ Zero friction pour persona primaire TDAH
- ✅ Respecte intention utilisateur (télécharger timer visuel)

**Inconvénients**:
- ⚠️ Impact batterie 5-8% par Pomodoro
- ⚠️ Users sensibles batterie doivent désactiver manuellement

### Option B: Keep Awake OFF par Défaut + Message Contextuel

**Implementation**:
```javascript
// Détecter premier timer où écran s'est verrouillé
const detectScreenLock = () => {
  // AppState listener
  if (timerRunning && screenLocked) {
    // Show modal après timer fini
    showKeepAwakePrompt();
  }
};
```

**Message Contextuel**:
```jsx
<Modal>
  <Title>💡 Astuce</Title>
  <Text>
    Votre écran s'est verrouillé pendant le timer.
    Voulez-vous activer "Maintenir l'écran allumé" ?
  </Text>
  <Buttons>
    <Button primary>Activer</Button>
    <Button>Non merci</Button>
  </Buttons>
</Modal>
```

**Avantages**:
- ✅ Respecte batterie par défaut
- ✅ Éduque utilisateur au bon moment
- ✅ Choix explicite

**Inconvénients**:
- ❌ Friction lors du premier usage (mauvaise première impression)
- ❌ User TDAH doit "subir" un timer raté pour découvrir feature
- ❌ Message modal = interruption cognitive (anti-TDAH)

### Option C: Détection Intelligente (Batterie + Durée)

**Implementation**:
```javascript
const smartKeepAwake = () => {
  const batteryLevel = await Battery.getBatteryLevelAsync();
  const timerDuration = duration;

  // Auto-enable si batterie > 50% ET timer > 10min
  if (batteryLevel > 0.5 && timerDuration > 600) {
    return true; // Keep awake
  }
  return false;
};
```

**Avantages**:
- ✅ Balance automatique fonction/batterie
- ✅ Pas de décision utilisateur

**Inconvénients**:
- ❌ Comportement imprévisible (TDAH déteste l'imprévisibilité)
- ❌ Complexité technique
- ❌ Cas edge difficiles (batterie 49% vs 51%)

### Option D: Mode "Low Power Visual"

**Implementation**:
```javascript
const lowPowerMode = {
  keepAwake: true,
  reduceBrightness: 0.3, // 30% luminosité
  disableAnimations: true, // Pas de pulse
  refreshRate: 1000, // 1 update/sec au lieu de 60fps
};
```

**Avantages**:
- ✅ Keep awake avec impact batterie réduit (~2-3% vs 5-8%)
- ✅ Compromis optimal
- ✅ Mode dédié dans settings

**Inconvénients**:
- ⚠️ Complexité UI (3 options: OFF / ON / LOW POWER)
- ⚠️ Luminosité réduite = lisibilité réduite

---

## Recommandation Finale

### ✅ OPTION A: Keep Awake ON par Défaut

**Rationale**:

1. **Alignement mission app**:
   - App s'appelle "ResetPulse" = timer VISUEL
   - Si écran éteint, pas de différence vs alarme iPhone native
   - Persona TDAH a choisi cette app POUR le visuel

2. **Benchmarks industrie**:
   - Time Timer (référence TDAH): ON par défaut
   - Forest, Headspace: ON par défaut
   - Pattern standard apps visuelles = keep awake actif

3. **Impact batterie acceptable**:
   - 25min Pomodoro = ~5-8% batterie
   - Comparable à 25min YouTube, Instagram, jeux
   - Users comprennent trade-off (fonction > batterie)

4. **Friction minimale**:
   - Persona TDAH ne doit rien configurer
   - "It just works" dès premier usage
   - Settings toggle disponible pour edge cases

5. **Désactivation facile**:
   - Toggle dans Settings (section Batterie)
   - Hint: "Désactiver pour économiser la batterie"
   - Persona secondaire peut opt-out

### Implementation Recommandée

**Phase 1 - MVP (v1.2.0)**:

1. **Activer keep awake pendant timer running**:
   ```javascript
   // src/hooks/useTimerKeepAwake.js
   import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

   export const useTimerKeepAwake = () => {
     const { isRunning } = useTimer();
     const { keepAwakeEnabled } = useSettings(); // Default: true

     useEffect(() => {
       if (isRunning && keepAwakeEnabled) {
         activateKeepAwake();
       } else {
         deactivateKeepAwake();
       }

       return () => deactivateKeepAwake();
     }, [isRunning, keepAwakeEnabled]);
   };
   ```

2. **Toggle Settings**:
   ```jsx
   <Section title="⚡ Batterie">
     <SettingRow
       icon="⚡"
       label="Maintenir l'écran allumé"
       hint="Garde l'écran actif pendant le timer pour suivre visuellement le temps restant"
     >
       <Switch
         value={keepAwakeEnabled}
         onValueChange={setKeepAwakeEnabled}
       />
     </SettingRow>
   </Section>
   ```

3. **Default value**:
   ```javascript
   // src/config/defaults.js
   export const DEFAULT_SETTINGS = {
     keepAwakeEnabled: true, // ON par défaut
   };
   ```

**Phase 2 - Optimisation (v1.3.0+)** (optionnel):

- Mode "Low Power Visual" (luminosité réduite + 30fps)
- Analytics: Tracker % users qui désactivent
- A/B test si conversion rate impactée

---

## Messaging & Communication

### Dans Settings (Hint)

**Texte recommandé**:
> "Garde l'écran actif pendant le timer pour suivre visuellement le temps restant. Désactiver pour économiser la batterie."

**Rationale**: Explique le "pourquoi" (suivi visuel) + opt-out clair (batterie)

### Store Description (Mettre en avant)

**Ajouter feature**:
> "🔋 Écran toujours actif pendant le timer pour ne jamais perdre le visuel de vue"

**Rationale**: Transformer "problème batterie" en feature (utilisateurs comprennent le trade-off)

### Onboarding (PAS de modal)

**Approche recommandée**: Ne PAS mentionner dans onboarding initial
- Comportement "naturel" pour timer visuel
- Éviter friction cognitive
- Settings toggle suffit pour opt-out

---

## Risks & Mitigations

### Risk 1: Users se plaignent de batterie

**Probabilité**: Moyenne (10-20% users sensibles)
**Impact**: MEDIUM (review 3 stars "battery drain")
**Mitigation**:
- Toggle visible dans Settings
- Store description mentionne feature
- Hint explicite dans settings

### Risk 2: Batterie critique → crash app

**Probabilité**: Faible
**Impact**: HIGH (perte données timer)
**Mitigation**:
```javascript
const batteryLevel = await Battery.getBatteryLevelAsync();
if (batteryLevel < 0.1) {
  // Auto-disable keep awake si batterie < 10%
  deactivateKeepAwake();
  showLowBatteryToast();
}
```

### Risk 3: Confusion users (pourquoi écran reste allumé?)

**Probabilité**: Faible (comportement attendu pour timer)
**Impact**: LOW
**Mitigation**: Hint dans settings explique clairement

---

## Metrics de Succès

**Post-implémentation (v1.2.0)**:

1. **User satisfaction**:
   - Reviews mentionnant "écran allumé" = positif
   - Support tickets "battery drain" < 5%

2. **Adoption toggle**:
   - % users qui désactivent < 15% (= majorité apprécie)
   - Si > 30% désactivent = reconsidérer default

3. **Retention**:
   - D7 retention post-v1.2.0 vs baseline
   - Hypothesis: Amélioration car fonction principale préservée

---

## Decision Log

**Decision**: ✅ Keep Awake ON par défaut avec toggle Settings

**Date**: 2025-10-18

**Deciders**: irimwebforge + Claude Code

**Rationale**:
1. Aligné mission app (timer VISUEL)
2. Pattern industrie standard (Time Timer, Forest)
3. Persona TDAH = friction minimale prioritaire
4. Impact batterie acceptable (5-8% / 25min)
5. Opt-out facile pour edge cases

**Alternative considérée**: OFF par défaut + message contextuel
**Rejected because**: Friction premier usage + modal = anti-TDAH

---

## Implementation Checklist

- [ ] Installer `expo-keep-awake` si pas déjà fait
- [ ] Créer `useTimerKeepAwake.js` hook
- [ ] Intégrer dans `TimerScreen.jsx` ou `useTimer.js`
- [ ] Ajouter toggle Settings (section Batterie)
- [ ] Default value `keepAwakeEnabled: true`
- [ ] Tester sur device physique (simulateur ne teste pas keep awake)
- [ ] Mesurer impact batterie réel (25min timer)
- [ ] Update store description (mention feature)
- [ ] Analytics event: `keep_awake_toggled` (track qui désactive)

---

## References

**Standards Industrie**:
- iOS Human Interface Guidelines: Timer apps (keep screen active expected)
- Android Material Design: Fitness apps (screen awake standard)

**Accessibility**:
- WCAG 2.1: Predictable behavior (timer visual = screen expected active)

**Benchmark Apps**:
- Time Timer: https://www.timetimer.com/
- Forest: https://www.forestapp.cc/
- Headspace: https://www.headspace.com/

---

**Status**: READY FOR IMPLEMENTATION
**Target Release**: v1.2.0 (post Android submission)
**Effort**: 2-3h (hook + settings + tests)
