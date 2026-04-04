import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import type { StackScreenNavigation } from '../types';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import RadioGroup from '../components/RadioGroup';

type Props = { navigation: StackScreenNavigation };

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.green }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function NotificationsScreen({ navigation }: Props) {
  const [choreReminder, setChoreReminder] = useState('48h');
  const [updatesEnabled, setUpdatesEnabled] = useState(true);
  const [updatesFilter, setUpdatesFilter] = useState('important');
  const [calendarUpdates, setCalendarUpdates] = useState(true);
  const [locationShare, setLocationShare] = useState(true);
  const [roommateStatus, setRoommateStatus] = useState(true);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Chore Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chore Reminders</Text>
          <RadioGroup
            options={[
              { label: '24 hours before due', value: '24h' },
              { label: '48 hours before due', value: '48h' },
              { label: 'Custom', value: 'custom' },
            ]}
            selected={choreReminder}
            onSelect={setChoreReminder}
          />
        </View>

        {/* Updates */}
        <View style={styles.section}>
          <ToggleRow label="Updates" value={updatesEnabled} onChange={setUpdatesEnabled} />
          {updatesEnabled && (
            <RadioGroup
              options={[
                { label: 'All', value: 'all' },
                { label: 'Only Important Flagged', value: 'important' },
                { label: 'Custom', value: 'custom' },
              ]}
              selected={updatesFilter}
              onSelect={setUpdatesFilter}
            />
          )}
        </View>

        {/* Toggles */}
        <View style={styles.section}>
          <ToggleRow label="Calendar Updates" value={calendarUpdates} onChange={setCalendarUpdates} />
          <ToggleRow label="Enable Location Share" value={locationShare} onChange={setLocationShare} />
          <ToggleRow label="Roommate Status Change" value={roommateStatus} onChange={setRoommateStatus} />
        </View>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
});
