// Tests d'équivalence — CONFIG_MIGRATIONS[2] (lot gardes-v3, 07/08).
//
// Contexte : 4 gardes-fossiles every-boot vivaient dans
// TimerConfigContext.jsx (useEffect post-chargement, lisant `values` APRÈS
// deepMergeDefaults) — garde activité « none », garde mode « complet »,
// garde palette morte, détecteur showActivityEmoji/shouldPulse. Retour
// pilote Eric (07/08) : consolidées en UNE migration run-once,
// CONFIG_MIGRATIONS[2] (src/config/config-schema.js), qui voit le blob BRUT
// (avant deepMergeDefaults, des champs peuvent manquer).
//
// Chaque test ci-dessous reproduit le pipeline réel de usePersistedObject :
// migrateConfigSchema(blobBrut) PUIS deepMergeDefaults(defauts, migré) — et
// vérifie que le résultat est EXACTEMENT ce que produisait la garde
// d'origine (reprend les assertions des tests de garde qui existaient :
// __tests__/contexts/TimerConfigContext.test.js pour shouldPulse).
import { CONFIG_SCHEMA_VERSION, CONFIG_MIGRATIONS, migrateConfigSchema } from '../../src/config/config-schema';
import { deepMergeDefaults } from '../../src/hooks/usePersistedState';
import { getDefaultActivity, getActivityById } from '../../src/config/activities';
import { TIMER_PALETTES } from '../../src/config/timer-palettes';

// Défauts de forme comparable à getDefaultValues() (branche PROD,
// TimerConfigContext.jsx) — suffisants pour exercer deepMergeDefaults sur
// les namespaces touchés par les 4 gardes, sans dupliquer tout le blob.
function makeDefaults() {
  return {
    version: CONFIG_SCHEMA_VERSION,
    timer: {
      currentActivity: getDefaultActivity(),
      currentDuration: 1500,
      selectedSoundId: 'timer_complete',
      clockwise: false,
    },
    display: {
      shouldPulse: true,
      lockedScale: null,
      showDigitalTimer: false,
      showTime: true,
    },
    mode: {
      current: 'mixte',
    },
    palette: {
      currentPalette: 'serenity',
      currentColor: TIMER_PALETTES.serenity.colors[0],
    },
  };
}

describe('CONFIG_MIGRATIONS[2] — garde « none » (activité fantôme)', () => {
  it('blob v2 avec currentActivity.id="none" → basculé vers getDefaultActivity(), même effet que la garde retirée', () => {
    const blob = {
      version: 2,
      timer: {
        currentActivity: { id: 'none', label: 'None', emoji: '' },
        currentDuration: 900,
        selectedSoundId: 'timer_complete',
        clockwise: true,
      },
    };

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema(blob));

    expect(merged.timer.currentActivity).toEqual(getDefaultActivity());
    // Le reste du namespace timer n'est pas touché par cette garde.
    expect(merged.timer.currentDuration).toBe(900);
    expect(merged.timer.clockwise).toBe(true);
  });

  it('blob v2 avec une activité valide (pas "none") → intact', () => {
    // Objet complet (comme un vrai blob persisté le porte, cf.
    // setCurrentActivity) — un objet PARTIEL ferait apparaître l'artefact du
    // merge récursif de deepMergeDefaults (champs manquants comblés par
    // ceux de l'activité par défaut, un objet DIFFÉRENT) : pas le sujet ici.
    const workActivity = getActivityById('work');
    const blob = {
      version: 2,
      timer: { currentActivity: workActivity, clockwise: false },
    };

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema(blob));

    expect(merged.timer.currentActivity).toEqual(workActivity);
  });
});

describe('CONFIG_MIGRATIONS[2] — garde « complet » (mode mort)', () => {
  it('blob v2 avec mode.current="complet" → basculé vers "mixte", même effet que la garde retirée', () => {
    const blob = { version: 2, mode: { current: 'complet' } };

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema(blob));

    expect(merged.mode).toEqual({ current: 'mixte' });
  });

  it('blob v2 avec mode.current="focus" (valide) → intact', () => {
    const blob = { version: 2, mode: { current: 'focus' } };

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema(blob));

    expect(merged.mode).toEqual({ current: 'focus' });
  });
});

