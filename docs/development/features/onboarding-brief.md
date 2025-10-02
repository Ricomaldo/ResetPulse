# 🎯 Onboarding Implementation Brief

# Brief Onboarding ResetPulse v1.0.4

**Version Standalone - Conception & Implémentation**

---

## 🎯 Objectifs Stratégiques

### Vision Produit

Créer un premier contact qui établit immédiatement l'identité de ResetPulse : un outil minimaliste, bienveillant et respectueux du rythme utilisateur. L'onboarding doit refléter l'expérience app et préparer la présence store.

### Public Cible

- Utilisateurs neuroatypiques (TDAH/TSA) sensibles à la surcharge cognitive
- Neurotypiques recherchant simplicité
- Nouveaux utilisateurs sans contexte timer visuel

### Contraintes Techniques

- React Native SDK 54
- Pas de dépendances externes onboarding
- Persistence AsyncStorage
- Format hybride : Welcome screen + tooltips contextuels

---

## 📐 Architecture Onboarding

### 1. Écran Welcome Unique

**Objectif émotionnel :**
Rassurer, inviter au calme, donner l'état d'esprit "pause consciente"

**Contenu proposé :**

```
[Visuel]
Emoji : ⏱️ (neutre, pas rouge/anxiogène)
ou illustration minimaliste timer circulaire

[Titre principal]
"Bienvenue sur ResetPulse"

[Sous-titre]
"Votre allié pour des pauses régénératrices"
ou
"Des pauses conscientes, à votre rythme"

[CTA]
Bouton principal : "Découvrir" (action positive)
Lien discret : "Passer" (non culpabilisant, coin supérieur droit)
```

**Design :**

- Fond blanc épuré
- Typographie douce (pas de bold agressif)
- Animations entrée subtiles (fade in 300ms)
- SafeArea respect iOS/Android

---

### 2. Tooltips Contextuels sur Interface Réelle

**Séquence validée : 2 → 1 → 4 → 3**

#### Tooltip 1 : Activités (Priorité contexte)

```
Élément pointé : Carrousel activités emoji (haut écran)
Texte : "Sélectionnez votre contexte"
Position : Au-dessus du carrousel, flèche vers bas
Déclencheur suivant : Tap activité OU bouton "Suivant"
```

#### Tooltip 2 : Dial Timer (Interaction principale)

```
Élément pointé : Cadran circulaire central
Texte : "Glissez pour ajuster la durée"
Position : Centre-bas, flèche vers cadran
Déclencheur suivant : Interaction dial OU "Suivant"
```

#### Tooltip 3 : Palette Couleurs (Personnalisation visuelle)

```
Élément pointé : Bande palette bas écran
Texte : "Glissez pour changer de palette"
Position : Juste au-dessus palette, flèche vers bas
Déclencheur suivant : Scroll palette OU "Suivant"
```

#### Tooltip 4 : Settings (Découverte avancée)

```
Élément pointé : Icône settings (coin supérieur droit)
Texte : "Sons et couleurs personnalisables"
Position : Dropdown depuis settings icon
Déclencheur suivant : Tap settings OU "Terminer"
```

**Caractéristiques tooltips :**

- Overlay semi-transparent noir 40% sur reste interface
- Bulle tooltip blanc/blur avec ombre douce
- Texte noir 14-16pt, max 1 ligne
- Flèche CSS triangle 10px vers élément
- Bouton "Suivant"/"Terminer" petit, non intrusif
- Bouton "Passer tout" toujours visible coin supérieur droit
- Animation apparition : scale 0.9→1.0 + fade 200ms
- Haptic feedback léger à chaque transition

---

## 🔧 Logique Technique

### Persistence & État

```javascript
AsyncStorage keys :
- @ResetPulse:onboardingCompleted (boolean)
- @ResetPulse:onboardingStep (0-4, optionnel pour reprise)

États composant :
- showWelcome (boolean)
- currentTooltip (0-3 ou null)
- tooltipsCompleted ([boolean, boolean, boolean, boolean])
```

### Conditions Complétion

```javascript
Marquer onboarding complété si :
- Utilisateur clique "Passer" sur welcome
- Utilisateur clique "Passer tout" pendant tooltips
- Utilisateur arrive à tooltip 4 et clique "Terminer"
- Utilisateur interagit avec les 4 éléments pointés

Ne PAS forcer interaction - guidance suffisante
```

### Réactivation

```
Settings > Section Développement (DEV only) :
"Réinitialiser l'onboarding" → Clear AsyncStorage key

Settings > Section Aide (production future) :
"Revoir le guide" → Reset flag temporairement
```

---

## 🎨 Design System Aligné

### Palette Couleurs

