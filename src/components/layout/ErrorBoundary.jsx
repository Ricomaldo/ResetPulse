/**
 * @fileoverview Error boundary component for catching and displaying errors
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import * as Updates from 'expo-updates';
import Logger from '../../utils/logger';
import { fontWeights } from '../../theme/tokens';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
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

  async handleRestart() {
    if (Updates.isAvailable) {
      await Updates.reloadAsync();
    } else {
      // En dev, reset le state
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😵</Text>
            <Text style={styles.title}>Oups&nbsp;!</Text>
            <Text style={styles.message}>
              L&apos;application a rencontré un problème
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => this.handleRestart()}
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

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const COLORS = {
  background: '#1a1a1a',
  white: '#ffffff',
  gray: '#999999',
  button: '#4A90E2',
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.button,
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: fontWeights.semibold,
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  message: {
    color: COLORS.gray,
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: fontWeights.bold,
    marginBottom: 10,
  },
});

export default ErrorBoundary;