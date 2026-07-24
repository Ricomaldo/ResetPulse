---
created: '2026-07-23'
updated: '2026-07-23'
status: active
type: spec
---

# Spec — Recentrage (Lots 2-3)

> Référence d'intégration. Autorité : `CONTEXT.md` (vocabulaire) + ADR-014/015 >
> cette spec > screen flow Claude design (`screen-flow.dc.html`, projet design
> « ResetPulse ») > code existant. Les IDs SCR-x réfèrent au screen flow.
> Le Lot 1 (soustraction + sheet léger) est spécifié par la mission —
> `_cockpit/missions/active/recentrage.md`.

## Décisions figées (23/07, Eric)

| Choix | Verdict |
|-------|---------|
| SCR-10 accès palettes | **A** — une ligne « Palettes », sous-écran unifié couleurs + emojis |
| SCR-11→14 départ Première fois | **A** — timer vivant présélectionné, tips guident |
| SCR-15 tirage Distraction | **A** — aléatoire pur, jamais deux fois le même d'affilée |
| SCR-16/17 emoji custom | **A** — gratuit ; le gratuit est capé à **3 rituels** (la collection se paie) |
| Pause | **ADR-007 tient** — pas d'état PAUSED, pattern rembobinage. L'UI s'aligne, pas l'inverse |

### Écarts au screen flow (annotations Eric)

- **SEQ hors 3.0.0** : la bulle « Enchaîner une pause ? » (SCR-3) et le bouton
  « Pause 5′ » (SCR-9) shippent en build n+1, pas au recentrage.
- **Bouton « Pause » (SCR-8)** : n'existe pas — remplacé par Stop (rembobinage
  ADR-007) + Reset.
- **Taille du dial** : systématiquement plus grand que les maquettes —
  règle : ~80 % de la largeur écran en Mixte/Focus, ~65 % en Complet.
  Le disque est le produit.
- **Bouton Distraction sobre** : *la distraction, c'est l'emoji qui la porte —
  le bouton n'est que le déclencheur.* Pas d'animation permanente du bouton ;
  au plus un micro-état idle.
- **Layout Complet (SCR-7/8/9)** : à retravailler avec CD (cycle suivant) —
  intégrer la version actuelle comme provisoire.

## Modes (Lot 2)

Réglage **global unique** (persisté), 3 valeurs — le cadran et l'emoji ne bougent
jamais de place, seul le chrome autour change :

- **Mixte** (défaut, la signature) : dial + une rangée compacte (activités +
  couleurs) + bouton Distraction. SCR-1/2/3.
- **Focus** : dial seul, zéro contrôle, Distraction **masqué**. Fin muette
  (emoji ✨, pas de bouton). Relance = tap sur le disque. SCR-4/5/6.
- **Complet** : titre activité, durée ±, activités, couleurs, ⚙, Distraction.
  Le ± de durée = override de séance, ne modifie pas le Rituel. SCR-7/8/9.

Bascule : segmenté dans le sheet (SCR-10). États par mode : repos (disque plein) /
séance (se vide, emoji animé) / fin (message de fin de l'**Activité**).

## Sheet léger (Lot 1 structure, Lot 2 contenu)

SCR-10 — un seul écran, 4 blocs, swipe up (tous modes) ou ⚙ (Complet) :
1. Segmenté Mode (Mixte/Focus/Complet)
2. 3 toggles : écran allumé, sens horaire, emoji au centre
3. « Mes rituels » → liste + créer (SCR-16)
4. « Palettes » → sous-écran unifié couleurs (PALC) + emojis (PALE).
   La répartition gratuit/payant y est **parquée** — à trancher devant les écrans.

## Rituels (Lot 2)

Modèle ADR-015. Schéma : `Rituel { nom, emoji→Activité, couleur, durée, son, étapes?[] }`
(`étapes` présent, non implémenté). Storage neuf, pas de migration (reset propre).

- **Gratuit : 3 rituels max.** Ambiances : illimités + création libre étendue.
- Formulaire unique (SCR-16) : emoji → couleur → durée → son. Sert Première fois,
  création, édition. Aucun écran spécial.
- **Emoji custom** (SCR-17, gratuit) : clavier système ; crée une Activité légère
  à la volée (messages génériques, rythme défaut). Invisible pour l'user — il
  voit « son rituel ».
- Rituel « Cuisson » 🥚 livré : 3 durées-raccourcis (Coque 3′ / Mollet 6′ / Dur 9′)
  — c'est SCR-16 avec des valeurs par défaut, zéro concept nouveau.

## Première fois (Lot 2)

SCR-11→14, départ **A** : l'app s'ouvre en Mixte sur un timer vivant (🧘).
4 moments, tips ancrés à l'élément désigné, dismiss au **geste attendu** (jamais
de « suivant »), « passer » discret en haut à droite. Ne réapparaissent pas après
le premier rituel créé. Aucune collecte, aucun profilage (ADR-014).

