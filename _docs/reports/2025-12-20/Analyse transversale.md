# Expérience Utilisateur ResetPulse : Onboarding & Conversion

## 🚀 Parcours Utilisateur Actuel

### Structure de l’Onboarding

- **10 filtres adaptatifs** (010-100)
- **2 branches principales** :

1. **“Discover”** : Parcours aspirationnel

- Orientation marketing
- Aboutit au paywall

1. **“Personalize”** : Parcours technique

- Configuration audio/interface
- Sans passage immédiat au paywall

### Philosophie de Personnalisation

- **4 personas d’interaction** (actuellement théoriques) :
  - Impulsif
  - Abandonniste
  - Ritualiste (défaut)
  - Véloce

## 💡 Stratégie de Conversion

### Modèle Économique

- **Freemium**
  - 2 palettes/4 activités gratuites
  - Achat unique : 4,99€
  - Essai gratuit : 7 jours

### Système de Modales

1. **PremiumModal** : Paywall principal
2. **DiscoveryModals** :

- Prévisualisation contenu premium
- Couleurs/Activités

1. **TwoTimersModal** :

- Déclenchée après 2 timers
- Invitation à explorer premium
- Moment d’engagement fort

### Logique de “Gating”

- **Gratuit** :
  - Fonctionnalités UX
  - Audio
  - Thème sombre
  - Animations
- **Premium** :
  - Palettes supplémentaires
  - Activités additionnelles

## 🎯 Déclencheurs de Conversion

- Tap sur contenu premium
- Complétion de 2 timers
- Fin du parcours “Discover”

—
# Diagnostic Critique : Onboarding et Conversion ResetPulse

## 🔍 Angles Morts Structurels

### 1. Décalage Conception vs Implémentation

- **Personas** : 4 profils théoriques mais aucune intégration réelle
  - Définition technique existante
  - Aucun mécanisme de sélection/adaptation
  - Profil “ritualiste” par défaut sans justification

### 2. Incohérences Parcours Utilisateur

- **Branches Onboarding Déconnectées**
  - “Discover” : Approche marketing
  - “Personalize” : Configuration technique
  - Aucun pont logique entre ces branches

### 3. Friction dans l’Expérience de Découverte

- **Test Timer 60s Incomplet**
  - Absence de MessageZone
  - Démonstration des interactions manquante
  - Pas de mise en contexte des gestes (long press)

## 🚧 Hypothèses Non Validées

### Modèle de Conversion

- **Déclencheurs Aléatoires**
  - TwoTimersModal : Déclenchement mécanique
  - Pas de personnalisation du moment de conversion
  - Absence de logique d’engagement progressive

### Stratégie Freemium

- **Gating Superficiel**
  - Séparation arbitraire fonctionnalités gratuites/premium
  - Pas de progression incitative
  - Manque de démonstration de valeur

## 💡 Diagnostic Final

### Symptômes Critiques

- **Onboarding Théorique** : Design sophistiqué
- **Onboarding Réel** : Implémentation fragmentée
- **Conversion** : Approche mécanique sans empathie utilisateur

### Point Focal

L’application souffre d’un **décalage entre l’intention de personnalisation et son implémentation concrète**.

## 🎯 Recommandations Préliminaires

1. **Intégration Vivante des Personas**

- Mécanisme dynamique de détection
- Adaptation du parcours en temps réel

1. **Parcours de Découverte Unifié**

- Connecter branches “Discover” et “Personalize”
- Création d’un flux narratif cohérent

1. **Conversion Contextuelle**

- Déclencheurs basés sur le comportement utilisateur
- Personnalisation du moment de proposition premium
