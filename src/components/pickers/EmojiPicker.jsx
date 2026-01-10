// src/components/pickers/EmojiPicker.jsx
// Grid selector for emoji selection in custom activities

import PropTypes from 'prop-types';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { rs } from '../../styles/responsive';
import { useTheme } from '../../theme/ThemeProvider';
import haptics from '../../utils/haptics';

// Color constants for emoji picker
const TRANSPARENT = 'transparent';

// Curated list of emojis suitable for activities (18 most common)
const ACTIVITY_EMOJIS = [
  '💻', '📚', '🏃', '🧘', '🎨', '✍️',
  '☕', '🎮', '🎵', '📝', '💡', '⏰',
  '🌱', '🛁', '🎯', '📱', '✨', '❤️',
];

const EmojiPicker = React.memo(function EmojiPicker({
  onSelectEmoji,
  selectedEmoji,
  style,
}) {
  const theme = useTheme();

  const handleEmojiPress = (emoji) => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onSelectEmoji(emoji);
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    emoji: {
      fontSize: rs(28, 'min'),
      lineHeight: rs(32, 'min'),
    },
    emojiButton: {
      alignItems: 'center',
      borderRadius: rs(12, 'min'),
      borderWidth: 2,
      height: rs(48, 'min'),
      justifyContent: 'center',
      margin: rs(4, 'min'),
      minHeight: 44,
      minWidth: 44,
      width: rs(48, 'min'),
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      paddingVertical: rs(8, 'min'),
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.grid}>
        {ACTIVITY_EMOJIS.map((emoji) => {
          const isSelected = selectedEmoji === emoji;

          // Determine background and border colors
          const backgroundColor = isSelected
            ? theme.colors.brand.primary + '20'
            : TRANSPARENT;
          const borderColor = isSelected
            ? theme.colors.brand.primary
            : TRANSPARENT;

          return (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.emojiButton,
                {
                  backgroundColor,
                  borderColor,
                },
              ]}
              onPress={() => handleEmojiPress(emoji)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel={`Emoji ${emoji}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

EmojiPicker.displayName = 'EmojiPicker';
EmojiPicker.propTypes = {
  onSelectEmoji: PropTypes.func.isRequired,
  selectedEmoji: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default EmojiPicker;

// Export emoji list for potential reuse
export { ACTIVITY_EMOJIS };
