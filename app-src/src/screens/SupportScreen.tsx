import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenNavigation } from '../types';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = { navigation: StackScreenNavigation };

const OPTIONS = [
  {
    icon: 'mail-outline' as const,
    title: 'Email us',
    sub: 'support@rumiapp.co',
    onPress: () => Linking.openURL('mailto:support@rumiapp.co'),
  },
  {
    icon: 'bug-outline' as const,
    title: 'Report a bug',
    sub: 'Help us squash issues',
    onPress: () => {},
  },
  {
    icon: 'bulb-outline' as const,
    title: 'Feature request',
    sub: 'Tell us what you want next',
    onPress: () => {},
  },
];

export default function SupportScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Support" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="chatbubbles-outline" size={28} color={colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Need help?</Text>
          <Text style={styles.heroSub}>
            We're here for you. Reach out and we'll get back to you within 24 hours.
          </Text>
        </View>

        <View style={styles.card}>
          {OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt.title}
              style={[styles.row, i < OPTIONS.length - 1 && styles.rowBorder]}
              onPress={opt.onPress}
              activeOpacity={0.6}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={opt.icon} size={18} color={colors.accent} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.optTitle}>{opt.title}</Text>
                <Text style={styles.optSub}>{opt.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
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
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 10,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  heroSub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  optTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  optSub: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
