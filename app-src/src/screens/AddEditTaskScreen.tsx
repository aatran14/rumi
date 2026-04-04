import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, radius } from '../theme';
import { useSyncContext } from '../contexts/SyncContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, RepeatFrequency, Task } from '../types';

type AddProps = NativeStackScreenProps<RootStackParamList, 'AddTask'>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditTask'>;
type Props = AddProps | EditProps;

const FREQUENCIES: RepeatFrequency[] = ['Weekly', 'Biweekly', 'Monthly', 'Custom'];

export default function AddEditTaskScreen({ navigation, route }: Props) {
  const { tasks, setTasks, roommates } = useSyncContext();

  const isEdit = route.name === 'EditTask';
  const existingTask = isEdit
    ? tasks.find((t) => t.id === (route.params as { taskId: string }).taskId)
    : undefined;

  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [weight, setWeight] = useState(existingTask?.weight ?? 5);
  const [assignee, setAssignee] = useState(existingTask?.assignee ?? '');
  const [deadlineDate, setDeadlineDate] = useState(existingTask?.deadlineDate ?? '');
  const [deadlineTime, setDeadlineTime] = useState(existingTask?.deadlineTime ?? '');
  const [repeatOn, setRepeatOn] = useState(existingTask?.repeat ?? false);
  const [frequency, setFrequency] = useState<RepeatFrequency>(existingTask?.repeatFrequency ?? 'Weekly');

  // Points per roommate from active tasks
  const pointsMap: Record<string, number> = {};
  for (const t of tasks) {
    if (!t.done) {
      pointsMap[t.assignee] = (pointsMap[t.assignee] ?? 0) + (t.weight ?? 0);
    }
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
      Alert.alert('Delete Task', `Delete "${existingTask.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const SLIDER_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Task' : 'Add Task'}</Text>
        <TouchableOpacity
          onPress={isEdit ? handleDelete : () => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Ionicons name="trash-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Task name */}
        <Text style={styles.label}>Task</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.textMuted}
          autoFocus={!isEdit}
        />

        {/* Weight */}
        <Text style={styles.label}>Weight</Text>
        <View style={styles.sliderTrack}>
          {SLIDER_STEPS.map((step) => (
            <TouchableOpacity
              key={step}
              onPress={() => setWeight(step)}
              style={[styles.sliderSegment, step <= weight && styles.sliderSegmentActive]}
            />
          ))}
          <View style={[styles.sliderThumb, { left: `${((weight - 1) / 9) * 100}%` }]} />
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabelEnd}>1</Text>
          <Text style={styles.sliderLabelCenter}>{weight} pts</Text>
          <Text style={styles.sliderLabelEnd}>10</Text>
        </View>

        {/* Who */}
        <Text style={styles.label}>Who</Text>
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
                <Text style={styles.chipPts}>{currentPts} + {weight} pts</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Deadline */}
        <Text style={styles.label}>Deadline</Text>
        <View style={styles.deadlineRow}>
          <TextInput
            style={styles.deadlineInput}
            value={deadlineDate}
            onChangeText={setDeadlineDate}
            placeholder="Date"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.deadlineInput}
            value={deadlineTime}
            onChangeText={setDeadlineTime}
            placeholder="Time"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Repeat */}
        <Text style={styles.label}>Repeat</Text>
        <View style={styles.repeatRow}>
          <Switch
            value={repeatOn}
            onValueChange={setRepeatOn}
            trackColor={{ false: colors.surfaceLight, true: colors.green }}
            thumbColor={colors.white}
          />
          {repeatOn && <Text style={styles.frequencyLabel}>Frequency</Text>}
        </View>
        <View style={styles.frequencyRow}>
          {FREQUENCIES.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => { setRepeatOn(true); setFrequency(f); }}
              style={[styles.freqChip, repeatOn && frequency === f && styles.freqChipActive]}
            >
              <Text style={[styles.freqText, repeatOn && frequency === f && styles.freqTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>{isEdit ? 'Save Edits' : 'Save New Task'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 64 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26, fontWeight: '700', color: colors.white,
    flex: 1, textAlign: 'center',
  },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120 },

  // Stacked fields
  label: {
    color: colors.textPrimary, fontSize: 16, fontWeight: '600',
    marginBottom: 8, marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    color: colors.white, fontSize: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },

  // Slider
  sliderTrack: {
    flexDirection: 'row', height: 8, borderRadius: 4,
    backgroundColor: colors.surface, overflow: 'visible', position: 'relative',
  },
  sliderSegment: { flex: 1, height: 8, backgroundColor: colors.surfaceLight },
  sliderSegmentActive: { backgroundColor: colors.accent },
  sliderThumb: {
    position: 'absolute', top: -6, width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.white, marginLeft: -10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  sliderLabels: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 8,
  },
  sliderLabelEnd: { color: colors.textMuted, fontSize: 12 },
  sliderLabelCenter: { color: colors.white, fontSize: 13, fontWeight: '600' },

  // Chips — 2 col grid
  chipGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  chip: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md, paddingVertical: 10, alignItems: 'center',
    width: '47%',
  },
  chipSelected: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  chipName: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  chipNameSelected: { color: colors.white },
  chipPts: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

  // Deadline
  deadlineRow: { flexDirection: 'row', gap: 10 },
  deadlineInput: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    color: colors.white, fontSize: 14, textAlign: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },

  // Repeat
  repeatRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.sm,
  },
  frequencyLabel: { color: colors.textSecondary, fontSize: 15, fontWeight: '500' },
  frequencyRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md,
  },
  freqChip: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8,
  },
  freqChipActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  freqText: { color: colors.textMuted, fontSize: 14 },
  freqTextActive: { color: colors.white, fontWeight: '600' },

  // Save
  saveButton: {
    backgroundColor: colors.accent, borderRadius: radius.lg,
    paddingVertical: 16, alignItems: 'center', marginTop: spacing.xl,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  saveButtonText: { color: colors.white, fontSize: 18, fontWeight: '700' },
});
