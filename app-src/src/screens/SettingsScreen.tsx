import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TabScreenNavigation } from '../types';
import { colors, spacing, radius } from '../theme';
import { useAuth } from '../contexts/AuthContext';

const MENU_ITEMS = [
  { label: 'Notifications',  icon: 'notifications-outline'        as const, screen: 'Notifications' },
  { label: 'Support',        icon: 'chatbox-outline'               as const, screen: 'Support' },
  { label: 'FAQ',            icon: 'help-circle-outline'           as const, screen: 'FAQ' },
  { label: 'About Rumi',     icon: 'information-circle-outline'    as const, screen: 'About' },
];

type Props = { navigation: TabScreenNavigation };

export default function SettingsScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Settings</Text>

      {/* User banner */}
      {user && (
        <View style={styles.userBanner}>
          <View style={[styles.avatar, { backgroundColor: user.color }]}>
            <Text style={styles.avatarText}>{user.displayName[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>
        </View>
      )}

      {/* Menu */}
      <Text style={styles.sectionLabel}>General</Text>
      <View style={styles.card}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.row, i < MENU_ITEMS.length - 1 && styles.rowBorder]}
            onPress={() => item.screen && navigation.getParent()?.navigate(item.screen)}
            accessibilityLabel={item.label}
            activeOpacity={0.6}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={18} color={colors.accent} />
            </View>
            <Text style={styles.rowText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={signOut}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 72,
    paddingHorizontal: spacing.lg,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  username: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
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
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '400',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `rgba(255, 69, 58, 0.3)`,
    backgroundColor: `rgba(255, 69, 58, 0.06)`,
  },
  signOutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '500',
  },
});
