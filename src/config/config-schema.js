// src/config/config-schema.js
/**
 * @fileoverview Socle de versionnage du blob persisté @ResetPulse:config.
 * @description Le champ `version` du blob (TimerConfigContext.jsx) était
 *              écrit depuis la naissance de la clé consolidée (ADR-009,
 *              déc. 2025) mais JAMAIS LU — figé à 2, tous les blobs en
 *              circulation indistinguables (audit fiabilité 06/08). Ce
 *              module pose le contrat de migration SANS migrer quoi que ce
 *              soit encore : la table est vide, l'effet net aujourd'hui se
 *              limite à tamponner `version: CONFIG_SCHEMA_VERSION` sur tout
 *              blob qui n'est pas déjà à jour.
 *
 *              Les gardes-fossiles every-boot de TimerConfigContext.jsx
 *              (garde `none`/`complet`, palette morte, détecteur
 *              showActivityEmoji/shouldPulse) restent INTOUCHÉES — leur
 *              consolidation en migrations run-once dans CONFIG_MIGRATIONS
 *              est explicitement reportée au retour du pilote humain.
 *
 * @created 2026-08-06
 */

import logger from '../utils/logger';

// Version courante du schéma du blob @ResetPulse:config.
export const CONFIG_SCHEMA_VERSION = 3;

/**
 * Table des migrations, indexée par version DE DÉPART.
 *
 * Contrat : `CONFIG_MIGRATIONS[n]` transforme un blob de version `n` en
 * blob de version `n + 1`. Chaque migration doit être :
 * - PURE : aucune I/O (pas d'AsyncStorage, pas de réseau), entrée → sortie.
 * - TOTALE sur son domaine : reçoit le blob BRUT (avant deepMergeDefaults),
 *   ne doit pas supposer que les champs par défaut sont déjà présents.
 * - Ne doit PAS poser `version` elle-même — `migrateConfigSchema` la pose
 *   une seule fois, à la fin de la chaîne.
 *
 * Vide pour l'instant : aucun cran de version n'a encore de transformation
 * dédiée (les corrections de blobs stale actuelles vivent dans les
 * gardes-fossiles every-boot de TimerConfigContext.jsx, pas ici).
 */
export const CONFIG_MIGRATIONS = {};

/**
 * Migre un blob parsé vers CONFIG_SCHEMA_VERSION, fonction pure.
 *
 * - `parsed` null/undefined → retourné tel quel (rien à migrer, pas de blob).
 * - `parsed.version` absent → traité comme 2 (l'ère indistinguable, avant
 *   que ce socle n'existe : tout blob sans version connue est réputé v2).
 * - `parsed.version >= CONFIG_SCHEMA_VERSION` → retourné tel quel (déjà à
 *   jour, ou plus récent — ex. rollback vers un build plus ancien : on ne
 *   régresse jamais un blob).
 * - Sinon : applique séquentiellement les migrations de `migrations`
 *   (par défaut CONFIG_MIGRATIONS) depuis la version de départ jusqu'à
 *   CONFIG_SCHEMA_VERSION. Si un cran intermédiaire n'a pas de migration
 *   enregistrée, il est sauté sans crash (log DEV, pas d'exception) — le
 *   blob avance quand même jusqu'au cran suivant.
 * - Retourne toujours `{ ...blobMigré, version: CONFIG_SCHEMA_VERSION }`.
 *
 * @param {*} parsed - Blob brut parsé (JSON.parse d'AsyncStorage), avant
 *   deepMergeDefaults.
 * @param {Object} [migrations] - Table de migrations à utiliser (paramètre
 *   optionnel, testabilité — défaut CONFIG_MIGRATIONS).
 * @returns {*} Blob migré, tamponné à CONFIG_SCHEMA_VERSION (ou `parsed`
 *   inchangé si rien à faire).
 */
export function migrateConfigSchema(parsed, migrations = CONFIG_MIGRATIONS) {
  if (parsed === null || parsed === undefined) {
    return parsed;
  }

  const startVersion = parsed.version ?? 2;

  if (startVersion >= CONFIG_SCHEMA_VERSION) {
    return parsed;
  }

  let blob = parsed;
  for (let v = startVersion; v < CONFIG_SCHEMA_VERSION; v += 1) {
    const migrate = migrations[v];
    if (typeof migrate === 'function') {
      blob = migrate(blob);
    } else {
      logger.log(`config-schema: pas de migration pour v${v} → v${v + 1}, cran sauté`);
    }
  }

  return { ...blob, version: CONFIG_SCHEMA_VERSION };
}
