/**
 * @fileoverview Activity carousel for selecting timer activities
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import PropTypes from 'prop-types';
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { useTimerPalette } from '../../contexts/TimerPaletteContext';
import { rs } from '../../styles/responsive';
import { getAllActivities, getFreeActivities } from '../../config/activities';
import haptics from '../../utils/haptics';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import {
  PremiumModal,
  MoreActivitiesModal,
  CreateActivityModal,
  EditActivityModal,
} from '../modals';
import { ActivityItem, PlusButton } from './activity-items';
import { fontWeights } from '../../theme/tokens';

// Couleurs extraites pour respecter la règle no-color-literals
const OVERLAY_DARK = 'rgba(0, 0, 0, 0.85)';

export default function ActivityCarousel({ drawerVisible = false }) {
  const theme = useTheme();
  const t = useTranslation();
  const {
    currentActivity,
    setCurrentActivity,
    setCurrentDuration,
    favoriteActivities = [],
    activityDurations = {},
  } = useTimerOptions();
  const { currentColor } = useTimerPalette();
  const scrollViewRef = useRef(null);
  const scaleAnims = useRef({}).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const scrollContentWidthRef = useRef(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showMoreActivitiesModal, setShowMoreActivitiesModal] = useState(false);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
  const [showEditActivityModal, setShowEditActivityModal] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const { isPremium: isPremiumUser } = usePremiumStatus();
  const { customActivities } = useCustomActivities();
  const allActivities = getAllActivities();
  const freeActivities = getFreeActivities();

  // Memoize expensive sorting/filtering operations
  const builtInActivities = useMemo(() => {
    if (!isPremiumUser) {return freeActivities;}

    return [...allActivities].sort((a, b) => {
      if (a.id === 'none') {return -1;}
      if (b.id === 'none') {return 1;}
      const aIsFavorite = favoriteActivities.includes(a.id);
      const bIsFavorite = favoriteActivities.includes(b.id);
      if (aIsFavorite && !bIsFavorite) {return -1;}
      if (!aIsFavorite && bIsFavorite) {return 1;}
      if (aIsFavorite && bIsFavorite) {return favoriteActivities.indexOf(a.id) - favoriteActivities.indexOf(b.id);}
      return 0;
    });
  }, [isPremiumUser, allActivities, freeActivities, favoriteActivities]);

  const activities = useMemo(() =>
    isPremiumUser ? [...builtInActivities, ...customActivities] : builtInActivities,
  [isPremiumUser, builtInActivities, customActivities]
  );

  // Organize activities into pages: max 4 activities per page, favorites first
  const activityPages = useMemo(() => {
    const MAX_ITEMS_PER_PAGE = 4;

    // Sort activities: favorites first (already sorted in builtInActivities)
    const sortedActivities = [...activities];

    // Split into pages of max 4 items
    const pages = [];
    for (let i = 0; i < sortedActivities.length; i += MAX_ITEMS_PER_PAGE) {
      pages.push(sortedActivities.slice(i, i + MAX_ITEMS_PER_PAGE));
    }

    return pages.length > 0 ? pages : [[]]; // Return at least one empty page
  }, [activities]);

  useEffect(() => {
    if (drawerVisible && scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollTo({ x: 0, animated: false }), 50);
    }
  }, [drawerVisible]);

  const getScaleAnim = (activityId) => {
    if (!scaleAnims[activityId]) {scaleAnims[activityId] = new Animated.Value(1);}
    return scaleAnims[activityId];
  };

  const animateSelection = (activityId) => {
    const anim = getScaleAnim(activityId);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const showActivityName = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const showToast = useCallback((message) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastMessage(''));
  }, [toastAnim]);

  const handleActivityPress = useCallback((activity) => {
    if (activity.isPremium && !isPremiumUser) {
      haptics.warning().catch(() => { /* Optional operation - failure is non-critical */ });
      setShowPremiumModal(true);
      return;
    }

    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    setCurrentActivity(activity);
    const savedDuration = activityDurations[activity.id];
    if (savedDuration) {setCurrentDuration(savedDuration);}
    else if (activity.defaultDuration) {setCurrentDuration(activity.defaultDuration);}
    animateSelection(activity.id);
    showActivityName();
  }, [isPremiumUser, activityDurations, setCurrentActivity, setCurrentDuration]);

  const handleMorePress = useCallback(() => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    setShowMoreActivitiesModal(true);
  }, []);

  const handleCreatePress = useCallback(() => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    setShowCreateActivityModal(true);
  }, []);

  const handleActivityLongPress = useCallback((activity) => {
    if (activity.isCustom) {
      haptics.impact('medium').catch(() => { /* Optional operation - failure is non-critical */ });
      setActivityToEdit(activity);
      setShowEditActivityModal(true);
    }
  }, []);

  const handleActivityCreated = useCallback((newActivity) => {
    setCurrentActivity(newActivity);
    setCurrentDuration(newActivity.defaultDuration);
    showToast(t('customActivities.toast.created'));
  }, [setCurrentActivity, setCurrentDuration, showToast, t]);

  const handleActivityUpdated = useCallback((updatedActivity) => {
    if (currentActivity?.id === updatedActivity.id) {setCurrentActivity(updatedActivity);}
    showToast(t('customActivities.toast.updated'));
  }, [currentActivity, setCurrentActivity, showToast, t]);

  const handleActivityDeleted = useCallback((deletedActivity) => {
    if (currentActivity?.id === deletedActivity.id) {
      const defaultActivity = activities.find((a) => a.id === 'none') || activities[0];
      setCurrentActivity(defaultActivity);
      setCurrentDuration(defaultActivity?.defaultDuration || 2700);
    }
    showToast(t('customActivities.toast.deleted'));
  }, [currentActivity, activities, setCurrentActivity, setCurrentDuration, showToast, t]);

  // Update scroll offset for circular navigation
  const updateArrowVisibility = useCallback((offset) => {
    setScrollOffset(offset);
  }, []);

  const handleScroll = useCallback((event) => {
    updateArrowVisibility(event.nativeEvent.contentOffset.x);
  }, [updateArrowVisibility]);

  const scrollLeft = useCallback(() => {
    const pageWidth = rs(280, 'width');
    const currentPage = Math.round(scrollOffset / pageWidth);
    // Wrap to last page if at first page
    const newPage = currentPage === 0 ? activityPages.length - 1 : currentPage - 1;
    scrollViewRef.current?.scrollTo({ x: newPage * pageWidth, animated: true });
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
  }, [scrollOffset, activityPages.length]);

  const scrollRight = useCallback(() => {
    const pageWidth = rs(280, 'width');
    const currentPage = Math.round(scrollOffset / pageWidth);
    // Wrap to first page if at last page
    const newPage = currentPage === activityPages.length - 1 ? 0 : currentPage + 1;
    scrollViewRef.current?.scrollTo({ x: newPage * pageWidth, animated: true });
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
  }, [scrollOffset, activityPages.length]);

  const styles = StyleSheet.create({
    activityNameBadge: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      position: 'absolute',
      top: -35,
      ...theme.shadow('md'),
    },
    activityNameText: {
      color: theme.colors.text,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.semibold,
    },
    carouselContainer: {
      maxWidth: rs(280, 'width'),
    },
    chevronButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: rs(16, 'min'),
      height: rs(32, 'min'),
      justifyContent: 'center',
      marginHorizontal: theme.spacing.xs,
      minHeight: 44,
      minWidth: 44,
      width: rs(32, 'min'),
      ...theme.shadows.sm,
    },
    chevronText: {
      color: theme.colors.textSecondary,
      fontSize: rs(18, 'min'),
      fontWeight: fontWeights.semibold,
    },
    onboardingToast: {
      alignSelf: 'center',
      backgroundColor: OVERLAY_DARK,
      borderRadius: theme.borderRadius.lg,
      bottom: rs(50, 'height'),
      maxWidth: '80%',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      position: 'absolute',
      ...theme.shadow('lg'),
    },
    onboardingToastText: {
      color: theme.colors.fixed.white,
      fontSize: rs(13, 'min'),
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
    },
    outerContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs,
      justifyContent: 'center',
    },
    pageContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.md,
      justifyContent: 'center',
      paddingHorizontal: rs(6, 'width'),
      paddingVertical: theme.spacing.xs,
      width: rs(280, 'width'), // Fixed width per page for paging
    },
    scrollContent: {
      alignItems: 'center',
      paddingHorizontal: 0,
    },
    scrollView: {
      flexGrow: 0,
    },
  });

  return (
    <View style={styles.outerContainer}>
      {/* Left chevron - always enabled for circular navigation */}
      <TouchableOpacity
        style={styles.chevronButton}
        onPress={scrollLeft}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={t('accessibility.scrollLeft')}
      >
        <Text style={styles.chevronText}>‹</Text>
      </TouchableOpacity>

      {/* Carousel container */}
      <View style={styles.carouselContainer}>
        {currentActivity && (
          <Animated.View
            style={[
              styles.activityNameBadge,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [5, 0],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.activityNameText}>{currentActivity.label}</Text>
          </Animated.View>
        )}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onContentSizeChange={(width) => {
            scrollContentWidthRef.current = width;
            updateArrowVisibility(0);
          }}
          snapToInterval={rs(280, 'width')}
          decelerationRate="fast"
          scrollEnabled={false} // Disable manual scrolling, only chevrons control navigation
        >
          {activityPages.map((pageActivities, pageIndex) => (
            <View key={`page-${pageIndex}`} style={styles.pageContainer}>
              {pageActivities.map((activity) => {
                const isActive = currentActivity?.id === activity.id;
                const isLocked = activity.isPremium && !isPremiumUser && !activity.isCustom;
                const isCustom = activity.isCustom;

                return (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    isActive={isActive}
                    isLocked={isLocked}
                    isCustom={isCustom}
                    currentColor={currentColor}
                    onPress={() => handleActivityPress(activity)}
                    onLongPress={() => handleActivityLongPress(activity)}
                    scaleAnim={getScaleAnim(activity.id)}
                  />
                );
              })}
              {/* Plus button on last page */}
              {pageIndex === activityPages.length - 1 && (
                <PlusButton
                  isPremium={isPremiumUser}
                  onPress={isPremiumUser ? handleCreatePress : handleMorePress}
                  accessibilityLabel={
                    isPremiumUser
                      ? t('customActivities.addButton')
                      : t('accessibility.moreActivities')
                  }
                  accessibilityHint={
                    isPremiumUser
                      ? t('customActivities.addButtonHint')
                      : t('accessibility.discoverPremium')
                  }
                />
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Right chevron - always enabled for circular navigation */}
      <TouchableOpacity
        style={styles.chevronButton}
        onPress={scrollRight}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={t('accessibility.scrollRight')}
      >
        <Text style={styles.chevronText}>›</Text>
      </TouchableOpacity>

      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        highlightedFeature={t('discovery.activities')}
      />
      <MoreActivitiesModal
        visible={showMoreActivitiesModal}
        onClose={() => setShowMoreActivitiesModal(false)}
        onOpenPaywall={() => setShowPremiumModal(true)}
      />
      <CreateActivityModal
        visible={showCreateActivityModal}
        onClose={() => setShowCreateActivityModal(false)}
        onOpenPaywall={() => setShowPremiumModal(true)}
        onActivityCreated={handleActivityCreated}
      />
      <EditActivityModal
        visible={showEditActivityModal}
        onClose={() => {
          setShowEditActivityModal(false);
          setActivityToEdit(null);
        }}
        activity={activityToEdit}
        onActivityUpdated={handleActivityUpdated}
        onActivityDeleted={handleActivityDeleted}
      />
      {toastMessage !== '' && (
        <Animated.View
          style={[
            styles.onboardingToast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.onboardingToastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
}

ActivityCarousel.propTypes = {
  drawerVisible: PropTypes.bool,
};
