// src/screens/SettingsScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { usePurchases } from '../contexts/PurchaseContext';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { rs } from '../styles/responsive';
import PremiumModal from '../components/modals/PremiumModal';
import { fontWeights } from '../theme/tokens';

export default function SettingsScreen() {
  const theme = useTheme();
  const {
    shouldPulse,
    setShouldPulse,
    showDigitalTimer,
    setShowDigitalTimer,
    clockwise,
    setClockwise,
    useMinimalInterface,
    setUseMinimalInterface,
  } = useTimerOptions();
  const { isPremium } = usePremiumStatus();
  const { restorePurchases } = usePurchases();
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.success) {
        Alert.alert(
          'Restauration réussie',
          result.hasPremium
            ? 'Vos achats ont été restaurés. Toutes les fonctionnalités premium sont débloquées.'
            : 'Aucun achat précédent trouvé pour ce compte.'
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de restaurer vos achats.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
    } finally {
      setIsRestoring(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: rs(20),
      paddingTop: rs(60),
      paddingBottom: rs(40),
    },
    header: {
      paddingHorizontal: rs(20),
      paddingTop: rs(16),
      paddingBottom: rs(12),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '20',
    },
    headerText: {
      fontSize: rs(24),
      fontWeight: fontWeights.bold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    premiumSection: {
      marginBottom: rs(24),
      paddingVertical: rs(16),
      paddingHorizontal: rs(16),
      borderRadius: rs(12),
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: isPremium ? theme.colors.brand.primary : theme.colors.border + '40',
    },
    premiumHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: rs(12),
      gap: rs(8),
    },
    premiumBadge: {
      fontSize: rs(24),
    },
    premiumTitle: {
      fontSize: rs(16),
      fontWeight: fontWeights.bold,
      color: isPremium ? theme.colors.brand.primary : theme.colors.text,
      flex: 1,
    },
    premiumStatus: {
      fontSize: rs(13),
      color: theme.colors.textSecondary,
      marginBottom: rs(12),
    },
    premiumButton: {
      minHeight: 44,
      borderRadius: rs(8),
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: rs(12),
      paddingHorizontal: rs(16),
      marginTop: rs(8),
    },
    premiumButtonUnlock: {
      backgroundColor: theme.colors.brand.primary,
    },
    premiumButtonRestore: {
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    premiumButtonText: {
      fontSize: rs(14),
      fontWeight: fontWeights.semibold,
      color: theme.colors.text,
    },
    premiumButtonUnlockText: {
      color: theme.colors.fixed.white,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: rs(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '20',
    },
    settingInfo: {
      flex: 1,
      marginRight: rs(16),
    },
    settingLabel: {
      fontSize: rs(17),
      color: theme.colors.text,
      fontWeight: fontWeights.semibold,
      marginBottom: rs(4),
    },
    settingDescription: {
      fontSize: rs(14),
      color: theme.colors.textSecondary,
      lineHeight: rs(20),
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Réglages</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Section */}
        <View style={styles.premiumSection}>
          <View style={styles.premiumHeader}>
            <Text style={styles.premiumBadge}>{isPremium ? '👑' : '✨'}</Text>
            <Text style={styles.premiumTitle}>
              {isPremium ? 'Premium Actif' : 'Déverrouiller Premium'}
            </Text>
          </View>
          <Text style={styles.premiumStatus}>
            {isPremium
              ? 'Vous avez accès à tous les palettes et activités.'
              : 'Accédez à 13 palettes supplémentaires et 14 activités.'}
          </Text>
          {!isPremium && (
            <TouchableOpacity
              style={[styles.premiumButton, styles.premiumButtonUnlock]}
              onPress={() => setPremiumModalVisible(true)}
            >
              <Text style={[styles.premiumButtonText, styles.premiumButtonUnlockText]}>
                Déverrouiller Premium
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.premiumButton, styles.premiumButtonRestore]}
            onPress={handleRestorePurchases}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text style={styles.premiumButtonText}>Restaurer mes achats</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Chrono numérique</Text>
            <Text style={styles.settingDescription}>
              Afficher le temps restant en chiffres
            </Text>
          </View>
          <Switch
            value={showDigitalTimer}
            onValueChange={setShowDigitalTimer}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.brand.primary
            }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Animation de pulsation</Text>
            <Text style={styles.settingDescription}>
              Effet visuel pendant que le timer tourne
            </Text>
          </View>
          <Switch
            value={shouldPulse}
            onValueChange={setShouldPulse}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.brand.primary
            }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sens horaire</Text>
            <Text style={styles.settingDescription}>
              Le timer tourne dans le sens des aiguilles d'une montre
            </Text>
          </View>
          <Switch
            value={clockwise}
            onValueChange={setClockwise}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.brand.primary
            }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Interface minimale</Text>
            <Text style={styles.settingDescription}>
              Masquer les options pendant que le timer tourne
            </Text>
          </View>
          <Switch
            value={useMinimalInterface}
            onValueChange={setUseMinimalInterface}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.brand.primary
            }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>
      </ScrollView>

      {/* Premium Modal */}
      <PremiumModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
        highlightedFeature="settings_premium"
      />
    </SafeAreaView>
  );
}
