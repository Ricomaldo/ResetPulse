/**
 * @fileoverview RitualsPanel — sous-écran « Mes rituels » (bloc 3, SCR-10/16)
 * @description Monté dans AsideZone à la place des blocs 2-4 quand ouvert.
 * Liste → tap applique tout (activité/couleur/durée/son) et referme le sheet
 * (« un tap = tout est prêt ») ; édition discrète par rituel ; création via
 * le même formulaire, vide (ADR-015).
 */
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { useRituals } from '../../hooks/useRituals';
import { useTranslation } from '../../hooks/useTranslation';
import { buildRitualApplyPayload, resolveRitualActivity } from '../../config/rituals';
import { formatDuration } from '../../config/durations';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import RitualForm from './RitualForm';

export default function RitualsPanel({ onBack, onApplied }) {
  const theme = useTheme();
  const t = useTranslation();
  const { rituals, createRitual, updateRitual, deleteRitual, getRitualById } = useRituals();
  const { customActivities } = useCustomActivities();
  const { setCurrentActivity, setCurrentDuration, setSelectedSoundId, setColorIndex } = useTimerConfig();

  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingId, setEditingId] = useState(null);

  const handleApply = (ritual) => {
    const payload = buildRitualApplyPayload(ritual, customActivities);
    haptics.impact('light').catch(() => {});
    setCurrentActivity(payload.activity);
    setCurrentDuration(payload.duration);
    setSelectedSoundId(payload.soundId);
    setColorIndex(payload.colorIndex);
    onApplied();
  };

  const handleCreatePress = () => {
    haptics.selection().catch(() => {});
    setEditingId(null);
    setView('form');
  };

  const handleEditPress = (id) => {
    haptics.selection().catch(() => {});
    setEditingId(id);
    setView('form');
  };

  const handleFormSave = (fields) => {
    if (editingId) {
      updateRitual(editingId, fields);
    } else {
      createRitual(fields);
    }
    setEditingId(null);
    setView('list');
  };

  const handleFormDelete = (id) => {
    deleteRitual(id);
    setEditingId(null);
    setView('list');
  };

  const styles = StyleSheet.create({
    backButton: {
      minHeight: 44,
      minWidth: 44,
      paddingRight: theme.spacing.sm,
    },
    backChevron: {
      color: theme.colors.text,
      fontSize: rs(20, 'min'),
    },
    createRow: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: rs(12),
    },
    createText: {
      color: theme.colors.brand.primary,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.semibold,
    },
    durationBadge: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      marginRight: theme.spacing.sm,
    },
    editAffordance: {
      color: theme.colors.textSecondary,
      fontSize: rs(16, 'min'),
      minHeight: 44,
      minWidth: 44,
      paddingLeft: theme.spacing.sm,
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    emoji: {
      fontSize: rs(20, 'min'),
      marginRight: theme.spacing.sm,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      paddingVertical: rs(12),
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    ritualName: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(14, 'min'),
    },
    ritualRow: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      paddingVertical: rs(10),
    },
    ritualTouchable: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
    },
    title: {
      color: theme.colors.text,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
    },
  });

  if (view === 'form') {
    const initialRitual = editingId ? getRitualById(editingId) : null;
    return (
      <RitualForm
        initialRitual={initialRitual}
        onSave={handleFormSave}
        onCancel={() => { setEditingId(null); setView('list'); }}
        onDelete={handleFormDelete}
      />
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('rituals.list.title')}</Text>
      </View>

      {rituals.length === 0 && (
        <Text style={styles.emptyText}>{t('rituals.list.empty')}</Text>
      )}

      {rituals.map((ritual) => {
        const activity = resolveRitualActivity(ritual, customActivities);
        return (
          <View key={ritual.id} style={styles.ritualRow}>
            <TouchableOpacity
              style={styles.ritualTouchable}
              onPress={() => handleApply(ritual)}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('accessibility.applyRitual', { name: ritual.name })}
            >
              <Text style={styles.emoji}>{activity?.emoji}</Text>
              <Text style={styles.ritualName}>{ritual.name}</Text>
              <Text style={styles.durationBadge}>{formatDuration(ritual.duration)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleEditPress(ritual.id)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('accessibility.editRitual', { name: ritual.name })}
            >
              <Text style={styles.editAffordance}>›</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.createRow}
        onPress={handleCreatePress}
        accessible
        accessibilityRole="button"
        accessibilityLabel={t('accessibility.createRitual')}
      >
        <Text style={styles.createText}>{t('rituals.list.createRow')}</Text>
      </TouchableOpacity>
    </View>
  );
}