Moment 4 nomme l'acquis : « Ton rituel est prêt 🎉 Touche le disque pour démarrer. »

## Distraction — MOT-f (Lot 3)

SCR-15, tirage **A** : tap → mouvement aléatoire parmi MOT-a…e (pas deux fois le
même d'affilée), ~2 s, retour à l'anim de séance. N'affecte ni durée ni timer.
Haptic léger + son optionnel (respecte le réglage du rituel). Vit en Mixte et
Complet, masqué en Focus. Bouton sobre (cf. écarts).

## Mouvements (Lot 3)

MOT-a Respire / b Tourne / c Flotte (disparition fun) / d Rebond / e Bat.
Défaut : **auto par Activité** (dérivé de `pulseDuration` existant — 600 ms
travail, 1200 ms médi). Choix libre du mouvement : parqué (probable Ambiances).
Respire gratuit (le pulse est la signature) ; le reste : Ambiances.

## Notifications (invariants — conseil CD ratifié)

Règle de tri : **est-ce que ça sert la séance en cours ? Sinon, silence.**

1. **Fin de séance** (existe : `useNotificationTimer` — à réaligner, pas
   reconstruire) : message de fin de l'Activité + emoji en icône.
   Jamais « Temps écoulé ! ».
2. **Live Activity / Dynamic Island** (Lot 3, Ambiances) : le disque qui se vide
   dans l'île, l'emoji qui pulse sur l'écran verrouillé. Couleur du rituel =
   accent. La signature qui déborde hors de l'app.
3. **Rappel doux** (Lot 3, opt-in explicite, jamais par défaut, 1/jour max) :
   « ton rituel du soir t'attend ».

**Interdits absolus** : streaks, « tu n'as pas médité depuis X jours », badges,
toute culpabilisation. L'app propose, elle ne diagnostique pas. Ton : minuscules,
phrases courtes, emoji de l'activité en icône.

## Analytics — PostHog (Lot 2)

Funnel : `first_run_completed` → `ritual_created` → `ritual_started` →
`ambiances_invitation_shown` → `ambiances_purchased`. Plus : `mode_changed`,
`distraction_tapped`. Rien d'autre au départ — la taxonomie grandit avec les
questions, pas avant.

## E2E — Maestro (Lot 2)

Flows : première fois complète, lancer/finir un rituel par mode (×3), créer un
rituel custom, basculer de mode, ouvrir/fermer le sheet.

## i18n

FR/EN pendant les lots (nouvelles clés : tips, rituels, sheet, notifs).
Batch 15 langues en fin de Lot 3, avant build store.

## Fidélité au rendu — valeurs exactes des maquettes CD (ajout 25/07, C6.2)

Extraites du canvas `screen-flow.dc.html` (source d'autorité visuelle).
L'écart au rendu se mesure contre CES valeurs, pas au goût.

**Tokens couleur (monde crème/corail) :**
- Fond écran : `#F4EFE7` (crème chaud) — pas de gris-beige froid
- Corail marque : `#E89665` · Accompli : `#7FA86B` · Encre : `#2D2520`
- Texte secondaire : `#5A5147` · Texte léger/hints : `#A89B8F`
- Surfaces (rangée, sheet, cartes) : `#FFFFFF` pur, ombres douces
  (`0 1px 4px rgba(0,0,0,0.08)`)

**Le centre du dial (SCR-1/2) — le point le plus sensible :**
- Emoji net, AUCUN overlay au-dessus (le fantôme play-button meurt —
  `showPlayButton` overlay retiré du rendu, le tap reste sur tout le disque)
- Centre = petit disque discret, jamais un rond translucide baveux qui
  recouvre l'emoji

**Chips et pastilles :**
- Activité sélectionnée : cercle **sombre `#2D2520`** (le doré n'existe pas
  dans les maquettes) · non-sélectionnée : blanc, bord `#E3DACB` 1.5px
- Couleur sélectionnée : anneau `#2D2520` 2px · autres : bord `rgba(0,0,0,0.08)`
- Segmenté : sélection **sombre `#2D2520` texte blanc**, fond `#F1EADF` pour
  les inactifs

**Focus (SCR-4/5/6) :**
- Dial nettement plus grand qu'en standard (maquette : 208 vs 192 sur 236 de
  large → ~88 % vs ~81 %)
- Hint « balayer vers le haut » : discret, EN BAS d'écran, couleur `#A89B8F`,
  petite taille — et passé en i18n (fin de l'exception hardcode C4)
- Rien d'autre : pas de ⚙ visible (vérifier bulle Expo Dev Client vs code app
  — si code app, mort)

**Modes → 2 états (acté Eric 25/07, ×2) :** Complet meurt. Segmenté à 2
entrées ; libellés provisoires [Standard | Focus] — naming définitif à la
passe CD (piste : le défaut ne se nomme pas). L'affordance d'entrée en Focus
reste une question ouverte CD (le segmenté-dans-settings est un intérim).

## VERDICTS FERMÉS CD (25/07) — normatif, remplace tout ce qui contredit

**Hub central (ex-pastille)** : plat, fond crème `#F4EFE7` (clairière du cadran,
pas sticker), liseré interne 1px `rgba(0,0,0,0.06)`, ZÉRO ombre portée,
Ø = 34 % du cadran, emoji = 20 % du cadran. Toujours présent, tous états.

**Poignée de drag** (repère R = rayon graduations) : repos = barre radiale
R−16→R+2, épaisseur 4, `#2D2520` à 55 %, à l'angle de progression ; drag =
R−20→R+4, épaisseur 5, 100 %, halo cercle 22 `#2D2520` 8 % au bout.
JAMAIS de rayon plein centre→bord.

**⏱ Digital timer** : ui-monospace 700 26px, interlettre 0.03em, `#5A5147` ;
glyphe ⏱ 12px `#A89B8F`, gap 6, à gauche ; haut-centre ~22px sous l'encoche ;
optionnel (Show time) ; masqué en Focus.

**Naming définitif** : segmenté = « ResetPulse » · « Focus » (Zen tué —
collision palette ; Standard tué — technique). Le défaut porte le nom de
l'objet (◉ du pouls en polish ultérieur).

**Double-tap fond** = bascule Focus : fond nu uniquement, 2 taps < 300 ms,
ignoré 1,5 s après réveil d'écran, NON destructif (ne touche pas au timer).
Apprentissage : légende sous le toggle du sheet « astuce : double-tap le fond
pour basculer », visible les 2 premières ouvertures du sheet, puis jamais.

**Dé Distraction** : 🎲 seul au repos, rattaché à la famille des contrôles
(carte blanche arrondie) ; intitulé « surprends-moi » en pastille au tout
premier affichage post-onboarding, disparaît au premier geste ou après 4 s,
ne réapparaît jamais ; ne s'anime qu'au tap (Lot 3) ; masqué en Focus.

**Fin (Accompli)** : le vert `#7FA86B` MEURT. Disque plein dans LA COULEUR DU
RITUEL + bloom radial `#FFF4E6`→transparent (~40 % du disque) derrière
l'emoji + ✨ REJOINT l'emoji (ne le remplace pas) + message de fin d'Activité.
Signal « done » éventuel : or `#D4A853`, jamais vert.

**Palettes** — sections « Incluses » / « Ambiances » (pleine couleur, jamais
cadenassées ; preview live ; invitation inline Lot 3 ; sélection non achetée
revient au dernier inclus au redémarrage) :
- Incluses (3) : serenity (défaut) · dusk · ocean
- Retravailler : earth (saturation/contraste +, plus gratuite telle quelle),
  dawn (foncer), zen (remplacer le greige #B8B0A8)
- Tuer : darkLaser, autumn (fusion dans le rework earth)
- Garder : softLaser, classic, tropical, soft, lavender, teal, forest

**Voix (registre : complice, minuscules, présent, jamais culpabilisant)** :
- work : « au boulot. » / « voilà, c'est fait. » · break : « on souffle. » /
  « te revoilà, en douceur. » · meditation : « on respire. » / « te revoilà. »
  · creativity : « laisse venir. » / « beau moment. »
- invitation : « on y va ? » (ratifiée) · geste d'arrêt : « revenir à zéro »
- Tips première fois : 1 « on commence par choisir une activité 👇 » ·
  2 « cet emoji te tient compagnie. glisse le disque pour régler la durée. » ·
  3 « une couleur ? elle change tout de suite. » · 4 « c'est prêt. touche le
  disque pour lancer. »
- Les 14 paires premium : CD attend la table du repo (devlog C7) pour les
  traiter au même registre.

## Hors mission (après 3.0.0 — inscrits, pas abandonnés)

- **SEQ-a puis SEQ-b** (enchaînements, Pomodoro)
- **App watchOS** — chantier nommé, assumé comme investissement formateur
  (triptyque extensions natives : Live Activities + WidgetKit + watchOS,
  transférable aux autres apps). Ne retarde pas le ship 3.0.0.
- Répartition gratuit/payant des palettes, mouvement libre : à trancher devant
  les écrans réels.
