# i18n Testing Guide - ResetPulse v1.2.0

**Date**: 20 Oct 2025
**Milestone**: M7.6 - Internationalisation
**Languages**: 15 (FR, EN, ES, DE, IT, PT, NL, JA, KO, ZH-Hans, ZH-Hant, AR, RU, SV, NO)

---

## 🎯 Objectif des tests

Valider que toutes les strings de l'application s'affichent correctement dans les 15 langues supportées, avec un focus particulier sur :
- Langues à caractères spéciaux (JA, KO, ZH, AR, RU)
- RTL (Right-to-Left) pour l'arabe
- Adaptation des metadata stores pour ASO multilingue

---

## 📱 Phase 5A : Tests iOS (Priorité 1)

### Configuration Device

1. **Ouvrir Réglages iOS** → Général → Langue et région
2. **Tester ces 5 langues prioritaires** :
   - 🇫🇷 Français (baseline actuel)
   - 🇬🇧 English (marché principal)
   - 🇪🇸 Español (marché européen)
   - 🇯🇵 日本語 (caractères complexes + marché)
   - 🇸🇦 العربية (RTL validation)

### Checklist par langue

Pour chaque langue testée, vérifier :

#### ✅ WelcomeScreen (Onboarding initial)
- [ ] Titre traduit ("Welcome to ResetPulse" / "Bienvenue sur ResetPulse")
- [ ] Sous-titre traduit
- [ ] Bouton "Découvrir" / "Discover"
- [ ] Bouton "Passer" / "Skip"

#### ✅ Tooltips Onboarding
- [ ] Tooltip 1: "Sélectionnez votre activité" / "Select your activity"
- [ ] Tooltip 2: "Ajustez la durée du timer" / "Adjust the timer duration"
- [ ] Tooltip 3: "Changez les couleurs à votre guise" / "Change colors as you wish"
- [ ] Tooltip 4: "Démarrez, mettez en pause..." / "Start, pause, or reset"
- [ ] Tooltip 5: "Profitez bien de ResetPulse !" / "Enjoy ResetPulse!"

#### ✅ TimerScreen - Activités (carousel horizontal)
Vérifier traduction des 5 activités gratuites :
- [ ] "Basique" / "Basic"
- [ ] "Travail" / "Work"
- [ ] "Pause" / "Break"
- [ ] "Respiration" / "Breathing"

#### ✅ TimerScreen - Palettes (carousel horizontal)
Vérifier traduction des 2 palettes gratuites :
- [ ] "Terre" / "Earth"
- [ ] "Soft Laser" (identique toutes langues)

#### ✅ SettingsModal - Section Interface (🪄)
- [ ] Titre section traduit
- [ ] "Interface minimaliste" / "Minimal interface"
- [ ] Descriptions ON/OFF traduites
- [ ] "Chrono numérique" / "Digital timer"
- [ ] "Animation Pulse" / "Pulse animation"
- [ ] Alert photosensibilité traduit (si activé)

#### ✅ SettingsModal - Section Timer (⚙️)
- [ ] Titre section traduit
- [ ] "Mode Cadran" : "60min" / "25min" (identique)
- [ ] "Sens de rotation" / "Rotation direction"
- [ ] "Maintenir l'écran allumé" / "Keep screen awake"
- [ ] Descriptions traduites

#### ✅ SettingsModal - Section Apparence (🎨)
- [ ] Titre section traduit
- [ ] "Thème" : Clair ☀️ / Sombre 🌙 / Auto 📱 (emojis préservés)
- [ ] "Afficher les palettes" / "Show palettes"
- [ ] "Afficher les activités" / "Show activities"
- [ ] Description version gratuite traduite

#### ✅ SettingsModal - Section À propos (ℹ️)
- [ ] Titre section traduit
- [ ] "ResetPulse" (identique)
- [ ] "Timer visuel personalisable" / "Customizable visual timer"
- [ ] "Version 1.1.8" (identique)
- [ ] "Relancer le guide" / "Restart the guide"

#### ✅ PremiumModal (paywall)
- [ ] Titre "Débloquer Premium" / "Unlock Premium"
- [ ] Description gratuit + premium traduite
- [ ] "15 palettes + 16 activités" (chiffres identiques)
- [ ] Prix traduit : "4,99€" / "$4.99" / "¥700" (adapté par langue)
- [ ] "Trial gratuit 7 jours" / "Free 7-day trial"
- [ ] Bouton "Commencer l'essai gratuit" / "Start free trial"
- [ ] Bouton "Peut-être plus tard" / "Maybe later"
- [ ] Bouton "Restaurer mes achats" / "Restore my purchases"

