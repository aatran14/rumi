import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TabScreenNavigation } from '../types';
import { colors, spacing, radius } from '../theme';

const MENU_ITEMS = [
  { label: 'Notifications', icon: 'notifications-outline' as const, screen: 'Notifications' },
  { label: 'Support', icon: 'chatbox-outline' as const, screen: 'Support' },
  { label: 'FAQ', icon: 'help-circle-outline' as const, screen: 'FAQ' },
  { label: 'About', icon: 'information-circle-outline' as const, screen: 'About' },
];

type Props = { navigation: TabScreenNavigation };

export default function SettingsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Account Settings</Text>

      <View style={styles.card}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.row,
              i < MENU_ITEMS.length - 1 && styles.rowBorder,
            ]}
            onPress={() => item.screen && navigation.getParent()?.navigate(item.screen)}
            accessibilityLabel={item.label}
            activeOpacity={0.6}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={20} color={colors.accent} />
            </View>
            <Text style={styles.rowText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 80,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    color: colors.textPrimary,
    fontSize: 17,
    flex: 1,
    marginLeft: 14,
    fontWeight: '500',
  },
});
