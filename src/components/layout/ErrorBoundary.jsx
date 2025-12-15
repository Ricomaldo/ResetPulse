/**
 * @fileoverview Error boundary component for catching and displaying errors
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import * as Updates from 'expo-updates';
import Logger from '../../utils/logger';
import { fontWeights } from '../../theme/tokens';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log l'erreur
    Logger.error('App crashed', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  handleRestart = async () => {
    if (Updates.isAvailable) {
      await Updates.reloadAsync();
    } else {
      // En dev, reset le state
      this.setState({ hasError: false });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😵</Text>
            <Text style={styles.title}>Oups !</Text>
            <Text style={styles.message}>
              L'application a rencontré un problème
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleRestart}
            >
              <Text style={styles.buttonText}>Redémarrer</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    alignItems: 'center',
    padding: 20
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    color: '#fff',
    marginBottom: 10
  },
  message: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: fontWeights.semibold
  }
});

export default ErrorBoundary;