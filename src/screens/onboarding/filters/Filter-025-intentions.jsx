/**
 * Filter-025-intentions - Comprendre pourquoi l'user est là
 * 2 questions multi-select → config interactionProfile
 * Remplace Filter-040 (TestStart) et Filter-050 (TestStop)
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { PrimaryButton } from '../../../components/buttons';
import OnboardingLayout from '../../../components/onboarding/OnboardingLayout';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { rs } from '../../../styles/responsive';
import { spacing, typography, fontWeights } from '../../../theme/tokens';

const Q1_OPTIONS = [
  { id: 'focus', labelKey: 'onboarding.intentions.q1.focus', startWeight: 1, stopWeight: 1 },
  { id: 'launch', labelKey: 'onboarding.intentions.q1.launch', startWeight: 2, stopWeight: 0 },
  { id: 'breathe', labelKey: 'onboarding.intentions.q1.breathe', startWeight: 0, stopWeight: 0 },
  { id: 'children', labelKey: 'onboarding.intentions.q1.children', startWeight: -1, stopWeight: -1 },
  { id: 'other', labelKey: 'onboarding.intentions.q1.other', startWeight: 0, stopWeight: 0, hasInput: true },
];

const Q2_OPTIONS = [
  { id: 'starting', labelKey: 'onboarding.intentions.q2.starting', startWeight: 2, stopWeight: 0 },
  { id: 'finishing', labelKey: 'onboarding.intentions.q2.finishing', startWeight: 0, stopWeight: 2 },
  { id: 'staying', labelKey: 'onboarding.intentions.q2.staying', startWeight: 1, stopWeight: 1 },
  { id: 'managing', labelKey: 'onboarding.intentions.q2.managing', startWeight: 0, stopWeight: 0 },
];

export default function Filter025Intentions({ onContinue }) {
  const t = useTranslation();
  const { colors } = useTheme();
  const analytics = useAnalytics();

  const [q1Selected, setQ1Selected] = useState([]);
  const [q2Selected, setQ2Selected] = useState([]);
  const [otherText, setOtherText] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const toggleQ1 = (id) => {
    setQ1Selected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleQ2 = (id) => {
    setQ2Selected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const calculateProfile = () => {
    let startScore = 0;
    let stopScore = 0;

    // Q1 weights
    q1Selected.forEach(id => {
      const opt = Q1_OPTIONS.find(o => o.id === id);
      if (opt) {
        startScore += opt.startWeight;
        stopScore += opt.stopWeight;
      }
    });

    // Q2 weights
    q2Selected.forEach(id => {
      const opt = Q2_OPTIONS.find(o => o.id === id);
      if (opt) {
        startScore += opt.startWeight;
        stopScore += opt.stopWeight;
      }
    });

    return {
      startRequiresLongPress: startScore >= 2,
      stopRequiresLongPress: stopScore >= 2,
    };
  };

  const handleNext = () => {
    if (currentQuestion === 1) {
      setCurrentQuestion(2);
    } else {
      const interactionProfile = calculateProfile();

      // Track analytics
      analytics.trackIntentionsCompleted({
        intentions: q1Selected,
        challenges: q2Selected,
        hasOther: q1Selected.includes('other'),
        otherText: otherText || null,
        calculatedProfile: interactionProfile,
      });

      onContinue({
        intentions: q1Selected,
        challenges: q2Selected,
        otherIntention: otherText,
        interactionProfile,
      });
    }
  };

  const canContinue = currentQuestion === 1
    ? q1Selected.length > 0
    : q2Selected.length > 0;

  const renderOption = (option, selected, onToggle) => {
    const isSelected = selected.includes(option.id);
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionButton,
          {
            backgroundColor: isSelected ? colors.brand.primary + '15' : colors.surface,
            borderColor: isSelected ? colors.brand.primary : colors.border,
          }
        ]}
        onPress={() => onToggle(option.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={[
          styles.optionText,
          { color: isSelected ? colors.brand.primary : colors.text }
        ]}>
          {t(option.labelKey)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <OnboardingLayout
      title={currentQuestion === 1 ? t('onboarding.intentions.q1.title') : t('onboarding.intentions.q2.title')}
      centerContent
      footer={
        <PrimaryButton
          label={t('common.continue')}
          onPress={handleNext}
          disabled={!canContinue}
        />
      }
    >
      {currentQuestion === 1 ? (
        <>
          <View style={styles.optionsContainer}>
            {Q1_OPTIONS.map(opt => renderOption(opt, q1Selected, toggleQ1))}
          </View>

          {q1Selected.includes('other') && (
            <TextInput
              style={[styles.otherInput, {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              }]}
              placeholder={t('onboarding.intentions.q1.otherPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={otherText}
              onChangeText={setOtherText}
              maxLength={100}
              autoFocus
            />
          )}
        </>
      ) : (
        <View style={styles.optionsContainer}>
          {Q2_OPTIONS.map(opt => renderOption(opt, q2Selected, toggleQ2))}
        </View>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    gap: rs(spacing.md),
    width: '100%',
  },
  optionButton: {
    padding: rs(spacing.lg),
    borderRadius: rs(12),
    borderWidth: 2,
    alignItems: 'center',
  },
  optionText: {
    fontSize: rs(typography.md),
    fontWeight: fontWeights.medium,
  },
  otherInput: {
    marginTop: rs(spacing.md),
    padding: rs(spacing.md),
    borderRadius: rs(12),
    borderWidth: 1,
    fontSize: rs(typography.base),
  },
});
