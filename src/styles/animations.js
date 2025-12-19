// src/styles/animations.js
// Platform-adaptive animation configurations

import { Platform, Animated, Easing } from 'react-native';

// iOS animation preferences (smoother, more subtle)
const iosAnimations = {
  // Timing configurations
  timing: {
    fast: 200,
    normal: 250,
    slow: 350,
    verySlow: 500,
  },

  // Easing functions
  easing: {
    in: Easing.bezier(0.42, 0, 1, 1),
    out: Easing.bezier(0, 0, 0.58, 1),
    inOut: Easing.bezier(0.42, 0, 0.58, 1),
    bounce: Easing.bounce,
    elastic: Easing.elastic(1.2),
  },

  // Spring configurations
  spring: {
    default: {
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    },
    bouncy: {
      tension: 30,
      friction: 3,
      useNativeDriver: true,
    },
    stiff: {
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    },
  },
};

// Android animation preferences (Material Design)
const androidAnimations = {
  // Timing configurations (slightly longer for Material Design)
  timing: {
    fast: 150,
    normal: 300,
    slow: 400,
    verySlow: 600,
  },

  // Easing functions (Material Design curves)
  easing: {
    in: Easing.bezier(0.4, 0, 0.2, 1), // Material decelerate
    out: Easing.bezier(0, 0, 0.2, 1),  // Material accelerate
    inOut: Easing.bezier(0.4, 0, 0.2, 1), // Material standard
    bounce: Easing.bounce,
    elastic: Easing.elastic(1),
  },

  // Spring configurations
  spring: {
    default: {
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    },
    bouncy: {
      tension: 35,
      friction: 4,
      useNativeDriver: true,
    },
    stiff: {
      tension: 120,
      friction: 12,
      useNativeDriver: true,
    },
  },
};

// Get platform-specific animation config
const platformConfig = Platform.select({
  ios: iosAnimations,
  android: androidAnimations,
});

// Animation creators
export const createAnimation = {
  // Fade animations
  fadeIn: (value = new Animated.Value(0), duration = 'normal') => {
    return Animated.timing(value, {
      toValue: 1,
      duration: platformConfig.timing[duration] || platformConfig.timing.normal,
      easing: platformConfig.easing.out,
      useNativeDriver: true,
    });
  },

  fadeOut: (value, duration = 'normal') => {
    return Animated.timing(value, {
      toValue: 0,
      duration: platformConfig.timing[duration] || platformConfig.timing.normal,
      easing: platformConfig.easing.in,
      useNativeDriver: true,
    });
  },

  // Scale animations
  scaleIn: (value = new Animated.Value(0), _duration = 'normal') => {
    return Animated.spring(value, {
      toValue: 1,
      ...platformConfig.spring.default,
    });
  },

  scaleOut: (value, _duration = 'normal') => {
    return Animated.timing(value, {
      toValue: 0,
      duration: platformConfig.timing[_duration] || platformConfig.timing.normal,
      easing: platformConfig.easing.in,
      useNativeDriver: true,
    });
  },

  // Bounce animations
  bounce: (value = new Animated.Value(1)) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: 1.2,
        duration: platformConfig.timing.fast,
        easing: platformConfig.easing.out,
        useNativeDriver: true,
      }),
      Animated.spring(value, {
        toValue: 1,
        ...platformConfig.spring.bouncy,
      }),
    ]);
  },

  // Pulse animations
  pulse: (value = new Animated.Value(1), repeat = true) => {
    const animation = Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: platformConfig.timing.slow,
        easing: platformConfig.easing.inOut,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: platformConfig.timing.slow,
        easing: platformConfig.easing.inOut,
        useNativeDriver: true,
      }),
    ]);

    if (repeat) {
      return Animated.loop(animation);
    }
    return animation;
  },

  // Slide animations
  slideInLeft: (value = new Animated.Value(-100), _duration = 'normal') => {
    return Animated.spring(value, {
      toValue: 0,
      ...platformConfig.spring.default,
    });
  },

  slideInRight: (value = new Animated.Value(100), _duration = 'normal') => {
    return Animated.spring(value, {
      toValue: 0,
      ...platformConfig.spring.default,
    });
  },

  slideInUp: (value = new Animated.Value(100), _duration = 'normal') => {
    return Animated.spring(value, {
      toValue: 0,
      ...platformConfig.spring.default,
    });
  },

  slideInDown: (value = new Animated.Value(-100), _duration = 'normal') => {
    return Animated.spring(value, {
      toValue: 0,
      ...platformConfig.spring.default,
    });
  },
};

// Common animation patterns
export const animationPatterns = {
  // Button press animation
  buttonPress: (scaleValue = new Animated.Value(1)) => {
    return Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: Platform.select({ ios: 0.95, android: 0.92 }),
        duration: platformConfig.timing.fast,
        easing: platformConfig.easing.in,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        ...platformConfig.spring.default,
      }),
    ]);
  },

  // Modal entrance
  modalIn: (opacityValue = new Animated.Value(0), scaleValue = new Animated.Value(0.9)) => {
    return Animated.parallel([
      createAnimation.fadeIn(opacityValue, 'normal'),
      Animated.spring(scaleValue, {
        toValue: 1,
        ...platformConfig.spring.default,
      }),
    ]);
  },

  // Modal exit
  modalOut: (opacityValue, scaleValue) => {
    return Animated.parallel([
      createAnimation.fadeOut(opacityValue, 'fast'),
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: platformConfig.timing.fast,
        easing: platformConfig.easing.in,
        useNativeDriver: true,
      }),
    ]);
  },

  // List item entrance
  listItemIn: (values = [], delay = 50) => {
    return Animated.stagger(
      delay,
      values.map((value) => createAnimation.fadeIn(value, 'fast'))
    );
  },

  // Tab switch
  tabSwitch: (translateX, toValue) => {
    return Animated.spring(translateX, {
      toValue,
      ...platformConfig.spring.stiff,
    });
  },

  // Timer tick
  timerTick: (scaleValue = new Animated.Value(1)) => {
    return Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.02,
        duration: Platform.select({ ios: 100, android: 150 }),
        easing: platformConfig.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: Platform.select({ ios: 100, android: 150 }),
        easing: platformConfig.easing.in,
        useNativeDriver: true,
      }),
    ]);
  },

  // Color transition
  colorTransition: (colorValue, toValue) => {
    return Animated.timing(colorValue, {
      toValue,
      duration: platformConfig.timing.normal,
      easing: platformConfig.easing.inOut,
      useNativeDriver: false, // Color animations can't use native driver
    });
  },
};

// Interpolation helpers
export const interpolate = {
  // Opacity fade
  opacity: (animatedValue, inputRange = [0, 1], outputRange = [0, 1]) => {
    return animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  },

  // Scale transformation
  scale: (animatedValue, inputRange = [0, 1], outputRange = [0, 1]) => {
    return animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  },

  // Rotation transformation
  rotate: (animatedValue, inputRange = [0, 1], outputRange = ['0deg', '360deg']) => {
    return animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  },

  // Translation transformation
  translate: (animatedValue, inputRange = [0, 1], outputRange = [0, 100]) => {
    return animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  },
};

// Export configuration
export default {
  config: platformConfig,
  create: createAnimation,
  patterns: animationPatterns,
  interpolate,

  // Direct access to timings and easings
  timing: platformConfig.timing,
  easing: platformConfig.easing,
  spring: platformConfig.spring,
};