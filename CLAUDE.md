# CLAUDE.md — arc enow

> **Tu n'es pas sur ResetPulse 3.0. Tu es sur l'arc `enow`.**
>
> Lis `_cockpit/missions/active/arc-enow.md` **en premier** — c'est l'amorce de
> l'arc. Elle renvoie au **dernier devlog**, qui liste les lectures de la
> séance. Ce fichier-ci ne vit que sur la branche `enow`.

## Où tu es

- **Copie de travail** : `~/_forge/experimental/enow`, branche `enow`.
- **Témoin figé de la 3.0** : `~/_codebase/apps/resetpulse-3.0` (branche `main`).
  On ne le touche pas. Il existe pour qu'on puisse regarder ce qui était.
- La 3.0 est **en ligne sur les deux stores et gelée**. « Pas de 3.1 » est
  rouvert par la cible RP3.1 — à trancher, voir le devlog du 03/10.
- **Build en main : T3-2**, installé sur l'iPhone d'Eric le 05/10 (tag
  `enow-t3-build-2`, app « enow 2 », bundle `com.irimwebforge.enow2`), à
  côté de la 3.0 et de T3-1 (`enow-t3-build-1`). En usage, sans retouche,
  jusqu'au crible. Son log d'intégration :
  `_cockpit/missions/active/P0-build-t3-2.md`.

## Ce qu'on fabrique

La branche porte deux cibles :

- **RP3.1** — la 3.0 relancée avec les améliorations du cadran.
- **enow** — la proposition neuve : un écran d'accueil qui fait choisir entre
  deux régimes.

Le détail vit dans `_cockpit/rd/` (lexique, registre, collecteurs), pas ici.

## Langage

Le lexique R&D (`_cockpit/rd/lexique-rd-rp3-enow.md`) fait foi. La thèse
parle français, le dev anglais — chaque terme a son équivalent. « RP4 » ne
désigne plus rien. « T3 » seul désigne le temps 3 ; un build se nomme Tx-n.

## Le juge

**L'usage d'Eric au quotidien, puis celui d'Arthur.** Pas le marché, pas les
métriques, pas les trois cerveaux théoriques. Rien ne part sur TestFlight tant
qu'Eric n'est pas conquis.

## Règles de l'arc

- **Sketch sauvage.** Cacher un module jusqu'à nouvel ordre, essayer une forme,
  la jeter — c'est permis et souhaité. On avance avec joie et légèreté.
- **La 3.0 témoigne de l'état, elle n'est pas la référence.** Ne pas « rester
  cohérent avec l'existant » par réflexe : c'est l'existant qu'on interroge.
- **Ne rien trancher par accident.** La section « Ouvert » de l'amorce liste ce
  qui doit rester ouvert (polarité, sort du drag, forme, plafond, nom, bundle
  id). Si un geste y touche, on le dit avant.
- **Interdit** : toucher `main` · viser les stores, la review, l'i18n complète,
  les assets · traiter cette branche comme une release.
- Commits au fil sur `enow`, **un seul push en fin de passe**.

## Le noyau qu'on ne casse pas

Le reste est matière à sketch — ceci ne l'est pas :

- `src/hooks/useTimer.js` et la state machine du timer (ADR-007)
- Les tests de ce noyau, dans `__tests__/`

Ailleurs, **les tests suivent le code** : un composant supprimé emporte ses
tests dans le même commit.

## Stack & commandes

React Native 0.83.6 · Expo SDK 55 (New Architecture) · React 19.1.0 · npm.
État Context API, i18n-js, RevenueCat, PostHog.

```bash
npm install                # requis — le clone est neuf
npx expo prebuild          # requis — ios/ et android/ sont gitignorés
npx expo start             # serveur dev
npm run ios / npm run android
npm run test               # jest
```

Le build iOS passe par Xcode (`ios/enow2.xcworkspace` depuis le prebuild
du 05/10), jamais par EAS. Signature GUI pour les deux cibles (app +
widget) après chaque prebuild propre. **Simulateur en Release
seulement** : `npx expo run:ios --configuration Release --no-bundler
--device <udid>` — le Debug ne lie plus avec les pods précompilés de RN
0.83 (`RCTPackagerConnection` manquant pour `expo-dev-launcher`). Le JS
est embarqué : recompiler après chaque changement.

## Architecture (héritée, à interroger)

```
src/
├── components/   dial/ · layout/ · modals/ · rituals/ · sounds/ · first-run/
├── config/       activities.js · timer-palettes.js · revenuecat.js · test-mode.js
├── contexts/     TimerConfigContext · PurchaseContext
├── hooks/        useTimer ← noyau · useNotificationTimer · useTranslation
├── i18n/         15 langues
├── screens/      TimerScreen.jsx
├── services/     analytics.js (PostHog)
└── theme/        ThemeProvider · tokens · colors
```

## Conventions de code

- Fichiers et dossiers : kebab-case · Composants : PascalCase ·
  Variables : camelCase · Constantes : SCREAMING_SNAKE
- Français pour la conversation, anglais pour le code
- Textes visibles : `t('key')` via `useTranslation()` — mais pendant le sketch,
  du texte en dur est toléré tant qu'il est provisoire

## Ce qui n'est PAS à charger en orientation de session

`_docs/` (les ADR de la 3.0), `CONTEXT.md`, `_cockpit/README.md`,
`_cockpit/missions/done/recentrage.md` — tout cela décrit le monde 3.0. À ouvrir
**sur demande explicite**, jamais par réflexe d'orientation. Deux exceptions
utiles : ADR-004 et ADR-011 (mécanismes de durée, auto-scale) — ce sont eux que
l'arc révoque, et l'ADR-019 les supersédera au temps 4.
