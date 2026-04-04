import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, setUserColor, availableColors } = useAuth();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const userColor = user?.color ?? colors.accent;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={[styles.avatarRing, { borderColor: userColor }]}>
        <View style={[styles.avatar, { backgroundColor: userColor }]}>
          <Ionicons name="person" size={56} color={colors.white} />
        </View>
      </View>

      <Text style={styles.name}>{user?.displayName ?? 'Your Name'}</Text>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{'\u{1F3E0}'} Home</Text>
      </View>

      {/* Color picker toggle */}
      <TouchableOpacity
        style={styles.colorToggle}
        onPress={() => setShowColorPicker(!showColorPicker)}
        activeOpacity={0.7}
      >
        <View style={[styles.colorDot, { backgroundColor: userColor }]} />
        <Text style={styles.colorToggleText}>Change color</Text>
        <Ionicons
          name={showColorPicker ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {showColorPicker && (
        <View style={styles.colorGrid}>
          {availableColors.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setUserColor(c)}
              activeOpacity={0.7}
              style={[
                styles.colorOption,
                { backgroundColor: c },
                c === userColor && styles.colorOptionSelected,
              ]}
            />
          ))}
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Roomies</Text>
        </View>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 110;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xl,
    letterSpacing: 0.3,
  },
  avatarRing: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: spacing.lg,
  },
  statusText: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '500',
  },

  // Color picker
  colorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  colorToggleText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.white,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
