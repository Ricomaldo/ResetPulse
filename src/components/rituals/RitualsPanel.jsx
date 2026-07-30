/**
 * @fileoverview RitualsPanel — sous-écran « Mes rituels » (bloc 3, SCR-10/16)
 * @description Monté dans AsideZone à la place des blocs 2-4 quand ouvert.
 * Liste → tap applique tout (activité/couleur/durée/son) et referme le sheet
 * (« un tap = tout est prêt ») ; édition discrète par rituel ; création via
 * le même formulaire, vide (ADR-015).
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
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

export default function RitualsPanel({ onBack, onApplied, onViewChange, maxHeight }) {
  const theme = useTheme();
  const t = useTranslation();
  const { rituals, createRitual, updateRitual, deleteRitual, getRitualById, restoreBaseRituals, hasMissingBaseRituals, favoriteRituals, toggleFavorite } = useRituals();
  const { customActivities } = useCustomActivities();
  const { setCurrentActivity, setCurrentDuration, setSelectedSoundId, setColorByValue } = useTimerConfig();

  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingId, setEditingId] = useState(null);

  // A3/D5 (hotfix-porte-1) : remonte liste/form à AsideZone — elle arbitre
  // scroll extérieur + pan de fermeture selon le sous-écran actif.
  useEffect(() => {
    onViewChange?.(view);
  }, [view, onViewChange]);

  const handleApply = (ritual) => {
    const payload = buildRitualApplyPayload(ritual, customActivities);
    haptics.impact('light').catch(() => {});
    setCurrentActivity(payload.activity);
    setCurrentDuration(payload.duration);
    setSelectedSoundId(payload.soundId);
    setColorByValue(payload.color);
    onApplied();
  };

  const handleCreatePress = () => {
    haptics.selection().catch(() => {});
    setEditingId(null);
    setView('form');
  };

  // D8 (hotfix-porte-1) : la suppression reste libre, mais l'user peut se
  // retrouver sans base — ré-insère les rituels de base manquants (aucun
  // doublon, aucun écrasement d'un custom).
  const handleRestoreBase = () => {
    haptics.selection().catch(() => {});
    restoreBaseRituals();
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
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: StyleSheet.hairlineWidth,
      justifyContent: 'center',
      marginLeft: theme.spacing.sm,
      minHeight: 36,
      minWidth: 36,
    },
    editAffordanceText: {
      color: theme.colors.textSecondary,
      fontSize: rs(15, 'min'),
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
    restoreRow: {
      alignItems: 'center',
      paddingVertical: rs(10),
    },
    restoreText: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
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
    deleteAction: {
      alignItems: 'center',
      backgroundColor: '#A85B42', // terracotta du DS — destructif sans crier
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      marginVertical: rs(2),
      paddingHorizontal: theme.spacing.md,
    },
    deleteActionText: {
      color: '#FFFFFF',
      fontSize: rs(13, 'min'),
      fontWeight: '600',
    },
    favoriteAffordance: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 36,
    },
    favoriteStar: {
      color: theme.colors.textLight,
      fontSize: rs(18, 'min'),
    },
    favoriteStarActive: {
      color: '#D4A853', // l'or « done » du DS — jamais le vert
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
        maxHeight={maxHeight}
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
        const isFavorite = favoriteRituals.some((fav) => fav.id === ritual.id);
        return (
          // porte-2 (retour Eric) : swipe gauche = supprimer (Swipeable RNGH),
          // étoile = élire aux 3 favoris de la rangée d'accueil.
          <Swipeable
            key={ritual.id}
            friction={2}
            rightThreshold={40}
            overshootRight={false}
            renderRightActions={() => (
              <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => {
                  haptics.impact('medium').catch(() => {});
                  deleteRitual(ritual.id);
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={t('accessibility.deleteRitual', { name: ritual.name })}
              >
                <Text style={styles.deleteActionText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            )}
          >
            <View style={styles.ritualRow}>
              <TouchableOpacity
                style={styles.favoriteAffordance}
                onPress={() => {
                  const changed = toggleFavorite(ritual.id);
                  haptics.selection().catch(() => {});
                  if (!changed && !isFavorite) {
                    // 4e étoile refusée : libérer une place d'abord (max 3)
                    haptics.impact('light').catch(() => {});
                  }
                }}
                accessible
                accessibilityRole="button"
                accessibilityState={{ selected: isFavorite }}
                accessibilityLabel={t('accessibility.favoriteRitual', { name: ritual.name })}
              >
                <Text style={[styles.favoriteStar, isFavorite && styles.favoriteStarActive]}>
                  {isFavorite ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
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
                style={styles.editAffordance}
                onPress={() => handleEditPress(ritual.id)}
                activeOpacity={0.7}
                accessible
                accessibilityRole="button"
                accessibilityLabel={t('accessibility.editRitual', { name: ritual.name })}
              >
                <Text style={styles.editAffordanceText}>✎</Text>
              </TouchableOpacity>
            </View>
          </Swipeable>
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

      {hasMissingBaseRituals && (
        <TouchableOpacity
          style={styles.restoreRow}
          onPress={handleRestoreBase}
          activeOpacity={0.7}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('rituals.restoreBase')}
        >
          <Text style={styles.restoreText}>{t('rituals.restoreBase')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
