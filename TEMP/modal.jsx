/**
 * @file app/modal.jsx
 * @description Test modal simple comme l'exemple natif Expo
 * @version 2.3.0 - Structure native simple
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { BaseButton } from '@src/ui/components';
import { useTheme } from '@src/ui/theme';

export default function ModalTestScreen() {
  const { title, subtitle, height } = useLocalSearchParams();
  const theme = useTheme();

  console.log('🔍 Modal Test - Params:', { title, subtitle, height });
  console.log('🔍 Modal Test - Theme colors:', theme?.colors);

  // Structure EXACTEMENT comme l'exemple natif Expo
  return (
    <View style={styles.container}>
      
      <Text style={[styles.title, { color: theme?.colors?.text || '#000' }]}>
        🎯 TEST MODAL NATIVE
      </Text>
      
      <View style={[styles.separator, { backgroundColor: theme?.colors?.border || '#eee' }]} />
      
      <Text style={[styles.subtitle, { color: theme?.colors?.textSecondary || '#666' }]}>
        Structure comme l'exemple natif Expo
      </Text>
      
      <Text style={[styles.info, { color: theme?.colors?.text || '#000' }]}>
        Title: {title || 'undefined'}
      </Text>
      
      <Text style={[styles.info, { color: theme?.colors?.text || '#000' }]}>
        Subtitle: {subtitle || 'undefined'}
      </Text>
      
      <Text style={[styles.info, { color: theme?.colors?.text || '#000' }]}>
        Theme mode: {theme?.mode || 'undefined'}
      </Text>
      
      <BaseButton
        title="🧪 Test Button"
        variant="primary"
        onPress={() => console.log('🔥 Button marche dans modal native !')}
      />
      
      <View style={[styles.colorBlock, { backgroundColor: theme?.colors?.primary || '#D81B60' }]}>
        <Text style={styles.colorText}>
          Bloc coloré thème
        </Text>
      </View>

      {/* StatusBar comme dans l'exemple natif */}
      <StatusBar style="auto" />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    marginBottom: 8,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  colorBlock: {
    width: 200,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  colorText: {
    color: 'white',
    fontWeight: '600',
  },
}); 