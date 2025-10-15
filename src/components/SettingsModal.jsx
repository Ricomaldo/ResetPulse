// src/components/SettingsModal.jsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  TouchableNativeFeedback,
  Alert,
  Image,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { useTimerOptions } from "../contexts/TimerOptionsContext";
import { useTimerPalette } from "../contexts/TimerPaletteContext";
import { useOnboarding } from "./onboarding/OnboardingController";
import { rs } from "../styles/responsive";
import PalettePreview from "./PalettePreview";
import SoundPicker from "./SoundPicker";
import PremiumModal from "./PremiumModal";
import { getAllActivities } from "../config/activities";
import { TIMER_PALETTES, isPalettePremium } from "../config/timerPalettes";
import haptics from "../utils/haptics";
import { usePremiumStatus } from "../hooks/usePremiumStatus";

export default function SettingsModal({ visible, onClose }) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const theme = useTheme();
  const { currentPalette, setPalette } = useTimerPalette();
  const { resetOnboarding, startTooltips } = useOnboarding();
  const {
    shouldPulse,
    setShouldPulse,
    showActivities,
    setShowActivities,
    showPalettes,
    setShowPalettes,
    useMinimalInterface,
    setUseMinimalInterface,
    showDigitalTimer,
    setShowDigitalTimer,
    currentActivity,
    setCurrentActivity,
    clockwise,
    setClockwise,
    scaleMode,
    setScaleMode,
    favoriteActivities,
    setFavoriteActivities,
    selectedSoundId,
    setSelectedSoundId,
  } = useTimerOptions();

  const allActivities = getAllActivities();
  const { isPremium: isPremiumUser } = usePremiumStatus(); // Check premium status for test mode

  const toggleFavorite = (activityId) => {
    haptics.selection().catch(() => {});
    const newFavorites = favoriteActivities.includes(activityId)
      ? favoriteActivities.filter((id) => id !== activityId)
      : [...favoriteActivities, activityId];
    setFavoriteActivities(newFavorites);
  };

  // Platform-specific touchable component
  const Touchable =
    Platform.OS === "android" &&
    TouchableNativeFeedback?.canUseNativeForeground?.()
      ? TouchableNativeFeedback
      : TouchableOpacity;

  const touchableProps =
    Platform.OS === "android" && TouchableNativeFeedback?.Ripple
      ? {
          background: TouchableNativeFeedback.Ripple(
            theme.colors.brand.primary + "20",
            false
          ),
        }
      : {
          activeOpacity: 0.7,
        };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: Platform.select({
        ios: "rgba(0, 0, 0, 0.4)",
        android: "rgba(0, 0, 0, 0.5)",
      }),
      justifyContent: "center",
      alignItems: "center",
    },

    modalContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: Platform.select({
        ios: 16,
        android: 12,
      }),
      width: "90%",
      maxHeight: "80%",
      padding: theme.spacing.lg,
      ...theme.shadow("xl"),
      ...Platform.select({
        ios: {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border + "30",
        },
        android: {},
      }),
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    title: {
      fontSize: rs(24, "min"),
      fontWeight: "bold",
      color: theme.colors.text,
    },

    closeButton: {
      padding: theme.spacing.md,
      margin: -theme.spacing.sm, // Extend tap area outside visible bounds
      minWidth: 44, // iOS minimum tap target
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },

    closeText: {
      fontSize: rs(20, "min"),
      color: theme.colors.text,
    },

    scrollContent: {
      paddingBottom: theme.spacing.md,
    },

    section: {
      marginBottom: theme.spacing.lg,
    },

    // Card-based sections (NIVEAU 1 - Core Experience)
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border + '30',
      ...theme.shadow('sm'),
    },

    // Card with emphasis (for important sections)
    sectionCardPrimary: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm, // Réduit de md à sm
      borderWidth: 1,
      borderColor: theme.colors.brand.primary + '15',
      ...theme.shadow('md'),
    },

    // Flat section (for "À propos")
    sectionFlat: {
      marginBottom: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },

    // Level divider
    levelDivider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
    },

    levelDividerText: {
      fontSize: rs(11, 'min'),
      color: theme.colors.textLight,
      textAlign: 'center',
      marginTop: -theme.spacing.sm,
      backgroundColor: theme.colors.background,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.sm,
    },

    sectionTitle: {
      fontSize: rs(16, "min"),
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },

    optionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },

    optionLabel: {
      fontSize: rs(14, "min"),
      color: theme.colors.text,
      flex: 1,
    },

    optionDescription: {
      fontSize: rs(11, "min"),
      color: theme.colors.textLight,
      marginTop: theme.spacing.xs / 2,
    },

    segmentedControl: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 2,
    },

    segmentButton: {
      flex: 1,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.md - 2,
      alignItems: "center",
      minWidth: 60,
    },

    segmentButtonActive: {
      backgroundColor: theme.colors.brand.primary,
    },

    segmentText: {
      fontSize: rs(11, "min"),
      color: theme.colors.text,
      fontWeight: "500",
      textAlign: "center",
    },

    segmentTextActive: {
      color: theme.colors.background,
    },

    paletteGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },

    paletteItem: {
      width: "30%",
      aspectRatio: 1.5,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
      borderWidth: 2,
      borderColor: "transparent",
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.sm,
      ...theme.shadow("sm"),
    },

    paletteItemActive: {
      borderColor: theme.colors.brand.primary,
      backgroundColor: theme.colors.background,
      ...theme.shadow("md"),
    },

    paletteItemLocked: {
      opacity: 0.6,
    },

    paletteName: {
      fontSize: rs(10, "min"),
      color: theme.colors.text,
      textAlign: "center",
      marginTop: theme.spacing.xs / 2,
      fontWeight: "500",
    },

    paletteNameActive: {
      color: theme.colors.brand.primary,
      fontWeight: "600",
    },

    paletteLockBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },

    lockIcon: {
      fontSize: 14,
      opacity: 0.75,
    },

    colorRow: {
      flexDirection: "row",
      height: 16,
      borderRadius: theme.borderRadius.sm,
      overflow: "hidden",
    },

    colorSegment: {
      flex: 1,
    },

    favoritesSection: {
      marginTop: theme.spacing.md,
    },

    favoritesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },

    activityItem: {
      width: "22%",
      aspectRatio: 1,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "transparent",
      ...theme.shadow("sm"),
      padding: theme.spacing.xs,
    },

    activityItemFavorite: {
      borderColor: theme.colors.brand.primary,
      backgroundColor: theme.colors.background,
      ...theme.shadow("md"),
    },

    activityEmoji: {
      fontSize: rs(24, "min"),
      marginBottom: theme.spacing.xs / 2,
      textAlign: "center",
    },

    activityIcon: {
      width: rs(24, "min"),
      height: rs(24, "min"),
      marginBottom: theme.spacing.xs / 2,
      // Pas de tintColor pour garder les couleurs originales de l'icône
    },

    activityItemLabel: {
      fontSize: rs(9, "min"),
      color: theme.colors.textLight,
      fontWeight: "500",
      textAlign: "center",
      width: "100%",
    },

    activityItemLabelFavorite: {
      color: theme.colors.brand.primary,
      fontWeight: "600",
    },

    premiumBadge: {
      position: "absolute",
      top: 2,
      right: 2,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },

    lockMini: {
      fontSize: 12,
      opacity: 0.7,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },

    sectionBadge: {
      backgroundColor: theme.colors.brand.primary + "15",
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },

    sectionBadgeText: {
      fontSize: rs(10, "min"),
      color: theme.colors.brand.primary,
      fontWeight: "600",
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Paramètres</Text>
            <TouchableOpacity
              accessible={true}
              accessibilityLabel="Fermer les paramètres"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. 🪄 Interface (Card Primary) - Comment je veux utiliser l'app */}
            <View style={styles.sectionCardPrimary}>
              <Text style={styles.sectionTitle}>🪄 Interface</Text>

              {/* Interface minimaliste */}
              <View style={styles.optionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Interface minimaliste</Text>
                  <Text style={styles.optionDescription}>
                    {useMinimalInterface
                      ? "Masque activités et couleurs quand le timer tourne"
                      : "Interface complète même pendant le timer"}
                  </Text>
                </View>
                <Switch
                  accessible={true}
                  accessibilityLabel="Interface minimaliste"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: useMinimalInterface }}
                  value={useMinimalInterface}
                  onValueChange={(value) => {
                    haptics.switchToggle().catch(() => {});
                    setUseMinimalInterface(value);
                  }}
                  {...theme.styles.switch(useMinimalInterface)}
                />
              </View>

              {/* Chrono Numérique */}
              <View style={styles.optionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Chrono numérique</Text>
                  <Text style={styles.optionDescription}>
                    {showDigitalTimer
                      ? "Affiche le temps restant en MM:SS"
                      : "Chrono numérique désactivé"}
                  </Text>
                </View>
                <Switch
                  value={showDigitalTimer}
                  onValueChange={(value) => {
                    haptics.switchToggle().catch(() => {});
                    setShowDigitalTimer(value);
                  }}
                  {...theme.styles.switch(showDigitalTimer)}
                />
              </View>

              {/* Animation Pulse */}
              <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Animation Pulse</Text>
                  <Text style={styles.optionDescription}>
                    {shouldPulse
                      ? "Animation activée pendant le timer"
                      : "Animation désactivée"}
                  </Text>
                </View>
                <Switch
                  value={shouldPulse}
                  onValueChange={(value) => {
                    if (value) {
                      // Avertissement pour conformité épilepsie/photosensibilité
                      Alert.alert(
                        "Animation de pulsation",
                        "Cette option active une animation visuelle répétitive.\n\nÉvitez d'activer cette fonctionnalité si vous êtes sensible aux effets visuels ou si vous avez des antécédents de photosensibilité.",
                        [
                          {
                            text: "Annuler",
                            style: "cancel",
                            onPress: () => {
                              haptics.selection().catch(() => {});
                            },
                          },
                          {
                            text: "Activer",
                            onPress: () => {
                              haptics.switchToggle().catch(() => {});
                              setShouldPulse(true);
                            },
                          },
                        ],
                        { cancelable: true }
                      );
                    } else {
                      haptics.switchToggle().catch(() => {});
                      setShouldPulse(false);
                    }
                  }}
                  {...theme.styles.switch(shouldPulse)}
                />
              </View>
            </View>

            {/* 2. ⚙️ Timer (Card) - Réglages techniques du minuteur */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>⚙️ Timer</Text>

              {/* Sons du Timer */}
              <Text style={styles.optionDescription}>
                Choisissez le son qui sera joué à la fin du timer
              </Text>
              <SoundPicker
                selectedSoundId={selectedSoundId}
                onSoundSelect={setSelectedSoundId}
              />

              {/* Mode Cadran */}
              <View style={[styles.optionRow, { marginTop: theme.spacing.md }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Mode Cadran</Text>
                  <Text style={styles.optionDescription}>
                    {scaleMode === "60min"
                      ? "Échelle 60 minutes"
                      : "25 minutes Pomodoro"}
                  </Text>
                </View>
                <View style={styles.segmentedControl}>
                  <Touchable
                    style={[
                      styles.segmentButton,
                      scaleMode === "60min" && styles.segmentButtonActive,
                    ]}
                    onPress={() => {
                      haptics.selection().catch(() => {});
                      setScaleMode("60min");
                    }}
                    {...touchableProps}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        scaleMode === "60min" && styles.segmentTextActive,
                      ]}
                    >
                      60min
                    </Text>
                  </Touchable>
                  <Touchable
                    style={[
                      styles.segmentButton,
                      scaleMode === "25min" && styles.segmentButtonActive,
                    ]}
                    onPress={() => {
                      haptics.selection().catch(() => {});
                      setScaleMode("25min");
                    }}
                    {...touchableProps}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        scaleMode === "25min" && styles.segmentTextActive,
                      ]}
                    >
                      25min
                    </Text>
                  </Touchable>
                </View>
              </View>

              {/* Sens de Rotation */}
              <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Sens de rotation</Text>
                  <Text style={styles.optionDescription}>
                    {clockwise ? "Sens horaire" : "Sens anti-horaire"}
                  </Text>
                </View>
                <Switch
                  accessible={true}
                  accessibilityLabel="Sens de rotation"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: clockwise }}
                  value={clockwise}
                  onValueChange={(value) => {
                    haptics.switchToggle().catch(() => {});
                    setClockwise(value);
                  }}
                  {...theme.styles.switch(clockwise)}
                />
              </View>
            </View>

            {/* 3. 🎨 Apparence (Card) - Personnalisation visuelle */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🎨 Apparence</Text>

              {/* Thème */}
              <View style={styles.optionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Thème</Text>
                  <Text style={styles.optionDescription}>
                    {theme.mode === "auto"
                      ? "Automatique (système)"
                      : theme.mode === "dark"
                      ? "Sombre"
                      : "Clair"}
                  </Text>
                </View>
                <View style={styles.segmentedControl}>
                  <Touchable
                    style={[
                      styles.segmentButton,
                      theme.mode === "light" && styles.segmentButtonActive,
                    ]}
                    onPress={() => {
                      haptics.selection().catch(() => {});
                      theme.setTheme("light");
                    }}
                    {...touchableProps}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        theme.mode === "light" && styles.segmentTextActive,
                      ]}
                    >
                      ☀️ Clair
                    </Text>
                  </Touchable>
                  <Touchable
                    style={[
                      styles.segmentButton,
                      theme.mode === "dark" && styles.segmentButtonActive,
                    ]}
                    onPress={() => {
                      haptics.selection().catch(() => {});
                      theme.setTheme("dark");
                    }}
                    {...touchableProps}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        theme.mode === "dark" && styles.segmentTextActive,
                      ]}
                    >
                      🌙 Sombre
                    </Text>
                  </Touchable>
                  <Touchable
                    style={[
                      styles.segmentButton,
                      theme.mode === "auto" && styles.segmentButtonActive,
                    ]}
                    onPress={() => {
                      haptics.selection().catch(() => {});
                      theme.setTheme("auto");
                    }}
                    {...touchableProps}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        theme.mode === "auto" && styles.segmentTextActive,
                      ]}
                    >
                      📱 Auto
                    </Text>
                  </Touchable>
                </View>
              </View>

              {/* Palettes de couleurs */}
              <View style={[styles.optionRow, { marginTop: theme.spacing.md }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Afficher les palettes</Text>
                  <Text style={styles.optionDescription}>
                    {showPalettes
                      ? "Palettes visibles dans l'interface"
                      : "Palettes masquées"}
                  </Text>
                </View>
                <Switch
                  accessible={true}
                  accessibilityLabel="Afficher les palettes"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: showPalettes }}
                  value={showPalettes}
                  onValueChange={(value) => {
                    haptics.switchToggle().catch(() => {});
                    setShowPalettes(value);
                  }}
                  {...theme.styles.switch(showPalettes)}
                />
              </View>

              {showPalettes && (
                <>
                  <Text style={[styles.optionDescription, { marginTop: theme.spacing.sm }]}>
                    Version gratuite : Terre et Laser disponibles
                  </Text>
                  <View style={styles.paletteGrid}>
                    {Object.keys(TIMER_PALETTES).map((paletteName) => {
                      const isLocked =
                        isPalettePremium(paletteName) && !isPremiumUser;
                      const isActive = currentPalette === paletteName;
                      const paletteInfo = TIMER_PALETTES[paletteName];

                      return (
                        <TouchableOpacity
                          key={paletteName}
                          style={[
                            styles.paletteItem,
                            isActive && styles.paletteItemActive,
                            isLocked && styles.paletteItemLocked,
                          ]}
                          onPress={() => {
                            if (isLocked) {
                              haptics.warning().catch(() => {});
                              setShowPremiumModal(true);
                            } else {
                              setPalette(paletteName);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <PalettePreview paletteName={paletteName} />
                          <Text
                            style={[
                              styles.paletteName,
                              isActive && styles.paletteNameActive,
                            ]}
                          >
                            {paletteInfo?.name || paletteName}
                          </Text>
                          {isLocked && (
                            <View style={styles.paletteLockBadge}>
                              <Text style={styles.lockIcon}>✨</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* Activités favorites */}
              <View style={[styles.optionRow, { marginTop: theme.spacing.md, borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Afficher les activités</Text>
                  <Text style={styles.optionDescription}>
                    {showActivities
                      ? "Activités visibles dans l'interface"
                      : "Activités masquées"}
                  </Text>
                </View>
                <Switch
                  accessible={true}
                  accessibilityLabel="Afficher les activités"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: showActivities }}
                  value={showActivities}
                  onValueChange={(value) => {
                    haptics.switchToggle().catch(() => {});
                    setShowActivities(value);

                    // Si on masque les activités, remettre à "none" (Basique)
                    if (!value) {
                      const noneActivity = allActivities.find(
                        (activity) => activity.id === "none"
                      );
                      if (noneActivity) {
                        setCurrentActivity(noneActivity);
                      }
                    }
                  }}
                  {...theme.styles.switch(showActivities)}
                />
              </View>

              {showActivities && (
                <>
                  <Text style={[styles.optionDescription, { marginTop: theme.spacing.sm }]}>
                    Sélectionnez vos favoris pour les voir en premier
                  </Text>
                  <View style={styles.favoritesGrid}>
                    {allActivities.map((activity) => {
                      const isFavorite = favoriteActivities.includes(
                        activity.id
                      );
                      const isLocked = activity.isPremium && !isPremiumUser;
                      return (
                        <TouchableOpacity
                          key={activity.id}
                          style={[
                            styles.activityItem,
                            isFavorite && styles.activityItemFavorite,
                            isLocked && styles.activityItemLocked,
                          ]}
                          onPress={() => {
                            if (isLocked) {
                              haptics.warning().catch(() => {});
                              setShowPremiumModal(true);
                            } else {
                              toggleFavorite(activity.id);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.activityEmoji}>
                            {activity.id === "none" ? "⏱️" : activity.emoji}
                          </Text>
                          <Text
                            style={[
                              styles.activityItemLabel,
                              isFavorite && styles.activityItemLabelFavorite,
                            ]}
                          >
                            {activity.label}
                          </Text>
                          {isLocked && (
                            <View style={styles.premiumBadge}>
                              <Text style={styles.lockMini}>✨</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>

            {/* Divider avant À propos */}
            <View style={styles.levelDivider} />

            {/* 4. ℹ️ À propos (Flat) */}
            <View style={styles.sectionFlat}>
              <Text style={styles.sectionTitle}>ℹ️ À propos</Text>
              <View style={styles.optionRow}>
                <View>
                  <Text style={styles.optionLabel}>ResetPulse</Text>
                  <Text style={styles.optionDescription}>
                    Timer visuel personalisable
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { marginTop: theme.spacing.xs },
                    ]}
                  >
                    Version 1.1.5
                  </Text>
                </View>
              </View>

              {/* Relancer le guide - Available for all users */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => {
                  haptics.selection().catch(() => {});
                  // Reset l'onboarding complet (WelcomeScreen + tooltips)
                  resetOnboarding();
                  // Fermer le modal pour laisser le WelcomeScreen apparaître
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Relancer le guide</Text>
                  <Text style={styles.optionDescription}>
                    Afficher à nouveau l'écran de bienvenue et les conseils
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Dev Section - Only visible in development */}
            {__DEV__ && (
              <View style={styles.sectionFlat}>
                <Text style={styles.sectionTitle}>🔧 Développement</Text>
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    Alert.alert(
                      "Réinitialiser l'onboarding",
                      "L'écran de bienvenue et les tooltips seront affichés au prochain lancement de l'application.",
                      [
                        {
                          text: "Annuler",
                          style: "cancel",
                          onPress: () => {
                            haptics.selection().catch(() => {});
                          },
                        },
                        {
                          text: "Réinitialiser",
                          onPress: () => {
                            resetOnboarding();
                            haptics.success().catch(() => {});
                            onClose();
                          },
                          style: "destructive",
                        },
                      ]
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionLabel}>
                      Réinitialiser l'onboarding
                    </Text>
                    <Text style={styles.optionDescription}>
                      Afficher à nouveau l'écran de bienvenue
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        highlightedFeature="contenu premium"
      />
    </Modal>
  );
}
