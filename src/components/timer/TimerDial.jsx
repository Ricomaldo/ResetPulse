/**
 * @fileoverview Timer dial component with drag/tap interaction
 * Orchestrates dial sub-components for visual timer display
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useMemo, useRef, useState } from 'react';
import { View, Animated, PanResponder, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useDialOrientation } from '../../hooks/useDialOrientation';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import {
  TIMER_SVG,
  TIMER_PROPORTIONS,
  TIMER_VISUAL,
  COLORS,
  DIAL_INTERACTION,
  getDialMode,
  DRAG,
  VISUAL,
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
import DialCenter from './dial/DialCenter';
import Svg, { Circle } from 'react-native-svg';
import { fontWeights } from '../../theme/tokens';

/**
 * TimerDial - Main timer dial component
 * Orchestrates all dial sub-components
 */
function TimerDial({
  progress = 1,
  duration = 0,
  color,
  size = null,
  clockwise = false,
  scaleMode = '60min',
  activityEmoji = null,
  isRunning = false,
  shouldPulse = true,
  showActivityEmoji = true,
  onGraduationTap = null,
  onDialTap = null,
  isCompleted = false,
  currentActivity = null,
  showNumbers = true,
  showGraduations = true,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const completionColorAnim = useRef(new Animated.Value(0)).current;

  // Use centralized dial orientation logic
  const dial = useDialOrientation(clockwise, scaleMode);

  // Calculate responsive sizes
  const circleSize = size || rs(280, 'min');
  const svgSize = circleSize + TIMER_SVG.PADDING;
  const radiusOuter = (circleSize / 2); // Radius for graduations (outer)
  const radiusBackground = radiusOuter - 30; // Cercle blanc (laisse espace pour graduations)
  const radius = radiusBackground - 8; // Arc de progression (un peu plus petit → anneau blanc visible)
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
    return marks.map(mark => ({
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
      fontSize: Math.max(TIMER_PROPORTIONS.MIN_NUMBER_FONT, circleSize * TIMER_PROPORTIONS.NUMBER_FONT_RATIO),
    }));
  }, [dial, radiusBackground, centerX, centerY, circleSize]);

  // Pan responder for drag interaction + tap detection
  const gestureStartTimeRef = useRef(null);
  const gestureStartPosRef = useRef(null);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Capture all touches
      onMoveShouldSetPanResponder: () => !!onGraduationTap, // Allow drag anytime (even when running for skipping ahead)

      onPanResponderGrant: (evt) => {
        gestureStartTimeRef.current = Date.now();
        gestureStartPosRef.current = {
          x: evt.nativeEvent.locationX,
          y: evt.nativeEvent.locationY,
        };

        setIsDragging(true);

        // Calculate where the user touched
        const touchMinutes = dial.coordinatesToMinutes(
          evt.nativeEvent.locationX,
          evt.nativeEvent.locationY,
          centerX,
          centerY
        );

        // Calculate current timer value in minutes
        const currentMinutes = duration / 60;

        // Store the offset between touch position and current value
        dragOffsetRef.current = currentMinutes - touchMinutes;

        // Store references for wrap-around detection
        lastMinutesRef.current = currentMinutes;
        lastTouchMinutesRef.current = touchMinutes;
        lastMoveTimeRef.current = Date.now();
      },

      onPanResponderMove: (evt) => {
        // Calculate where the user is touching now
        const touchMinutes = dial.coordinatesToMinutes(
          evt.nativeEvent.locationX,
          evt.nativeEvent.locationY,
          centerX,
          centerY
        );

        const maxMinutes = dial.maxMinutes;

        // Check if touch position wrapped around
        let touchDelta = 0;
        if (lastTouchMinutesRef.current !== null) {
          touchDelta = touchMinutes - lastTouchMinutesRef.current;

          // If touch jumped more than half the dial, it wrapped
          if (Math.abs(touchDelta) > maxMinutes / 2) {
            // Adjust the delta to represent the actual movement
            if (touchDelta > 0) {
              // Wrapped counter-clockwise (60→0)
              touchDelta = touchDelta - maxMinutes;
            } else {
              // Wrapped clockwise (0→60)
              touchDelta = touchDelta + maxMinutes;
            }
          }
        }

        // Calculate velocity for dynamic resistance
        const now = Date.now();
        const deltaTime = Math.max(1, now - (lastMoveTimeRef.current || now));
        const velocity = Math.abs(touchDelta) / (deltaTime / 1000); // minutes per second

        // Apply dynamic resistance based on velocity
        // Faster movements get more resistance for smoother control
        const velocityFactor = Math.min(1, velocity / DRAG.VELOCITY_THRESHOLD);
        const dynamicResistance = DRAG.BASE_RESISTANCE - (velocityFactor * DRAG.VELOCITY_REDUCTION);

        // Apply ease-out curve for natural deceleration
        const easedResistance = DRAG.BASE_RESISTANCE * easeOut(dynamicResistance / DRAG.BASE_RESISTANCE);
        const resistedDelta = touchDelta * easedResistance;

        // Update time reference
        lastMoveTimeRef.current = now;

        // Calculate new value based on last value plus resisted delta
        let newMinutes = lastMinutesRef.current + resistedDelta;

        // Critical: Clamp to valid range to prevent any jumps
        newMinutes = Math.max(0, Math.min(maxMinutes, newMinutes));

        // Update the timer
        onGraduationTap(newMinutes);

        // Update references
        lastMinutesRef.current = newMinutes;
        lastTouchMinutesRef.current = touchMinutes;

        // Adjust offset to maintain the drag relationship
        dragOffsetRef.current = newMinutes - touchMinutes;
      },

      onPanResponderRelease: (evt) => {
        const now = Date.now();
        const timeDelta = now - (gestureStartTimeRef.current || now);
        const startPos = gestureStartPosRef.current;

        // Calculate movement distance
        let movementDistance = 0;
        if (startPos) {
          const dx = evt.nativeEvent.locationX - startPos.x;
          const dy = evt.nativeEvent.locationY - startPos.y;
          movementDistance = Math.sqrt(dx * dx + dy * dy);
        }

        // Detect tap: quick release (<200ms) with minimal movement (<10px)
        const isTap = timeDelta < 200 && movementDistance < 10;

        if (isTap && onDialTap) {
          onDialTap();
        }

        setIsDragging(false);
        lastMinutesRef.current = null;
        lastTouchMinutesRef.current = null;
        lastMoveTimeRef.current = null;
        dragOffsetRef.current = 0;
        gestureStartTimeRef.current = null;
        gestureStartPosRef.current = null;
      },
    }),
    [dial, isRunning, onGraduationTap, onDialTap]
  );

  // Animated color for completion
  const animatedColor = completionColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color || theme.colors.energy, COLORS.COMPLETION_GREEN],
  });

  // Calculate accessibility information
  const durationMinutes = Math.round(duration / 60);
  const activityName = currentActivity?.label || t('activities.none');

  // Build accessibility label
  const dialAccessibilityLabel = t('accessibility.timer.dial', {
    minutes: durationMinutes,
    activity: activityName
  });

  // Build accessibility hint
  const dialAccessibilityHint = isRunning
    ? t('accessibility.timer.dialTapToToggle')
    : t('accessibility.timer.dialAdjustable') + ' ' + t('accessibility.timer.dialTapToToggle');

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        width: svgSize,
        height: svgSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessible={true}
      accessibilityRole={isRunning ? "timer" : "adjustable"}
      accessibilityLabel={dialAccessibilityLabel}
      accessibilityHint={dialAccessibilityHint}
      accessibilityValue={{
        min: 0,
        max: getDialMode(scaleMode).maxMinutes,
        now: durationMinutes,
        text: `${durationMinutes} minutes`
      }}
      accessibilityActions={!isRunning ? [
        { name: 'increment', label: 'Increase duration' },
        { name: 'decrement', label: 'Decrease duration' },
        { name: 'activate', label: 'Start timer' },
      ] : [
        { name: 'activate', label: 'Pause timer' },
      ]}
      onAccessibilityAction={(event) => {
        const { actionName } = event.nativeEvent;
        if (actionName === 'increment' && onGraduationTap && !isRunning) {
          const newDuration = Math.min(duration + 60, getDialMode(scaleMode).maxMinutes * 60);
          onGraduationTap(newDuration / 60);
        } else if (actionName === 'decrement' && onGraduationTap && !isRunning) {
          const newDuration = Math.max(0, duration - 60);
          onGraduationTap(newDuration / 60);
        } else if (actionName === 'activate' && onDialTap) {
          onDialTap();
        }
      }}
    >
      {/* Base layer: static elements */}
      <DialBase
        svgSize={svgSize}
        centerX={centerX}
        centerY={centerY}
        radius={radiusBackground}
        strokeWidth={strokeWidth}
        graduationMarks={graduationMarks}
        minuteNumbers={minuteNumbers}
        showNumbers={showNumbers}
        showGraduations={showGraduations}
        color={color}
      />

      {/* Progress layer: animated arc */}
      {/* IMPORTANT: Scale progress based on dial mode */}
      {(() => {
        // Calculate scaled progress based on dial maximum
        const maxMinutes = getDialMode(scaleMode).maxMinutes;
        const currentMinutes = duration / 60; // Convert seconds to minutes
        const scaledProgress = Math.min(1, currentMinutes / maxMinutes) * progress;


        return (
          <DialProgress
            svgSize={svgSize}
            centerX={centerX}
            centerY={centerY}
            radius={radius}
            strokeWidth={strokeWidth}
            progress={scaledProgress}
            color={color}
            isClockwise={clockwise}
            scaleMode={scaleMode}
            animatedColor={animatedColor}
            isRunning={isRunning}
          />
        );
      })()}

      {/* Physical fixation dots - rendered on top of dial */}
      <Svg
        width={svgSize}
        height={svgSize}
        style={{ position: 'absolute' }}
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no"
      >
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.08}
          fill={theme.colors.neutral}
          opacity={0.8}
        />
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.04}
          fill={theme.colors.text}
          opacity={0.4}
        />
      </Svg>

      {/* Center layer: emoji and pulse */}
      <DialCenter
        circleSize={circleSize}
        activityEmoji={activityEmoji}
        isRunning={isRunning}
        shouldPulse={shouldPulse}
        showActivityEmoji={showActivityEmoji}
        color={color}
        pulseDuration={currentActivity?.pulseDuration}
      />

      {/* Dragging indicator */}
      {isDragging && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            backgroundColor: theme.colors.background,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.borderRadius.md,
            ...theme.shadow('md'),
          }}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: fontWeights.semibold,
              color: theme.colors.text,
            }}
          >
            {Math.floor(duration / 60)} min
          </Text>
        </View>
      )}
    </View>
  );
}

// Export memoized version
export default React.memo(TimerDial, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.progress === nextProps.progress &&
    prevProps.duration === nextProps.duration &&
    prevProps.color === nextProps.color &&
    prevProps.size === nextProps.size &&
    prevProps.clockwise === nextProps.clockwise &&
    prevProps.scaleMode === nextProps.scaleMode &&
    prevProps.activityEmoji === nextProps.activityEmoji &&
    prevProps.isRunning === nextProps.isRunning &&
    prevProps.shouldPulse === nextProps.shouldPulse &&
    prevProps.onDialTap === nextProps.onDialTap &&
    prevProps.isCompleted === nextProps.isCompleted &&
    prevProps.currentActivity === nextProps.currentActivity
  );
});