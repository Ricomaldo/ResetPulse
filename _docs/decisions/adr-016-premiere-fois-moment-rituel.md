---
created: '2026-07-30'
updated: '2026-07-30'
status: active
type: architecture-decision-record
context: 'ResetPulse 3.0 — onboarding minimaliste confirmé, langage Moment/Rituel'
stakeholders: 'Eric (product), Claude design (design), pilote Fable (implémentation)'
supersedes: 'adr-010-onboarding-v2-vision-finale.md'
---

# ADR-016 — Première fois : un Moment tendu comme une main

## Statut

**ACCEPTED** — grillé point par point avec Eric le 30/07/2026 (soir),
rédigé après validation de chaque décision. Remplace l'onboarding v2.1
(ADR-010, superseded).

## Contexte

L'onboarding 2.0 déployé (9 écrans linéaires, ~2-4 min) n'était pas un
tutoriel : une machine d'investissement émotionnel avec paywall au sommet.
Ses chiffres : paywall→trial 5,7 %, trial→paid 100 %. Le recentrage
(ADR-014) l'a tué d'un bloc pour la signature — mais le deuil d'Eric a
révélé ce que les documents n'avaient pas capturé : ce qui manque au
minimalisme actuel n'est ni la pédagogie ni la vitrine, c'est **la chaleur
de l'accueil** — « une main tendue, pas un doigt qui pointe ». Les tips,
si bien écrits soient-ils, pointent ; les deux premiers écrans de la 2.0
accueillaient.

Les trois user stories validées (vision `les-trois-cerveaux.md`) bornent
l'autre côté : Claire fuit tout ce qui retarde son premier tap, les
questions imposées sont des murs (le 3e écran de la 2.0 — « Ton timer, ce
serait pour… » — était la première friction nommée par Eric lui-même).

Découverte en cours de grill : les 3 rituels de base préinstallés
remplissent le cap gratuit (3) dès l'installation — toute création jour 1
tombait sur la surface d'achat. La présente décision résout cette
collision par le mécanisme « garde ce moment ».

## Langage (entre au CONTEXT.md)

- **Moment** : ce qui se vit quand le disque tourne — éphémère, réglé à la
  volée (activité, durée, couleur), jamais sauvegardé par lui-même.
- **Rituel** : **un Moment gardé** — sauvegardé, relançable en un tap.
- « Séance » est banni du langage visible (registre clinique) ; les textes
  qui l'emploient encore basculent au lot de copies post-review Claude
  design. « Moment » n'est plus « le langage d'avant » : il est réhabilité
  comme terme du domaine.

## Décision

### 1. Le seuil — deux écrans chaleureux, zéro question

La Première fois s'ouvre par un **seuil de deux écrans** repris de la 2.0
(les deux qu'Eric revendique) : ① l'accueil qui respire — logo, phrase de
bienvenue, le disque qui respire, rien à répondre ; ② la main tendue —
« Un timer qui s'adapte à toi » + « **Créer mon moment** » — dont le bouton n'ouvre PAS un
formulaire : il fait entrer dans la vraie app. ~15 secondes de chaleur,
puis le réel. AUCUN autre écran : les questions psycho (liées au bouton
intelligent abandonné), l'écran notifications (permission désormais
contextuelle au premier démarrage de Moment — en place), les choix
imposés et le paywall d'onboarding sont morts et le restent.

### 2. Dedans : un Moment se construit, rien ne se sauvegarde

Sur l'écran d'accueil réel, les 4 tips existants (C7) guident le setup —
rangée, cadran, couleur — et le premier disque tourne en moins d'une
minute. **Jamais le sheet, jamais de formulaire.** La Première fois
construit un Moment, pas un Rituel.

### 3. La naissance du Rituel — « garde ce moment ? »

Au sommet émotionnel (fin du premier Moment accompli), sous le message de
fin : « **garde ce moment ?** » — un tap, tout est prérempli de ce qui
vient d'être vécu. Comme le Moment est parti d'un rituel de base, la
sauvegarde **met à jour ce rituel** — il devient le sien, le cap gratuit
reste à 3, zéro mur jour 1. *Un Moment, gardé, devient un Rituel* : le
mot fait la pédagogie.

### 4. La découverte continue — astuces dormantes (3.0)

Héritage assumé des tooltips 2.0, sans le tour : une astuce ponctuelle se
réveille UNE fois si une fonction n'a jamais été touchée (spec screen-flow,
§tips — jamais codée à ce jour). Décision Eric : **dans la 3.0.**

### 5. Le tour guidé : mort définitive, sans porte de replay (Monde B)

Pas de « revoir les bases ». Sa chaleur a émigré dans le seuil, sa
pédagogie dans les astuces dormantes. Réversible à bas coût si les
données montrent des utilisateurs perdus ; l'inverse (retirer une porte
installée) coûte toujours plus.

### 6. La preuve par les chiffres

L'ADR se juge aux données d'août (PostHog) : `first_moment_started`
(sortie du seuil), `first_moment_completed` (premier Moment accompli),
`ritual_kept` (« garde ce moment » accepté), puis `ritual_applied`
(existant) pour la suite. Le deuil se tranche par la réalité, pas par
une opinion.

## Ce que ça coûte à construire (roadmap, après Temps 2/3)

- Seuil 2 écrans (reprise visuelle des écrans 2.0 validés, sans questions).
- « garde ce moment ? » en fin de premier Moment (mise à jour du rituel
  de base d'origine) + événements §6.
- Astuces dormantes (déjà en roadmap).
- CONTEXT.md : entrées Moment/Rituel (fait avec cette ADR).
- Référence esthétique parquée : l'écran « 6 cartes » de la 2.0, aimé
  d'Eric — inspiration future pour la palette d'emojis, PAS un écran
  d'onboarding.

## Ce que ça remplace

ADR-010 (onboarding v2.1, 9 écrans, paywall intégré) : superseded. La
fonction de conversion du paywall-au-sommet est reprise par la mécanique
3b (invitations post-usage, portes étiquetées, surface adaptative) — « 
garde ce moment ? » n'est PAS un paywall, c'est la naissance de l'objet
central du produit.
