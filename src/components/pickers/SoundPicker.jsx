/**
 * @fileoverview SoundPicker — picker neuf et sobre (C6, formulaire Rituel SCR-16)
 * @description Reconstruit à neuf (mission recentrage, note C3 : l'ancien
 * SoundPicker meurt avec SettingsPanel). Liste des sons existants
 * (config/sounds.js), tap = sélectionne + prévisualise. Pas d'animation de
 * progression — la sobriété est la spec.
 */
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TIMER_SOUNDS } from '../../config/sounds';
import { fontWeights } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import useSimpleAudio from '../../hooks/useSimpleAudio';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

export default function SoundPicker({ onSoundSelect, selectedSoundId }) {
  const theme = useTheme();
  const { playSound, isPlaying } = useSimpleAudio(selectedSoundId);

  const handlePress = useCallback((soundId) => {
    haptics.selection().catch(() => {});
    onSoundSelect(soundId);
    playSound(soundId).catch(() => {});
  }, [onSoundSelect, playSound]);

  const styles = StyleSheet.create({
    emoji: {
      fontSize: rs(18, 'min'),
      marginRight: theme.spacing.sm,
    },
    list: {
      maxHeight: rs(180, 'min'),
    },
    name: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(14, 'min'),
    },
    row: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      minHeight: 44,
      paddingVertical: rs(10),
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    selectedMark: {
      color: theme.colors.brand.primary,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
    },
  });

  return (
    <View>
      <ScrollView style={styles.list} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {TIMER_SOUNDS.map((sound, index) => {
          const isActive = selectedSoundId === sound.id;
          return (
            <TouchableOpacity
              key={sound.id}
              accessible
              accessibilityRole="button"
              accessibilityLabel={sound.name}
              accessibilityState={{ selected: isActive }}
              style={[styles.row, index === TIMER_SOUNDS.length - 1 && styles.rowLast]}
              onPress={() => handlePress(sound.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{sound.emoji}</Text>
              <Text style={styles.name}>{sound.name}</Text>
              {isActive && (
                <Text style={styles.selectedMark}>{isPlaying ? '♪' : '✓'}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

SoundPicker.displayName = 'SoundPicker';
SoundPicker.propTypes = {
  onSoundSelect: PropTypes.func.isRequired,
  selectedSoundId: PropTypes.string.isRequired,
};
