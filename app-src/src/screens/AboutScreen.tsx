import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { StackScreenNavigation } from '../types';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = { navigation: StackScreenNavigation };

const CARDS = [
  {
    heading: 'What is Rumi?',
    body: 'Rumi is a shared living companion designed to make roommate life easier. Coordinate chores, share updates on the Fridge, sync calendars, and stay in tune with your household — all in one place.',
  },
  {
    heading: 'Our mission',
    body: 'We believe great roommate relationships start with great communication. Rumi replaces messy group chats and passive-aggressive sticky notes with a single, playful app that keeps everyone on the same page.',
  },
  {
    heading: 'Built by',
    body: 'Daniel, Gaya, Adriel, and Andy — four roommates who got tired of arguing about whose turn it was to take out the trash.',
  },
];

export default function AboutScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ScreenHeader title="About" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.hero}>
          <Text style={styles.wordmark}>Rumi</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {CARDS.map((c) => (
          <View key={c.heading} style={styles.card}>
            <Text style={styles.heading}>{c.heading}</Text>
            <Text style={styles.body}>{c.body}</Text>
          </View>
        ))}

        <Text style={styles.footer}>Made with love from our apartment to yours.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  wordmark: {
    fontSize: 56,
    color: colors.textPrimary,
    fontStyle: 'italic',
    fontFamily: 'serif',
    letterSpacing: 2,
    marginBottom: 6,
  },
  version: {
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 8,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    paddingVertical: spacing.md,
  },
});
