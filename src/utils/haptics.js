// src/utils/haptics.js
// Cross-platform haptic feedback module

import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

// Haptic feedback types (iOS-style naming, mapped for Android)
const HapticTypes = {
  // Selection feedback (light tick)
  selection: 'selection',

  // Impact feedback (button press)
  impactLight: 'impactLight',
  impactMedium: 'impactMedium',
  impactHeavy: 'impactHeavy',

  // Notification feedback
  notificationSuccess: 'notificationSuccess',
  notificationWarning: 'notificationWarning',
  notificationError: 'notificationError',

  // Custom patterns
  soft: 'soft',
  rigid: 'rigid',
};

// Android vibration patterns (milliseconds)
const androidPatterns = {
  selection: 10,
  impactLight: 20,
  impactMedium: 40,
  impactHeavy: 60,
  notificationSuccess: [0, 30, 60, 30],
  notificationWarning: [0, 40, 80, 40],
  notificationError: [0, 50, 100, 50],
  soft: 15,
  rigid: 50,
};

// Main haptic feedback class
class HapticManager {
  constructor() {
    this.isEnabled = true; // Can be controlled via settings
    this.platform = Platform.OS;
  }

  // Enable/disable haptic feedback
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Generic haptic trigger
  async trigger(type = HapticTypes.selection) {
    if (!this.isEnabled) {return;}

    if (Platform.OS === 'ios') {
      await this.triggerIOS(type);
    } else if (Platform.OS === 'android') {
      await this.triggerAndroid(type);
    }
  }

  // iOS haptic implementation using expo-haptics
  async triggerIOS(type) {
    try {
      // Map to expo-haptics types
      switch (type) {
      case HapticTypes.selection:
        await Haptics.selectionAsync();
        break;

      case HapticTypes.impactLight:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case HapticTypes.impactMedium:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case HapticTypes.impactHeavy:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case HapticTypes.notificationSuccess:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case HapticTypes.notificationWarning:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;

      case HapticTypes.notificationError:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      case HapticTypes.soft:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case HapticTypes.rigid:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      default:
        await Haptics.selectionAsync();
      }
    } catch (e) {
      // Fallback to Vibration API if haptic library not available
      console.log('Expo Haptics not available, using fallback');
      this.fallbackVibration(type);
    }
  }

  // Android haptic implementation using expo-haptics when available
  async triggerAndroid(type) {
    try {
      // Try to use expo-haptics first for better Android support
      switch (type) {
      case HapticTypes.selection:
        await Haptics.selectionAsync();
        break;

      case HapticTypes.impactLight:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case HapticTypes.impactMedium:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case HapticTypes.impactHeavy:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case HapticTypes.notificationSuccess:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case HapticTypes.notificationWarning:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;

      case HapticTypes.notificationError:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      case HapticTypes.soft:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case HapticTypes.rigid:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      default:
        await Haptics.selectionAsync();
      }
    } catch (e) {
      // Fallback to native vibration patterns
      console.log('Expo Haptics not supported on this Android device, using vibration fallback');
      const pattern = androidPatterns[type];

      if (Array.isArray(pattern)) {
        // Complex pattern
        Vibration.vibrate(pattern);
      } else {
        // Simple vibration
        Vibration.vibrate(pattern || 20);
      }
    }
  }

  // Fallback vibration for when haptic library is not available
  fallbackVibration(type) {
    const pattern = androidPatterns[type];

    if (Platform.OS === 'ios') {
      // iOS only supports single duration
      if (Array.isArray(pattern)) {
        Vibration.vibrate(pattern[1] || 30);
      } else {
        Vibration.vibrate(pattern || 20);
      }
    } else {
      // Android supports patterns
      if (Array.isArray(pattern)) {
        Vibration.vibrate(pattern);
      } else {
        Vibration.vibrate(pattern || 20);
      }
    }
  }

  // Convenience methods for common use cases
  async selection() {
    await this.trigger(HapticTypes.selection);
  }

  async impact(intensity = 'medium') {
    switch (intensity) {
    case 'light':
      await this.trigger(HapticTypes.impactLight);
      break;
    case 'heavy':
      await this.trigger(HapticTypes.impactHeavy);
      break;
    default:
      await this.trigger(HapticTypes.impactMedium);
    }
  }

  async notification(type = 'success') {
    switch (type) {
    case 'warning':
      await this.trigger(HapticTypes.notificationWarning);
      break;
    case 'error':
      await this.trigger(HapticTypes.notificationError);
      break;
    default:
      await this.trigger(HapticTypes.notificationSuccess);
    }
  }

  // Timer-specific haptic patterns
  async timerStart() {
    await this.trigger(HapticTypes.impactMedium);
  }

  async timerPause() {
    await this.trigger(HapticTypes.selection);
  }

  async timerComplete() {
    await this.trigger(HapticTypes.notificationSuccess);
  }

  async timerReset() {
    await this.trigger(HapticTypes.impactLight);
  }

  // Button press feedback
  async buttonPress() {
    await this.trigger(HapticTypes.impactLight);
  }

  // Switch toggle feedback
  async switchToggle() {
    await this.trigger(HapticTypes.selection);
  }

  // Slider change feedback
  async sliderChange() {
    await this.trigger(HapticTypes.selection);
  }

  // Swipe gesture feedback
  async swipeGesture() {
    await this.trigger(HapticTypes.soft);
  }

  // Error feedback
  async error() {
    await this.trigger(HapticTypes.notificationError);
  }

  // Success feedback
  async success() {
    await this.trigger(HapticTypes.notificationSuccess);
  }

  // Warning feedback
  async warning() {
    await this.trigger(HapticTypes.notificationWarning);
  }

  // Cancel all vibrations
  cancel() {
    Vibration.cancel();
  }
}

// Create singleton instance
const haptics = new HapticManager();

// Export haptics instance and types
export { haptics as default, HapticTypes };

// Export convenience functions
export const triggerHaptic = async (type) => await haptics.trigger(type);
export const selectionHaptic = async () => await haptics.selection();
export const impactHaptic = async (intensity) => await haptics.impact(intensity);
export const notificationHaptic = async (type) => await haptics.notification(type);
export const buttonPressHaptic = async () => await haptics.buttonPress();
export const switchToggleHaptic = async () => await haptics.switchToggle();
export const timerStartHaptic = async () => await haptics.timerStart();
export const timerCompleteHaptic = async () => await haptics.timerComplete();