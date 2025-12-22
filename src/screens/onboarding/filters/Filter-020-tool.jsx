import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimerConfig } from '../../../contexts/TimerConfigContext';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { SelectionCard } from '../../../components/settings';
import { Button } from '../../../components/buttons';
import { rs } from '../../../styles/responsive';
import { spacing, typography, fontWeights } from '../../../theme/tokens';

const TOOL_OPTIONS = [
  { id: 'creative', emoji: '🎨', labelKey: 'onboarding.tool.creative' },
  { id: 'minimalist', emoji: '☯', labelKey: 'onboarding.tool.minimalist' },
  { id: 'multitask', emoji: '🔄', labelKey: 'onboarding.tool.multitask' },
  { id: 'rational', emoji: '⏱', labelKey: 'onboarding.tool.rational' },
];

export default function Filter020Tool({ onContinue }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { setFavoriteToolMode } = useTimerConfig();
  const [selected, setSelected] = useState(null);

  const handleSelect = (toolId) => setSelected(toolId);

  const handleContinue = () => {
    if (selected) {
      setFavoriteToolMode(selected);
      onContinue({ favoriteToolMode: selected });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.tool.title')}</Text>
        <View style={styles.grid}>
          {TOOL_OPTIONS.map((option) => (
            <SelectionCard
              key={option.id}
              emoji={option.emoji}
              label={t(option.labelKey)}
              selected={selected === option.id}
              onSelect={() => handleSelect(option.id)}
              compact
            />
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          title={t('common.continue')}
          onPress={handleContinue}
          disabled={!selected}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: rs(spacing.lg), justifyContent: 'center' },
  title: { fontSize: rs(typography.xl), fontWeight: fontWeights.semibold, textAlign: 'center', marginBottom: rs(spacing.xl) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: rs(spacing.md) },
  footer: { padding: rs(spacing.lg), paddingBottom: rs(spacing.xl) },
});
