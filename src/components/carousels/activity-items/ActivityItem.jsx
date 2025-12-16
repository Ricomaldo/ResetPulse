/**
 * @fileoverview Single activity item for the activity carousel
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import { View, Text, TouchableOpacity, Animated, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../../../styles/responsive';

/**
 * ActivityItem - Pure presentational component for rendering a single activity
 *
 * @param {Object} props
 * @param {Object} props.activity - Activity object with id, emoji, label, isPremium, isCustom
 * @param {boolean} props.isActive - Whether this activity is currently selected
 * @param {boolean} props.isLocked - Whether this activity is premium and user is free
 * @param {boolean} props.isCustom - Whether this is a custom user-created activity
 * @param {string} props.currentColor - Current timer color
 * @param {function} props.onPress - Handler for press event
 * @param {function} props.onLongPress - Handler for long press event
 * @param {Animated.Value} props.scaleAnim - Animation value for scale transform
 */
const ActivityItem = React.memo(
  ({ activity, isActive, isLocked, isCustom, currentColor, onPress, onLongPress, scaleAnim }) => {
    const theme = useTheme();
    const t = useTranslation();

    const styles = StyleSheet.create({
      activityButtonActive: {
        backgroundColor: currentColor || theme.colors.brand.primary,
        borderColor: currentColor || theme.colors.brand.secondary,
        borderWidth: 2,
        ...(Platform.OS === 'ios' ? theme.shadow('md') : {}),
      },

      activityButtonInner: {
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        height: '100%',
        justifyContent: 'center',
        width: '100%',
        ...(Platform.OS === 'ios' ? theme.shadow('sm') : {}),
      },

      activityEmoji: {
        fontSize: rs(34, 'min'),
        lineHeight: rs(36, 'min'),
        textAlign: 'center',
      },

      activityInner: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        width: '100%',
      },

      activityWrapper: {
        backgroundColor: 'transparent',
        borderRadius: theme.borderRadius.full,
        height: rs(60, 'min'),
        opacity: isLocked ? 0.5 : 1,
        overflow: 'visible',
        width: rs(60, 'min'),
      },

      customBadge: {
        alignItems: 'center',
        backgroundColor: 'transparent',
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
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },

      premiumBadge: {
        alignItems: 'center',
        backgroundColor: 'transparent',
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
          <Animated.View style={[styles.activityInner, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.activityEmoji}>
              {activity.id === 'none' ? '⏱️' : activity.emoji}
            </Text>
          </Animated.View>

          {isLocked && (
            <View style={styles.premiumBadge}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}

          {isCustom && !isActive && (
            <View style={styles.customBadge}>
              <Text style={styles.customIcon}>✎</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }
);

export default ActivityItem;
