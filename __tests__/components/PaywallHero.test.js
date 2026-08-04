// __tests__/components/PaywallHero.test.js
// Lambda U — la résolution du héros (accroche/sous-titre/nom) est PURE et
// exportée séparément du composant (l'infra de test du projet n'a pas de
// fireEvent/testing-library, cf. commentaire RitualForm.jsx) : ces fonctions
// sont testables sans montage.
import { resolveHeroCopyKeys, resolveHeroName } from '../../src/components/modals/PaywallHero';
import { TIMER_PALETTES } from '../../src/config/timer-palettes';
import { TIMER_SOUNDS } from '../../src/config/sounds';

describe('PaywallHero — resolveHeroCopyKeys', () => {
  test('emoji hero → clés porte activités vitrine (2a)', () => {
    expect(resolveHeroCopyKeys({ type: 'emoji', emoji: '🎮' })).toEqual({
      headlineKey: 'ambiances.hook.emoji',
      subtitleKey: 'ambiances.hookSub.emoji',
    });
  });

  test('plus hero → accroche custom, sous-titre dédié (passe copies CD)', () => {
    expect(resolveHeroCopyKeys({ type: 'plus' })).toEqual({
      headlineKey: 'ambiances.hook.custom',
      subtitleKey: 'ambiances.hookSub.custom',
    });
  });

  test('ritualSlots hero → clés porte cap rituels (2b)', () => {
    expect(resolveHeroCopyKeys({ type: 'ritualSlots', emojis: ['💻', '☕', '🧘'] })).toEqual({
      headlineKey: 'ambiances.hook.rituals',
      subtitleKey: 'ambiances.hookSub.rituals',
    });
  });

  test('palette hero → clés porte essai libre (2c)', () => {
    expect(resolveHeroCopyKeys({ type: 'palette', paletteKey: 'zen' })).toEqual({
      headlineKey: 'ambiances.hook.palette',
      subtitleKey: 'ambiances.hookSub.palette',
    });
  });

  test('sound hero → clés DÉDIÉES son (passe copies CD : « les 7 autres »)', () => {
    expect(resolveHeroCopyKeys({ type: 'sound', soundId: 'chime' })).toEqual({
      headlineKey: 'ambiances.hook.sound',
      subtitleKey: 'ambiances.hookSub.sound',
    });
  });

  test('null/undefined hero → null (guichet, pieds de section 1b sans hero)', () => {
    expect(resolveHeroCopyKeys(null)).toBeNull();
    expect(resolveHeroCopyKeys(undefined)).toBeNull();
  });

  test('type inconnu → null (repli sûr, jamais de crash sur une porte future)', () => {
    expect(resolveHeroCopyKeys({ type: 'unknown-future-door' })).toBeNull();
  });
});

describe('PaywallHero — resolveHeroName', () => {
  test('palette hero → le nom localisé de la palette (get name(), timer-palettes.js)', () => {
    const key = Object.keys(TIMER_PALETTES)[1]; // une palette Ambiances existante
    expect(resolveHeroName({ type: 'palette', paletteKey: key })).toBe(TIMER_PALETTES[key].name);
  });

  test('sound hero → le nom localisé du son', () => {
    const sound = TIMER_SOUNDS[0];
    expect(resolveHeroName({ type: 'sound', soundId: sound.id })).toBe(sound.name);
  });

  test('paletteKey inconnu → null (pas de repli dans TIMER_PALETTES, %{name} retombe sur une chaîne vide côté appelant)', () => {
    expect(resolveHeroName({ type: 'palette', paletteKey: 'does-not-exist' })).toBeNull();
  });

  test('soundId inconnu → le nom du son PAR DÉFAUT (getSoundById replie déjà, jamais de crash)', () => {
    expect(resolveHeroName({ type: 'sound', soundId: 'does-not-exist' })).toBe(
      require('../../src/config/sounds').getSoundById('does-not-exist').name
    );
  });

  test('emoji/plus/ritualSlots hero → null (pas de %{name} dans leur sous-titre)', () => {
    expect(resolveHeroName({ type: 'emoji', emoji: '🎮' })).toBeNull();
    expect(resolveHeroName({ type: 'plus' })).toBeNull();
    expect(resolveHeroName({ type: 'ritualSlots', emojis: [] })).toBeNull();
  });

  test('hero null → null', () => {
    expect(resolveHeroName(null)).toBeNull();
  });
});
