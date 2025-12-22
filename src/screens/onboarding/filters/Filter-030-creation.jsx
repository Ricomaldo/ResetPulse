import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCustomActivities } from '../../../hooks/useCustomActivities';
import CreateActivityModalContent from '../../../components/modals/CreateActivityModalContent';
import { rs } from '../../../styles/responsive';

export default function Filter030Creation({ onContinue }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { createActivity } = useCustomActivities();

  const handleActivityCreated = (activityData) => {
    const activity = createActivity(
      activityData.emoji,
      activityData.name,
      activityData.defaultDuration,
      { createdDuringOnboarding: true } // Slot gratuit
    );
    onContinue({ customActivity: activity });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.creation.title')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('onboarding.creation.subtitle')}
        </Text>
      </View>
      <View style={styles.content}>
        <CreateActivityModalContent
          context="onboarding"
          onActivityCreated={handleActivityCreated}
          onClose={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: rs(21), paddingTop: rs(13) },
  title: { fontSize: rs(24), fontWeight: '600', textAlign: 'center' },
  subtitle: { fontSize: rs(15), textAlign: 'center', marginTop: rs(8) },
  content: { flex: 1 },
});
