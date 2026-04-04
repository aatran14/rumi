import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
  Pressable,
  PanResponder,
  Animated,
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
type DraggableNoteProps = {
  item: FridgeItem;
  onTap: () => void;
  onDragEnd: (x: number, y: number) => void;
};

function DraggableNote({ item, onTap, onDragEnd }: DraggableNoteProps) {
  const pan = useRef(new Animated.ValueXY({ x: item.x, y: item.y })).current;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, g) => {
        if (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5) {
          isDragging.current = true;
        }
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(_, g);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const finalX = Math.max(0, Math.min((pan.x as any)._value, FRIDGE_W - 100));
        const finalY = Math.max(0, Math.min((pan.y as any)._value, FRIDGE_H - 60));
        pan.setValue({ x: finalX, y: finalY });
        if (!isDragging.current) {
          onTap();
        } else {
          onDragEnd(finalX, finalY);
        }
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[
        styles.fridgeNote,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
      {...panResponder.panHandlers}
    >
      {item.important && <Text style={styles.importantBadge}>Important!</Text>}
      <Text style={styles.noteText} numberOfLines={3}>{item.text}</Text>
      <Text style={styles.noteAuthor}>- {item.author}</Text>
      <View style={styles.noteFooter}>
        <Ionicons name="ellipsis-horizontal" size={14} color={colors.textMuted} />
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
  const [items, setItems] = useState<FridgeItem[]>(SAMPLE_ITEMS);
  const [activeFilter, setActiveFilter] = useState<string>('fridge');
  const [selectedItem, setSelectedItem] = useState<FridgeItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);

  // Form state
  const [formText, setFormText] = useState('');
  const [formImportant, setFormImportant] = useState(false);
  const [formFridgeCollage, setFormFridgeCollage] = useState(true);

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, x, y } : item)));
  }, []);

  const openAdd = () => {
    setFormText('');
    setFormImportant(false);
    setFormFridgeCollage(true);
    setEditingItem(null);
    setShowAdd(true);
  };

  const openEdit = (item: FridgeItem) => {
    setFormText(item.text ?? '');
    setFormImportant(item.important ?? false);
    setFormFridgeCollage(item.fridgeCollage ?? true);
    setEditingItem(item);
    setSelectedItem(null);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!formText.trim()) return;
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? { ...i, text: formText.trim(), important: formImportant, fridgeCollage: formFridgeCollage }
            : i,
        ),
      );
    } else {
      const item: FridgeItem = {
        id: Date.now().toString(),
        type: 'note',
        text: formText.trim(),
        important: formImportant,
        fridgeCollage: formFridgeCollage,
        author: user?.displayName ?? 'Anonymous',
        reactions: [],
        x: (FRIDGE_W - 120) / 2,
        y: (FRIDGE_H - 80) / 2,
      };
      setItems([item, ...items]);
    }
    setShowAdd(false);
    setEditingItem(null);
  };

  const archiveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    setSelectedItem(null);
  };

  const toggleReaction = (itemId: string, color: string) => {
    setItems(
      items.map((item) => {
        if (item.id !== itemId) return item;
        const has = item.reactions.includes(color);
        return { ...item, reactions: has ? item.reactions.filter((r) => r !== color) : [...item.reactions, color] };
      }),
    );
    setSelectedItem((prev) => {
      if (!prev || prev.id !== itemId) return prev;
      const has = prev.reactions.includes(color);
      return { ...prev, reactions: has ? prev.reactions.filter((r) => r !== color) : [...prev.reactions, color] };
    });
  };

  const displayName = user?.displayName ?? 'You';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fridge</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fridge body */}
      {activeFilter === 'fridge' || activeFilter === 'all' ? (
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
          <TouchableOpacity style={styles.helpBtn}>
            <Ionicons name="help" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.listCard}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.8}
            >
              {item.important && <Text style={styles.importantBadgeList}>Important!</Text>}
              <Text style={styles.listCardText}>{item.text}</Text>
              <Text style={styles.listCardAuthor}>- {item.author}</Text>
              <View style={styles.reactionDots}>
                {item.reactions.map((c, i) => (
                  <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* View note popup */}
      <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelectedItem(null)}>
          <Pressable style={styles.cardModal} onPress={(e) => e.stopPropagation()}>
            {/* Avatar + name */}
            <View style={styles.cardAvatar}>
              <Ionicons name="person" size={28} color={colors.textMuted} />
            </View>
            <Text style={styles.cardName}>{selectedItem?.author}</Text>

            {/* Note text */}
            <View style={styles.cardTextBox}>
              <Text style={styles.cardText}>{selectedItem?.text}</Text>
            </View>

            {selectedItem?.important && (
              <View style={styles.cardCheckRow}>
                <Ionicons name="checkbox" size={20} color={colors.white} />
                <Text style={styles.cardCheckLabel}>Important!</Text>
              </View>
            )}

            {/* Reactions */}
            <View style={styles.cardReactions}>
              {REACTION_COLORS.map((c) => (
                <TouchableOpacity key={c} onPress={() => selectedItem && toggleReaction(selectedItem.id, c)}>
                  <View style={[
                    styles.dotLarge,
                    { backgroundColor: c },
                    selectedItem?.reactions.includes(c) && styles.dotLargeActive,
                  ]} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.cardActionBtn} onPress={() => selectedItem && openEdit(selectedItem)}>
                <Text style={styles.cardActionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardActionBtn, styles.archiveBtn]}
                onPress={() => selectedItem && archiveItem(selectedItem.id)}
              >
                <Text style={styles.archiveBtnText}>Archive</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add / Edit modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowAdd(false)}>
          <Pressable style={styles.cardModal} onPress={(e) => e.stopPropagation()}>
            {/* Avatar + name */}
            <View style={styles.cardAvatar}>
              <Ionicons name="person" size={28} color={colors.textMuted} />
            </View>
            <Text style={styles.cardName}>{displayName}</Text>

            {/* Text input */}
            <TextInput
              style={styles.cardInput}
              placeholder="Enter Update Text"
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={formText}
              onChangeText={setFormText}
              multiline
              autoFocus
            />

            {/* Important */}
            <TouchableOpacity style={styles.cardCheckRow} onPress={() => setFormImportant(!formImportant)}>
              <Ionicons
                name={formImportant ? 'checkbox' : 'square-outline'}
                size={20}
                color={formImportant ? colors.white : 'rgba(255,255,255,0.5)'}
              />
              <Text style={styles.cardCheckLabel}>Important!</Text>
            </TouchableOpacity>

            {/* Fridge Collage + Image */}
            <View style={styles.cardOptionRow}>
              <TouchableOpacity style={styles.cardCheckRow} onPress={() => setFormFridgeCollage(!formFridgeCollage)}>
                <Ionicons
                  name={formFridgeCollage ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={formFridgeCollage ? colors.white : 'rgba(255,255,255,0.5)'}
                />
                <Text style={styles.cardCheckLabel}>Fridge Collage</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cardCheckRow}>
                <Ionicons name="attach" size={20} color="rgba(255,255,255,0.7)" />
                <Text style={styles.cardCheckLabel}>Image</Text>
              </TouchableOpacity>
            </View>

            {/* Save button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{editingItem ? 'Save Edit' : 'Add'}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28, fontWeight: '700', color: colors.white,
    flex: 1, textAlign: 'center', letterSpacing: 0.3,
  },
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },

  // Filters
  filterRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    marginBottom: spacing.md, paddingHorizontal: spacing.lg,
  },
  filterChip: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 6,
  },
  filterChipActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  filterText: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: colors.accentLight },

  // Fridge
  fridgeWrap: { flex: 1, alignItems: 'center' },
  fridge: {
    width: FRIDGE_W, height: FRIDGE_H, backgroundColor: colors.accentLight,
    borderRadius: radius.lg, overflow: 'hidden', position: 'relative',
  },
  fridgeHandle: {
    position: 'absolute', right: 8, top: '15%', width: 8, height: '20%',
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 4, zIndex: 0,
  },
  fridgeDivider: {
    position: 'absolute', top: '50%', left: 0, right: 0, height: 3,
    backgroundColor: 'rgba(0,0,0,0.15)', zIndex: 0,
  },

  // Notes on fridge
  fridgeNote: {
    position: 'absolute', left: 0, top: 0,
    backgroundColor: 'rgba(240,240,255,0.92)', borderRadius: 6,
    padding: 10, maxWidth: '45%', minWidth: 90,
    shadowColor: '#000', shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3, zIndex: 5,
  },
  importantBadge: { color: colors.red, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  noteText: { color: '#1a1a2e', fontSize: 13, fontWeight: '600', lineHeight: 17 },
  noteAuthor: { color: '#555', fontSize: 11, marginTop: 4 },
  noteFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6,
  },
  reactionDots: { flexDirection: 'row', gap: 3 },
  dot: { width: 10, height: 10, borderRadius: 5 },

  helpBtn: {
    position: 'absolute', bottom: 90, right: 24, width: 40, height: 40,
    borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 2, borderColor: colors.white,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },

  // List view
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: spacing.sm },
  listCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  importantBadgeList: { color: colors.red, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  listCardText: { color: colors.white, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  listCardAuthor: { color: colors.textMuted, fontSize: 13, marginBottom: 8 },

  // Overlay
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Purple card modal (matching mockup)
  cardModal: {
    backgroundColor: colors.accent, borderRadius: 20,
    padding: spacing.xl, width: '82%', maxWidth: 340,
    alignItems: 'center',
  },
  cardAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(200,200,210,0.6)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  cardName: {
    color: colors.white, fontSize: 18, fontWeight: '700', marginBottom: spacing.md,
  },
  cardTextBox: {
    backgroundColor: 'rgba(240,240,250,0.9)', borderRadius: radius.sm,
    padding: spacing.md, width: '100%', minHeight: 60, marginBottom: spacing.md,
  },
  cardText: { color: '#1a1a2e', fontSize: 15, lineHeight: 20 },
  cardInput: {
    backgroundColor: 'rgba(240,240,250,0.9)', borderRadius: radius.sm,
    padding: spacing.md, width: '100%', minHeight: 80,
    color: '#1a1a2e', fontSize: 15, textAlignVertical: 'top', marginBottom: spacing.md,
  },
  cardCheckRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start', marginBottom: spacing.sm,
  },
  cardCheckLabel: { color: colors.white, fontSize: 15, fontWeight: '600' },
  cardOptionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', marginBottom: spacing.md,
  },
  cardReactions: {
    flexDirection: 'row', gap: 8, marginVertical: spacing.md,
  },
  dotLarge: { width: 24, height: 24, borderRadius: 12, opacity: 0.4 },
  dotLargeActive: { opacity: 1, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  cardActions: {
    flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, width: '100%',
  },
  cardActionBtn: {
    flex: 1, paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center',
  },
  cardActionText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  archiveBtn: { backgroundColor: 'rgba(0,0,0,0.5)' },
  archiveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  saveBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radius.md,
    paddingVertical: 14, width: '100%', alignItems: 'center', marginTop: spacing.sm,
  },
  saveBtnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
});
