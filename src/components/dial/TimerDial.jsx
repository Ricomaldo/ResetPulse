/**
 * @fileoverview Timer dial component with drag/tap interaction
 * Orchestrates dial sub-components for visual timer display
 * @created 2025-12-14
 * @updated 2025-12-19 - Migrated from PanResponder to Gesture API (RNGH v2)
 */
import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useDialOrientation } from '../../hooks/useDialOrientation';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import {
  TIMER_SVG,
  TIMER_PROPORTIONS,
  TIMER_VISUAL,
  COLORS,
  getDialMode,
  DRAG,
  DIAL_LAYOUT,
} from './timerConstants';

/**
 * Quadratic ease-out for natural deceleration during drag
 * @param {number} t - Progress value 0-1
 * @returns {number} Eased value
 */
const easeOut = (t) => t * (2 - t);

// Import modular components
import DialBase from './dial/DialBase';
import DialProgress from './dial/DialProgress';
import DialGraduations from './dial/DialGraduations';
import DialCenter from './dial/DialCenter';
import Svg, { Circle, Line } from 'react-native-svg';

/**
 * TimerDial - Main timer dial component
 * Orchestrates all dial sub-components
 */
function TimerDial({
  progress = 1,
  duration = 0,
  remaining = 0,
  color,
  size = null,
  clockwise = false,
  scaleMode = '60min',
  activityEmoji: _activityEmoji = null, // Legacy prop, now using currentActivity.emoji
  isRunning = false,
  showActivityEmoji = true,
  onGraduationTap = null,
  onDialTap = null,
  onDialLongPress = null,
  isCompleted = false,
  currentActivity = null,
  showNumbers = true,
  showGraduations = true,
  showPlayButton = true,
  showCenterDisk = false,
  centerImage = null,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const [isDragging, setIsDragging] = useState(false);

  // === HINT ANIMATION (fade-in/pulse on mount) ===
  const hintOpacity = useSharedValue(0);
  const [hintAnimationDone, setHintAnimationDone] = useState(false);

  useEffect(() => {
    // Animate handle on mount: fade-in → pulse → settle
    hintOpacity.value = withSequence(
      // Fade in
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
      // Pulse (2x)
      withDelay(100, withTiming(0.4, { duration: 300, easing: Easing.inOut(Easing.ease) })),
      withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
      withTiming(0.4, { duration: 300, easing: Easing.inOut(Easing.ease) }),
      withTiming(0.7, { duration: 300, easing: Easing.out(Easing.ease) })
    );
    // Mark animation as done after total duration (~1.7s)
    const timer = setTimeout(() => setHintAnimationDone(true), 1700);
    return () => clearTimeout(timer);
  }, [hintOpacity]);

  const handleHintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  // === SMOOTH GRADUATION TAP ANIMATION ===
  // Pre-calc scaled progress (needed early for animation)
  const maxMinutesForScale = getDialMode(scaleMode).maxMinutes;
  const currentMinutesForScale = duration / 60;
  const targetProgress = Math.min(1, currentMinutesForScale / maxMinutesForScale) * progress;

  // Shared value for animating progress on graduation taps
  const animatedProgress = useSharedValue(targetProgress);
  const [displayProgress, setDisplayProgress] = useState(targetProgress);

  // Animate progress when graduation is tapped (not running, not dragging)
  useEffect(() => {
    if (!isRunning && !isDragging) {
      // Graduation tap or external change - animate smoothly
      // Using ease-in-out for natural, unhurried motion
      animatedProgress.value = withTiming(targetProgress, {
        duration: 300,
        easing: Easing.inOut(Easing.quad),
      });
    } else {
      // Running timer or dragging - instant update
      animatedProgress.value = targetProgress;
    }
  }, [targetProgress, isRunning, isDragging]);

  // Sync animated value to JS state for rendering
  useAnimatedReaction(
    () => animatedProgress.value,
    (value) => {
      runOnJS(setDisplayProgress)(value);
    },
    [animatedProgress]
  );

  // Use centralized dial orientation logic
  const dial = useDialOrientation(clockwise, scaleMode);

  // Calculate responsive sizes
  const circleSize = size || rs(280, 'min');
  const svgSize = circleSize + TIMER_SVG.PADDING;
  const radiusOuter = circleSize / 2; // Radius for graduations (outer)
  const radiusBackground = radiusOuter - DIAL_LAYOUT.BACKGROUND_OFFSET; // Cercle blanc (laisse espace pour graduations)
  const strokeWidth = TIMER_SVG.STROKE_WIDTH;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Track previous minutes for wrap-around prevention
  const lastMinutesRef = useRef(null);
  // Track the offset between touch position and actual timer value
  const dragOffsetRef = useRef(0);
  // Track the last touch position to detect wrap-around
  const lastTouchMinutesRef = useRef(null);
  // Track timestamp for velocity calculation
  const lastMoveTimeRef = useRef(null);

  // Get graduation marks and numbers from centralized logic
  const graduationMarks = useMemo(() => {
    const marks = dial.getGraduationMarks(radiusBackground, centerX, centerY); // Sur le cercle blanc
    return marks.map((mark) => ({
      ...mark,
      strokeWidth: mark.isMajor ? TIMER_VISUAL.TICK_WIDTH_MAJOR : TIMER_VISUAL.TICK_WIDTH_MINOR,
      opacity: mark.isMajor ? TIMER_VISUAL.TICK_OPACITY_MAJOR : TIMER_VISUAL.TICK_OPACITY_MINOR,
    }));
  }, [dial, radiusBackground, centerX, centerY]);

  const minuteNumbers = useMemo(() => {
    const numberRadius = radiusBackground + TIMER_PROPORTIONS.NUMBER_RADIUS; // À l'extérieur du cercle blanc
    const positions = dial.getNumberPositions(numberRadius, centerX, centerY);
    return positions.map((pos, index) => ({
      key: `num-${index}`,
      x: pos.x,
      y: pos.y,
      minute: pos.value,
      fontSize: Math.max(
        TIMER_PROPORTIONS.MIN_NUMBER_FONT,
        circleSize * TIMER_PROPORTIONS.NUMBER_FONT_RATIO
      ),
    }));
  }, [dial, radiusBackground, centerX, centerY, circleSize]);

  // Calculate center zone for gesture exclusion
  const centerZoneRadius = radiusBackground * DIAL_LAYOUT.CENTER_ZONE_RATIO;
  const outerZoneMinRadius = radiusBackground * DIAL_LAYOUT.OUTER_ZONE_MIN_RATIO;

  // === JS CALLBACKS (called from worklets via runOnJS) ===
  // All gesture logic runs on JS thread because dial methods require JS

  // Handler for pan gesture start
  const handlePanStart = useCallback((touchX, touchY) => {
    const distanceFromCenter = Math.sqrt(
      Math.pow(touchX - centerX, 2) + Math.pow(touchY - centerY, 2)
    );

    // Ignore touches in center zone (let PulseButton handle them)
    if (distanceFromCenter <= centerZoneRadius) {
      return false;
    }

    setIsDragging(true);

    // Calculate where the user touched
    const touchMinutes = dial.coordinatesToMinutes(touchX, touchY, centerX, centerY);
    const currentMinutesValue = duration / 60;

    // Store references for drag tracking
    dragOffsetRef.current = currentMinutesValue - touchMinutes;
    lastMinutesRef.current = currentMinutesValue;
    lastTouchMinutesRef.current = touchMinutes;
    lastMoveTimeRef.current = Date.now();

    return true;
  }, [dial, duration, centerX, centerY, centerZoneRadius]);

  // Handler for pan gesture update (must be in JS thread for dial methods)
  const handlePanUpdate = useCallback((touchX, touchY) => {
    // Calculate where the user is touching now
    const touchMinutes = dial.coordinatesToMinutes(touchX, touchY, centerX, centerY);
    const maxMinutes = dial.maxMinutes;

    // Check if touch position wrapped around
    let touchDelta = 0;
    if (lastTouchMinutesRef.current !== null) {
      touchDelta = touchMinutes - lastTouchMinutesRef.current;

      // If touch jumped more than half the dial, it wrapped
      if (Math.abs(touchDelta) > maxMinutes / 2) {
        if (touchDelta > 0) {
          touchDelta = touchDelta - maxMinutes;
        } else {
          touchDelta = touchDelta + maxMinutes;
        }
      }
    }

    // Calculate velocity for dynamic resistance
    const now = Date.now();
    const deltaTime = Math.max(1, now - (lastMoveTimeRef.current || now));
    const velocity = Math.abs(touchDelta) / (deltaTime / 1000);

    // Apply dynamic resistance based on velocity
    const velocityFactor = Math.min(1, velocity / DRAG.VELOCITY_THRESHOLD);
    const dynamicResistance = DRAG.BASE_RESISTANCE - velocityFactor * DRAG.VELOCITY_REDUCTION;

    // Apply ease-out curve for natural deceleration
    const easedResistance = DRAG.BASE_RESISTANCE * easeOut(dynamicResistance / DRAG.BASE_RESISTANCE);
    const resistedDelta = touchDelta * easedResistance;

    // Update time reference
    lastMoveTimeRef.current = now;

    // Calculate new value based on last value plus resisted delta
    let newMinutes = lastMinutesRef.current + resistedDelta;
    newMinutes = Math.max(0, Math.min(maxMinutes, newMinutes));

    // Update the timer with smooth position (no snap during drag)
    onGraduationTap?.(newMinutes, false);

    // Update references
    lastMinutesRef.current = newMinutes;
    lastTouchMinutesRef.current = touchMinutes;
    dragOffsetRef.current = newMinutes - touchMinutes;
  }, [dial, centerX, centerY, onGraduationTap]);

  // Handler for pan gesture end
  const handlePanEnd = useCallback(() => {
    // Apply snap on release
    if (lastMinutesRef.current !== null) {
      onGraduationTap?.(lastMinutesRef.current, true);
    }
    setIsDragging(false);
    lastMinutesRef.current = null;
    lastTouchMinutesRef.current = null;
    lastMoveTimeRef.current = null;
    dragOffsetRef.current = 0;
  }, [onGraduationTap]);

  // Handler for tap on graduations
  const handleTapOnGraduation = useCallback((tapX, tapY) => {
    const distanceFromCenter = Math.sqrt(
      Math.pow(tapX - centerX, 2) + Math.pow(tapY - centerY, 2)
    );

    // Only handle taps on graduation zone (outer ring)
    if (distanceFromCenter > outerZoneMinRadius && onGraduationTap) {
      const tappedMinutes = dial.coordinatesToMinutes(tapX, tapY, centerX, centerY);
      onGraduationTap(tappedMinutes, true);
    }
  }, [dial, centerX, centerY, outerZoneMinRadius, onGraduationTap]);

  // === GESTURE: Pan (Drag to adjust duration) ===
  // All logic runs on JS thread via runOnJS (dial methods require JS)

  const panGesture = useMemo(() =>
    Gesture.Pan()
      .minDistance(10) // Minimum distance to start pan (differentiates from tap)
      .onStart((event) => {
        'worklet';
        runOnJS(handlePanStart)(event.x, event.y);
      })
      .onUpdate((event) => {
        'worklet';
        runOnJS(handlePanUpdate)(event.x, event.y);
      })
      .onEnd(() => {
        'worklet';
        runOnJS(handlePanEnd)();
      })
      .onFinalize(() => {
        'worklet';
        runOnJS(handlePanEnd)();
      }),
  [handlePanStart, handlePanUpdate, handlePanEnd]
  );

  // === GESTURE: Tap (on graduations to set duration) ===

  const tapGesture = useMemo(() =>
    Gesture.Tap()
      .maxDuration(200) // Quick tap only
      .onEnd((event) => {
        'worklet';
        runOnJS(handleTapOnGraduation)(event.x, event.y);
      }),
  [handleTapOnGraduation]
  );

  // === COMPOSED GESTURE ===
  // Race: First gesture to activate wins, others are cancelled
  const composedGesture = useMemo(() =>
    Gesture.Race(panGesture, tapGesture),
  [panGesture, tapGesture]
  );

  // Use provided color or default energy color
  const arcColor = color || theme.colors.energy;

  // Calculate accessibility information
  const durationMinutes = Math.round(duration / 60);
  const activityName = currentActivity?.label || t('activities.none');

  // Build accessibility label
  const dialAccessibilityLabel = t('accessibility.timer.dial', {
    minutes: durationMinutes,
    activity: activityName,
  });

  // Build accessibility hint
  const dialAccessibilityHint = isRunning
    ? t('accessibility.timer.dialTapToToggle')
    : t('accessibility.timer.dialAdjustable') + ' ' + t('accessibility.timer.dialTapToToggle');

  // isZeroState uses displayProgress for animation-aware rendering
  const isZeroState = !isRunning && remaining === 0;

  // Compute handle segment position on the edge of the progress arc
  // Uses displayProgress for smooth animation on graduation taps
  const handleAngleDeg = displayProgress * 360;
  const handleAngleRad = (handleAngleDeg * Math.PI) / 180;

  // Handle segment: small radial line on the arc edge (parallel to radius)
  // Positioned at the progress endpoint, within the arc thickness
  const arcOuterRadius = radiusBackground; // Outer edge of arc
  const arcInnerRadius = radiusBackground * 0.4; // Inner edge (roughly where arc ends toward center)
  const segmentLength = rs(12); // Small segment within arc thickness

  // Direction vector (radial - pointing outward from center)
  const radialX = clockwise ? Math.sin(handleAngleRad) : -Math.sin(handleAngleRad);
  const radialY = -Math.cos(handleAngleRad);

  // Segment from inner to outer edge of the arc (or partial)
  const handleInnerRadius = arcOuterRadius - segmentLength;
  const handleX1 = centerX + radialX * handleInnerRadius;
  const handleY1 = centerY + radialY * handleInnerRadius;
  const handleX2 = centerX + radialX * arcOuterRadius;
  const handleY2 = centerY + radialY * arcOuterRadius;

  // Static styles (moved outside render for performance)
  const staticStyles = StyleSheet.create({
    absoluteOverlay: {
      position: 'absolute',
    },
    root: {
      alignItems: 'center',
    },
  });

  // Dynamic style memoized
  const svgContainerStyle = useMemo(
    () => ({
      alignItems: 'center',
      height: svgSize,
      justifyContent: 'center',
      width: svgSize,
    }),
    [svgSize]
  );

  return (
    <View style={staticStyles.root}>
      <GestureDetector gesture={composedGesture}>
        <View
          style={svgContainerStyle}
          accessible={true}
          accessibilityRole={isRunning ? 'timer' : 'adjustable'}
          accessibilityLabel={dialAccessibilityLabel}
          accessibilityHint={dialAccessibilityHint}
          accessibilityValue={{
            min: 0,
            max: getDialMode(scaleMode).maxMinutes,
            now: durationMinutes,
            text: `${durationMinutes} minutes`,
          }}
          accessibilityActions={
            !isRunning
              ? [
                { name: 'increment', label: 'Increase duration' },
                { name: 'decrement', label: 'Decrease duration' },
                { name: 'activate', label: 'Start timer' },
              ]
              : [{ name: 'activate', label: 'Pause timer' }]
          }
          onAccessibilityAction={(event) => {
            const { actionName } = event.nativeEvent;
            if (actionName === 'increment' && onGraduationTap && !isRunning) {
              const newDuration = Math.min(duration + 60, getDialMode(scaleMode).maxMinutes * 60);
              onGraduationTap(newDuration / 60, true);
            } else if (actionName === 'decrement' && onGraduationTap && !isRunning) {
              const newDuration = Math.max(0, duration - 60);
              onGraduationTap(newDuration / 60, true);
            } else if (actionName === 'activate' && onDialTap) {
              onDialTap();
            }
          }}
        >
          {/* Base layer: static elements (background circle + numbers) */}
          <DialBase
            svgSize={svgSize}
            centerX={centerX}
            centerY={centerY}
            radius={radiusBackground}
            strokeWidth={strokeWidth}
            minuteNumbers={minuteNumbers}
            showNumbers={showNumbers}
            color={color}
          />

          {/* Progress layer: animated arc */}
          {/* Uses displayProgress for smooth graduation tap animation */}
          <DialProgress
            svgSize={svgSize}
            centerX={centerX}
            centerY={centerY}
            outerRadius={radiusBackground}
            strokeWidth={strokeWidth}
            progress={displayProgress}
            color={arcColor}
            isClockwise={clockwise}
            scaleMode={scaleMode}
            animatedColor={isCompleted ? COLORS.COMPLETION_GREEN : null}
            isRunning={isRunning}
          />

          {/* Graduation marks overlay: rendered above progress arc */}
          <DialGraduations
            svgSize={svgSize}
            graduationMarks={graduationMarks}
            showGraduations={showGraduations}
          />

          {/* Zero-state radial segment from center to 12 o'clock (visual cue) */}
          {isZeroState && (
            <Svg
              width={svgSize}
              height={svgSize}
              style={staticStyles.absoluteOverlay}
              pointerEvents="none"
              accessible={false}
              importantForAccessibility="no"
            >
              <Line
                x1={centerX}
                y1={centerY}
                x2={centerX}
                y2={centerY - radiusBackground}
                stroke={theme.colors.textSecondary}
                strokeOpacity={0.5}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          )}

          {/* Drag handle: small radial segment on the arc edge */}
          {/* Same color as arc but darker for contrast */}
          {!isRunning && displayProgress > 0 && (
            <Animated.View
              style={[
                staticStyles.absoluteOverlay,
                !hintAnimationDone && handleHintStyle,
              ]}
              pointerEvents="none"
            >
              <Svg
                width={svgSize}
                height={svgSize}
                accessible={false}
                importantForAccessibility="no"
              >
                {/* Small radial segment within arc thickness - deep color */}
                <Line
                  x1={handleX1}
                  y1={handleY1}
                  x2={handleX2}
                  y2={handleY2}
                  stroke={theme.colors.brand.deep}
                  strokeWidth={isDragging ? 6 : 5}
                  strokeLinecap="round"
                  opacity={isDragging ? 1 : 0.85}
                />
              </Svg>
            </Animated.View>
          )}

          {/* Physical fixation dots - hide when PulseButton is displayed */}
          {(showActivityEmoji || isRunning) && (
            <Svg
              width={svgSize}
              height={svgSize}
              style={staticStyles.absoluteOverlay}
              pointerEvents="none"
              accessible={false}
              importantForAccessibility="no"
            >
              <Circle
                cx={centerX}
                cy={centerY}
                r={radiusBackground * 0.08}
                fill={theme.colors.neutral}
                opacity={0.8}
              />
              <Circle
                cx={centerX}
                cy={centerY}
                r={radiusBackground * 0.04}
                fill={theme.colors.text}
                opacity={0.4}
              />
            </Svg>
          )}

          {/* Center layer: PulseButton (ADR-007) */}
          {showPlayButton && (
            <DialCenter
              activity={showActivityEmoji ? currentActivity : null}
              isRunning={isRunning}
              isCompleted={isCompleted}
              onTap={onDialTap}
              onLongPressComplete={onDialLongPress}
              clockwise={clockwise}
              size={circleSize * 0.25}
            />
          )}

          {/* Empty center disk for preview (no button, no emoji) */}
          {!showPlayButton && showCenterDisk && !centerImage && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={svgSize} height={svgSize}>
                <Circle
                  cx={centerX}
                  cy={centerY}
                  r={circleSize * 0.125}
                  fill={theme.colors.surface}
                  opacity={1}
                />
              </Svg>
            </View>
          )}

          {/* Center image for preview (logo) */}
          {!showPlayButton && centerImage && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View
                style={{
                  position: 'absolute',
                  top: centerY - (circleSize * 0.125),
                  left: centerX - (circleSize * 0.125),
                  width: circleSize * 0.25,
                  height: circleSize * 0.25,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={centerImage}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain',
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

TimerDial.propTypes = {
  progress: PropTypes.number,
  duration: PropTypes.number,
  remaining: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  clockwise: PropTypes.bool,
  scaleMode: PropTypes.string,
  activityEmoji: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  isRunning: PropTypes.bool,
  showActivityEmoji: PropTypes.bool,
  onGraduationTap: PropTypes.func,
  onDialTap: PropTypes.func,
  onDialLongPress: PropTypes.func,
  isCompleted: PropTypes.bool,
  currentActivity: PropTypes.object,
  showNumbers: PropTypes.bool,
  showGraduations: PropTypes.bool,
  showPlayButton: PropTypes.bool,
  showCenterDisk: PropTypes.bool,
  centerImage: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
};

// Export memoized version
export default React.memo(TimerDial, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.progress === nextProps.progress &&
    prevProps.duration === nextProps.duration &&
    prevProps.remaining === nextProps.remaining &&
    prevProps.color === nextProps.color &&
    prevProps.size === nextProps.size &&
    prevProps.clockwise === nextProps.clockwise &&
    prevProps.scaleMode === nextProps.scaleMode &&
    prevProps.activityEmoji === nextProps.activityEmoji &&
    prevProps.isRunning === nextProps.isRunning &&
    prevProps.onDialTap === nextProps.onDialTap &&
    prevProps.onGraduationTap === nextProps.onGraduationTap &&
    prevProps.onDialLongPress === nextProps.onDialLongPress &&
    prevProps.isCompleted === nextProps.isCompleted &&
    prevProps.currentActivity === nextProps.currentActivity &&
    prevProps.showNumbers === nextProps.showNumbers &&
    prevProps.showGraduations === nextProps.showGraduations &&
    prevProps.showActivityEmoji === nextProps.showActivityEmoji &&
    prevProps.showPlayButton === nextProps.showPlayButton &&
    prevProps.showCenterDisk === nextProps.showCenterDisk &&
    prevProps.centerImage === nextProps.centerImage
  );
});
