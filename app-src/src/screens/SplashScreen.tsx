import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { StackScreenNavigation } from '../types';
import { colors } from '../theme';

type Props = { navigation: StackScreenNavigation };

export default function SplashScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.titleWrap}>
        <Text style={styles.title}>Rumi</Text>
        <View style={styles.glow} />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Login')}
        accessibilityLabel="Check in to Rumi"
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Check-In</Text>
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
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 80,
    color: colors.white,
    fontStyle: 'italic',
    fontFamily: 'serif',
    letterSpacing: 2,
  },
  glow: {
    position: 'absolute',
    top: 20,
    width: 200,
    height: 60,
    borderRadius: 100,
    backgroundColor: colors.accent,
    opacity: 0.12,
    transform: [{ scaleX: 2 }],
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 64,
    paddingVertical: 18,
    borderRadius: 32,
    position: 'absolute',
    bottom: 100,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
