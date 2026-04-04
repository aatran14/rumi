import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenNavigation } from '../types';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = { navigation: StackScreenNavigation };

export default function SupportScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Support" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Ionicons name="chatbubbles" size={40} color={colors.accentLight} />
          <Text style={styles.heroTitle}>Need help?</Text>
          <Text style={styles.heroSub}>
            We're here for you. Reach out and we'll get back to you within 24 hours.
          </Text>
        </View>

        <TouchableOpacity style={styles.option}>
          <View style={styles.iconWrap}>
            <Ionicons name="mail-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Email Us</Text>
            <Text style={styles.optionSub}>support@rumiapp.co</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <View style={styles.iconWrap}>
            <Ionicons name="bug-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Report a Bug</Text>
            <Text style={styles.optionSub}>Help us squash issues</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <View style={styles.iconWrap}>
            <Ionicons name="bulb-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Feature Request</Text>
            <Text style={styles.optionSub}>Tell us what you want next</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 64 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  heroCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl, gap: 8,
  },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '700' },
  heroSub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  option: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.accentDim,
    alignItems: 'center', justifyContent: 'center',
  },
  optionText: { flex: 1, marginLeft: 14 },
  optionTitle: { color: colors.white, fontSize: 16, fontWeight: '600' },
  optionSub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
