import { renderHook, act } from '@testing-library/react-native';
import useAudio from '../useAudio';
import { Audio } from 'expo-av';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({
        sound: {
          setPositionAsync: jest.fn(() => Promise.resolve()),
          playAsync: jest.fn(() => Promise.resolve()),
          unloadAsync: jest.fn(() => Promise.resolve()),
        }
      }))
    }
  }
}));

describe('useAudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should configure audio mode on mount', async () => {
      renderHook(() => useAudio());

      // Wait for async initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    });

    it('should load sound on mount', async () => {
      renderHook(() => useAudio());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        expect.anything(), // The require() for the sound file
        { shouldPlay: false }
      );
    });

    it('should handle loading errors silently', async () => {
      // Mock error
      Audio.Sound.createAsync.mockRejectedValueOnce(new Error('Load failed'));

      const consoleLog = jest.spyOn(console, 'log').mockImplementation();

      renderHook(() => useAudio());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should not throw, just log in dev
      expect(consoleLog).toHaveBeenCalledWith(
        'Audio loading failed (silent fallback):',
        'Load failed'
      );

      consoleLog.mockRestore();
    });
  });

  describe('playSound function', () => {
    it('should play sound when loaded', async () => {
      const mockSound = {
        setPositionAsync: jest.fn(() => Promise.resolve()),
        playAsync: jest.fn(() => Promise.resolve()),
        unloadAsync: jest.fn(() => Promise.resolve()),
      };

      Audio.Sound.createAsync.mockResolvedValueOnce({ sound: mockSound });

      const { result } = renderHook(() => useAudio());

      // Wait for sound to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Play sound
      await act(async () => {
        await result.current.playSound();
      });

      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(0);
      expect(mockSound.playAsync).toHaveBeenCalled();
    });

    it('should handle playback errors silently', async () => {
      const mockSound = {
        setPositionAsync: jest.fn(() => Promise.resolve()),
        playAsync: jest.fn(() => Promise.reject(new Error('Playback failed'))),
        unloadAsync: jest.fn(() => Promise.resolve()),
      };

      Audio.Sound.createAsync.mockResolvedValueOnce({ sound: mockSound });
      const consoleLog = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.playSound();
      });

      expect(consoleLog).toHaveBeenCalledWith(
        'Audio playback failed (silent fallback):',
        'Playback failed'
      );

      consoleLog.mockRestore();
    });

    it('should do nothing if sound not loaded', async () => {
      Audio.Sound.createAsync.mockRejectedValueOnce(new Error('Load failed'));

      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should not throw when trying to play
      await act(async () => {
        await result.current.playSound();
      });

      // No error, just silent fallback
    });
  });

  describe('Cleanup', () => {
    it('should unload sound on unmount', async () => {
      const mockSound = {
        setPositionAsync: jest.fn(() => Promise.resolve()),
        playAsync: jest.fn(() => Promise.resolve()),
        unloadAsync: jest.fn(() => Promise.resolve()),
      };

      Audio.Sound.createAsync.mockResolvedValueOnce({ sound: mockSound });

      const { unmount } = renderHook(() => useAudio());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      unmount();

      expect(mockSound.unloadAsync).toHaveBeenCalled();
    });

    it('should handle cleanup errors silently', async () => {
      const mockSound = {
        setPositionAsync: jest.fn(() => Promise.resolve()),
        playAsync: jest.fn(() => Promise.resolve()),
        unloadAsync: jest.fn(() => Promise.reject(new Error('Unload failed'))),
      };

      Audio.Sound.createAsync.mockResolvedValueOnce({ sound: mockSound });

      const { unmount } = renderHook(() => useAudio());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should not throw on unmount even if unload fails
      unmount();
    });
  });
});