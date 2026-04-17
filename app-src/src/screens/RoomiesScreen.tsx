import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenNavigation } from '../types';
import { useSyncContext } from '../contexts/SyncContext';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = { navigation: StackScreenNavigation };

const STATUS_COLORS: Record<string, string> = {
  Home: colors.success,
  Away: colors.textMuted,
};

export default function RoomiesScreen({ navigation }: Props) {
  const { roommates } = useSyncContext();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Roomies" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {roommates.map((r) => (
          <View key={r.id} style={styles.card}>
            {/* Speech bubble */}
            <View style={[styles.bubble, { backgroundColor: r.bubbleColor + '22', borderColor: r.bubbleColor + '55' }]}>
              <Text style={[styles.bubbleText, { color: r.bubbleColor }]}>{r.bubble}</Text>
              {r.timestamp && (
                <Text style={styles.timestamp}>{r.timestamp}</Text>
              )}
            </View>

            {/* Avatar */}
            <View style={[styles.avatarRing, { borderColor: r.bubbleColor + '66' }]}>
              <View style={[styles.avatar, { backgroundColor: r.bubbleColor + '33' }]}>
                <Ionicons name="person" size={36} color={r.bubbleColor} />
              </View>
            </View>

            <Text style={styles.name}>{r.name}</Text>

            <View style={styles.statusPill}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[r.status] ?? colors.textMuted }]} />
              <Text style={[styles.statusText, { color: STATUS_COLORS[r.status] ?? colors.textMuted }]}>
                {r.status}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const AVATAR_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingBottom: 100,
  },
  card: {
    width: '46%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: 8,
  },
  bubble: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'stretch',
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  avatarRing: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    borderWidth: 2,
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
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
