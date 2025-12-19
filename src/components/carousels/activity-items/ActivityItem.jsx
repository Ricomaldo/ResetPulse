/**
 * @fileoverview Single activity item for the activity carousel
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../../../styles/responsive';
import { harmonizedSizes } from '../../../styles/harmonized-sizes';
import Icons from '../../layout/Icons';

// Color constants for transparency overlays
const TEXT_SHADOW_DARK = 'rgba(0, 0, 0, 0.3)';

/**
 * ActivityItem - Pure presentational component for rendering a single activity
 *
 * @param {Object} props
 * @param {Object} props.activity - Activity object with id, emoji, label, isPremium, isCustom
 * @param {boolean} props.isActive - Whether this activity is currently selected
 * @param {boolean} props.isLocked - Whether this activity is premium and user is free
 * @param {boolean} props.isCustom - Whether this is a custom user-created activity
 * @param {function} props.onPress - Handler for press event
 * @param {function} props.onLongPress - Handler for long press event
 */
const ActivityItem = React.memo(function ActivityItem({
  activity,
  isActive,
  isLocked,
  isCustom,
  onPress,
  onLongPress,
}) {
  const theme = useTheme();
  const t = useTranslation();

  const styles = StyleSheet.create({
    activityButtonActive: {
      backgroundColor: theme.colors.brand.accent,
      borderColor: theme.colors.brand.accent,
      borderWidth: 2,
      ...(Platform.OS === 'ios' ? theme.shadow('md') : {}),
    },
    activityButtonInner: {
      alignItems: 'center',
      backgroundColor: theme.colors.fixed.transparent,
      borderColor: theme.colors.brand.neutral,
      borderRadius: rs(20, 'min'),
      borderWidth: 2,
      height: '100%',
      justifyContent: 'center',
      width: '100%',
    },
    activityEmoji: {
      fontSize: harmonizedSizes.carouselItem.iconSize,
      lineHeight: harmonizedSizes.carouselItem.iconSize,
      textAlign: 'center',
    },
    activityInner: {
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
      width: '100%',
    },
    activityWrapper: {
      backgroundColor: theme.colors.fixed.transparent,
      borderRadius: theme.borderRadius.full,
      height: harmonizedSizes.carouselItem.size,
      opacity: isLocked ? 0.5 : 1,
      overflow: 'visible',
      width: harmonizedSizes.carouselItem.size,
    },
    customBadge: {
      alignItems: 'center',
      backgroundColor: theme.colors.fixed.transparent,
      justifyContent: 'center',
      position: 'absolute',
      right: -2,
      top: -2,
    },
    customIcon: {
      fontSize: rs(14, 'min'),
      opacity: 0.75,
    },
    lockIcon: {
      fontSize: rs(16, 'min'),
      opacity: 0.75,
      textShadowColor: TEXT_SHADOW_DARK,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    premiumBadge: {
      alignItems: 'center',
      backgroundColor: theme.colors.fixed.transparent,
      justifyContent: 'center',
      position: 'absolute',
      right: -2,
      top: -2,
    },
  });

  return (
    <View style={styles.activityWrapper}>
      <TouchableOpacity
        accessible={true}
        accessibilityLabel={t('accessibility.activity', {
          name: activity.label || activity.name,
        })}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive, disabled: isLocked }}
        accessibilityHint={
          isLocked
            ? t('accessibility.activityLocked')
            : isCustom
              ? t('accessibility.customActivityHint')
              : t('accessibility.activity', { name: activity.label || activity.name })
        }
        style={[styles.activityButtonInner, isActive && styles.activityButtonActive]}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
        disabled={false}
      >
        <View style={styles.activityInner}>
          {activity.id === 'none' ? (
            <Icons
              name="timer"
              size={rs(32, 'min')}
              color={isActive ? theme.colors.fixed.white : theme.colors.textSecondary}
            />
          ) : (
            <Text style={styles.activityEmoji}>
              {activity.emoji}
            </Text>
          )}
        </View>

        {isLocked && (
          <View style={styles.premiumBadge}>
            <Icons name="lock" size={rs(16, 'min')} color={theme.colors.textSecondary} />
          </View>
        )}

        {isCustom && !isActive && (
          <View style={styles.customBadge}>
            <Icons name="edit" size={rs(14, 'min')} color={theme.colors.textSecondary} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});

export default ActivityItem;
