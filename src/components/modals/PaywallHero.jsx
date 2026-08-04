/**
 * @fileoverview PaywallHero — zone héros de PremiumModalContent (Lambda U)
 * @description Maquettes CD 2a/2b/2c (verdict CC×CD, brief
 * `_cockpit/briefs/2026-08-04_brief-cd-frontiere-paywall.md` §B) : la
 * modale Ambiances garde tout son squelette (features/prix/CTA/restore) —
 * elle GAGNE une zone visuelle au-dessus du titre, propre à la porte
 * d'entrée qui l'a ouverte. 4 variantes :
 *   - `emoji`      : l'emoji EXACT touché (activités vitrine, RitualForm)
 *   - `plus`        : cercle pointillé « + » (création d'emoji custom fermée)
 *   - `ritualSlots` : 3 emojis des rituels de base + le 4ᵉ slot pointillé
 *                     (cap rituels perso, RitualsPanel)
 *   - `palette`     : les 4 swatches de la palette Ambiances empruntée
 *   - `sound`       : pictogramme note sobre (son Ambiances emprunté)
 * Portes SANS `hero` transmis (guichet AsideZone, pieds de section
 * Palettes/Sons du lambda T) → PremiumModalContent ne monte pas ce
 * composant, modale générique inchangée (décision CD).
 * `resolveHeroCopyKeys`/`resolveHeroName` sont volontairement PURES et
 * exportées séparément — l'infra de test du projet n'a pas de
 * fireEvent/testing-library (cf. commentaire RitualForm), elles restent
 * testables sans montage.
 * @created 2026-08-04
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { TIMER_PALETTES } from '../../config/timer-palettes';
import { getSoundById } from '../../config/sounds';
import { rs } from '../../styles/responsive';

const HERO_SIZE = rs(76, 'min');
const SLOT_SIZE = rs(44, 'min');

/**
 * Résout le nom localisé porté par un héros — sert à interpoler %{name}
 * dans `ambiances.hookSub.palette` (portes palette ET son, même sous-titre
 * générique, mandat bullet 4). Pure.
 * @param {Object|null} hero
 * @returns {string|null}
 */
export const resolveHeroName = (hero) => {
  if (!hero) {return null;}
  if (hero.type === 'palette') {
    return TIMER_PALETTES[hero.paletteKey]?.name ?? null;
  }
  if (hero.type === 'sound') {
    return getSoundById(hero.soundId)?.name ?? null;
  }
  return null;
};

/**
 * Résout les clés i18n accroche/sous-titre pour un héros donné. Pure —
 * pas de dépendance à `t()`, l'appelant (PremiumModalContent) interpole.
 * @param {Object|null} hero
 * @returns {{headlineKey: string, subtitleKey: string}|null}
 */
export const resolveHeroCopyKeys = (hero) => {
  switch (hero?.type) {
    case 'emoji':
      return { headlineKey: 'ambiances.hook.emoji', subtitleKey: 'ambiances.hookSub.emoji' };
    case 'plus':
      // Sous-titre générique réutilisé de la porte emoji (mandat §2 « même
      // modèle ») — pas de clé dédiée.
      return { headlineKey: 'ambiances.hook.custom', subtitleKey: 'ambiances.hookSub.emoji' };
    case 'ritualSlots':
      return { headlineKey: 'ambiances.hook.rituals', subtitleKey: 'ambiances.hookSub.rituals' };
    case 'palette':
    case 'sound':
      return { headlineKey: 'ambiances.hook.palette', subtitleKey: 'ambiances.hookSub.palette' };
    default:
      return null;
  }
};

function FilledCircle({ size, backgroundColor, borderColor, children, theme }) {
  return (
    <View
      style={[
        styles.circleBase,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor,
        },
        theme.shadow('sm'),
      ]}
    >
      {children}
    </View>
  );
}

FilledCircle.propTypes = {
  size: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
  children: PropTypes.node,
  theme: PropTypes.object.isRequired,
};

function DashedPlusCircle({ size, theme }) {
  return (
    <View
      style={[
        styles.circleBase,
        styles.dashedCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: theme.colors.brand.primary,
        },
      ]}
    >
      <Text style={[styles.plusGlyph, { color: theme.colors.brand.primary, fontSize: size * 0.4 }]}>+</Text>
    </View>
  );
}

DashedPlusCircle.propTypes = {
  size: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
};

export default function PaywallHero({ hero }) {
  const theme = useTheme();

  if (!hero) {
    return null;
  }

  if (hero.type === 'emoji') {
    return (
      <View style={styles.container}>
        <FilledCircle
          size={HERO_SIZE}
          backgroundColor={theme.colors.fixed.white}
          borderColor={theme.colors.background}
          theme={theme}
        >
          <Text style={{ fontSize: HERO_SIZE * 0.5 }}>{hero.emoji}</Text>
        </FilledCircle>
      </View>
    );
  }

  if (hero.type === 'plus') {
    return (
      <View style={styles.container}>
        <DashedPlusCircle size={HERO_SIZE} theme={theme} />
      </View>
    );
  }

  if (hero.type === 'ritualSlots') {
    return (
      <View style={[styles.container, styles.row]}>
        {(hero.emojis || []).map((emoji, index) => (
          <FilledCircle
            key={`${emoji}-${index}`}
            size={SLOT_SIZE}
            backgroundColor={theme.colors.fixed.white}
            borderColor={theme.colors.background}
            theme={theme}
          >
            <Text style={{ fontSize: SLOT_SIZE * 0.5 }}>{emoji}</Text>
          </FilledCircle>
        ))}
        <DashedPlusCircle size={SLOT_SIZE} theme={theme} />
      </View>
    );
  }

  if (hero.type === 'palette') {
    const colors = TIMER_PALETTES[hero.paletteKey]?.colors || [];
    return (
      <View style={[styles.container, styles.row]}>
        {colors.map((color, index) => (
          <FilledCircle
            key={`${color}-${index}`}
            size={SLOT_SIZE}
            backgroundColor={color}
            borderColor={color}
            theme={theme}
          />
        ))}
      </View>
    );
  }

  if (hero.type === 'sound') {
    return (
      <View style={styles.container}>
        <FilledCircle
          size={HERO_SIZE}
          backgroundColor={theme.colors.fixed.white}
          borderColor={theme.colors.background}
          theme={theme}
        >
          <Text style={{ color: theme.colors.textSecondary, fontSize: HERO_SIZE * 0.4 }}>♪</Text>
        </FilledCircle>
      </View>
    );
  }

  return null;
}

PaywallHero.propTypes = {
  hero: PropTypes.shape({
    type: PropTypes.oneOf(['emoji', 'plus', 'ritualSlots', 'palette', 'sound']).isRequired,
    emoji: PropTypes.string,
    emojis: PropTypes.arrayOf(PropTypes.string),
    paletteKey: PropTypes.string,
    soundId: PropTypes.string,
  }),
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: rs(12),
  },
  row: {
    flexDirection: 'row',
    gap: rs(10),
    justifyContent: 'center',
  },
  circleBase: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dashedCircle: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  plusGlyph: {
    fontWeight: '600',
  },
});
