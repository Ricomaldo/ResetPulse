// src/prototypes/OnboardingV2Prototype.jsx
// Prototype standalone - Funnel OnboardingV2 en 6 filtres

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Vibration,
} from "react-native";
import TimerDial from "../components/timer/TimerDial";

const { width, height } = Dimensions.get("window");

// ============================================
// RESPONSIVE SIZING (from app)
// ============================================
const BASE_WIDTH = 390;
const rs = (size) => Math.round((size * width) / BASE_WIDTH);

// ============================================
// SPACING TOKENS (Golden Ratio based)
// ============================================
const SPACING = {
  xs: 4,
  sm: 8,
  md: 13,
  lg: 21,
  xl: 34,
};

const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
};

// ============================================
// THÈME APP (dark mode)
// ============================================
const THEME = {
  background: "#1A1A1A",
  surface: "#2D2D2D",
  surfaceAlt: "#383838",
  text: "#FEFEFE",
  textSecondary: "#B8B8B8",
  textLight: "#8A8A8A",
  border: "#4A4A4A",
  primary: "#6B7A8A", // Gris-bleu (brand.primary dark)
  accent: "#B85A5A", // Rouge brique (brand.accent dark)
  success: "#48BB78",
};

// ============================================
// PALETTES TIMER
// ============================================
const PALETTES = {
  terre: {
    name: "Terre",
    colors: ["#8B7355", "#A0522D", "#6B8E23", "#CD853F"],
  },
  softLaser: {
    name: "Soft Laser",
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
  },
};

// ============================================
// SMART DEFAULTS selon needs
// ============================================
const getSmartDefaults = (needs) => {
  if (needs.includes("meditation")) {
    return { duration: 20, palette: "terre", colorIndex: 2 };
  }
  if (needs.includes("work")) {
    return { duration: 25, palette: "softLaser", colorIndex: 0 };
  }
  if (needs.includes("creativity")) {
    return { duration: 45, palette: "softLaser", colorIndex: 1 };
  }
  if (needs.includes("time")) {
    return { duration: 15, palette: "terre", colorIndex: 0 };
  }
  if (needs.includes("neurodivergent")) {
    return { duration: 25, palette: "softLaser", colorIndex: 0 };
  }
  return { duration: 15, palette: "terre", colorIndex: 0 };
};

// ============================================
// FILTRE 0 - Respiration
// ============================================
function Filter0Opening({ onContinue }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cycleCount = useRef(0);

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        cycleCount.current += 1;
        if (cycleCount.current < 5) {
          pulse();
        } else {
          // Auto-continue after 5 cycles
          onContinue();
        }
      });
    };
    pulse();
  }, []);

  return (
    <TouchableOpacity
      style={styles.fullScreen}
      onPress={onContinue}
      activeOpacity={1}
    >
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.breathingCircle,
            { transform: [{ scale: scaleAnim }] },
          ]}
        />
        <Text style={styles.breathingText}>
          Respire.{"\n"}Ton temps t'appartient.
        </Text>
        <Text style={styles.tapHint}>Touche pour continuer</Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// FILTRE 1 - Identification besoin
