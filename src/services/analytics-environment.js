// src/services/analytics-environment.js
/**
 * Détection de l'environnement d'exécution pour la super-property
 * `environment` posée par analytics.js à l'init (décision Eric 07/08, suite
 * audit analytics 06/08) : le gate DEV_MODE coupe le simulateur, mais les
 * builds device release (TestFlight, QA) émettent dans PostHog prod sans
 * marquage — objectif : les distinguer d'un vrai événement App Store / Play.
 *
 * iOS TestFlight — repli assumé, TODO non résolu (06/08) : aucune API
 * disponible SANS nouvelle dépendance ne distingue TestFlight de l'App
 * Store. Investigué avant d'écrire ce repli :
 *
 * - `expo-application` (dépendance transitive déjà installée — requise par
 *   `expo` lui-même, présente dans node_modules sans figurer dans
 *   package.json en direct) expose `getIosApplicationReleaseTypeAsync()`.
 *   Son implémentation native
 *   (node_modules/expo-application/ios/EXApplication/EXProvisioningProfile.m,
 *   méthode `appReleaseType`, lignes ~39-69) renvoie `APP_STORE` dès qu'aucun
 *   `embedded.mobileprovision` n'est présent dans le bundle — vrai à la fois
 *   pour TestFlight ET pour l'App Store (les deux sont re-signés côté Apple,
 *   sans profil embarqué). L'API ne peut donc PAS les séparer : ce n'est pas
 *   une limitation d'usage, c'est la donnée native elle-même qui est
 *   identique dans les deux cas.
 * - Le signal qui marche réellement dans l'écosystème iOS (nom du reçu —
 *   `sandboxReceipt` en TestFlight vs `receipt` en prod, lu via
 *   `appStoreReceiptURL`) n'est exposé par AUCUNE dépendance déjà installée
 *   (ni `expo-application`, ni `expo-constants` — vérifié, aucune des deux
 *   n'expose l'URL du reçu).
 *
 * Repli : `'prod'` inconditionnel, iOS et Android. Android : le sideload /
 * la piste interne Play n'est pas traité ici (hors mandat) — même repli
 * `'prod'` en attendant.
 *
 * Async par construction : la vraie détection, si une dépendance native
 * l'apporte un jour (ou un accès receipt URL), pourra remplacer ce corps
 * sans changer la forme de l'appel côté analytics.js (cf. gestion async
 * dans `init()` : posé à 'prod' immédiatement, corrigé si cette promesse
 * résout à autre chose, jamais de throw qui remonte).
 */
export async function detectEnvironment() {
  return 'prod';
}
