# CLAUDE.md — arc enow

> **Tu n'es pas sur ResetPulse 3.0. Tu es sur l'arc `enow`.**
>
> Lis `_cockpit/missions/active/arc-enow.md` **en premier** — c'est l'amorce de
> l'arc : la thèse, ce qui est décidé, ce qui est ouvert, ce qui est interdit,
> et le temps en cours. Ce fichier-ci ne vit que sur la branche `enow`.

## Où tu es

- **Copie de travail** : `~/_forge/experimental/enow`, branche `enow`.
- **Témoin figé de la 3.0** : `~/_codebase/apps/resetpulse-3.0` (branche `main`).
  On ne le touche pas. Il existe pour qu'on puisse regarder ce qui était.
- La 3.0 est **en ligne sur les deux stores et gelée**. Il n'y aura pas de 3.1.

## Ce qu'on fabrique

Une 4.0 beta, jamais publiée en l'état. La thèse, en bref — le détail est dans
l'amorce :

- Le premier geste n'est pas une durée, c'est une intention : **`no more`**
  (un plafond, pas plus) ou **`no less`** (un plancher, pas moins).
- **La forme part vide et se remplit** pendant la séance. La récompense est la
  complétude. Le Time Timer classique se vide ; celui-ci dépose.
- Parcours visé : **mode → intention → start**. Pas d'étape de durée.

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

Le build iOS passe par Xcode (`ios/ResetPulse.xcworkspace`), jamais par EAS.

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