#### ✅ Alerts & Messages
- [ ] Alert erreur réseau traduit
- [ ] Alert succès achat traduit ("Bienvenue Premium ! 🎉")
- [ ] Alert restauration traduite

### Tests spécifiques RTL (Arabe uniquement)

- [ ] Texte aligné à droite
- [ ] Boutons inversés (✕ à gauche au lieu de droite)
- [ ] Carousel scroll inversé (swipe gauche→droite)
- [ ] Pas de débordement UI

### Tests caractères complexes (JA/KO/ZH)

- [ ] Caractères affichés correctement (pas de �)
- [ ] Pas de débordement texte dans boutons
- [ ] Line-height correct (caractères asiatiques souvent plus hauts)

---

## 🤖 Phase 5B : Tests Android (Priorité 2)

**Même checklist que iOS**, mais attention à :

### Différences Android spécifiques

1. **Changement langue** : Réglages → Système → Langues et saisie
2. **Material Design switches** : Vérifier traduction labels
3. **TouchableNativeFeedback** : Tester ripple effect (pas d'impact i18n)

### Langues à tester Android (5 prioritaires)

- 🇫🇷 Français
- 🇬🇧 English
- 🇩🇪 Deutsch (marché européen)
- 🇰🇷 한국어 (caractères complexes)
- 🇸🇦 العربية (RTL validation)

---

## 🔍 Tests de régression

Après validation i18n, vérifier que **les fonctionnalités core fonctionnent** :

- [ ] Timer démarre/pause/reset correctement
- [ ] Changement activité fonctionne
- [ ] Changement palette fonctionne
- [ ] Toggle settings appliqués (minimal interface, keep awake, etc.)
- [ ] Premium modal s'ouvre (pas besoin tester achat)
- [ ] Onboarding reset fonctionne (Settings → Relancer le guide)

---

## 🐛 Bugs à surveiller

### Débordements texte
- Langues verbeuses (DE, RU) : textes plus longs → vérifier boutons/labels
- Texte coupé dans SettingsModal sections

### Fallback EN
- Si langue device non supportée (ex: 🇮🇹 Italien activé mais fichier manquant) → app doit fallback EN

### Cache i18n
- Si changement langue ne s'applique pas → force quit app + relancer

---

## ✅ Validation finale

Avant de passer Phase 6 (version bump), confirmer :

- [ ] **5 langues testées iOS** : FR, EN, ES, JA, AR
- [ ] **5 langues testées Android** : FR, EN, DE, KO, AR
- [ ] **Aucun débordement UI critique** (texte coupé rendant app inutilisable)
- [ ] **RTL arabe fonctionnel** (pas de layout cassé)
- [ ] **Premium modal prix adapté** par langue (€ vs $ vs ¥)
- [ ] **Fonctionnalités core non régressées**

---

## 📸 Screenshots pour stores (optionnel - Phase 4.5)

**Note Eric** : Screenshots = action manuelle après Phase 5.

Pour chaque langue supportée (ou minimum 5 principales) :
1. Lancer app en langue cible
2. Capturer :
   - TimerScreen (timer configuré + activité + palette visible)
   - SettingsModal ouvert (montrer options)
   - PremiumModal ouvert (montrer offre)

**Specs screenshots** :
- iOS : 1290x2796 (iPhone 15 Pro Max) ou 1284x2778 (iPhone 14 Pro Max)
- Android : 1920x1080 minimum (landscape optionnel)

---

## 🚨 Si bloqueur trouvé

**Critères bloqueurs** (empêchent soumission stores) :
- App crash au changement langue
- Texte manquant (keys non traduites → affiche "onboarding.activities" brut)
- Layout complètement cassé RTL (boutons hors écran)

**Actions** :
1. Note langue + screen concerné
2. Screenshot bug
3. Report à Claude Code pour fix
4. Re-test après fix

---

## 📊 Métriques succès Phase 5

- ✅ **10 langues testées** (5 iOS + 5 Android, overlap OK)
- ✅ **Aucun bloqueur critique** trouvé
- ✅ **RTL fonctionnel** (arabe)
- ✅ **Caractères complexes** affichés (JA/KO/ZH)
- ✅ **Fonctionnalités core** non régressées

**Durée estimée** : 1h (20 min iOS + 20 min Android + 20 min screenshots optionnels)

---

**Prêt pour Phase 6 (version bump v1.2.0) après validation ✅**
