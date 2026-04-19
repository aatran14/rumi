import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenNavigation } from '../types';
import { useSyncContext } from '../contexts/SyncContext';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = { navigation: StackScreenNavigation };

const STATUS_COLORS: Record<string, string> = {
  Home: colors.success,
  Away: colors.textMuted,
};

export default function RoomiesScreen({ navigation }: Props) {
  const { roommates, setRoommates } = useSyncContext();
  const { user, setUserColor, availableColors } = useAuth();

  const [editing, setEditing] = useState(false);
  const myName = user?.displayName ?? '';
  const me = roommates.find((r) => r.name === myName);

  // Displayed color for "me" always reflects AuthContext (source of truth for current user)
  const renderRoommates = roommates.map((r) =>
    r.name === myName && user ? { ...r, bubbleColor: user.color } : r,
  );

  const [draftStatus, setDraftStatus] = useState<'Home' | 'Away'>(me?.status ?? 'Home');
  const [draftBubble, setDraftBubble] = useState<string>(me?.bubble ?? '');
  const [draftColor, setDraftColor] = useState<string>(user?.color ?? colors.accent);

  const openEdit = () => {
    if (!me) return;
    setDraftStatus(me.status);
    setDraftBubble(me.bubble);
    setDraftColor(user?.color ?? me.bubbleColor);
    setEditing(true);
  };

  const takenColors = new Set(
    roommates.filter((r) => r.name !== myName).map((r) => r.bubbleColor),
  );
  const pickableColors = availableColors.filter(
    (c) => !takenColors.has(c) || c === draftColor,
  );

  const handleSave = () => {
    if (!me) return;
    setRoommates(
      roommates.map((r) =>
        r.name === myName
          ? { ...r, status: draftStatus, bubble: draftBubble, bubbleColor: draftColor, timestamp: 'just now' }
          : r,
      ),
    );
    setUserColor(draftColor);
    setEditing(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Roomies" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {renderRoommates.map((r) => {
          const isMe = r.name === myName;
          const CardWrap: any = isMe ? TouchableOpacity : View;
          return (
            <CardWrap
              key={r.id}
              style={[styles.card, isMe && styles.cardMe]}
              onPress={isMe ? openEdit : undefined}
              activeOpacity={0.8}
            >
              {isMe && (
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={11} color={colors.accent} />
                  <Text style={styles.editBadgeText}>You</Text>
                </View>
              )}

              <View style={[styles.bubble, { backgroundColor: r.bubbleColor + '22', borderColor: r.bubbleColor + '55' }]}>
                <Text style={[styles.bubbleText, { color: r.bubbleColor }]}>{r.bubble}</Text>
                {r.timestamp && <Text style={styles.timestamp}>{r.timestamp}</Text>}
              </View>

              <View style={[styles.avatarRing, { borderColor: r.bubbleColor + '66' }]}>
                <View style={[styles.avatar, { backgroundColor: r.bubbleColor + '33' }]}>
                  <Ionicons name="person" size={36} color={r.bubbleColor} />
                </View>
              </View>

              <Text style={styles.name}>{r.name}</Text>

              <View style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[r.status] ?? colors.textMuted }]} />
                <Text style={[styles.statusText, { color: STATUS_COLORS[r.status] ?? colors.textMuted }]}>
                  {r.status}
                </Text>
              </View>
            </CardWrap>
          );
        })}
      </ScrollView>

      {/* Edit modal for "me" */}
      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <Pressable style={styles.overlay} onPress={() => setEditing(false)}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Edit your card</Text>

            {/* Status */}
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {(['Home', 'Away'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusChip, draftStatus === s && styles.statusChipActive]}
                  onPress={() => setDraftStatus(s)}
                >
                  <Text style={[styles.statusChipText, draftStatus === s && styles.statusChipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bubble text */}
            <Text style={styles.label}>What's up?</Text>
            <TextInput
              style={styles.input}
              value={draftBubble}
              onChangeText={setDraftBubble}
              placeholder="🔥 locked in"
              placeholderTextColor={colors.textMuted}
              maxLength={60}
            />

            {/* Color */}
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorGrid}>
              {availableColors.map((c) => {
                const taken = takenColors.has(c) && c !== draftColor;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => !taken && setDraftColor(c)}
                    activeOpacity={taken ? 1 : 0.7}
                  >
                    <View
                      style={[
                        styles.colorOption,
                        { backgroundColor: c },
                        taken && styles.colorOptionTaken,
                        c === draftColor && styles.colorOptionSelected,
                      ]}
                    >
                      {taken && <Ionicons name="close" size={14} color="#00000088" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const AVATAR_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingBottom: 100,
  },
  card: {
    width: '46%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: 8,
  },
  cardMe: {
    borderColor: colors.accentBorder,
    borderWidth: 1,
  },
  editBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.accentDim,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  editBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '600',
  },
  bubble: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'stretch',
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  avatarRing: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '88%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  statusChipActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accentBorder,
  },
  statusChipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  statusChipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
  colorOptionTaken: {
    opacity: 0.35,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  saveText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
