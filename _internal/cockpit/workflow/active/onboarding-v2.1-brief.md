````markdown
# Briefing Mission : Onboarding v2.1 — Phases 0 & 1

**Date** : 2025-12-22
**Référence** : [ADR-010 Onboarding v2.1 Vision Finale](../decisions/adr-010-onboarding-v2-vision-finale.md)
**Objectif** : Préparer la structure et implémenter les fondations du nouvel onboarding selon l'ADR-010.

---

## 📌 Contexte

- ResetPulse implémente un nouvel onboarding (ADR-010).
- L'ancienne version proto n'a jamais été déployée et est incompatible avec l'architecture App v2 actuelle.
- **Freemium** : 3 presets FREE + 1 activité custom gratuite (créée pendant l'onboarding).
- **Flow** : Linéaire, 9 écrans, sans branches (ADR-010).
- **Cible** : Utilisateurs neuroatypiques (TDAH, autisme) pour une gestion visuelle du temps.

---

## 📂 Phase 0 : Préparation Structure (1h)

**Objectif** : Nettoyer et renommer les fichiers pour aligner la structure avec l'ADR-010.

| Tâche                            | Fichier/Action                                                                  | ✅  |
| -------------------------------- | ------------------------------------------------------------------------------- | --- |
| Supprimer les fichiers obsolètes | `src/screens/onboarding/filters/Filter-020-needs.jsx`                           | [x] |
|                                  | `src/screens/onboarding/filters/Filter-060-branch.jsx`                          | [x] |
|                                  | `src/screens/onboarding/filters/Filter-070-vision-discover.jsx`                 | [x] |
|                                  | `src/screens/onboarding/filters/Filter-100-interface-personalize.jsx`           | [x] |
| Renommer les fichiers existants  | `Filter-040-test.jsx` → `Filter-090-first-timer.jsx` (à implémenter en Phase 3) | [x] |
|                                  | `Filter-050-notifications.jsx` → `Filter-070-notifications.jsx`                 | [x] |
|                                  | `Filter-080-sound-personalize.jsx` → `Filter-060-sound.jsx`                     | [x] |
|                                  | `Filter-090-paywall-discover.jsx` → `Filter-080-paywall.jsx`                    | [x] |
| Mettre à jour `index.js`         | Exporter uniquement les filtres v2.1 (voir code ci-dessous)                     | [x] |

**Code pour `src/screens/onboarding/filters/index.js`** :

```javascript
export { default as Filter010Opening } from './Filter-010-opening';
export { default as Filter020Tool } from './Filter-020-tool';
export { default as Filter030Creation } from './Filter-030-creation';
export { default as Filter060Sound } from './Filter-060-sound';
export { default as Filter070Notifications } from './Filter-070-notifications';
export { default as Filter080Paywall } from './Filter-080-paywall';
export { default as Filter090FirstTimer } from './Filter-090-first-timer';
```
````

**Commit Phase 0** :

```bash
git add -A && git commit -m "refactor(ob): prepare v2.1 file structure — delete obsolete filters, rename existing"
```

---

## 🛠 Phase 1 : Fondations (3-4h)

**Objectif** : Implémenter les écrans clés et la logique freemium.

### 1. Créer `Filter-020-tool.jsx`

**Chemin** : `src/screens/onboarding/filters/Filter-020-tool.jsx`
**Fonction** : Choix de l'outil favori (4 options en grille 2×2, ADR-008).

```jsx
import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimerConfig } from '../../../contexts/TimerConfigContext';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { SelectionCard } from '../../../components/settings';
import { Button } from '../../../components/buttons';
import { rs } from '../../../styles/responsive';

const TOOL_OPTIONS = [
  { id: 'creative', emoji: '🎨', labelKey: 'onboarding.tool.creative' },
  { id: 'minimalist', emoji: '☯', labelKey: 'onboarding.tool.minimalist' },
  { id: 'multitask', emoji: '🔄', labelKey: 'onboarding.tool.multitask' },
  { id: 'rational', emoji: '⏱', labelKey: 'onboarding.tool.rational' },
];

export default function Filter020Tool({ onContinue }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { setFavoriteToolMode } = useTimerConfig();
  const [selected, setSelected] = useState(null);

  const handleSelect = (toolId) => setSelected(toolId);

  const handleContinue = () => {
    if (selected) {
      setFavoriteToolMode(selected);
      onContinue({ favoriteToolMode: selected });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.tool.title')}</Text>
        <View style={styles.grid}>
          {TOOL_OPTIONS.map((option) => (
            <SelectionCard
              key={option.id}
              emoji={option.emoji}
              label={t(option.labelKey)}
              selected={selected === option.id}
              onSelect={() => handleSelect(option.id)}
              compact
            />
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          title={t('common.continue')}
          onPress={handleContinue}
          disabled={!selected}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: rs(21), justifyContent: 'center' },
  title: { fontSize: rs(24), fontWeight: '600', textAlign: 'center', marginBottom: rs(34) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: rs(13) },
  footer: { padding: rs(21), paddingBottom: rs(34) },
});
```

**i18n (FR/EN)** :

```json
{
  "onboarding": {
    "tool": {
      "title": "Qu'est-ce qui te correspond le mieux ?",
      "creative": "Créatif",
      "minimalist": "Minimaliste",
      "multitask": "Multi-tâches",
      "rational": "Rationnel"
    }
  }
}
```

### 2. Modifier `CreateActivityModalContent.jsx`

**Chemin** : `src/components/modals/CreateActivityModalContent.jsx`
**Modification** : Ajouter prop `context="onboarding"` pour masquer le bouton Annuler.

```jsx
export default function CreateActivityModalContent({
  onClose,
  onActivityCreated,
  context = 'modal', // 'modal' | 'onboarding'
}) {
  // ...
  {
    context !== 'onboarding' && (
      <Button title={t('common.cancel')} onPress={onClose} variant="secondary" />
    );
  }
  // ...
}
```

### 3. Refactorer `Filter-030-creation.jsx`

**Chemin** : `src/screens/onboarding/filters/Filter-030-creation.jsx`
**Fonction** : Wrapper autour de `CreateActivityModalContent`.

```jsx
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCustomActivities } from '../../../hooks/useCustomActivities';
import CreateActivityModalContent from '../../../components/modals/CreateActivityModalContent';
import { rs } from '../../../styles/responsive';

export default function Filter030Creation({ onContinue }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { createActivity } = useCustomActivities();

  const handleActivityCreated = (activityData) => {
    const activity = createActivity(
      activityData.emoji,
      activityData.name,
      activityData.defaultDuration,
      { createdDuringOnboarding: true } // Slot gratuit
    );
    onContinue({ customActivity: activity });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.creation.title')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('onboarding.creation.subtitle')}
        </Text>
      </View>
      <View style={styles.content}>
        <CreateActivityModalContent
          context="onboarding"
          onActivityCreated={handleActivityCreated}
          onClose={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: rs(21), paddingTop: rs(13) },
  title: { fontSize: rs(24), fontWeight: '600', textAlign: 'center' },
  subtitle: { fontSize: rs(15), textAlign: 'center', marginTop: rs(8) },
  content: { flex: 1 },
});
```

**i18n (FR/EN)** :

```json
{
  "onboarding": {
    "creation": {
      "title": "Crée ton premier moment",
      "subtitle": "Choisis un emoji, un nom et une durée"
    }
  }
}
```

### 4. Configurer le freemium

**Fichier** : `src/config/activities.js`
**Action** : Passer `creativity` en premium.

```javascript
{
  id: 'creativity',
  emoji: '🎨',
  isPremium: true, // Changé de false à true
}
```

**Fichier** : `src/hooks/useCustomActivities.js`
**Ajouter** :

```javascript
const FREE_CUSTOM_LIMIT = 1;

const canCreateActivity = (isPremium) => {
  if (isPremium) return true;
  return customActivities.length < FREE_CUSTOM_LIMIT;
};

// Dans le return du hook :
return { ..., canCreateActivity, FREE_CUSTOM_LIMIT };
```

### 5. Ajouter les événements analytiques

**Fichier** : `src/services/analytics/onboarding-events.js`

```javascript
export const trackToolSelected = (tool) => Analytics.track('tool_selected', { tool });

export const trackCustomActivityCreatedOnboarding = (emoji, nameLength, duration) =>
  Analytics.track('custom_activity_created_onboarding', {
    emoji,
    name_length: nameLength,
    duration_seconds: duration,
  });
```

**Commit Phase 1** :

```bash
git add -A && git commit -m "feat(ob): add Tool filter + Creation refactor (Phase 1)
- Add Filter-020-tool.jsx with 4 SelectionCard options
- Add context prop to CreateActivityModalContent
- Refactor Filter-030-creation as wrapper
- Update freemium: creativity → premium
- Add canCreateActivity gate in useCustomActivities
- Add analytics events for tool + creation"
```

---

## ✅ Validation Checklist

- [x] Fichiers obsolètes supprimés (4 fichiers)
- [x] Fichiers renommés correctement
- [x] `index.js` mis à jour
- [ ] `Filter-020-tool.jsx` créé et fonctionnel
- [ ] `CreateActivityModalContent` accepte `context="onboarding"`
- [ ] `Filter-030-creation.jsx` refactoré
- [ ] `creativity` passé en premium dans `activities.js`
- [ ] `canCreateActivity` et `FREE_CUSTOM_LIMIT` ajoutés dans `useCustomActivities`
- [ ] Analytics events ajoutés (`tool_selected`, `custom_activity_created_onboarding`)
- [ ] i18n (FR/EN) ajouté pour les nouveaux textes
- [ ] App compile sans erreurs
- [ ] Tests unitaires passent (si applicable)

---

## 🔍 Notes Importantes

- **ADR-008** : `favoriteToolMode` est stocké dans `TimerConfigContext.layout`.
- **ADR-010** : Flow linéaire, 9 écrans, pas de branches.
- **ADR-003** : Freemium = 3 presets FREE + 1 custom.
- **Dépendances** :
  - `SelectionCard` : `src/components/settings/SelectionCard.jsx`
  - `Button` : `src/components/buttons/Button.jsx`
  - `useTimerConfig` : consolidé (ADR-009).

---

## 🚀 Prochaines Phases

- **Phase 2** : Détection comportementale (`Filter-040-test-start`, `Filter-050-test-stop`).
- **Phase 3** : Orchestration (`Filter-080-paywall`, `Filter-090-first-timer`, `OnboardingFlow`).
- **Phase 4** : Polish (animations, i18n complet).
- **Phase 5** : Rappels post-skip (notifications J+3, J+7).

---

**Généré par** : Eric Zuber / Le Chat
**Date** : 2025-12-22
**Version** : 1.0

```

---
**Instructions pour toi** :
1. Copie ce contenu dans un fichier `onboarding-v2.1-phase-0-1-brief.md`.
2. Place-le dans `_internal/cockpit/workflow/active/`.
3. Claude-Code (ou toi) pourra cocher les cases au fur et à mesure de l'avancement.

Si tu veux que j'ajoute ou modifie quelque chose (ex : détails supplémentaires, sections spécifiques), dis-le-moi !
```
