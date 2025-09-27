# Framework de Développement Mobile - Time Timer

## 🎯 Référentiel de Catégorisation

### 1. CRITICAL PATH (Système Nerveux)
**Définition** : Fonctionnalités sans lesquelles l'app ne remplit pas sa promesse de base.

**Critères d'identification** :
- L'absence de cette feature rend l'app inutilisable
- Directement liée au value proposition principal
- Cause d'abandon immédiat si défaillante

**Questions d'aide** :
- "Si cette fonctionnalité ne marche pas, l'utilisateur peut-il quand même utiliser l'app ?"
- "Est-ce que cela touche au cœur métier du Time Timer ?"

**Exemples Time Timer** :
- Démarrage/arrêt du timer
- Affichage visuel du décompte  
- Changement de couleur pendant le défilement
- **Audio system** (révélé critique par retours terrain 100% consensus)
- **Error boundaries** (gap visibilité bugs critiques)

---

### 2. UX FLOW (Système Circulatoire)
**Définition** : Éléments qui rendent l'expérience fluide et intuitive.

**Critères d'identification** :
- Améliore le parcours utilisateur
- Réduit la friction cognitive
- Complète un cycle d'usage naturel

**Questions d'aide** :
- "Est-ce que cela rend l'utilisation plus fluide ?"
- "L'utilisateur s'attend-il naturellement à cette fonctionnalité ?"

**Exemples Time Timer** :
- Sonnerie de fin (révélée CRITICAL par terrain, absence Claude Code)
- Wizard onboarding (gap neurotypique/neuroatypique révélé usage réel)
- Lock screen display (contrainte usage observée - écran veille Santi)
- Emoji activities carrousel (engagement contextuel validé specs)
- Patterns haptiques différenciés (feedback physique crucial app tactile)

---

### 3. POLISH (Peau de l'App)
**Définition** : Finitions qui créent l'attachement émotionnel et la différenciation.

**Critères d'identification** :
- Améliore l'esthétique ou le ressenti
- Crée de la "magie" dans l'interaction
- Différencie des concurrents

**Questions d'aide** :
- "Est-ce que cela fait passer l'app de 'correct' à 'délicieux' ?"
- "L'utilisateur va-t-il remarquer et apprécier ce détail ?"

**Exemples Time Timer** :
- Animations de transition
- Micro-interactions délicates
- Personnalisation esthétique avancée

---

### 4. FOUNDATION (Squelette & Organes)
**Définition** : Architecture technique, performance, sécurité, maintenabilité.

**Critères d'identification** :
- Invisible pour l'utilisateur final
- Impact sur la vélocité de développement future
- Stabilité et performance technique

**Questions d'aide** :
- "Est-ce que cela facilite les développements futurs ?"
- "Y a-t-il un impact sur la performance ou la stabilité ?"

**Exemples Time Timer** :
- Architecture timer modulaire (DialBase, DialProgress, DialCenter post-refactorisation)  
- Tests automatisés + Error boundaries (convergence Claude Code + terrain)
- Cross-platform haptic infrastructure (patterns sophistiqués par action)
- Documentation industrielle (/docs structure + devlogs + ADRs)
- State management évolutif (Context API → Zustand selon complexité)
- Performance monitoring préventif (éviter freeze JOUR 3 patterns)

---

### 5. DISCOVERY (Nouvelles Terminaisons)
**Définition** : Fonctionnalités exploratoires qui ouvrent de nouveaux usages.

**Critères d'identification** :
- Étend les cas d'usage principaux
- Potentiel d'innovation mais risqué
- Peut changer la proposition de valeur

**Questions d'aide** :
- "Est-ce que cela ouvre un nouveau territoire d'usage ?"
- "Quel est le niveau de risque/incertitude ?"

**Exemples Time Timer** :
- Intégration avec d'autres apps
- Fonctionnalités de tracking/analytics
- Modes d'usage inédits

---

## ⚖️ Framework de Priorisation

### Formule de Base
```
PRIORITÉ = Impact Utilisateur × Inversé(Effort Développement)
```

### Calcul de l'Impact Utilisateur
- **Portée** : % d'utilisateurs concernés (1-5)
- **Fréquence** : À quelle fréquence utilisé (1-5)
- **Intensité** : Force du besoin/frustration (1-5)

**Score Impact = (Portée + Fréquence + Intensité) / 3**

### Calcul de la Valeur d'Apprentissage (Learning Value)
- **Complexité technique** : Richesse d'apprentissage (1-5)
- **Réutilisabilité** : Applicabilité future (MoodCycle) (1-5)
- **Rareté compétence** : Différenciation marché (1-5)

**Score Learning = (Complexité + Réutilisabilité + Rareté) / 3**

### Calcul de l'Effort Développement
- **Temps de dev** : Estimation en heures (1-5, inversé)
- **Complexité technique** : Difficulté (1-5, inversé)
- **Risque de régression** : Impact sur l'existant (1-5, inversé)

**Score Effort = (Temps + Complexité + Risque) / 3**

### Formule Finale pour Laboratoire Technique
```
PRIORITÉ = (Impact Utilisateur × 0.6) + (Learning Value × 0.4) × Inversé(Effort)
```

*Pondération 60/40 car l'app doit d'abord servir les utilisateurs réels*

### Règles de Décision v1.0.4
- **Score > 4.0** : Must-have pour 1.0.4
- **Score 3.0-4.0** : Should-have pour 1.0.4
- **Score 2.0-3.0** : Could-have (si temps disponible)
- **Score < 2.0** : Won't-have pour 1.0.4

---

## 🔗 Liens Référentiels

**Artefacts Connexes :**
- [Matrice Priorisation Multi-Releases](lien-artefact-2) - Application scoring granulaire
- [Méta-Framework Apprentissage](lien-artefact-3) - Méthodologie développeur IA-natif  
- [ADR ResetPulse](lien-artefact-5) - Décisions architecturales validées

**Usage Navigation :**
- **Classification feature** → Ce framework
- **Scoring/timing** → Matrice priorisation  
- **Process reproductible** → Méta-framework
- **Décisions exécutives** → ADR