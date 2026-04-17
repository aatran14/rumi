import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useSyncContext } from '../contexts/SyncContext';

export default function ProfileScreen() {
  const { user, setUserColor, availableColors } = useAuth();
  const { tasks, events, roommates } = useSyncContext();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const userColor   = user?.color ?? colors.accent;
  const doneTasks   = tasks.filter((t) => t.done).length;
  const activeTasks = tasks.filter((t) => !t.done).length;

  const initial = user?.displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Profile</Text>

      {/* Avatar */}
      <View style={[styles.avatarRing, { borderColor: userColor + '66' }]}>
        <View style={[styles.avatar, { backgroundColor: userColor }]}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
      </View>

      <Text style={styles.name}>{user?.displayName ?? 'Your Name'}</Text>
      <Text style={styles.username}>@{user?.username ?? 'username'}</Text>

      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
        <Text style={styles.statusText}>Home</Text>
      </View>

      {/* Stats card */}
      <View style={styles.statsCard}>
        {[
          { label: 'Active tasks', value: activeTasks },
          { label: 'Completed',    value: doneTasks },
          { label: 'Events',       value: events.length },
          { label: 'Roomies',      value: roommates.length },
        ].map((stat, i, arr) => (
          <React.Fragment key={stat.label}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={styles.statDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Color picker */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionRow}
          onPress={() => setShowColorPicker(!showColorPicker)}
          activeOpacity={0.7}
        >
          <View style={[styles.colorSwatch, { backgroundColor: userColor }]} />
          <Text style={styles.sectionLabel}>Profile color</Text>
          <Ionicons
            name={showColorPicker ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {showColorPicker && (
          <View style={styles.colorGrid}>
            {availableColors.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setUserColor(c)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  c === userColor && styles.colorOptionSelected,
                ]} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const AVATAR_SIZE = 104;

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: {
    paddingTop: 72,
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    alignItems: 'center',
    gap: spacing.md,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  avatarRing: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '700',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  username: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: -4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },

  // Stats
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: colors.border,
  },

  // Section card
  section: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sectionLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '400',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    padding: spacing.md,
    paddingTop: 0,
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
});