describe('CONFIG_MIGRATIONS[2] — garde palette morte', () => {
  it('blob v2 avec une palette supprimée de TIMER_PALETTES (darkLaser) → retombe sur serenity, même effet que la garde retirée', () => {
    const blob = {
      version: 2,
      palette: { currentPalette: 'darkLaser', currentColor: '#111111' },
    };

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema(blob));

    expect(merged.palette).toEqual({
      currentPalette: 'serenity',
      currentColor: TIMER_PALETTES.serenity.colors[0],
    });
  });

  it('blob v2 avec une palette encore vivante (zen) → intact', () => {
    const blob = {
      version: 2,
      palette: { currentPalette: 'zen', currentColor: TIMER_PALETTES.zen.colors[2] },
    };

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema(blob));

    expect(merged.palette).toEqual({
      currentPalette: 'zen',
      currentColor: TIMER_PALETTES.zen.colors[2],
    });
  });

  it('blob v2 sans currentPalette du tout (champ manquant) → migration ne touche rien, deepMergeDefaults comble avec serenity', () => {
    const blob = {
      version: 2,
      palette: { currentColor: '#custom-hex' },
    };

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema(blob));

    // currentPalette absent du stored → comblé par le défaut (serenity),
    // currentColor stocké gagne (scalaire, stored l'emporte en bloc) — la
    // migration n'a pas dû écraser ce hex custom en l'absence d'anomalie
    // détectable (pas de currentPalette invalide à corriger).
    expect(merged.palette).toEqual({
      currentPalette: 'serenity',
      currentColor: '#custom-hex',
    });
  });
});

describe('CONFIG_MIGRATIONS[2] — détecteur showActivityEmoji/shouldPulse', () => {
  it('blob v2 fossile (showActivityEmoji présent, shouldPulse:false) → shouldPulse forcé à true, showActivityEmoji purgé', () => {
    const blob = {
      version: 2,
      display: {
        shouldPulse: false,
        showDigitalTimer: false,
        showActivityEmoji: true,
        showTime: true,
      },
    };

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema(blob));

    expect(merged.display).toEqual({
      shouldPulse: true,
      lockedScale: null,
      showDigitalTimer: false,
      showTime: true,
    });
    expect(merged.display.showActivityEmoji).toBeUndefined();
  });

  it('préférence utilisateur explicite (shouldPulse:false, pas de fossile showActivityEmoji) : jamais altérée', () => {
    const blob = {
      version: 2,
      display: { shouldPulse: false, showDigitalTimer: false, showTime: true },
    };

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema(blob));

    expect(merged.display.shouldPulse).toBe(false);
    expect(merged.display.showActivityEmoji).toBeUndefined();
  });
});

describe('CONFIG_MIGRATIONS[2] — cas croisé : plusieurs fossiles dans le même blob', () => {
  it('mode complet + palette morte + shouldPulse fossile en un seul blob → tout corrigé en une passe', () => {
    const blob = {
      version: 2,
      timer: { currentActivity: { id: 'none', label: 'None', emoji: '' }, clockwise: false },
      mode: { current: 'complet' },
      palette: { currentPalette: 'autumn', currentColor: '#B08540' },
      display: {
        shouldPulse: false,
        showDigitalTimer: false,
        showActivityEmoji: true,
        showTime: true,
      },
    };

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema(blob));

    expect(merged.timer.currentActivity).toEqual(getDefaultActivity());
    expect(merged.mode).toEqual({ current: 'mixte' });
    expect(merged.palette).toEqual({
      currentPalette: 'serenity',
      currentColor: TIMER_PALETTES.serenity.colors[0],
    });
    expect(merged.display).toEqual({
      shouldPulse: true,
      lockedScale: null,
      showDigitalTimer: false,
      showTime: true,
    });
    expect(merged.display.showActivityEmoji).toBeUndefined();
  });
});