```javascript
welcome: {
  background: '#FFFFFF',
  text: '#2C3E50', // Texte principal doux
  subtitle: '#7F8C8D', // Gris moyen
  buttonPrimary: '#3498DB', // Bleu calme
  buttonSecondary: '#95A5A6' // Gris neutre
}

tooltips: {
  overlay: 'rgba(0, 0, 0, 0.4)',
  bubble: '#FFFFFF',
  bubbleBlur: 'blur(10px)', // iOS backdrop-filter
  shadow: '0 4px 12px rgba(0,0,0,0.15)',
  arrow: '#FFFFFF'
}
```

### Typographie

```javascript
welcome: {
  title: { fontSize: 28, fontWeight: '600', lineHeight: 36 },
  subtitle: { fontSize: 16, fontWeight: '400', lineHeight: 24 }
}

tooltips: {
  text: { fontSize: 15, fontWeight: '500', lineHeight: 20 }
}
```

### Animations

```javascript
welcome: {
  fadeIn: { duration: 300, easing: 'ease-out' }
}

tooltips: {
  appear: {
    scale: [0.9, 1.0],
    opacity: [0, 1],
    duration: 200
  },
  dismiss: {
    opacity: [1, 0],
    duration: 150
  }
}
```

---

## 📱 Cohérence Store Presence

### Screenshots App Store/Play Store

Utiliser les 4 tooltips comme base screenshots :

1. **Screenshot 1** : Tooltip activités visible → "Contextualisez vos pauses"
2. **Screenshot 2** : Tooltip dial interaction → "Timer visuel intuitif"
3. **Screenshot 3** : Tooltip palette → "Personnalisez votre expérience"
4. **Screenshot 4** : Settings ouvert sons → "Sons apaisants configurables"

### Ton Marketing

```
App Store description opener :
"ResetPulse vous accompagne dans vos pauses conscientes avec un timer visuel minimaliste et personnalisable. Conçu pour les esprits qui ont besoin de calme et de clarté."

Aligné avec welcome screen "pauses régénératrices"
```

---

## 🚀 Plan Implémentation

### Phase 1 : Welcome Screen (30min)

1. Créer `src/components/onboarding/WelcomeScreen.jsx`
2. Layout SafeArea + emoji/titre/sous-titre
3. Boutons "Découvrir" / "Passer"
4. Animations fade in
5. Persistence flag onboarding

### Phase 2 : Tooltip System (1h)

1. Créer `src/components/onboarding/Tooltip.jsx` (composant réutilisable)
2. Overlay controller avec état tooltip actif
3. Positionnement dynamique selon élément cible
4. Flèche CSS triangle
5. Logique "Suivant" / "Passer tout"

### Phase 3 : Intégration TimerScreen (45min)

1. Détecter premier lancement dans App.js
2. Conditionner affichage welcome
3. Injecter tooltips dans TimerScreen après welcome
4. Séquence 2→1→4→3 avec refs vers éléments
5. Haptic feedback transitions

### Phase 4 : Tests & Polish (45min)

1. Test premier lancement simulateur
2. Test skip à différentes étapes
3. Test interactions vs "Suivant"
4. Validation neuroatypique (pas de surcharge)
5. Reset onboarding dev tools

### Phase 5 : Documentation (30min)

1. Ajouter devlog onboarding conception
2. Screenshots pour store preparation
3. Update TODO v1.0.4 completion

**Total estimé : 3h30**

---

## ✅ Critères Validation

### Expérience Utilisateur

- [ ] Welcome donne envie de découvrir (pas intimidant)
- [ ] Tooltips apparaissent au bon moment
- [ ] Interaction réelle OU "Suivant" fonctionne
- [ ] "Passer" toujours accessible sans culpabilité
- [ ] Pas de blocage utilisateur impatient
- [ ] Animations fluides 60fps

### Technique

- [ ] Persistence onboarding fonctionne
- [ ] Pas de re-déclenchement intempestif
- [ ] Reset dev tools opérationnel
- [ ] Pas de memory leak animations
- [ ] Compatible iOS + Android

### Accessibilité Neuroatypique

- [ ] Pas de rouge/orange anxiogène
- [ ] Textes courts 1 ligne max
- [ ] Rythme utilisateur respecté
- [ ] Pas de timeout forcé
- [ ] Prédictibilité séquence

---

## 📎 Fichiers Impactés

```
Nouveaux :
src/components/onboarding/
  ├── WelcomeScreen.jsx
  ├── Tooltip.jsx
  └── OnboardingController.jsx

Modifiés :
App.js (détection premier lancement)
src/screens/TimerScreen.jsx (injection tooltips)
src/components/SettingsModal.jsx (reset onboarding dev)

Assets :
assets/onboarding/ (optionnel illustrations)
```

---

## 🎯 Session Suivante si Temps

Si implémentation onboarding < 3h30, préparer TestFlight/Internal Testing :

- Build iOS production
- Screenshots store (4 tooltips + welcome)
- Metadata App Store/Play Store
- Invite testeurs famille

---

_Briefing onboarding pour ResetPulse v1.1.0_
