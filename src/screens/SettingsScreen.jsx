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
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    header: {
      borderBottomColor: theme.colors.border + '20',
      borderBottomWidth: 1,
      paddingBottom: rs(12),
      paddingHorizontal: rs(20),
      paddingTop: rs(16),
    },
    headerText: {
      color: theme.colors.text,
      fontSize: rs(24),
      fontWeight: fontWeights.bold,
      textAlign: 'center',
    },
    premiumBadge: {
      fontSize: rs(24),
    },
    premiumButton: {
      alignItems: 'center',
      borderRadius: rs(8),
      justifyContent: 'center',
      marginTop: rs(8),
      minHeight: 44,
      paddingHorizontal: rs(16),
      paddingVertical: rs(12),
    },
    premiumButtonRestore: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    premiumButtonText: {
      color: theme.colors.text,
      fontSize: rs(14),
      fontWeight: fontWeights.semibold,
    },
    premiumButtonUnlock: {
      backgroundColor: theme.colors.brand.primary,
    },
    premiumButtonUnlockText: {
      color: theme.colors.fixed.white,
    },
    premiumHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: rs(8),
      marginBottom: rs(12),
    },
    premiumSection: {
      backgroundColor: theme.colors.surface,
      borderColor: isPremium ? theme.colors.brand.primary : theme.colors.border + '40',
      borderRadius: rs(12),
      borderWidth: 1,
      marginBottom: rs(24),
      paddingHorizontal: rs(16),
      paddingVertical: rs(16),
    },
    premiumStatus: {
      color: theme.colors.textSecondary,
      fontSize: rs(13),
      marginBottom: rs(12),
    },
    premiumTitle: {
      color: isPremium ? theme.colors.brand.primary : theme.colors.text,
      flex: 1,
      fontSize: rs(16),
      fontWeight: fontWeights.bold,
    },
    scrollContent: {
      paddingBottom: rs(40),
      paddingHorizontal: rs(20),
      paddingTop: rs(60),
    },
    scrollView: {
      flex: 1,
    },
    settingDescription: {
      color: theme.colors.textSecondary,
      fontSize: rs(14),
      lineHeight: rs(20),
    },
    settingInfo: {
      flex: 1,
      marginRight: rs(16),
    },
    settingLabel: {
      color: theme.colors.text,
      fontSize: rs(17),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(4),
    },
    settingRow: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border + '20',
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: rs(16),
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
