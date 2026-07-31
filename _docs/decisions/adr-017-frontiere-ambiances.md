---
created: '2026-07-31'
updated: '2026-07-31'
status: active
type: architecture-decision-record
context: 'ResetPulse 3.0 — frontière free/premium caractérisée après prise en main Eric'
stakeholders: 'Eric (product), pilote Fable (spéc/implémentation)'
amends: 'adr-014-recentrage-signature.md (§freemium), adr-016-premiere-fois-moment-rituel.md (§3)'
---

# ADR-017 — La frontière Ambiances : vivre est gratuit, garder est payant

## Statut

**ACCEPTED** — grillée point par point avec Eric le 31/07/2026, rédigée
après validation de chaque décision. Remplace la table de frontière du
30/07 (finding cockpit) et le « cœur gratuit entier » comme formule.

## Contexte

Première prise en main réelle du reborn (Eric, simulateur, 30/07) avec la
question « est-ce que je paierais ? ». Réponse : non. Le free d'alors
permettait de personnaliser entièrement les 3 rituels de l'accueil
(emoji, durée, couleur) — « si je peux à ce point personnaliser en free,
jamais je ne paierai. Les palettes en plus et les sons en plus ne
suffisent pas. » Le « cœur gratuit entier » (ADR-014) créait de l'amour
mais aucun manque : la personnalisation — le vrai désir — était gratuite.

Contre-preuve dans le même geste : Eric constate qu'avec UN rituel
personnel qui lui apporte satisfaction, il paierait pour remplacer les
templates par d'autres rituels à lui. « J'ai déjà la preuve. »

## Principe directeur

**Vivre est gratuit, garder est payant.** Ou : *le free donne le geste,
Ambiances donne l'univers.*

- Le **Moment** (ce qui se vit quand le disque tourne) reste intégralement
  libre : durée à la volée, couleur en direct, dé, tout. On n'ampute
  jamais l'expérience vécue — c'est le produit.
- Ce qui **persiste** — faire sien, garder, construire son univers — est
  le territoire d'Ambiances. Le free en reçoit l'essentiel (assez pour le
  déclic des trois cerveaux au jour 1), l'univers complet est payant.
- **Jamais de mur** (invariant conservé) : la frontière se montre par des
  portes étiquetées, jamais par un refus brutal.

## Décisions par surface

### 1. Rituels — 3 templates figés + UN slot personnel (le cœur de la frontière)

- **Free** : les 3 rituels de base sont des **templates figés** —
  relançables à l'infini tels quels, mais toute l'UX d'édition
  (supprimer, renommer, changer la durée/couleur/son) est **masquée** sur
  eux. Un **4ᵉ slot** accueille UN rituel personnel, entièrement
  éditable : c'est là que vit l'appropriation gratuite.
- **Premium** : tout se débloque — les 4 slots entièrement éditables (les
  templates deviennent des rituels normaux, remplaçables/supprimables),
  rituels illimités au-delà.
- Le pari (preuve Eric sur lui-même) : la satisfaction du rituel unique
  crée l'envie de remplacer les templates — le manque exact qui vend.

### 2. « Garde ce moment ? » — amende ADR-016 §3

Le mécanisme ne met plus à jour un rituel de base : à la fin du premier
Moment accompli, il **crée le rituel personnel dans le 4ᵉ slot**. Ton
premier Moment devient ton premier rituel à toi, posé à côté des 3
templates — le geste est plus vrai, le code plus simple, la pédagogie
visible (on VOIT la différence entre un template et un rituel qui te
ressemble). Si le slot personnel est déjà occupé (rituel créé au
formulaire avant la première complétion), la ligne propose la mise à
jour de CE rituel — même geste, jamais de mur.

### 3. Renommage — nouveauté

Renommer un rituel au **clavier natif** (saisie inline). Visible
uniquement dans le menu « Mes rituels » — le nom n'apparaît jamais sur
l'écran d'accueil (la rangée ne montre que les emojis). Free : le rituel
personnel seul. Premium : tous.

### 4. Emojis — la vitrine

La liste derrière le + : **~6 emojis gratuits**, le reste **visible mais
grisé** (chaque emoji grisé est une porte étiquetée Ambiances). Critère
de curation — non le nombre mais la **couverture des trois cerveaux** :
Claire/Mehdi (travail, pause), Sofia/Louis (devoirs), la signature
(calme), plus deux pour respirer. Curation exacte devant l'écran.

### 5. Activités personnalisées — 100 % Ambiances

La création d'activité personnalisée (emoji librement choisi, rythme
propre) passe entièrement en Ambiances — sinon le + contourne la
vitrine et la frontière redevient illisible. **Grand-père** (validé Eric
31/07) : les activités personnalisées déjà créées par les utilisateurs
v2 free restent utilisables — seule la création NOUVELLE est Ambiances.

### 6. Palettes — l'essai libre (mécanique 3b conservée)

**3 gratuites / 10 Ambiances**, et les Ambiances restent **applicables
librement en séance** (pleine couleur, pas de cadenas) : ligne
d'invitation discrète pendant l'essai, **retour à la dernière palette
incluse au relancement** (`resolvePaletteOnLaunch`). La perte vécue
(« j'étais bien dans cette palette ») vend mieux que le gris. Curation
des 3 gratuites devant l'écran (une chaude — signature, une froide, une
sombre).

### 7. Actés inchangés

Sons **4 gratuits / 8 Ambiances** (structure 12, curation 30/07) ·
mouvements, plein écran, exports : Ambiances (ADR-014) · pack unique
≈ 4,99 €, jamais d'abonnement (`premium_lifetime_v2`).

## La grammaire des portes (deux registres, un principe)

- **Vitrine grisée** pour ce qui *persiste* (emojis → identité d'un
  rituel) : on voit l'univers, on ne peut pas encore le toucher.
- **Essai libre** pour ce qui se *vit* (palettes → couleur du moment
  présent) : on l'habite, on le perd au réveil.

Les deux sont des portes étiquetées vers la même surface d'achat
adaptative (Lot 3b) — jamais un mur, jamais de culpabilisation.

## La preuve par les chiffres

La frontière se juge aux données d'août (PostHog) : `paywall_viewed` par
porte (les portes existantes + les nouvelles : vitrine emojis, édition de
template), `trial_started`, `purchase_completed`, croisés avec
`ritual_kept` et `ritual_applied`. Si le manque ne convertit pas, on
déplace la frontière — elle est réversible par construction.

## Ce que ça amende

- **ADR-014** : « cœur gratuit entier » meurt comme formule — le free
  donne le geste, pas l'univers. Le reste (signature, pack unique) tient.
- **ADR-016 §3** : « garde ce moment » crée dans le slot 4 (ne met plus à
  jour un rituel de base). Le §1 (seuil), §4 (astuces), §5 (tour mort)
  tiennent.
- **Vision gagner-de-largent** : « cap 3 = seul hard cap » remplacé par
  la présente frontière.
- **Finding 2026-07-30 table-frontiere-ambiances** : remplacé.

## Reste à trancher (nommé, pas de dette cachée)

- Curation des ~6 emojis gratuits et des 3 palettes gratuites — devant
  l'écran, à la porte Eric.
- UX exacte du grisé (tap sur un emoji grisé → quelle porte, quel texte)
  — boucle Claude design (Temps 4), textes flaggés.
