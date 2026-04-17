import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, radius } from '../theme';
import { useSyncContext } from '../contexts/SyncContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, RepeatFrequency, Task } from '../types';

type AddProps  = NativeStackScreenProps<RootStackParamList, 'AddTask'>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditTask'>;
type Props = AddProps | EditProps;

const FREQUENCIES: RepeatFrequency[] = ['Weekly', 'Biweekly', 'Monthly', 'Custom'];

export default function AddEditTaskScreen({ navigation, route }: Props) {
  const { tasks, setTasks, roommates } = useSyncContext();

  const isEdit = route.name === 'EditTask';
  const existingTask = isEdit
    ? tasks.find((t) => t.id === (route.params as { taskId: string }).taskId)
    : undefined;

  const [title,        setTitle]        = useState(existingTask?.title ?? '');
  const [weight,       setWeight]       = useState(existingTask?.weight ?? 5);
  const [assignee,     setAssignee]     = useState(existingTask?.assignee ?? '');
  const [deadlineDate, setDeadlineDate] = useState(existingTask?.deadlineDate ?? '');
  const [deadlineTime, setDeadlineTime] = useState(existingTask?.deadlineTime ?? '');
  const [repeatOn,     setRepeatOn]     = useState(existingTask?.repeat ?? false);
  const [frequency,    setFrequency]    = useState<RepeatFrequency>(existingTask?.repeatFrequency ?? 'Weekly');

  const pointsMap: Record<string, number> = {};
  for (const t of tasks) {
    if (!t.done) pointsMap[t.assignee] = (pointsMap[t.assignee] ?? 0) + (t.weight ?? 0);
  }

  const handleSave = () => {
    if (!title.trim()) return;
    const task: Task = {
      id: existingTask?.id ?? Date.now().toString(),
      title: title.trim(),
      assignee: assignee || 'Unassigned',
      weight,
      deadlineDate,
      deadlineTime,
      repeat: repeatOn,
      repeatFrequency: repeatOn ? frequency : undefined,
      done: existingTask?.done ?? false,
    };
    if (isEdit) {
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    } else {
      setTasks([task, ...tasks]);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existingTask) return;
    const doDelete = () => {
      setTasks(tasks.filter((t) => t.id !== existingTask.id));
      navigation.goBack();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${existingTask.title}"?`)) doDelete();
    } else {
      Alert.alert('Delete task', `Delete "${existingTask.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit task' : 'New task'}</Text>
        {isEdit ? (
          <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Task name */}
        <View style={styles.field}>
          <Text style={styles.label}>Task name</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor={colors.textMuted}
            autoFocus={!isEdit}
          />
        </View>

        {/* Weight */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Effort weight</Text>
            <Text style={styles.weightValue}>{weight} pts</Text>
          </View>
          <View style={styles.weightTrack}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
              <TouchableOpacity
                key={step}
                style={[styles.weightSegment, step <= weight && styles.weightSegmentFilled]}
                onPress={() => setWeight(step)}
              />
            ))}
          </View>
          <View style={styles.weightLabels}>
            <Text style={styles.weightEndLabel}>Easy</Text>
            <Text style={styles.weightEndLabel}>Heavy</Text>
          </View>
        </View>

        {/* Who */}
        <View style={styles.field}>
          <Text style={styles.label}>Assign to</Text>
          <View style={styles.chipGrid}>
            {roommates.map((rm) => {
              const selected = assignee === rm.name;
              const currentPts = pointsMap[rm.name] ?? 0;
              return (
                <TouchableOpacity
                  key={rm.id}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setAssignee(selected ? '' : rm.name)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipName, selected && styles.chipNameSelected]}>
                    {rm.name}
                  </Text>
                  <Text style={[styles.chipPts, selected && styles.chipPtsSelected]}>
                    {currentPts} + {weight} pts
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Deadline */}
        <View style={styles.field}>
          <Text style={styles.label}>Deadline</Text>
          <View style={styles.deadlineRow}>
            <TextInput
              style={[styles.input, styles.deadlineInput]}
              value={deadlineDate}
              onChangeText={setDeadlineDate}
              placeholder="Date (e.g. Jun 12, 2024)"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.input, styles.deadlineInput]}
              value={deadlineTime}
              onChangeText={setDeadlineTime}
              placeholder="Time (e.g. 5:00 PM)"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Repeat */}
        <View style={styles.field}>
          <View style={styles.repeatHeader}>
            <Text style={styles.label}>Repeat</Text>
            <Switch
              value={repeatOn}
              onValueChange={setRepeatOn}
              trackColor={{ false: colors.surfaceHover, true: colors.success }}
              thumbColor={colors.textPrimary}
            />
          </View>
          {repeatOn && (
            <View style={styles.freqRow}>
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.freqChip, frequency === f && styles.freqChipActive]}
                  onPress={() => setFrequency(f)}
                >
                  <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={!title.trim()}
        >
          <Text style={styles.saveBtnText}>
            {isEdit ? 'Save changes' : 'Add task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSpacer: { width: 34 },

  // Scroll
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    gap: spacing.lg,
  },

  // Fields
  field: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    color: colors.textPrimary,
    fontSize: 15,
  },

  // Weight
  weightValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  weightTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    gap: 2,
  },
  weightSegment: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 2,
  },
  weightSegmentFilled: {
    backgroundColor: colors.accent,
  },
  weightLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  weightEndLabel: { color: colors.textMuted, fontSize: 11 },

  // Assignee chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  chipName: { color: colors.textSecondary, fontSize: 15, fontWeight: '500' },
  chipNameSelected: { color: colors.textPrimary },
  chipPts: { color: colors.textMuted, fontSize: 12 },
  chipPtsSelected: { color: colors.accentSoft },

  // Deadline
  deadlineRow: { flexDirection: 'row', gap: 10 },
  deadlineInput: { flex: 1, textAlign: 'center' },

  // Repeat
  repeatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  freqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  freqChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  freqChipActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accentBorder,
  },
  freqText: { color: colors.textMuted, fontSize: 14 },
  freqTextActive: { color: colors.accentSoft, fontWeight: '500' },

  // Save
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
});
