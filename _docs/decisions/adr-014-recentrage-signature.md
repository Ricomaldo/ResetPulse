---
created: '2026-07-23'
updated: '2026-07-23'
status: accepted
type: architecture-decision-record
supersedes: 'adr-005, adr-008, adr-010, adr-013 (et partiellement adr-006)'
---

# ADR-014 — Recentrage signature : l'app devient opinionated

L'app s'était perdue dans la configurabilité (matrice 4×4 de profils, bottom sheet
3-snaps 7 sections, onboarding-parcours, bouton à pression paramétrable). Constat
d'Eric, 23/07/2026 : « mon cerveau complexifie pour éviter — ce timer doit être
beaucoup plus simple. » On recentre sur la signature — **un disque coloré qui se
vide, un emoji au centre, la couleur qui change en direct** — et on remplace le
réglage à la carte par des **choix assumés**.

## Décisions

- **3 Modes d'affichage fixes, réglage global unique** : Mixte (la signature,
  défaut), Focus (extra-minimaliste), Complet (extra-complet). Principe de design :
  *chaque profil TDAH en déteste un, en adore un, en tolère un — c'est voulu.*
  Les TDAH savent qu'ils sont tous différents ; trois modes tranchés servent tous
  les profils, un réglage à la carte n'en sert aucun.
- **Soustraction** : `@gorhom/bottom-sheet` (remplacé par un sheet léger custom
  Reanimated 4, pattern AsideZone V3 — résout aussi le crash P0), PulseButton à
  pression sensible (tap franc), matrice de personas ADR-008 (aucun profil
  configurable).
- **Première fois** (ex-onboarding) : construire son premier Rituel, guidé par des
  tips légers. La collecte de données pour prérégler à la place de l'user meurt.
  L'app propose, elle ne diagnostique pas.
- **Positionnement** : app **complice**, pas surveillante. Le bouton Distraction
  (mouvement aléatoire de l'emoji, masqué en Focus) est l'anti-pattern assumé :
  l'app autorise la pause au lieu de prétendre régler la concentration.
- **Monétisation** : cœur gratuit entier (disque, emoji, couleur en direct,
  activités et rituels de base) + pack **Ambiances** en achat unique ≈ 4,99 €,
  pas d'abonnement anxiogène. Amende ADR-003 : le déclencheur « 2 timers »
  devient une invitation (« fais-le respirer »), pas un mur.
- **Visuel** : crème + corail (peau actuelle) sur la mise en page épurée de la
  v0.1. Icône : le pouls (abstraite — marque, pas objet).

## Option rejetée

Continuer la personnalisation totale (« customizable focus timer ») : c'est le
sous-titre malade — l'user qui doit tout choisir n'adopte rien, et la matrice de
configuration était la source de la complexité runtime (crash Reanimated 4) comme
de la dérive produit.

## Références

- Session design : projet claude.ai/design « ResetPulse », `ResetPulse Recentrage.dc.html`
- Cockpit : `_cockpit/vision/recentrage-decisions.md` (décisions + lots de migration)
- Glossaire : `CONTEXT.md` (racine)
- Modèle de données : `adr-015-modele-rituel-activite.md`
