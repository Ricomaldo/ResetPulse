/**
 * @fileoverview BottomSheet Modal Template
 *
 * PATTERN: @gorhom/bottom-sheet avec detached={true}
 * SOURCE: https://gorhom.dev/react-native-bottom-sheet/detached
 * DEVLOG: _internal/cockpit/knowledge/devlog/2025-12-18_bottomsheet-modal-pattern.md
 *
 * ⚠️ IMPORTANT: Ce pattern résout le "peek bug" (ouverture à 15% au lieu de 90%)
 *
 * USAGE:
 * 1. Dupliquer ce fichier → `src/components/modals/VotreModal.jsx`
 * 2. Renommer le composant
 * 3. Ajuster snapPoints, styles, contenu
 * 4. Import dans parent screen/component
 *
 * EXEMPLE:
 * ```jsx
 * const [modalVisible, setModalVisible] = useState(false);
 *
 * <VotreModal
 *   visible={modalVisible}
 *   onClose={() => setModalVisible(false)}
 * />
 * ```
 *
 * @created 2025-12-18
 */

import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

export default function BottomSheetTemplate({ visible, onClose }) {
  const theme = useTheme();

  // ========== SNAP POINTS ==========
  // Un seul snap point pour modal simple (ex: 90%)
  // Plusieurs snap points pour drawer multi-niveau (ex: ['25%', '50%', '90%'])
  const snapPoints = useMemo(() => ['90%'], []);

  // ========== CALLBACKS ==========

  // Gérer les changements d'index (fermeture = index -1)
  const handleSheetChanges = useCallback((index) => {
    if (__DEV__) {
      console.warn('[BottomSheetTemplate] index:', index);
    }
    if (index === -1 && onClose) {
      onClose();
    }
  }, [onClose]);

  // Custom backdrop (overlay semi-transparent)
  // pressBehavior options: "none" | "close" | "collapse"
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}       // Apparaît quand sheet visible (index >= 0)
        disappearsOnIndex={-1}   // Disparaît quand sheet fermé (index -1)
        opacity={0.5}            // Opacité backdrop (0-1)
        pressBehavior="none"     // Pas de fermeture au tap backdrop (optionnel: "close")
      />
    ),
    []
  );

  // ========== STYLES ==========

  const styles = StyleSheet.create({
    // Container du sheet (marges pour effet "détaché")
    sheetContainer: {
      marginHorizontal: theme.spacing.md, // Marges latérales
      borderRadius: rs(20),               // Coins arrondis
      ...theme.shadow('xl'),              // Ombre portée
    },

    // Contenu interne du sheet
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },

    // Handle visuel personnalisé (barre de préhension)
    handle: {
      alignSelf: 'center',
      backgroundColor: theme.colors.textSecondary,
      borderRadius: rs(2.5),
      height: rs(5),
      marginBottom: theme.spacing.md,
      opacity: 0.8,
      width: rs(50),
    },
  });

  // ========== RENDER ==========

  return (
    <BottomSheet
      // INDEX CONTROL
      // visible ? 0 : -1 → Pattern déclaratif (pas de ref needed)
      // 0 = premier snap point (90%), -1 = fermé
      index={visible ? 0 : -1}

      // SNAP CONFIGURATION
      snapPoints={snapPoints}
      enablePanDownToClose={true}     // Swipe down pour fermer
      enableDynamicSizing={false}     // Si true, hauteur auto-calculée (voir doc Dynamic Sizing)

      // DETACHED MODE (clé du pattern - évite le "peek bug")
      detached={true}                 // Modal "flottant" au lieu de fullscreen
      bottomInset={46}                // Espace en bas (SafeArea bottom)
      style={styles.sheetContainer}   // Marges + ombre

      // CALLBACKS
      onChange={handleSheetChanges}

      // CUSTOMIZATION
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ display: 'none' }} // Cacher handle par défaut (on utilise custom)

      // BACKGROUND STYLE
      backgroundStyle={{
        backgroundColor: theme.colors.surface,
        // Border subtile iOS uniquement (Android se fie aux ombres)
        ...Platform.select({
          ios: {
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
          },
          android: {},
        }),
      }}
    >
      <BottomSheetView style={styles.container}>
        {/* Handle custom (barre de préhension visuelle) */}
        <View style={styles.handle} />

        {/* ========== CONTENU DU MODAL ========== */}
        {/* Remplacer par votre contenu ici */}
        <Text style={{ color: theme.colors.text, fontSize: rs(16) }}>
          Contenu du modal ici
        </Text>

        {/*
        EXEMPLES DE CONTENU:
        - Settings list (ScrollView avec sections)
        - Paywall (titre, features, CTA)
        - Discovery (carrousels d'aperçus)
        - Form (inputs, validation)
        */}
      </BottomSheetView>
    </BottomSheet>
  );
}

/**
 * ========== NOTES D'IMPLÉMENTATION ==========
 *
 * PROPS COMMUNES:
 * - visible (bool): Contrôle affichage (index 0 ou -1)
 * - onClose (function): Callback fermeture
 *
 * VARIANTES POSSIBLES:
 *
 * 1. MULTI-SNAP (drawer avec plusieurs niveaux)
 * ```jsx
 * snapPoints={['25%', '50%', '90%']}
 * index={visible ? 2 : -1} // Démarre au 3ème snap (90%)
 * ```
 *
 * 2. DYNAMIC SIZING (hauteur auto selon contenu)
 * ```jsx
 * enableDynamicSizing={true}
 * maxDynamicContentSize={screenHeight * 0.9}
 * snapPoints={undefined} // Pas de snap points fixes
 * ```
 *
 * 3. TAP BACKDROP TO CLOSE
 * ```jsx
 * pressBehavior="close" // Au lieu de "none"
 * ```
 *
 * 4. CUSTOM ANIMATIONS
 * ```jsx
 * animationConfigs={{
 *   duration: 300,
 *   easing: Easing.bezier(0.25, 0.1, 0.25, 1),
 * }}
 * ```
 *
 * ========== TROUBLESHOOTING ==========
 *
 * PROBLÈME: Modal s'ouvre à 15% au lieu de 90%
 * SOLUTION: Vérifier detached={true} + index={visible ? 0 : -1}
 *
 * PROBLÈME: Animation saccadée
 * SOLUTION: Utiliser BottomSheetView (pas View standard) pour contenu
 *
 * PROBLÈME: Backdrop ne s'affiche pas
 * SOLUTION: Vérifier appearsOnIndex={0} et disappearsOnIndex={-1}
 *
 * PROBLÈME: Swipe down ne ferme pas
 * SOLUTION: enablePanDownToClose={true} + onChange callback correct
 *
 * ========== RESSOURCES ==========
 *
 * Doc officielle v5: https://gorhom.dev/react-native-bottom-sheet/
 * Detached pattern: https://gorhom.dev/react-native-bottom-sheet/detached
 * Dynamic Sizing: https://gorhom.dev/react-native-bottom-sheet/dynamic-sizing
 * GitHub Issues: https://github.com/gorhom/react-native-bottom-sheet/issues
 *
 * Devlog debugging: _internal/cockpit/knowledge/devlog/2025-12-18_bottomsheet-modal-pattern.md
 */
