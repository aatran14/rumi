import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

type RadioOption = { label: string; value: string };

type Props = {
  options: RadioOption[];
  selected: string;
  onSelect: (value: string) => void;
};

export default function RadioGroup({ options, selected, onSelect }: Props) {
  return (
    <View style={styles.group}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={styles.row}
          onPress={() => onSelect(opt.value)}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === opt.value }}
        >
          <View
            style={[
              styles.radio,
              selected === opt.value && styles.radioSelected,
            ]}
          >
            {selected === opt.value && <View style={styles.radioDot} />}
          </View>
          <Text
            style={[
              styles.label,
              selected === opt.value && styles.labelSelected,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginLeft: spacing.md,
    marginBottom: spacing.lg,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  labelSelected: {
    color: colors.white,
    fontWeight: '500',
  },
});
