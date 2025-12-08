# ResetPulse - Architecture Decision Record (ADR)

## Status: ACCEPTED
**Date:** 27 septembre 2025  
**Décideurs:** Eric (dev IA-natif) + Chrysalis (architecte conseil)  
**Context:** Définition roadmap ResetPulse laboratoire technique pour MoodCycle

---

## Context

ResetPulse (projet #20) sert de laboratoire R&D pour valider compétences et méthodologies avant développement MoodCycle. Analyse triangulaire menée : retours terrain + recommandations Claude Code + architecture IMB.

**Contraintes :**
- Développeur IA-natif 18 mois expérience, 20 projets portfolio
- TDA/H nécessitant résistance scope creep et branches parallèles  
- Objectif apprentissage release management + transfert compétences

---

## Decision

### Priorité #1 : Foundation Technique (v1.0.4)
**DÉCISION :** Tests automatisés + Gestion erreurs avant toute expansion fonctionnelle

**JUSTIFICATION :**
- Convergence 3 perspectives : Bug NaN non détecté par 10 testeurs + Recommandation Claude Code + Infrastructure IMB
- Prévention emballement IA (Jest) par cadrage méthodique
- Méthodologie capitalisable sur portfolio entier

**ALTERNATIVES REJETÉES :**
- Features premium immédiates → Fondations instables
- Mode paysage → Solution cherche problème

### Roadmap Multi-Releases Validée

**v1.0.4 - Foundation :**
- Audio system (consensus terrain 100%)
- Tests + Error boundaries (convergence technique)
- Lock screen + Onboarding (usage réel validé)

**v1.1.0 - Monétisation :**
- RevenueCat + Premium logic (ROI + learning)
- Validation architecture sophistiquée IMB

**v1.2.0 - International :**
- 15 langues + expo-localization (marché 10x)
- Migration SDK 53 (stabilité)

**v1.3.0+ - Innovation :**
- Apple Watch (compétence différenciante)
- State management global (scaling)

### Framework Priorisation Adopté

**FORMULE :** Impact Utilisateur (50%) + Learning Value (30%) + Technical Effort (20%)

**RÈGLES :**
- User feedback > Analyse statique (audio absent Claude Code)
- Foundation > Features (tests avant expansion)
- Apprentissage > Perfectionnisme (80% fonctionnel suffisant)

---

## Consequences

### Positives
- Méthodologie reproductible pour MoodCycle
- Résistance scope creep par priorisation stricte
- Learning value maximisé par convergence perspectives
- Release management structuré et documenté

### Négatives
- Timeline 1.0.4 allongée par foundation technique
- Complexité cognitive framework multi-artefacts
- Dépendance cadrage IA pour éviter emballement

### Risques Identifiés
- Branches parallèles par impatience → Discipline priorisation requise
- Over-engineering par sophistication IMB → Référence objectif laboratoire
- Perfectionnisme paralysant → Focus 80% fonctionnel

---

## Compliance

### Validation Continue
- Retours testeurs famille avant chaque release
- Convergence triangulaire pour nouvelles features  
- Documentation apprentissage pour transfert MoodCycle

### Métriques Succès
- Zero crash non géré (error boundaries)
- Audio system adoption 100% testeurs
- Tests coverage >80% composants critiques
- ROI monétisation validé avant expansion

---

## Related

**Artefacts Techniques :**
- Framework Développement Mobile - Méthodologie générale
- Matrice Priorisation Multi-Releases - Scoring détaillé
- Méta-Framework Apprentissage - Template reproductible
- Analyse Claude Code - Confrontation perspectives

**Documentation Projet :**
- CHANGELOG.md - Historique complet
- /docs/devlogs/ - Learning capitalisé
- Manifesto Chrysalis-Eric v2.0 - Cadre collaboration

---

## Implementation Notes

**Prochaines Actions Immédiates :**
1. Tests unitaires useTimer + useDialOrientation (cadrage Jest strict)
2. Error boundaries React + logging centralisé  
3. Audio system complet (sonnerie + haptics + lock screen)
4. Wizard onboarding (gap neurotypique/neuroatypique)

**Signaux d'Alerte Monitoring :**
- IA galère logique simple → Architecture review
- Emballement branches → Retour focus priorité #1
- Absence validation terrain → Tests utilisateur immédiat
- Scope creep → Référence objectif laboratoire

---

*ADR vivant - Évolution selon feedback et apprentissage continu*