import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { StackScreenNavigation } from '../types';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = { navigation: StackScreenNavigation };

export default function AboutScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ScreenHeader title="About" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>Rumi</Text>
        <Text style={styles.version}>Version 1.0.0</Text>

        <View style={styles.card}>
          <Text style={styles.heading}>What is Rumi?</Text>
          <Text style={styles.body}>
            Rumi is a shared living companion designed to make roommate life easier. Coordinate chores, share updates on the Fridge, sync calendars, and stay in tune with your household — all in one place.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Our Mission</Text>
          <Text style={styles.body}>
            We believe great roommate relationships start with great communication. Rumi replaces messy group chats and passive-aggressive sticky notes with a single, playful app that keeps everyone on the same page.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Built By</Text>
          <Text style={styles.body}>
            Daniel, Gaya, Adriel, and Andy — four roommates who got tired of arguing about whose turn it was to take out the trash.
          </Text>
        </View>

        <Text style={styles.footer}>Made with love from our apartment to yours.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 64 },
  content: {
    paddingHorizontal: spacing.lg, paddingBottom: 100, alignItems: 'center',
  },
  logo: {
    fontSize: 48, color: colors.white, fontStyle: 'italic', fontFamily: 'serif',
    letterSpacing: 2, marginBottom: 4,
  },
  version: {
    color: colors.textMuted, fontSize: 14, marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, width: '100%', marginBottom: spacing.md,
  },
  heading: {
    color: colors.white, fontSize: 17, fontWeight: '700', marginBottom: spacing.sm,
  },
  body: {
    color: colors.textSecondary, fontSize: 14, lineHeight: 21,
  },
  footer: {
    color: colors.textMuted, fontSize: 13, fontStyle: 'italic', marginTop: spacing.lg,
  },
});
