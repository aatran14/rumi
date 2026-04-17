import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Dimensions, Pressable, PanResponder, Animated, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_W } = Dimensions.get('window');
const FRIDGE_W = SCREEN_W - 48;
const FRIDGE_H = FRIDGE_W * 1.35;

type FridgeItem = {
  id: string;
  type: 'note' | 'photo';
  text?: string;
  important?: boolean;
  fridgeCollage?: boolean;
  author: string;
  reactions: string[];
  x: number;
  y: number;
};

const REACTION_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A29BFE'];

const SAMPLE_ITEMS: FridgeItem[] = [
  {
    id: '1', type: 'note', text: 'No shoes in the house', important: true,
    fridgeCollage: true, author: 'Daniel',
    reactions: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A29BFE'],
    x: FRIDGE_W * 0.5, y: 20,
  },
  {
    id: '2', type: 'note', text: 'Out of town, pls eat my bread',
    important: false, fridgeCollage: true, author: 'Adriel',
    reactions: ['#FF6B6B', '#FFD93D'],
    x: FRIDGE_W * 0.45, y: FRIDGE_H * 0.35,
  },
  {
    id: '3', type: 'note', text: '4/21 - Game night @ our place',
    important: false, fridgeCollage: true, author: 'Gaya',
    reactions: ['#FF6B6B', '#4ECDC4', '#FFD93D'],
    x: 20, y: FRIDGE_H * 0.58,
  },
  {
    id: '4', type: 'note', text: 'Rent due Friday!!!',
    important: true, fridgeCollage: true, author: 'Andy',
    reactions: ['#A29BFE'],
    x: 15, y: 15,
  },
];

const FILTERS = ['list', 'fridge', 'unread', 'all'] as const;

