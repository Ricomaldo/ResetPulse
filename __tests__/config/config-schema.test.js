// Tests for migrateConfigSchema (socle de versionnage lot-socle-v3).
//
// Contexte : le champ `version` du blob @ResetPulse:config était écrit
// mais jamais lu (audit fiabilité 06/08) — tous les blobs en circulation
// indistinguables. Ce socle pose le contrat de migration SANS migrer quoi
// que ce soit encore (CONFIG_MIGRATIONS vide) : l'effet net aujourd'hui est
// de tamponner `version: CONFIG_SCHEMA_VERSION` sur tout blob qui n'est pas
// déjà à jour.
//
// Fonction pure, testée directement sans AsyncStorage ni React.
import { CONFIG_SCHEMA_VERSION, migrateConfigSchema } from '../../src/config/config-schema';
import { deepMergeDefaults } from '../../src/hooks/usePersistedState';

describe('migrateConfigSchema', () => {
  it('CONFIG_SCHEMA_VERSION vaut 3 (socle lot-socle-v3)', () => {
    expect(CONFIG_SCHEMA_VERSION).toBe(3);
  });

  it('null → null (aucun blob à migrer)', () => {
    expect(migrateConfigSchema(null)).toBeNull();
  });

  it('undefined → undefined', () => {
    expect(migrateConfigSchema(undefined)).toBeUndefined();
  });

  it('blob déjà à CONFIG_SCHEMA_VERSION → retourné inchangé (même référence)', () => {
    const blob = { version: CONFIG_SCHEMA_VERSION, timer: { clockwise: true } };

    const result = migrateConfigSchema(blob);

    expect(result).toBe(blob); // identité de référence : rien n'a été touché
  });

  it('blob v2 → tamponné à CONFIG_SCHEMA_VERSION, tout le reste identique champ à champ', () => {
    const blob = {
      version: 2,
      timer: { currentActivity: { id: 'work' }, clockwise: false },
      display: { shouldPulse: false, showTime: true },
      palette: { currentPalette: 'serenity', currentColor: '#8FA98F' },
    };

    const result = migrateConfigSchema(blob);

    expect(result).toEqual({ ...blob, version: CONFIG_SCHEMA_VERSION });
    expect(result.timer).toEqual(blob.timer);
    expect(result.display).toEqual(blob.display);
    expect(result.palette).toEqual(blob.palette);
  });

  it('blob sans champ version (fossile antérieur à ce socle) → tamponné à CONFIG_SCHEMA_VERSION', () => {
    const blob = { timer: { clockwise: true } };

    const result = migrateConfigSchema(blob);

    expect(result.version).toBe(CONFIG_SCHEMA_VERSION);
    expect(result.timer).toEqual(blob.timer);
  });

  it('blob v4 (futur, ex. rollback vers un build plus ancien) → intact, jamais régressé', () => {
    const blob = { version: 4, timer: { clockwise: true } };

    const result = migrateConfigSchema(blob);

    expect(result).toBe(blob);
  });

  it('table de migrations injectée : appliquée dans l\'ordre depuis la version de départ', () => {
    const order = [];
    const migrations = {
      2: (blob) => {
        order.push('2->3');
        return { ...blob, migratedFrom2: true };
      },
    };
    const blob = { version: 2, timer: { clockwise: true } };

    const result = migrateConfigSchema(blob, migrations);

    expect(order).toEqual(['2->3']);
    expect(result).toEqual({
      version: CONFIG_SCHEMA_VERSION,
      timer: { clockwise: true },
      migratedFrom2: true,
    });
  });

  it('cran intermédiaire sans migration enregistrée : sauté sans crash, version quand même tamponnée', () => {
    // Table vide (comportement réel de CONFIG_MIGRATIONS aujourd'hui) : aucun
    // cran n'a de transformation, mais le blob doit quand même ressortir à
    // CONFIG_SCHEMA_VERSION sans lever d'exception.
    const blob = { version: 2, timer: { clockwise: true } };

    expect(() => migrateConfigSchema(blob, {})).not.toThrow();
    expect(migrateConfigSchema(blob, {})).toEqual({
      version: CONFIG_SCHEMA_VERSION,
      timer: { clockwise: true },
    });
  });
});

describe('migrateConfigSchema + deepMergeDefaults — équivalence comportementale (lot gardes-v3)', () => {
  // Reproduit le pipeline réel de usePersistedObject : migrate() sur le blob
  // brut, PUIS deepMergeDefaults. Depuis lot gardes-v3 (07/08),
  // CONFIG_MIGRATIONS[2] n'est PLUS une table vide : le fossile
  // `showActivityEmoji` et `shouldPulse:false` qu'il signe sont corrigés ICI,
  // à la migration — la garde-fossile every-boot correspondante a été
  // retirée de TimerConfigContext.jsx (cf. équivalence détaillée par garde
  // dans __tests__/config/config-migrations.test.js). Ce test documente
  // l'inversion : ce qui était un no-op au socle v3 initial (06/08) est
  // maintenant la correction elle-même.
  it('blob stale réaliste (shouldPulse:false + fossile showActivityEmoji) : corrigé par la migration, plus par une garde', () => {
    const staleBlob = {
      version: 2,
      timer: { clockwise: false },
      display: {
        shouldPulse: false,
        showDigitalTimer: false,
        showActivityEmoji: true,
        showTime: true,
      },
    };
    const defaults = {
      version: CONFIG_SCHEMA_VERSION,
      timer: { clockwise: false },
      display: { shouldPulse: true, showDigitalTimer: false, showTime: true },
    };

    const migrated = migrateConfigSchema(staleBlob);
    const merged = deepMergeDefaults(defaults, migrated);

    expect(merged.display).toEqual({
      shouldPulse: true,
      showDigitalTimer: false,
      showTime: true,
    });
    expect(merged.display.showActivityEmoji).toBeUndefined();
    expect(merged.version).toBe(CONFIG_SCHEMA_VERSION);
  });

  it('préférence utilisateur explicite (pas de fossile, shouldPulse:false) : jamais altérée par la migration', () => {
    const blob = {
      version: 2,
      display: { shouldPulse: false, showDigitalTimer: false, showTime: true },
    };
    const defaults = {
      version: CONFIG_SCHEMA_VERSION,
      display: { shouldPulse: true, showDigitalTimer: false, showTime: true },
    };

    const merged = deepMergeDefaults(defaults, migrateConfigSchema(blob));

    expect(merged.display.shouldPulse).toBe(false);
    expect(merged.display.showActivityEmoji).toBeUndefined();
  });
});
