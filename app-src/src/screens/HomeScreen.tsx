import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TabScreenNavigation } from '../types';
import { colors, spacing } from '../theme';

const BUTTONS = [
  { label: 'To-Do', icon: 'clipboard-outline' as const, screen: 'ToDo' },
  { label: 'Updates', icon: 'megaphone-outline' as const, screen: 'Updates' },
  { label: 'Calendar', icon: 'calendar-outline' as const, screen: 'Calendar' },
  { label: 'Roomies', icon: 'people-outline' as const, screen: 'Roomies' },
] as const;

type Props = { navigation: TabScreenNavigation };

export default function HomeScreen({ navigation }: Props) {
  const handlePress = (screen: string) => {
    if (screen === 'Updates') {
      navigation.navigate('Updates');
    } else {
      navigation.getParent()?.navigate(screen) ?? navigation.navigate(screen as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <View style={styles.grid}>
        {BUTTONS.map((btn) => (
          <TouchableOpacity
            key={btn.label}
            style={styles.item}
            onPress={() => handlePress(btn.screen)}
            accessibilityLabel={btn.label}
            activeOpacity={0.7}
          >
            <View style={styles.circle}>
              <Ionicons name={btn.icon} size={52} color={colors.white} />
            </View>
            <Text style={styles.label}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const CIRCLE_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 72,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: spacing.xl,
  },
  item: {
    alignItems: 'center',
    gap: 12,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  label: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