// ============================================
function Filter1Needs({ onContinue }) {
  const [selected, setSelected] = useState([]);

  const needs = [
    { id: "meditation", emoji: "🧘", label: "Méditation & Bien-être" },
    { id: "work", emoji: "💼", label: "Travail & Étude" },
    { id: "creativity", emoji: "🎨", label: "Créativité & Flow" },
    { id: "time", emoji: "⏱️", label: "Gestion du temps quotidien" },
    {
      id: "neurodivergent",
      emoji: "🧠",
      label: "Mon cerveau fonctionne différemment",
    },
  ];

  const toggleNeed = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    console.log("[OnboardingV2] Filter 1 → 2");
    console.log("[OnboardingV2] Selected needs:", selected);
    onContinue(selected);
  };

  const canContinue = selected.length > 0;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Pour quoi utiliser ResetPulse ?</Text>

        {needs.map((need) => {
          const isSelected = selected.includes(need.id);
          return (
            <TouchableOpacity
              key={need.id}
              style={[styles.needOption, isSelected && styles.needSelected]}
              onPress={() => toggleNeed(need.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.needEmoji}>{need.emoji}</Text>
              <Text
                style={[
                  styles.needLabel,
                  isSelected && styles.needLabelSelected,
                ]}
              >
                {need.label}
              </Text>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}

        <Text style={styles.helperText}>Sélectionne au moins une option</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text
            style={[
              styles.buttonText,
              !canContinue && styles.buttonTextDisabled,
            ]}
          >
            Continuer
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// FREE ACTIVITIES pour onboarding
// ============================================
const FREE_ACTIVITIES = [
  { id: "work", emoji: "💻", label: "Travail", defaultDuration: 25 },
  { id: "break", emoji: "☕", label: "Pause", defaultDuration: 15 },
  { id: "meditation", emoji: "🧘", label: "Méditation", defaultDuration: 20 },
  { id: "creativity", emoji: "🎨", label: "Créativité", defaultDuration: 45 },
];

// ============================================
// FILTRE 2 - Création moment
// ============================================
function Filter2Creation({ needs, onContinue }) {
  const defaults = getSmartDefaults(needs);

  // Sélection activité - méditation par défaut (recommandée)
  const [selectedActivity, setSelectedActivity] = useState(FREE_ACTIVITIES[2]); // meditation
  const [duration, setDuration] = useState(defaults.duration);
  const [palette, setPalette] = useState(defaults.palette);
  const [colorIndex, setColorIndex] = useState(defaults.colorIndex);

  const durations = [5, 10, 15, 20, 25, 30, 45, 60];
  const currentColors = PALETTES[palette].colors;
  const currentColor = currentColors[colorIndex];

  // Quand on change d'activité, mettre à jour la durée par défaut
  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    setDuration(activity.defaultDuration);
    Vibration.vibrate(10);
  };

  const handleContinue = () => {
    const config = {
      activity: selectedActivity,
      duration,
      palette,
      colorIndex,
      color: currentColor,
    };
    console.log("[OnboardingV2] Filter 2 → 3");
    console.log("[OnboardingV2] Timer config:", config);
    onContinue(config);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Crée ton premier moment</Text>

        {/* Preview avec TimerDial réel */}
        <View style={styles.previewContainer}>
          <TimerDial
            progress={1}
            duration={duration * 60}
            color={currentColor}
            size={rs(200)}
            scaleMode={duration > 25 ? "60min" : "25min"}
            activityEmoji={selectedActivity.emoji}
            isRunning={false}
            shouldPulse={false}
          />
        </View>

        {/* Activité */}
        <Text style={styles.sectionLabel}>Activité</Text>
        <View style={styles.activityRow}>
          {FREE_ACTIVITIES.map((activity) => {
            const isSelected = selectedActivity.id === activity.id;
            return (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityPill,
                  isSelected && [
                    styles.activityPillSelected,
                    { backgroundColor: currentColor },
                  ],
                ]}
                onPress={() => handleActivitySelect(activity)}
                activeOpacity={0.7}
              >
                <Text style={styles.activityPillEmoji}>{activity.emoji}</Text>
                <Text
                  style={[
                    styles.activityPillLabel,
                    isSelected && styles.activityPillLabelSelected,
                  ]}
                >
                  {activity.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Durée */}
        <Text style={styles.sectionLabel}>Durée</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {durations.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.durationChip,
                duration === d && styles.durationChipSelected,
              ]}
              onPress={() => setDuration(d)}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === d && styles.durationTextSelected,
                ]}
              >
                {d} min
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Palette */}
        <Text style={styles.sectionLabel}>Palette</Text>
        <View style={styles.paletteRow}>
          {Object.entries(PALETTES).map(([key, pal]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.paletteButton,
                palette === key && styles.paletteSelected,
              ]}
              onPress={() => {
                setPalette(key);
                setColorIndex(0);
              }}
            >
              <View style={styles.palettePreview}>
                {pal.colors.map((c, i) => (
                  <View
                    key={i}
                    style={[styles.paletteDot, { backgroundColor: c }]}
                  />
                ))}
              </View>
              <Text
                style={[
                  styles.paletteName,
                  palette === key && styles.paletteNameSelected,
                ]}
              >
                {pal.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Couleur */}
        <Text style={styles.sectionLabel}>Couleur</Text>
        <View style={styles.colorRow}>
          {currentColors.map((c, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                colorIndex === i && styles.colorDotSelected,
              ]}
              onPress={() => setColorIndex(i)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Créer mon moment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// FILTRE 3 - Test expérience (60 sec)
// ============================================
function Filter3Test({ timerConfig, onContinue }) {
  const [progress, setProgress] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [started, setStarted] = useState(false);
  const startTime = useRef(null);
  const vibrated30 = useRef(false);

  useEffect(() => {
    // Auto-start
    setStarted(true);
  }, []);

  useEffect(() => {
    if (!started) return;
    startTime.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const remaining = Math.max(0, 60 - elapsed);
      const currentSecond = Math.ceil(remaining);

      setProgress(remaining / 60);
      setSecondsLeft(currentSecond);

      // Vibration à 30 sec (une seule fois)
      if (currentSecond <= 30 && !vibrated30.current) {
        vibrated30.current = true;
        Vibration.vibrate(200);
      }

      if (remaining <= 0) {
        clearInterval(interval);
        Vibration.vibrate(500);
        setTimeout(() => onContinue(), 1000);
      }
    }, 50); // 20 fps = fluide

    return () => clearInterval(interval);
  }, [started, onContinue]);

  const color = timerConfig?.color || "#4ECDC4";
  const emoji = timerConfig?.activity?.emoji || "🧘";

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Teste ton moment</Text>
        <Text style={styles.subtitle}>
          60 secondes pour découvrir l'expérience
        </Text>

        <View style={styles.testDialContainer}>
          <TimerDial
            progress={progress}
            duration={60}
            color={color}
            size={rs(240)}
            scaleMode="1min"
            activityEmoji={emoji}
            isRunning={started}
            shouldPulse={true}
            currentActivity={timerConfig?.activity}
          />
        </View>

        <Text style={styles.testHint}>
          {secondsLeft > 30 ? "Respire..." : "Tu y es presque..."}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// FILTRE 4 - Vision aspirationnelle
// ============================================
const getJourneyScenarios = (needs = []) => {
  // Journée type en 4 moments, adaptée selon les needs
  const hasMeditation = needs.includes("meditation");
  const hasWork = needs.includes("work");
  const hasCreativity = needs.includes("creativity");
  const hasNeuro = needs.includes("neurodivergent");

  return [
    {
      emoji: "🌅",
      label: "Matin",
      sublabel: hasMeditation ? "Méditation 20min" : hasNeuro ? "Ancrage 5min" : "Réveil en douceur 10min",
      color: "#6B8E23",
    },
    {
      emoji: "💼",
      label: "Journée",
      sublabel: hasWork ? "Focus Pomodoro 25min" : hasNeuro ? "Sprints courts 15min" : "Concentration 30min",
      color: "#FF6B6B",
    },
    {
      emoji: "☕",
      label: "Pause",
      sublabel: hasNeuro ? "Reset sensoriel 5min" : "Déconnexion 15min",
      color: "#8B7355",
    },
    {
      emoji: "🌙",
      label: "Soir",
      sublabel: hasCreativity ? "Créativité libre 45min" : hasMeditation ? "Relaxation 15min" : "Décompression 20min",
      color: "#4ECDC4",
    },
  ];
};

function Filter4Vision({ needs = [], onContinue }) {
  const scenarios = getJourneyScenarios(needs);

  const handleContinue = () => {
    console.log("[OnboardingV2] Filter 4 → 5");
    onContinue();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Imagine tes journées avec ResetPulse</Text>

        {scenarios.map((s, i) => (
          <View key={i} style={styles.scenarioCard}>
            <Text style={styles.scenarioEmoji}>{s.emoji}</Text>
            <View style={styles.scenarioText}>
              <Text style={styles.scenarioLabel}>{s.label}</Text>
              <Text style={styles.scenarioSublabel}>{s.sublabel}</Text>
            </View>
            <View style={[styles.scenarioCircle, { borderColor: s.color }]} />
          </View>
        ))}

        <Text style={styles.tagline}>
          Chaque moment, sa couleur.{"\n"}Chaque activité, son rythme.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Créer plus de moments</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// FILTRE 5 - Paywall (maquette)
// ============================================
function Filter5Paywall({ onComplete }) {
  const handleTrial = () => {
    console.log("[OnboardingV2] Trial started");
    console.log("[OnboardingV2] ONBOARDING COMPLETE");
    onComplete("trial");
  };

  const handleSkip = () => {
    console.log("[OnboardingV2] Paywall skipped");
    console.log("[OnboardingV2] ONBOARDING COMPLETE");
    onComplete("skipped");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Débloque tout</Text>

        <View style={styles.paywallFeatures}>
          <Text style={styles.paywallFeature}>Toutes les couleurs.</Text>
          <Text style={styles.paywallFeature}>Toutes les activités.</Text>
          <Text style={styles.paywallFeature}>Ton confort maximum.</Text>
        </View>

        <View style={styles.paywallBox}>
          <Text style={styles.paywallGift}>🎁 7 JOURS GRATUITS</Text>
          <Text style={styles.paywallPrice}>
            Puis 4,99€ une fois — à toi pour toujours.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleTrial}>
          <Text style={styles.buttonText}>Essayer 7 jours gratuits</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Peut-être plus tard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// ÉCRAN FIN PROTOTYPE
// ============================================
function PrototypeComplete({ result, onReset }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.centerContent}>
        <Text style={styles.completeEmoji}>🎉</Text>
        <Text style={styles.title}>Prototype terminé !</Text>
        <Text style={styles.completeResult}>
          Résultat: {result === "trial" ? "Trial démarré" : "Paywall skip"}
        </Text>

        <TouchableOpacity style={styles.button} onPress={onReset}>
          <Text style={styles.buttonText}>Recommencer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function OnboardingV2Prototype() {
  const [currentFilter, setCurrentFilter] = useState(0);
  const [needs, setNeeds] = useState([]);
  const [timerConfig, setTimerConfig] = useState({});
  const [paywallResult, setPaywallResult] = useState(null);

  const goToNextFilter = () => {
    console.log(
      `[OnboardingV2] Filter ${currentFilter} → ${currentFilter + 1}`
    );
    setCurrentFilter((prev) => prev + 1);
  };

  const jumpToFilter = (n) => {
    console.log(`[OnboardingV2] Jump to filter ${n}`);
    setCurrentFilter(n);
  };

  const reset = () => {
    console.log("[OnboardingV2] RESET");
    setCurrentFilter(0);
    setNeeds([]);
    setTimerConfig({});
    setPaywallResult(null);
  };

  // DEV buttons
  const DevButtons = () => (
    <View style={styles.devBar}>
      <View style={styles.devRow}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.devButton,
              currentFilter === n && styles.devButtonActive,
            ]}
            onPress={() => jumpToFilter(n)}
          >
            <Text style={styles.devButtonText}>{n}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.devResetButton} onPress={reset}>
          <Text style={styles.devButtonText}>↺</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilter = () => {
    switch (currentFilter) {
      case 0:
        return <Filter0Opening onContinue={goToNextFilter} />;
      case 1:
        return (
          <Filter1Needs
            onContinue={(selectedNeeds) => {
              setNeeds(selectedNeeds);
              goToNextFilter();
            }}
          />
        );
      case 2:
        return (
          <Filter2Creation
            needs={needs}
            onContinue={(config) => {
              setTimerConfig(config);
              goToNextFilter();
            }}
          />
        );
      case 3:
        return (
          <Filter3Test timerConfig={timerConfig} onContinue={goToNextFilter} />
        );
      case 4:
        return <Filter4Vision needs={needs} onContinue={goToNextFilter} />;
      case 5:
        return (
          <Filter5Paywall
            onComplete={(result) => {
              setPaywallResult(result);
              setCurrentFilter(6);
            }}
          />
        );
      case 6:
        return <PrototypeComplete result={paywallResult} onReset={reset} />;
      default:
        return <Filter0Opening onContinue={goToNextFilter} />;
    }
  };

  return (
    <View style={styles.container}>
      {__DEV__ && <DevButtons />}
      {renderFilter()}
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  screen: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rs(SPACING.lg),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: rs(SPACING.lg),
    paddingTop: rs(SPACING.lg),
    paddingBottom: rs(120),
  },

  // Dev bar
  devBar: {
    backgroundColor: THEME.surface,
    paddingTop: 50,
    paddingBottom: rs(SPACING.sm),
    paddingHorizontal: rs(SPACING.md),
  },
  devRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: rs(SPACING.sm),
  },
  devButton: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: THEME.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  devButtonActive: {
    backgroundColor: THEME.primary,
  },
  devResetButton: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: THEME.accent,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: rs(SPACING.md),
  },
  devButtonText: {
    color: THEME.text,
    fontSize: rs(14),
    fontWeight: "600",
  },
  devInfo: {
    color: THEME.textLight,
    fontSize: rs(11),
    textAlign: "center",
    marginTop: rs(SPACING.xs),
  },

  // Filter 0 - Breathing
  breathingCircle: {
    width: rs(160),
    height: rs(160),
    borderRadius: rs(80),
    backgroundColor: THEME.primary,
    marginBottom: rs(SPACING.xl),
  },
  breathingText: {
    fontSize: rs(26),
    color: THEME.text,
    textAlign: "center",
    lineHeight: rs(38),
    fontWeight: "300",
  },
  tapHint: {
    position: "absolute",
    bottom: rs(100),
    color: THEME.textLight,
    fontSize: rs(14),
  },

  // Common
  title: {
    fontSize: rs(28),
    fontWeight: "600",
    color: THEME.text,
    textAlign: "center",
    marginBottom: rs(SPACING.lg),
  },
  subtitle: {
    fontSize: rs(16),
    color: THEME.textSecondary,
    textAlign: "center",
    marginBottom: rs(SPACING.xl),
  },
  sectionLabel: {
    fontSize: rs(14),
    color: THEME.textSecondary,
    marginTop: rs(SPACING.lg),
    marginBottom: rs(SPACING.md),
    fontWeight: "500",
  },
  helperText: {
    fontSize: rs(14),
    color: THEME.textLight,
    textAlign: "center",
    marginTop: rs(SPACING.lg),
  },

  // Filter 1 - Needs
  needOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: rs(SPACING.md),
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
    marginBottom: rs(SPACING.md),
  },
  needSelected: {
    borderColor: THEME.primary,
    backgroundColor: THEME.surfaceAlt,
  },
  needEmoji: {
    fontSize: rs(26),
    marginRight: rs(SPACING.md),
  },
  needLabel: {
    flex: 1,
    fontSize: rs(16),
    color: THEME.text,
  },
  needLabelSelected: {
    color: THEME.text,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: rs(20),
    color: THEME.success,
    fontWeight: "700",
  },

  // Filter 2 - Creation
  previewContainer: {
    alignItems: "center",
    marginBottom: rs(SPACING.md),
  },
  previewCircle: {
    width: rs(180),
    height: rs(180),
    borderRadius: rs(90),
    borderWidth: rs(10),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.surface,
  },
  previewEmoji: {
    fontSize: rs(42),
    marginBottom: rs(SPACING.xs),
  },
  previewTime: {
    fontSize: rs(28),
    color: THEME.text,
    fontWeight: "300",
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: rs(SPACING.md),
    gap: rs(SPACING.sm),
  },
  activityPill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rs(SPACING.md),
    paddingHorizontal: rs(SPACING.sm),
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 2,
    borderColor: THEME.border,
  },
  activityPillSelected: {
    borderColor: "transparent",
  },
  activityPillEmoji: {
    fontSize: rs(28),
    marginBottom: rs(SPACING.xs),
  },
  activityPillLabel: {
    fontSize: rs(11),
    color: THEME.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  activityPillLabelSelected: {
    color: THEME.background,
    fontWeight: "600",
  },
  horizontalScroll: {
    marginBottom: rs(SPACING.sm),
  },
  durationChip: {
    paddingHorizontal: rs(SPACING.lg),
    paddingVertical: rs(SPACING.md),
    borderRadius: RADIUS.xxl,
    backgroundColor: THEME.surface,
    marginRight: rs(SPACING.sm),
  },
  durationChipSelected: {
    backgroundColor: THEME.primary,
  },
  durationText: {
    color: THEME.textSecondary,
    fontSize: rs(15),
    fontWeight: "500",
  },
  durationTextSelected: {
    color: THEME.text,
    fontWeight: "600",
  },
  paletteRow: {
    flexDirection: "row",
    gap: rs(SPACING.md),
  },
  paletteButton: {
    flex: 1,
    padding: rs(SPACING.md),
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: THEME.border,
    alignItems: "center",
  },
  paletteSelected: {
    borderColor: THEME.primary,
    backgroundColor: THEME.surfaceAlt,
  },
  palettePreview: {
    flexDirection: "row",
    gap: rs(SPACING.xs),
    marginBottom: rs(SPACING.sm),
  },
  paletteDot: {
    width: rs(16),
    height: rs(16),
    borderRadius: rs(8),
  },
  paletteName: {
    color: THEME.textSecondary,
    fontSize: rs(13),
  },
  paletteNameSelected: {
    color: THEME.text,
    fontWeight: "600",
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: rs(SPACING.lg),
  },
  colorDot: {
    width: rs(52),
    height: rs(52),
    borderRadius: rs(26),
  },
  colorDotSelected: {
    borderWidth: 4,
    borderColor: THEME.text,
  },

  // Filter 3 - Test
  testDialContainer: {
    marginVertical: rs(SPACING.xl),
    alignItems: "center",
  },
  digitalTimerWrapper: {
    marginBottom: rs(SPACING.lg),
  },
  testHint: {
    fontSize: rs(18),
    color: THEME.textSecondary,
    fontStyle: "italic",
  },

  // Filter 4 - Vision
  scenarioCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: rs(SPACING.md),
    backgroundColor: THEME.surface,
    borderRadius: RADIUS.xl,
    marginBottom: rs(SPACING.md),
  },
  scenarioEmoji: {
    fontSize: rs(32),
    marginRight: rs(SPACING.md),
  },
  scenarioText: {
    flex: 1,
  },
  scenarioLabel: {
    fontSize: rs(17),
    color: THEME.text,
    fontWeight: "600",
  },
  scenarioSublabel: {
    fontSize: rs(14),
    color: THEME.textSecondary,
    marginTop: 2,
  },
  scenarioCircle: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    borderWidth: rs(5),
    backgroundColor: THEME.surface,
  },
  tagline: {
    fontSize: rs(17),
    color: THEME.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: rs(SPACING.xl),
    lineHeight: rs(26),
  },

  // Filter 5 - Paywall
  paywallFeatures: {
    marginVertical: rs(SPACING.xl),
  },
  paywallFeature: {
    fontSize: rs(20),
    color: THEME.textSecondary,
    textAlign: "center",
    marginBottom: rs(SPACING.md),
  },
  paywallBox: {
    backgroundColor: THEME.surfaceAlt,
    borderRadius: RADIUS.xxl,
    padding: rs(SPACING.lg),
    marginBottom: rs(SPACING.xl),
    borderWidth: 2,
    borderColor: THEME.primary,
    alignItems: "center",
  },
  paywallGift: {
    fontSize: rs(22),
    color: THEME.success,
    fontWeight: "700",
    marginBottom: rs(SPACING.sm),
  },
  paywallPrice: {
    fontSize: rs(15),
    color: THEME.textSecondary,
    textAlign: "center",
  },
  skipButton: {
    marginTop: rs(SPACING.lg),
    padding: rs(SPACING.md),
  },
  skipText: {
    color: THEME.textLight,
    fontSize: rs(15),
  },

  // Complete screen
  completeEmoji: {
    fontSize: rs(64),
    marginBottom: rs(SPACING.lg),
  },
  completeResult: {
    fontSize: rs(16),
    color: THEME.textSecondary,
    marginBottom: rs(SPACING.xl),
  },

  // Footer & Button
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: rs(SPACING.lg),
    paddingBottom: rs(40),
    backgroundColor: THEME.background,
  },
  button: {
    backgroundColor: THEME.primary,
    paddingVertical: rs(SPACING.md),
    paddingHorizontal: rs(SPACING.xl),
    borderRadius: RADIUS.xl,
    alignItems: "center",
    minWidth: rs(200),
  },
  buttonDisabled: {
    backgroundColor: THEME.border,
  },
  buttonText: {
    color: THEME.text,
    fontSize: rs(18),
    fontWeight: "600",
  },
  buttonTextDisabled: {
    color: THEME.textLight,
  },
});
