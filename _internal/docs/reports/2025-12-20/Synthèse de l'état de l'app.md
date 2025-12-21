# ResetPulse - Cartographie Architecturale v1.0.4

## 🏗️ Architecture Globale

### Socle Technique

- **Framework** : React Native / Expo
- **Gestion d’état** : Context API
- **Persistance** : AsyncStorage
- **Monétisation** : RevenueCat

### Structure Principale

```
ResetPulse
├── TimerScreen (Composant Principal)
│   ├── DialZone (62% écran)
│   │   └── TimerDial (interactions circulaires)
│   └── AsideZone (BottomSheet 3 niveaux)
│       ├── FavoriteToolBox (15%)
│       ├── ToolBox (38%)
│       └── SettingsPanel (90%)
```

## 🧩 Contextes Principaux

### 1. TimerOptionsContext

- **Rôle** : Gestion complète du timer
- **Propriétés clés** :
  - Durée
  - Activité en cours
  - Profils d’interaction
- **États** : REST, RUNNING, COMPLETE

### 2. TimerPaletteContext

- **Rôle** : Gestion des couleurs
- **Configuration** :
  - 15 palettes (2 gratuites, 13 premium)
  - Personnalisation visuelle

### 3. UserPreferencesContext

- **Rôle** : Préférences utilisateur
- **Configuration** :
  - Outil favori par défaut
  - Paramètres d’affichage
  - Profil d’interaction

### 4. PurchaseContext

- **Rôle** : Gestion modèle freemium
- **Caractéristiques** :
  - SDK RevenueCat
  - Achat unique 4,99€
  - Cache 24h pour usage hors-ligne

### 5. ModalStackContext

- **Rôle** : Gestion des modales
- **Mécanisme** : Pile FIFO pour modales imbriquées

## 🎛️ Mécanismes Clés

### Polling & Synchronisation

- **Fréquence** : 50ms
- **Technologie** :
  - Foreground : RequestAnimationFrame
  - Background : setTimeout
- **Objectif** : Mise à jour temps réel minimal

### Interactions Gestuelles

- **Zone Centrale (<35% rayon)** : Play/Stop
- **Graduations (>65% rayon)** : Réglage durée
- **Technique** : PanResponder personnalisé

## 🧠 Profils Neurodivergents

### 4 Personas d’Interaction

1. **Impulsif**
2. **Abandonniste**
3. **Ritualiste**
4. **Véloce**

### Adaptations

- Durées d’appui personnalisables
- Vitesse d’animations adaptative
- Feedback multimodal

## 🔒 Principes de Conception

- **Accessibilité** : Réduction charge cognitive
- **Personnalisation** : Adaptive par défaut
- **Éthique** : Features d’accessibilité gratuites