describe('CONFIG_MIGRATIONS[2] — blob v2 sain (aucun fossile)', () => {
  it('seule la version change, tout le reste identique champ à champ', () => {
    const blob = {
      version: 2,
      // Objet complet (cf. commentaire du test « activité valide » plus
      // haut) — un objet partiel ferait apparaître l'artefact du merge
      // récursif de deepMergeDefaults, pas le sujet de ce test.
      timer: {
        currentActivity: getActivityById('break'),
        currentDuration: 300,
        selectedSoundId: 'chime',
        clockwise: true,
      },
      mode: { current: 'focus' },
      palette: { currentPalette: 'ocean', currentColor: TIMER_PALETTES.ocean.colors[1] },
      display: { shouldPulse: false, showDigitalTimer: true, showTime: false },
    };

    const migrated = migrateConfigSchema(blob);
    const merged = deepMergeDefaults(makeDefaults(), migrated);

    expect(merged.timer).toEqual(blob.timer);
    expect(merged.mode).toEqual(blob.mode);
    expect(merged.palette).toEqual(blob.palette);
    expect(merged.display).toEqual({ ...blob.display, lockedScale: null });
    expect(merged.version).toBe(CONFIG_SCHEMA_VERSION);
  });
});

describe('CONFIG_MIGRATIONS[2] — blob déjà v3', () => {
  it('la migration ne tourne jamais sur un blob v3, même s\'il porte un fossile (changement de sémantique voulu : run-once, pas every-boot)', () => {
    // Piège dev connu (06-07/08) : un blob déjà tamponné v3 SANS être passé
    // par CONFIG_MIGRATIONS[2] (simulateurs d'hier, avant ce lot) peut
    // encore porter un fossile — migrateConfigSchema ne le corrigera plus
    // JAMAIS, par construction (startVersion >= CONFIG_SCHEMA_VERSION
    // court-circuite). C'est le changement de sémantique voulu par le lot :
    // run-once, pas every-boot. Aucun blob v3 n'existe en production à ce
    // jour (3.0 pas sortie) — ce cas ne concerne que le dev (DevFab reset
    // disponible).
    const staleV3Blob = {
      version: 3,
      mode: { current: 'complet' },
      palette: { currentPalette: 'darkLaser', currentColor: '#111111' },
      display: { shouldPulse: false, showActivityEmoji: true, showDigitalTimer: false, showTime: true },
    };

    const migrated = migrateConfigSchema(staleV3Blob);

    expect(migrated).toBe(staleV3Blob); // identité de référence : rien n'a tourné
    expect(migrated.mode.current).toBe('complet'); // fossile NON corrigé, assumé
  });
});

describe('CONFIG_MIGRATIONS[2] — champs manquants (blob v2 partiel)', () => {
  it('blob sans `display` ni `mode` du tout → pas de crash, pas d\'invention de champs, defaults comblent après merge', () => {
    const blob = { version: 2, timer: { clockwise: true } };

    expect(() => migrateConfigSchema(blob)).not.toThrow();

    const migrated = migrateConfigSchema(blob);
    expect(migrated.display).toBeUndefined();
    expect(migrated.mode).toBeUndefined();

    const merged = deepMergeDefaults(makeDefaults(), migrated);
    expect(merged.display).toEqual(makeDefaults().display);
    expect(merged.mode).toEqual(makeDefaults().mode);
  });

  it('blob complètement vide `{}` (sans version) → réputé v2, migré sans crash', () => {
    expect(() => migrateConfigSchema({})).not.toThrow();

    const merged = deepMergeDefaults(makeDefaults(), migrateConfigSchema({}));
    expect(merged.version).toBe(CONFIG_SCHEMA_VERSION);
    expect(merged.display).toEqual(makeDefaults().display);
  });
});

describe('CONFIG_MIGRATIONS — table exportée', () => {
  it('porte exactement une entrée, indexée sur la version de départ 2', () => {
    expect(Object.keys(CONFIG_MIGRATIONS)).toEqual(['2']);
    expect(typeof CONFIG_MIGRATIONS[2]).toBe('function');
  });
});
