// src/components/SplashScreen.jsx
/**
 * Branded splash screen shown during app initialization
 * Replaces blank screen while AsyncStorage loads
 */

import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="small"
        color="#e5a8a3"
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ebe8e3', // Brand cream background
  },
  logo: {
    width: 120,
    height: 120,
  },
  loader: {
    marginTop: 24,
  },
});

export default SplashScreen;
