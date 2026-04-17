import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TabScreenNavigation } from '../types';
import { colors, spacing, radius } from '../theme';
import { useAuth } from '../contexts/AuthContext';

const TILES = [
  { label: 'To-Do',    icon: 'checkbox-outline'  as const, screen: 'ToDo',     desc: 'Chores & tasks' },
  { label: 'Fridge',   icon: 'megaphone-outline'  as const, screen: 'Updates',  desc: 'Shared notes' },
  { label: 'Calendar', icon: 'calendar-outline'   as const, screen: 'Calendar', desc: 'Household events' },
  { label: 'Roomies',  icon: 'people-outline'     as const, screen: 'Roomies',  desc: 'Who\'s home?' },
] as const;

type Props = { navigation: TabScreenNavigation };

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();

  const handlePress = (screen: string) => {
    if (screen === 'Updates') {
      navigation.navigate('Updates');
    } else {
      navigation.getParent()?.navigate(screen) ?? navigation.navigate(screen as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Good morning{user ? ',' : ''}</Text>
          <Text style={styles.name}>{user?.displayName ?? 'Roomie'} 👋</Text>
        </View>
        <View style={[styles.userDot, { backgroundColor: user?.color ?? colors.accent }]}>
          <Text style={styles.userInitial}>
            {user?.displayName?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {TILES.map((tile) => (
          <TouchableOpacity
            key={tile.label}
            style={styles.tile}
            onPress={() => handlePress(tile.screen)}
            accessibilityLabel={tile.label}
            activeOpacity={0.75}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={tile.icon} size={28} color={colors.accent} />
            </View>
            <Text style={styles.tileLabel}>{tile.label}</Text>
            <Text style={styles.tileDesc}>{tile.desc}</Text>
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
    paddingTop: 64,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 8,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tileLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tileDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
