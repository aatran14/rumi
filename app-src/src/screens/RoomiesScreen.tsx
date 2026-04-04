import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenNavigation } from '../types';
import { useSyncContext } from '../contexts/SyncContext';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

const AVATAR_SIZE = 96;

type Props = { navigation: StackScreenNavigation };

export default function RoomiesScreen({ navigation }: Props) {
  const { roommates } = useSyncContext();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Roomies" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.grid}>
        {roommates.map((r) => (
          <View key={r.id} style={styles.card}>
            {/* Speech bubble */}
            <View style={[styles.bubble, { backgroundColor: r.bubbleColor }]}>
              <Text style={styles.bubbleText}>{r.bubble}</Text>
              {r.timestamp && (
                <Text style={styles.timestamp}>{r.timestamp}</Text>
              )}
              <View style={[styles.bubbleTail, { borderTopColor: r.bubbleColor }]} />
            </View>

            {/* Avatar */}
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={colors.accentLight} />
              </View>
            </View>

            <Text style={styles.name}>{r.name}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusEmoji}>{r.statusEmoji}</Text>
              <Text style={[
                styles.statusText,
                r.status === 'Away' && styles.statusAway,
              ]}>
                {r.status}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 64,
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
    alignItems: 'center',
    width: '44%',
    paddingVertical: spacing.sm,
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 2,
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    left: 24,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bubbleText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
    alignSelf: 'flex-end',
  },
  avatarRing: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    borderWidth: 2.5,
    borderColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusEmoji: {
    fontSize: 13,
  },
  statusText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '500',
  },
  statusAway: {
    color: colors.textMuted,
  },
});
