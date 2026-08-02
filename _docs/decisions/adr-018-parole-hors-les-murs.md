---
created: '2026-08-02'
updated: '2026-08-02'
status: active
type: architecture-decision-record
context: 'ResetPulse 3.0 — Live Activity vivante (Temps 2), doctrine de la communication hors app'
stakeholders: 'Eric (product), pilote Fable (implémentation)'
---

# ADR-018 — La parole hors les murs

## Statut

**ACCEPTED** — principe posé par Eric (02/08/2026 : « je ne veux pas
polluer l'espace Live Activity ni l'espace notification — ça se pense
ensemble, c'est la communication avec l'user en dehors de l'app »),
rédaction déléguée au pilote, plan approuvé.

## Contexte

L'anneau Live Activity a vécu (Temps 2, 31/07) et a immédiatement révélé
un trou : la séance finie écran verrouillé, l'anneau reste momifié à
0:00 — l'app suspendue ne peut pas appeler `end()`, et le système ne
retire une activité seul qu'après ~8-12 h. En cherchant la sortie, le
constat s'est élargi : la communication hors app n'avait AUCUNE doctrine.
Une seule ADR l'effleurait (ADR-007 : pas de reprogrammation post-pause),
l'ADR-010 morte spécifiait des rappels J+3/J+7 jamais implémentés, et
une pollution dormait dans le code : app au premier plan, la complétion
déclenche bannière + son système PAR-DESSUS le son in-app et le bloom —
deux canaux pour le même instant.

## Principe

**Hors de l'app, ResetPulse parle par l'état, jamais par l'injonction.**
Et un même instant n'est jamais porté par deux canaux.

L'app est complice, pas surveillante (CONTEXT.md) — dehors comme dedans.
Ce qui vit sur l'écran verrouillé dit ce qui EST (une séance tourne, une
séance est accomplie) ; rien, jamais, ne réclame, ne rappelle, ne
culpabilise.

## Trois canaux, trois rôles

### 1. La notification locale — l'ÉVÉNEMENT
Un instant : la fin de séance sonne. Elle porte le son choisi par l'user
(iOS) et la voix de l'Activité (titre `emoji + message de fin`, corps
vide), puis s'efface. **One-shot à jamais** : les rappels J+3/J+7 de
l'ADR-010 sont déclarés MORTS, aucun rappel de rétention, aucun
marketing, aucun badge d'icône. La clé legacy `reminderScheduled` est
morte (nettoyée par Vanilla, plus aucun code derrière).

### 2. La Live Activity — l'ÉTAT
Une durée : la séance qui vit (l'anneau, animé par le système sur dates
fixes), puis l'état accompli. **Silencieuse par nature** — elle ne
sonne jamais, elle montre. Et elle doit **mourir dignement** (cycle de
vie normé, § suivant).

### 3. Le widget statique (phase 2, à venir) — l'ACCÈS
Un raccourci vers les rituels sur l'écran d'accueil. Ce n'est pas une
communication : il n'affiche aucun état de séance, ne se met pas à jour
pour parler — il attend un tap.

## Règles

**① Un instant = un canal.** Fin de séance app en fond : le SON vient de
la notification, l'ÉTAT de la Live Activity (« accompli ✨ »). Fin de
séance app au premier plan : le son vient de l'app (expo-audio + haptique
+ bloom) et la notification est SUPPRIMÉE par le foreground handler
(bannière, liste, son — rien ne passe). La double-parole constatée dans
le code meurt avec cette ADR.

**② Silence par défaut.** La permission notifications se demande au
premier démarrage RÉEL de Moment (ADR-016, gravé ici) — jamais au boot,
jamais par un écran dédié. Refus = dégradation silencieuse totale (le
feedback devient in-app seulement), aucune relance.

**③ Rien ne survit dehors sans raison — le cycle de vie de l'anneau.**
- `start` au démarrage du Moment (dates fixes, le système anime seul) ;
- à 0:00, `staleDate` (= endDate) fait re-rendre le widget PAR LE
  SYSTÈME : l'anneau devient « accompli ✨ » sans réveiller l'app ;
- fin naturelle app ouverte : `end(done)` → « accompli ✨ » ~3 min puis
  retrait ; rembobinage : retrait immédiat ;
- à CHAQUE retour de l'app au premier plan (et au démarrage à froid) :
  réconciliation — toute activité orpheline d'une séance qui ne tourne
  plus est terminée immédiatement ;
- le plafond système (~8-12 h) reste le tout dernier filet, jamais le
  mécanisme nominal.

**④ Android assume son approximation.** Le son de la notification y est
celui du channel, figé à la création (limitation plateforme) — c'est
nommé ici, pas caché. Live Activity : iOS 16.2+ seulement, no-op
silencieux partout ailleurs (jamais un crash, jamais un substitut).

## Ce que ça implique (lot « disparition digne », branche 3d)

- Module natif : `staleDate = endDate` au start.
- Widget : brancher sur `state == "done" || isStale` → DoneView (écran
  verrouillé ET Dynamic Island).
- `useLiveActivity` : réconciliation AppState (mount + retour actif —
  end immédiat si le timer ne tourne pas ; ne JAMAIS toucher une séance
  en marche, ses dates fixes restent justes).
- `useNotificationTimer` : foreground handler conditionnel (règle ①).

## Ce que ça remplace / grave

- ADR-010 §rappels J+3/J+7 : morts, définitivement.
- ADR-007 « plus de reprogrammation post-pause » : repris et gravé.
- ADR-016 permission contextuelle : reprise et gravée.
- Toute communication hors-app FUTURE (widget statique compris) se juge
  contre le principe : état, jamais injonction ; un instant, un canal.