// --- Draggable note ---
function DraggableNote({ item, onTap, onDragEnd }: {
  item: FridgeItem; onTap: () => void; onDragEnd: (x: number, y: number) => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: item.x, y: item.y })).current;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, g) => {
        if (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5) isDragging.current = true;
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(_, g);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const finalX = Math.max(0, Math.min((pan.x as any)._value, FRIDGE_W - 120));
        const finalY = Math.max(0, Math.min((pan.y as any)._value, FRIDGE_H - 80));
        pan.setValue({ x: finalX, y: finalY });
        if (!isDragging.current) onTap();
        else onDragEnd(finalX, finalY);
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[styles.fridgeNote, item.important && styles.fridgeNoteImportant, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
      {...panResponder.panHandlers}
    >
      {item.important && <Text style={styles.importantBadge}>Important</Text>}
      <Text style={styles.noteText} numberOfLines={3}>{item.text}</Text>
      <Text style={styles.noteAuthor}>— {item.author}</Text>
      <View style={styles.noteFooter}>
        <View style={styles.reactionDots}>
          {item.reactions.map((c, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: c }]} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// --- Main screen ---
export default function UpdatesScreen() {
  const { user } = useAuth();
  const [items, setItems]               = useState<FridgeItem[]>(SAMPLE_ITEMS);
  const [activeFilter, setActiveFilter] = useState<string>('fridge');
  const [selectedItem, setSelectedItem] = useState<FridgeItem | null>(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [editingItem, setEditingItem]   = useState<FridgeItem | null>(null);

  // Form state
  const [formText,      setFormText]      = useState('');
  const [formImportant, setFormImportant] = useState(false);
  const [formFridgeOn,  setFormFridgeOn]  = useState(true);

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, x, y } : item)));
  }, []);

  const openAdd = () => {
    setFormText(''); setFormImportant(false); setFormFridgeOn(true);
    setEditingItem(null); setShowAdd(true);
  };

  const openEdit = (item: FridgeItem) => {
    setFormText(item.text ?? ''); setFormImportant(item.important ?? false);
    setFormFridgeOn(item.fridgeCollage ?? true);
    setEditingItem(item); setSelectedItem(null); setShowAdd(true);
  };

  const handleSave = () => {
    if (!formText.trim()) return;
    if (editingItem) {
      setItems((prev) => prev.map((i) =>
        i.id === editingItem.id
          ? { ...i, text: formText.trim(), important: formImportant, fridgeCollage: formFridgeOn }
          : i,
      ));
    } else {
      setItems([{
        id: Date.now().toString(), type: 'note',
        text: formText.trim(), important: formImportant,
        fridgeCollage: formFridgeOn,
        author: user?.displayName ?? 'Anonymous',
        reactions: [], x: (FRIDGE_W - 120) / 2, y: (FRIDGE_H - 80) / 2,
      }, ...items]);
    }
    setShowAdd(false); setEditingItem(null);
  };

  const archiveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    setSelectedItem(null);
  };

  const toggleReaction = (itemId: string, color: string) => {
    const toggle = (list: string[]) =>
      list.includes(color) ? list.filter((r) => r !== color) : [...list, color];
    setItems(items.map((item) =>
      item.id === itemId ? { ...item, reactions: toggle(item.reactions) } : item,
    ));
    setSelectedItem((prev) =>
      prev?.id === itemId ? { ...prev, reactions: toggle(prev.reactions) } : prev,
    );
  };

  const showFridge = activeFilter === 'fridge' || activeFilter === 'all';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fridge</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
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

      {/* Fridge / List body */}
      {showFridge ? (
        <View style={styles.fridgeWrap}>
          <View style={styles.fridge}>
            <View style={styles.fridgeHandle} />
            <View style={styles.fridgeDivider} />
            {items.filter((i) => i.fridgeCollage !== false).map((item) => (
              <DraggableNote
                key={item.id}
                item={item}
                onTap={() => setSelectedItem(item)}
                onDragEnd={(x, y) => updatePosition(item.id, x, y)}
              />
            ))}
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.listCard, item.important && styles.listCardImportant]}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.8}
            >
              {item.important && (
                <View style={styles.importantPill}>
                  <Text style={styles.importantPillText}>Important</Text>
                </View>
              )}
              <Text style={styles.listCardText}>{item.text}</Text>
              <View style={styles.listCardFooter}>
                <Text style={styles.listCardAuthor}>— {item.author}</Text>
                <View style={styles.reactionDots}>
                  {item.reactions.map((c, i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* View note modal */}
      <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelectedItem(null)}>
          <Pressable style={styles.noteModal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.noteModalAvatar}>
              <Ionicons name="person" size={22} color={colors.textMuted} />
            </View>
            <Text style={styles.noteModalAuthor}>{selectedItem?.author}</Text>

            {selectedItem?.important && (
              <View style={styles.importantPill}>
                <Text style={styles.importantPillText}>Important</Text>
              </View>
            )}

            <View style={styles.noteModalTextBox}>
              <Text style={styles.noteModalText}>{selectedItem?.text}</Text>
            </View>

            {/* Reactions */}
            <View style={styles.reactionRow}>
              {REACTION_COLORS.map((c) => (
                <TouchableOpacity key={c} onPress={() => selectedItem && toggleReaction(selectedItem.id, c)}>
                  <View style={[
                    styles.reactionDotLg,
                    { backgroundColor: c },
                    selectedItem?.reactions.includes(c) && styles.reactionDotLgActive,
                  ]} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.noteModalActions}>
              <TouchableOpacity style={styles.noteEditBtn} onPress={() => selectedItem && openEdit(selectedItem)}>
                <Ionicons name="pencil-outline" size={15} color={colors.accent} />
                <Text style={styles.noteEditText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noteArchiveBtn} onPress={() => selectedItem && archiveItem(selectedItem.id)}>
                <Ionicons name="archive-outline" size={15} color={colors.textMuted} />
                <Text style={styles.noteArchiveText}>Archive</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add / Edit modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.overlay}>
          <View style={styles.addModal}>
            <View style={styles.addModalHeader}>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.addModalClose}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.addModalTitle}>{editingItem ? 'Edit note' : 'New note'}</Text>
              <TouchableOpacity style={styles.addModalSave} onPress={handleSave}>
                <Text style={styles.addModalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.addInput}
              value={formText}
              onChangeText={setFormText}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textMuted}
              multiline
              autoFocus
              textAlignVertical="top"
            />

            <View style={styles.addToggleRow}>
              <Text style={styles.addToggleLabel}>Mark as important</Text>
              <Switch
                value={formImportant}
                onValueChange={setFormImportant}
                trackColor={{ false: colors.surfaceRaised, true: colors.accent }}
                thumbColor={colors.textPrimary}
              />
            </View>
            <View style={styles.addToggleRow}>
              <Text style={styles.addToggleLabel}>Show on fridge</Text>
              <Switch
                value={formFridgeOn}
                onValueChange={setFormFridgeOn}
                trackColor={{ false: colors.surfaceRaised, true: colors.success }}
                thumbColor={colors.textPrimary}
              />
            </View>
          </View>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  addBtn: {
    width: 34, height: 34, borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },

  // Filters
  filterScroll: { maxHeight: 38, marginBottom: spacing.sm },
  filterContent: { paddingHorizontal: spacing.lg, gap: 8, alignItems: 'center' },
  filterChip: {
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 7,
  },
  filterChipActive: { backgroundColor: colors.accentDim, borderColor: colors.accentBorder },
  filterText: { color: colors.textMuted, fontSize: 13, textTransform: 'capitalize' },
  filterTextActive: { color: colors.accentSoft, fontWeight: '500' },

  // Fridge
  fridgeWrap: {
    flex: 1, alignItems: 'center', paddingTop: spacing.sm,
  },
  fridge: {
    width: FRIDGE_W, height: FRIDGE_H,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  fridgeHandle: {
    width: 40, height: 8, borderRadius: 4,
    backgroundColor: colors.surfaceHover,
    alignSelf: 'center', marginTop: 10,
  },
  fridgeDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginTop: 12,
  },

  // Draggable note
  fridgeNote: {
    position: 'absolute',
    width: 130,
    backgroundColor: '#FFFDE7',
    borderRadius: radius.sm,
    padding: 10,
    gap: 4,
  },
  fridgeNoteImportant: {
    borderTopWidth: 3,
    borderTopColor: colors.danger,
  },
  importantBadge: {
    fontSize: 10, fontWeight: '700',
    color: colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteText: { fontSize: 12, color: '#333', lineHeight: 16 },
  noteAuthor: { fontSize: 10, color: '#888', fontStyle: 'italic' },
  noteFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  reactionDots: { flexDirection: 'row', gap: 3 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  // List view
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 8,
  },
  listCardImportant: {
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  listCardText: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
  listCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listCardAuthor: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic' },
  importantPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,69,58,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,69,58,0.25)',
    borderRadius: radius.pill,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  importantPillText: { color: colors.danger, fontSize: 11, fontWeight: '600' },

  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Note detail modal
  noteModal: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 360,
    gap: spacing.sm,
  },
  noteModalAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
  noteModalAuthor: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  noteModalTextBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
  },
  noteModalText: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
  reactionRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  reactionDotLg: { width: 24, height: 24, borderRadius: 12 },
  reactionDotLgActive: { borderWidth: 2.5, borderColor: colors.textPrimary },
  noteModalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  noteEditBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: colors.accentDim,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.accentBorder,
    paddingVertical: 10,
  },
  noteEditText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  noteArchiveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    paddingVertical: 10,
  },
  noteArchiveText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },

  // Add / Edit modal
  addModal: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    gap: spacing.md,
  },
  addModalHeader: {
    flexDirection: 'row', alignItems: 'center',
  },
  addModalClose: {
    width: 30, height: 30, borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center', justifyContent: 'center',
  },
  addModalTitle: {
    flex: 1, textAlign: 'center',
    color: colors.textPrimary, fontSize: 16, fontWeight: '600',
  },
  addModalSave: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  addModalSaveText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  addInput: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 100,
    lineHeight: 22,
  },
  addToggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 4,
  },
  addToggleLabel: { color: colors.textPrimary, fontSize: 15 },
});
