// Timer test utilities - focused on deterministic testing
export class TimeController {
  constructor(initialTime = 0) {
    this.currentTime = initialTime;
    this.callbacks = [];
  }

  // Simulate time passing without relying on Jest fake timers
  advance(ms) {
    this.currentTime += ms;
    this.callbacks.forEach(cb => cb(this.currentTime));
    return this.currentTime;
  }

  onTick(callback) {
    this.callbacks.push(callback);
  }

  reset() {
    this.currentTime = 0;
    this.callbacks = [];
  }
}

// Create a controlled Date.now() for predictable testing
export function createControlledTime(initialTime = 0) {
  let currentTime = initialTime;

  return {
    now: () => currentTime,
    advance: (ms) => {
      currentTime += ms;
      return currentTime;
    },
    set: (time) => {
      currentTime = time;
      return currentTime;
    },
    reset: () => {
      currentTime = initialTime;
    }
  };
}

// Test data generators for common scenarios
export const timerScenarios = {
  pomodoro: { duration: 25 * 60, name: 'Pomodoro (25 min)' },
  shortBreak: { duration: 5 * 60, name: 'Short Break (5 min)' },
  longBreak: { duration: 15 * 60, name: 'Long Break (15 min)' },
  oneMinute: { duration: 60, name: 'One Minute' },
  zeroTimer: { duration: 0, name: 'Zero Timer' }
};

// Helper to wait for next tick in tests
export const waitForNextUpdate = () => new Promise(resolve => setTimeout(resolve, 0));