import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { StackScreenNavigation } from '../types';
import { colors, radius } from '../theme';

type Props = { navigation: StackScreenNavigation };

export default function SplashScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.center}>
        <Text style={styles.wordmark}>Rumi</Text>
        <Text style={styles.tagline}>Home. Together.</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Login')}
        accessibilityLabel="Get started with Rumi"
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Get started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 80,
    color: colors.textPrimary,
    fontStyle: 'italic',
    fontFamily: 'serif',
    letterSpacing: 2,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  button: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 48,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
