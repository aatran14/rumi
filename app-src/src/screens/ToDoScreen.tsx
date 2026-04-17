import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, Platform, Alert, Pressable, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenNavigation, Task } from '../types';
import { TASK_FILTERS } from '../data/tasks';
import { useSyncContext } from '../contexts/SyncContext';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, radius } from '../theme';

type Props = { navigation: StackScreenNavigation };

export default function ToDoScreen({ navigation }: Props) {
  const { tasks, setTasks } = useSyncContext();
  const { user } = useAuth();
  const [tab, setTab] = useState<'Mine' | 'Everyone'>('Mine');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (tab === 'Mine' && user) {
      list = list.filter(
        (t) =>
          t.assignee.toLowerCase() === user.displayName.toLowerCase() ||
          t.assignee.toLowerCase() === user.username.toLowerCase() ||
          t.assignee === 'You',
      );
    }
    switch (activeFilter) {
      case 'today':
        list = list.filter((t) => {
          const due = (t.due ?? t.deadlineDate ?? '').toLowerCase();
          return due.includes('today') || due.includes(new Date().toLocaleDateString());
        });
        break;
      case 'archived': list = list.filter((t) => t.done); break;
      case 'in progress': list = list.filter((t) => !t.done); break;
    }
    return list;
  }, [tasks, tab, activeFilter, user]);

  const toggleTask = (id: string) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const archiveTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    setViewingTask(null);
  };

  const dueLabel = (task: Task) => task.due ?? task.deadlineDate ?? '';
  const repeatLabel = (task: Task) =>
    task.repeat ? (task.repeatFrequency ?? 'Repeating') : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To-Do</Text>
        <TouchableOpacity
          style={[styles.headerBtn, styles.addBtn]}
          onPress={() => navigation.navigate('AddTask')}
        >
          <Ionicons name="add" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Mine / Everyone segment */}
      <View style={styles.segmentRow}>
        {(['Mine', 'Everyone'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.segment, tab === t && styles.segmentActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {TASK_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task list */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkbox-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No tasks here</Text>
            <Text style={styles.emptyHint}>Add one with the + button above.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.taskCard, item.done && styles.taskCardDone]}
            onPress={() => setViewingTask(item)}
          >
            <Pressable
              onPress={() => toggleTask(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={item.done ? 'checkbox' : 'square-outline'}
                size={24}
                color={item.done ? colors.success : colors.textMuted}
              />
            </Pressable>

            <View style={styles.taskBody}>
              <Text style={[styles.taskTitle, item.done && styles.taskTitleDone]}>
                {item.title}
              </Text>
              <View style={styles.taskMeta}>
                <View style={[styles.badge, styles.assigneeBadge]}>
                  <Text style={styles.badgeText}>{item.assignee}</Text>
                </View>
                {dueLabel(item) ? (
                  <View style={styles.duePill}>
                    <Ionicons name="time-outline" size={11} color={colors.warning} />
                    <Text style={styles.dueText}>{dueLabel(item)}</Text>
                  </View>
                ) : null}
                {repeatLabel(item) ? (
                  <View style={styles.repeatPill}>
                    <Ionicons name="repeat" size={11} color={colors.accent} />
                    <Text style={styles.repeatText}>{repeatLabel(item)}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('EditTask', { taskId: item.id })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.editBtn}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </Pressable>
        )}
      />

      {/* Task detail modal */}
      <Modal
        visible={!!viewingTask}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingTask(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setViewingTask(null)}>
          <Pressable style={styles.detailCard} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity
              style={styles.detailClose}
              onPress={() => setViewingTask(null)}
            >
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <Text style={styles.detailTitle}>{viewingTask?.title}</Text>

            <View
              style={[
                styles.statusBadge,
                viewingTask?.done ? styles.statusDone : styles.statusPending,
              ]}
            >
              <Text style={[styles.statusText, viewingTask?.done && styles.statusTextDone]}>
                {viewingTask?.done ? 'Completed' : 'In progress'}
              </Text>
            </View>

            <View style={styles.detailRows}>
              {viewingTask && [
                ['Assigned to', viewingTask.assignee],
                ['Due', dueLabel(viewingTask)],
                ['Weight', viewingTask.weight ? `${viewingTask.weight} pts` : null],
                ['Repeats', repeatLabel(viewingTask)],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <View key={label as string} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{label}</Text>
                    <Text style={styles.detailValue}>{value}</Text>
                  </View>
                ))}
            </View>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.editAction}
                onPress={() => {
                  const id = viewingTask?.id;
                  setViewingTask(null);
                  if (id) navigation.navigate('EditTask', { taskId: id });
                }}
              >
                <Ionicons name="pencil-outline" size={16} color={colors.accent} />
                <Text style={styles.editActionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.archiveAction}
                onPress={() => viewingTask && archiveTask(viewingTask.id)}
              >
                <Ionicons name="archive-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.archiveActionText}>Archive</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  addBtn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // Segment
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 3,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: colors.accent },
  segmentText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  segmentTextActive: { color: colors.textPrimary, fontWeight: '600' },

  // Filters
  filterScroll: { maxHeight: 36, marginBottom: spacing.sm },
  filterContent: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    height: 30,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.accentDim, borderColor: colors.accentBorder },
  chipText: { color: colors.textMuted, fontSize: 13 },
  chipTextActive: { color: colors.accentSoft, fontWeight: '500' },

  // List
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  empty: { alignItems: 'center', paddingTop: 64, gap: 10 },
  emptyText: { color: colors.textSecondary, fontSize: 16, fontWeight: '500' },
  emptyHint: { color: colors.textMuted, fontSize: 14 },

  // Task card
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskCardDone: { opacity: 0.55 },
  taskBody: { flex: 1, gap: 6 },
  taskTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '500', lineHeight: 22 },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  taskMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  badge: {
    borderRadius: radius.xs,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  assigneeBadge: { backgroundColor: colors.surfaceRaised },
  badgeText: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
  duePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dueText: { color: colors.warning, fontSize: 12 },
  repeatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  repeatText: { color: colors.accentSoft, fontSize: 12 },
  editBtn: { paddingTop: 2 },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 360,
  },
  detailClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
    zIndex: 1,
  },
  detailTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.sm,
    paddingRight: 28,
    lineHeight: 28,
  },
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  statusPending: { backgroundColor: 'rgba(255,159,10,0.12)', borderWidth: 1, borderColor: 'rgba(255,159,10,0.25)' },
  statusDone:    { backgroundColor: 'rgba(52,199,89,0.12)',  borderWidth: 1, borderColor: 'rgba(52,199,89,0.25)' },
  statusText: { color: colors.warning, fontSize: 13, fontWeight: '500' },
  statusTextDone: { color: colors.success },
  detailRows: { gap: 10, marginBottom: spacing.lg },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  detailLabel: { color: colors.textMuted, fontSize: 14 },
  detailValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
  detailActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  editAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentDim,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    paddingVertical: 11,
  },
  editActionText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  archiveAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 11,
  },
  archiveActionText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
});
