import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import type { StackScreenNavigation } from '../types';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import RadioGroup from '../components/RadioGroup';

type Props = { navigation: StackScreenNavigation };

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({ label, sub, value, onChange }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sub && <Text style={styles.toggleSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceHover, true: colors.success }}
        thumbColor={colors.textPrimary}
      />
    </View>
  );
}

export default function NotificationsScreen({ navigation }: Props) {
  const [choreReminder,   setChoreReminder]   = useState('48h');
  const [updatesEnabled,  setUpdatesEnabled]  = useState(true);
  const [updatesFilter,   setUpdatesFilter]   = useState('important');
  const [calendarUpdates, setCalendarUpdates] = useState(true);
  const [locationShare,   setLocationShare]   = useState(true);
  const [roommateStatus,  setRoommateStatus]  = useState(true);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <SectionCard title="Chore reminders">
          <RadioGroup
            options={[
              { label: '24 hours before due', value: '24h' },
              { label: '48 hours before due', value: '48h' },
              { label: 'Custom',              value: 'custom' },
            ]}
            selected={choreReminder}
            onSelect={setChoreReminder}
          />
        </SectionCard>

        <SectionCard title="Fridge updates">
          <ToggleRow
            label="Push notifications"
            sub="Get notified when roommates post"
            value={updatesEnabled}
            onChange={setUpdatesEnabled}
          />
          {updatesEnabled && (
            <View style={styles.subSection}>
              <RadioGroup
                options={[
                  { label: 'All notes',             value: 'all' },
                  { label: 'Important only',         value: 'important' },
                  { label: 'Custom',                 value: 'custom' },
                ]}
                selected={updatesFilter}
                onSelect={setUpdatesFilter}
              />
            </View>
          )}
        </SectionCard>

        <SectionCard title="Other">
          <ToggleRow
            label="Calendar updates"
            sub="New or changed household events"
            value={calendarUpdates}
            onChange={setCalendarUpdates}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            label="Location sharing"
            sub="Let roommates see when you're home"
            value={locationShare}
            onChange={setLocationShare}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            label="Roomie status changes"
            sub="Home / Away updates"
            value={roommateStatus}
            onChange={setRoommateStatus}
          />
        </SectionCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  toggleSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
    lineHeight: 16,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: -spacing.sm,
  },
  subSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
