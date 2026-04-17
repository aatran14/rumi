import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

type RadioOption = { label: string; value: string };

type Props = {
  options: RadioOption[];
  selected: string;
  onSelect: (value: string) => void;
};

export default function RadioGroup({ options, selected, onSelect }: Props) {
  return (
    <View style={styles.group}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.row, active && styles.rowActive]}
            onPress={() => onSelect(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            activeOpacity={0.7}
          >
            <View style={[styles.radio, active && styles.radioActive]}>
              {active && <View style={styles.dot} />}
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 2,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    gap: 12,
  },
  rowActive: {
    backgroundColor: colors.accentDim,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.accent,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
