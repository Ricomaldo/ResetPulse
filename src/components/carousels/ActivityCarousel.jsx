/**
 * @fileoverview Activity carousel for selecting timer activities
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Animated,
} from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "../../hooks/useTranslation";
import { useTimerOptions } from "../../contexts/TimerOptionsContext";
import { useTimerPalette } from "../../contexts/TimerPaletteContext";
import { rs } from "../../styles/responsive";
import { getAllActivities, getFreeActivities } from "../../config/activities";
import haptics from "../../utils/haptics";
import { usePremiumStatus } from "../../hooks/usePremiumStatus";
import { useCustomActivities } from "../../hooks/useCustomActivities";
import {
  PremiumModal,
  MoreActivitiesModal,
  CreateActivityModal,
  EditActivityModal,
} from "../modals";
import { ActivityItem, PlusButton } from "./activity-items";

export default function ActivityCarousel({ isTimerRunning = false, drawerVisible = false }) {
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
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showMoreActivitiesModal, setShowMoreActivitiesModal] = useState(false);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
  const [showEditActivityModal, setShowEditActivityModal] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const { isPremium: isPremiumUser } = usePremiumStatus();
  const { customActivities } = useCustomActivities();
  const allActivities = getAllActivities();
  const freeActivities = getFreeActivities();

  const builtInActivities = isPremiumUser
    ? [...allActivities].sort((a, b) => {
        if (a.id === "none") return -1;
        if (b.id === "none") return 1;
        const aIsFavorite = favoriteActivities.includes(a.id);
        const bIsFavorite = favoriteActivities.includes(b.id);
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        if (aIsFavorite && bIsFavorite) return favoriteActivities.indexOf(a.id) - favoriteActivities.indexOf(b.id);
        return 0;
      })
    : freeActivities;

  const activities = isPremiumUser ? [...builtInActivities, ...customActivities] : builtInActivities;

  useEffect(() => {
    if (drawerVisible && scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollTo({ x: 0, animated: false }), 50);
    }
  }, [drawerVisible]);

  const getScaleAnim = (activityId) => {
    if (!scaleAnims[activityId]) scaleAnims[activityId] = new Animated.Value(1);
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

  const showToast = (message) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastMessage(""));
  };

  const handleActivityPress = (activity) => {
    if (activity.isPremium && !isPremiumUser) {
      haptics.warning().catch(() => { /* Optional operation - failure is non-critical */ });
      setShowPremiumModal(true);
      return;
    }

    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    setCurrentActivity(activity);
    const savedDuration = activityDurations[activity.id];
    if (savedDuration) setCurrentDuration(savedDuration);
    else if (activity.defaultDuration) setCurrentDuration(activity.defaultDuration);
    animateSelection(activity.id);
    showActivityName();
  };

  const handleMorePress = () => { haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ }); setShowMoreActivitiesModal(true); };
  const handleCreatePress = () => { haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ }); setShowCreateActivityModal(true); };

  const handleActivityLongPress = (activity) => {
    if (activity.isCustom) {
      haptics.impact('medium').catch(() => { /* Optional operation - failure is non-critical */ });
      setActivityToEdit(activity);
      setShowEditActivityModal(true);
    }
  };

  const handleActivityCreated = (newActivity) => {
    setCurrentActivity(newActivity);
    setCurrentDuration(newActivity.defaultDuration);
    showToast(t('customActivities.toast.created'));
  };

  const handleActivityUpdated = (updatedActivity) => {
    if (currentActivity?.id === updatedActivity.id) setCurrentActivity(updatedActivity);
    showToast(t('customActivities.toast.updated'));
  };

  const handleActivityDeleted = (deletedActivity) => {
    if (currentActivity?.id === deletedActivity.id) {
      const defaultActivity = activities.find((a) => a.id === 'none') || activities[0];
      setCurrentActivity(defaultActivity);
      setCurrentDuration(defaultActivity?.defaultDuration || 2700);
    }
    showToast(t('customActivities.toast.deleted'));
  };

  const styles = StyleSheet.create({
    container: { position: "relative", alignItems: "center", justifyContent: "center" },
    scrollView: { flexGrow: 0 },
    scrollContent: {
      paddingHorizontal: rs(30, "width"),
      alignItems: "center",
      gap: theme.spacing.md,
    },
    activityNameBadge: {
      position: "absolute", top: -35, backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg, ...theme.shadow("md"),
    },
    activityNameText: { fontSize: rs(14, "min"), fontWeight: "600", color: theme.colors.text },
    onboardingToast: {
      position: "absolute", bottom: rs(50, "height"), alignSelf: "center",
      backgroundColor: "rgba(0, 0, 0, 0.85)", paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.lg,
      maxWidth: "80%", ...theme.shadow("lg"),
    },
    onboardingToastText: {
      fontSize: rs(13, "min"), fontWeight: "600",
      color: theme.colors.fixed.white, textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
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
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {activities.map((activity) => {
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
        <PlusButton
          isPremium={isPremiumUser}
          onPress={isPremiumUser ? handleCreatePress : handleMorePress}
          accessibilityLabel={
            isPremiumUser
              ? t("customActivities.addButton")
              : t("accessibility.moreActivities")
          }
          accessibilityHint={
            isPremiumUser
              ? t("customActivities.addButtonHint")
              : t("accessibility.discoverPremium")
          }
        />
      </ScrollView>
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
      {toastMessage !== "" && (
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
