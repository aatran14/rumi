import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Platform,
  Alert,
  Pressable,
  Modal,
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

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let list = tasks;

    // Mine vs Everyone
    if (tab === 'Mine' && user) {
      list = list.filter(
        (t) => t.assignee.toLowerCase() === user.displayName.toLowerCase()
          || t.assignee.toLowerCase() === user.username.toLowerCase()
          || t.assignee === 'You',
      );
    }

    // Filter chips
    switch (activeFilter) {
      case 'today':
        list = list.filter((t) => {
          const due = (t.due ?? t.deadlineDate ?? '').toLowerCase();
          return due.includes('today') || due.includes(new Date().toLocaleDateString());
        });
        break;
      case 'archived':
        list = list.filter((t) => t.done);
        break;
      case 'in progress':
        list = list.filter((t) => !t.done);
        break;
      // 'all' shows everything
    }

    return list;
  }, [tasks, tab, activeFilter, user]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const archiveTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    setViewingTask(null);
  };

  const clearDone = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete all completed tasks?')) {
        setTasks(tasks.filter((t) => !t.done));
      }
    } else {
      Alert.alert('Clear Done', 'Delete all completed tasks?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setTasks(tasks.filter((t) => !t.done)) },
      ]);
    }
  };

  const dueLabel = (task: Task) => task.due ?? task.deadlineDate ?? '';

  const repeatLabel = (task: Task) => {
    if (!task.repeat) return null;
    return task.repeatFrequency ?? 'Repeating';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To-Do</Text>
        <TouchableOpacity
          style={[styles.headerBtn, styles.addBtn]}
          onPress={() => navigation.navigate('AddTask')}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Mine / Everyone toggle */}
      <View style={styles.tabRow}>
        {(['Mine', 'Everyone'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {TASK_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task list */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No tasks yet</Text>
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
                size={26}
                color={item.done ? colors.green : 'rgba(255,255,255,0.4)'}
              />
            </Pressable>
            <View style={styles.taskContent}>
              <Text style={[styles.taskTitle, item.done && styles.taskTitleDone]}>
                {item.title}
              </Text>
              <View style={styles.taskMeta}>
                <View style={styles.assigneeBadge}>
                  <Text style={styles.assigneeText}>{item.assignee}</Text>
                </View>
                <View style={styles.dueBadge}>
                  <Ionicons name="time-outline" size={12} color={colors.orange} />
                  <Text style={styles.dueText}>{dueLabel(item)}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditTask', { taskId: item.id })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </Pressable>
        )}
      />

      {/* Task detail popup */}
      <Modal
        visible={!!viewingTask}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingTask(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setViewingTask(null)}>
          <Pressable style={styles.detailCard} onPress={(e) => e.stopPropagation()}>
            {/* Close */}
            <TouchableOpacity
              style={styles.detailClose}
              onPress={() => setViewingTask(null)}
            >
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.detailTitle}>{viewingTask?.title}</Text>

            {/* Status badge */}
            <View style={[styles.detailStatusBadge, viewingTask?.done && styles.detailStatusDone]}>
              <Ionicons
                name={viewingTask?.done ? 'checkmark-circle' : 'time-outline'}
                size={16}
                color={viewingTask?.done ? colors.green : colors.orange}
              />
              <Text style={[styles.detailStatusText, viewingTask?.done && { color: colors.green }]}>
                {viewingTask?.done ? 'Completed' : 'In Progress'}
              </Text>
            </View>

            {/* Details */}
            <View style={styles.detailRows}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assigned to</Text>
                <Text style={styles.detailValue}>{viewingTask?.assignee}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assigned by</Text>
                <Text style={styles.detailValue}>
                  {viewingTask?.assignee === 'You' ? 'Self-assigned' : 'Roommate'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Deadline</Text>
                <Text style={styles.detailValue}>
                  {viewingTask ? dueLabel(viewingTask) : ''}
                  {viewingTask?.deadlineTime ? ` at ${viewingTask.deadlineTime}` : ''}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>
                  {viewingTask?.weight ? `${viewingTask.weight} pts` : '-'}
                </Text>
              </View>
              {viewingTask && repeatLabel(viewingTask) && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Repeats</Text>
                  <Text style={styles.detailValue}>{repeatLabel(viewingTask)}</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.detailEditBtn}
                onPress={() => {
                  const id = viewingTask?.id;
                  setViewingTask(null);
                  if (id) navigation.navigate('EditTask', { taskId: id });
                }}
              >
                <Ionicons name="pencil" size={16} color={colors.white} />
                <Text style={styles.detailEditText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailArchiveBtn}
                onPress={() => viewingTask && archiveTask(viewingTask.id)}
              >
                <Ionicons name="archive" size={16} color={colors.white} />
                <Text style={styles.detailArchiveText}>Archive</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  addBtn: { backgroundColor: colors.accent },
  headerTitle: {
    fontSize: 26, fontWeight: '700', color: colors.white,
    flex: 1, textAlign: 'center', letterSpacing: 0.3,
  },
  headerRight: { flexDirection: 'row', gap: 8 },

  // Tabs
  tabRow: {
    flexDirection: 'row', marginHorizontal: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.pill,
    padding: 3, marginBottom: spacing.md,
  },
  tab: {
    flex: 1, paddingVertical: 11, borderRadius: radius.pill, alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  tabText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  tabTextActive: { color: colors.white },

  // Filters
  filterRow: { maxHeight: 34, marginBottom: spacing.sm },
  filterContent: {
    paddingHorizontal: spacing.lg, gap: spacing.sm,
    alignItems: 'center',
  },
  filterChip: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 6,
    height: 32, justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  filterText: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: colors.accentLight },

  // List
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: spacing.sm },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: colors.textMuted, fontSize: 16 },

  // Task card
  taskCard: {
    backgroundColor: colors.accent, borderRadius: radius.lg,
    padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  taskCardDone: { backgroundColor: colors.surfaceLight, opacity: 0.8 },
  taskContent: { flex: 1, gap: 6 },
  taskTitle: { color: colors.white, fontSize: 17, fontWeight: '600' },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textSecondary },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  assigneeBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radius.sm,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  assigneeText: { color: colors.textPrimary, fontSize: 12, fontWeight: '500' },
  dueBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dueText: { color: colors.orange, fontSize: 12, fontWeight: '500' },

  // Detail modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  detailCard: {
    backgroundColor: colors.surface, borderRadius: 20,
    padding: spacing.xl, width: '85%', maxWidth: 360, position: 'relative',
  },
  detailClose: { position: 'absolute', top: 12, right: 12, padding: 4, zIndex: 1 },
  detailTitle: {
    color: colors.white, fontSize: 22, fontWeight: '700',
    marginBottom: spacing.sm, paddingRight: 30,
  },
  detailStatusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,159,10,0.15)', borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  detailStatusDone: { backgroundColor: 'rgba(52,199,89,0.15)' },
  detailStatusText: { color: colors.orange, fontSize: 13, fontWeight: '600' },
  detailRows: { gap: spacing.sm, marginBottom: spacing.lg },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  detailLabel: { color: colors.textMuted, fontSize: 14 },
  detailValue: { color: colors.white, fontSize: 14, fontWeight: '600' },
  detailActions: { flexDirection: 'row', gap: spacing.sm },
  detailEditBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: colors.accent, borderRadius: radius.md,
    paddingVertical: 12,
  },
  detailEditText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  detailArchiveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.md,
    paddingVertical: 12,
  },
  detailArchiveText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});
