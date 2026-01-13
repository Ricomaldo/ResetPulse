/**
 * @fileoverview Activity carousel for selecting timer activities
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import PropTypes from 'prop-types';
import React, { useRef, useEffect, useState, useMemo, useCallback, forwardRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { rs } from '../../styles/responsive';
import { harmonizedSizes } from '../../styles/harmonized-sizes';
import { getAllActivities, getFreeActivities } from '../../config/activities';
import haptics from '../../utils/haptics';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { useModalStack } from '../../contexts/ModalStackContext';
import analytics from '../../services/analytics';
import { ActivityItem, PlusButton } from './activity-items/index';
import { fontWeights } from '../../theme/tokens';

const ActivityCarousel = forwardRef(function ActivityCarousel({ drawerVisible = false }, ref) {
  const theme = useTheme();
  const t = useTranslation();
  const {
    timer: { currentActivity },
    setCurrentActivity,
    setCurrentDuration,
    handleActivitySelect,
    favorites: { favoriteActivities = [] },
    stats: { activityDurations = {} },
    palette: { currentColor },
  } = useTimerConfig();
  const scrollViewRef = ref || useRef(null);
  const modalStack = useModalStack();
  const scaleAnims = useRef({}).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const scrollContentWidthRef = useRef(0);
  // eslint-disable-next-line no-unused-vars
  const [scrollOffset, setScrollOffset] = useState(0);
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
      modalStack.push('premium', {
        highlightedFeature: t('discovery.activities')
      });
      return;
    }

    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

    // Trigger flash feedback (ADR-007 messaging)
    handleActivitySelect(activity);

    // Update current activity and duration
    setCurrentActivity(activity);
    const savedDuration = activityDurations[activity.id];
    if (savedDuration) {setCurrentDuration(savedDuration);}
    else if (activity.defaultDuration) {setCurrentDuration(activity.defaultDuration);}
    animateSelection(activity.id);
  }, [isPremiumUser, activityDurations, setCurrentActivity, setCurrentDuration, handleActivitySelect, modalStack, t]);

  const handleMorePress = useCallback(() => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    analytics.trackDiscoveryModalShown('activities');

    // Create emoji grid for premium activities
    const premiumActivities = allActivities.filter(activity => activity.isPremium && activity.emoji);
    const emojiGrid = (
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.sm,
      }}>
        {premiumActivities.map((activity) => (
          <Text
            key={activity.id}
            style={{
              fontSize: rs(32, 'min'),
              height: rs(48, 'min'),
              lineHeight: rs(48, 'min'),
              textAlign: 'center',
              width: rs(48, 'min'),
            }}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`${activity.emoji} ${activity.name || activity.label}`}
          >
            {activity.emoji}
          </Text>
        ))}
      </View>
    );

    modalStack.push('discovery', {
      title: t('discovery.moreActivities.title'),
      subtitle: t('discovery.moreActivities.subtitle'),
      tagline: t('discovery.moreActivities.tagline'),
      highlightedFeature: 'activities',
      children: emojiGrid,
      onClose: () => analytics.trackDiscoveryModalDismissed('activities'),
    });
  }, [allActivities, theme, t, modalStack]);

  const handleCreatePress = useCallback(() => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

    // Push create activity modal to stack
    modalStack.push('createActivity', {
      snapPoints: ['90%'],
      onActivityCreated: handleActivityCreated,
    });
  }, [modalStack, handleActivityCreated]);

  const handleActivityLongPress = useCallback((activity) => {
    if (activity.isCustom) {
      haptics.impact('medium').catch(() => { /* Optional operation - failure is non-critical */ });

      // Push edit activity modal to stack
      modalStack.push('editActivity', {
        snapPoints: ['90%'],
        activity,
        onActivityUpdated: handleActivityUpdated,
        onActivityDeleted: handleActivityDeleted,
      });
    }
  }, [modalStack, handleActivityUpdated, handleActivityDeleted]);

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

  // Page sizing: 4 items (60px) + 3 gaps (13px) + padding (16px) = 295px
  // Add 5px margin for subtle scroll hint on edges
  const PAGE_WIDTH = rs(300, 'width');

  const styles = StyleSheet.create({
    carouselContainer: {
      maxWidth: PAGE_WIDTH,
    },
    onboardingToast: {
      alignSelf: 'center',
      backgroundColor: theme.colors.overlayDark,
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
      flexDirection: 'column',
      gap: harmonizedSizes.carouselSpacing.stackGap,
      justifyContent: 'center',
    },
    pageContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: harmonizedSizes.carouselSpacing.itemGap,
      justifyContent: 'center',
      paddingHorizontal: rs(10), // Symmetrical padding for content centering
      paddingVertical: harmonizedSizes.carouselSpacing.containerPadding.vertical,
      width: PAGE_WIDTH, // Fixed width per page for paging
    },
    // Plus button: uses same gap as other items (from parent's gap property)
    plusButtonWrapper: {
      // No negative margin - let the gap from pageContainer handle spacing
    },
    scrollContent: {
      alignItems: 'center',
      paddingHorizontal: 0,
    },
    scrollView: {
      flexGrow: 0,
      height: harmonizedSizes.scrollView.height,
    },
  });

  return (
    <View style={styles.outerContainer}>
      {/* Carousel container */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onContentSizeChange={(width) => {
            scrollContentWidthRef.current = width;
            updateArrowVisibility(0);
          }}
          snapToInterval={PAGE_WIDTH}
          decelerationRate="fast"
          nestedScrollEnabled={true}
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
              {/* Plus button on last page - pushed left for visual hierarchy */}
              {pageIndex === activityPages.length - 1 && (
                <View style={styles.plusButtonWrapper}>
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
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

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
});

ActivityCarousel.propTypes = {
  drawerVisible: PropTypes.bool,
};

export default ActivityCarousel;
