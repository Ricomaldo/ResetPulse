// src/config/config-schema.js
/**
 * @fileoverview Socle de versionnage du blob persisté @ResetPulse:config.
 * @description Le champ `version` du blob (TimerConfigContext.jsx) était
 *              écrit depuis la naissance de la clé consolidée (ADR-009,
 *              déc. 2025) mais JAMAIS LU — figé à 2, tous les blobs en
 *              circulation indistinguables (audit fiabilité 06/08). Ce
 *              module pose le contrat de migration.
 *
 *              Lot gardes-v3 (07/08, retour pilote Eric) : les 4
 *              gardes-fossiles every-boot de TimerConfigContext.jsx (garde
 *              `none`, garde `complet`, palette morte, détecteur
 *              showActivityEmoji/shouldPulse) sont consolidées ici en UNE
 *              migration `CONFIG_MIGRATIONS[2]`, run-once — elles ne
 *              tournent plus à chaque boot. `resolvePaletteOnLaunch`
 *              (usePaletteGating.js) N'EST PAS concernée : c'est du gating
 *              d'accès premium (une palette premium retombe à la dernière
 *              incluse pour un user redevenu free), pas une correction de
 *              blob stale — elle reste every-boot, à raison.
 *
 * PIÈGE DEV CONNU : des blobs déjà tamponnés `version: 3` SANS être passés
 * par cette migration existent en dev depuis lot-socle-v3 (simulateurs
 * d'hier, 06/08) — `migrateConfigSchema` ne les migre plus jamais
 * (`startVersion >= CONFIG_SCHEMA_VERSION` court-circuite), donc leurs
 * fossiles (mode complet, palette morte, etc.) resteraient bloqués. DevFab
 * reset disponible pour repartir d'un blob propre. AUCUN blob v3 en
 * production à ce jour (3.0 pas encore sortie, les stores écrivent
 * encore v2) — ce piège n'existe qu'en dev.
 *
 * @created 2026-08-06
 * @updated 2026-08-07
 */

import logger from '../utils/logger';
import { getDefaultActivity } from './activities';
import { TIMER_PALETTES } from './timer-palettes';

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
 * `migrateV2ToV3` (2 → 3) : consolide les 4 gardes-fossiles every-boot qui
 * vivaient dans TimerConfigContext.jsx (lot gardes-v3, 07/08). Contrairement
 * aux gardes (qui lisaient `values` APRÈS deepMergeDefaults, tous les champs
 * garantis présents), cette fonction voit le blob BRUT — un champ absent
 * n'est PAS une anomalie à corriger, c'est un trou que deepMergeDefaults
 * comblera juste après avec le bon défaut. D'où l'optional chaining partout
 * et l'absence de correction quand un champ manque plutôt qu'être `undefined`.
 */
function migrateV2ToV3(blob) {
  let next = blob;

  // Garde « none » (C5, 095de0a) : « none » retiré de la barre d'activités
  // (asymétrie 3 activités | 4 couleurs, ADR-014) — toute activité 'none'
  // encore référencée bascule vers l'activité par défaut.
  if (next?.timer?.currentActivity?.id === 'none') {
    next = {
      ...next,
      timer: { ...next.timer, currentActivity: getDefaultActivity() },
    };
  }

  // Garde « complet » (C6.2, 60b1b97) : mode Complet mort (segmenté à 2
  // entrées) — tout mode persisté à 'complet' bascule vers 'mixte'. Réplique
  // fidèlement la garde d'origine, qui remplaçait `mode` en bloc par
  // `{ current: 'mixte' }` (pas de spread d'éventuelles autres clés — le
  // schéma n'en a jamais eu d'autre).
  if (next?.mode?.current === 'complet') {
    next = { ...next, mode: { current: 'mixte' } };
  }

  // Garde palette morte (verdicts CD 25/07) : darkLaser/autumn supprimées de
  // TIMER_PALETTES — toute palette persistée qui ne s'y trouve plus retombe
  // sur serenity. Ne se déclenche que si `currentPalette` est BIEN présent
  // et invalide — un blob sans `currentPalette` du tout n'est pas une
  // anomalie, deepMergeDefaults le comblera avec 'serenity' (le bon défaut)
  // sans qu'on ait besoin d'y toucher ici.
  const currentPalette = next?.palette?.currentPalette;
  if (currentPalette && !TIMER_PALETTES[currentPalette]) {
    next = {
      ...next,
      palette: {
        ...next.palette,
        currentPalette: 'serenity',
        currentColor: TIMER_PALETTES.serenity.colors[0],
      },
    };
  }

  // Détecteur showActivityEmoji/shouldPulse (QA visuelle #1 bug 1, 0f7c07e) :
  // un blob écrit avant ec76ff2 (halo ON par défaut, 31/07) porte encore
  // shouldPulse:false ET le champ mort showActivityEmoji (purgé du code par
  // 7c2984e, jamais réécrit depuis) — sa seule présence signe un blob
  // fossile, jamais un choix utilisateur délibéré. La garde d'origine
  // excluait déjà showActivityEmoji du `display` qu'elle réécrivait (via
  // déstructuration) : ici pareil, delta réel = le purge a lieu à la SOURCE
  // (blob brut, avant tout merge) plutôt que sur le `values` post-merge via
  // un effet React qui devait re-persister derrière — pas de différence sur
  // l'état final obtenu, seulement sur QUAND/OÙ la purge se produit.
  if (next?.display?.showActivityEmoji !== undefined) {
    const cleanDisplay = { ...next.display };
    delete cleanDisplay.showActivityEmoji;
    next = { ...next, display: { ...cleanDisplay, shouldPulse: true } };
  }

  return next;
}

export const CONFIG_MIGRATIONS = {
  2: migrateV2ToV3,
};

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
