import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, TextInput, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenNavigation, CalendarEvent } from '../types';
import { useSyncContext } from '../contexts/SyncContext';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = { navigation: StackScreenNavigation };

const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDays(baseDate: Date, count = 3) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    return d;
  });
}

function formatHour(h: number) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function parseEventHour(timeStr: string) {
  const match = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)/i);
  if (!match) return 0;
  let hour = parseInt(match[1], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return hour;
}

function eventMatchesDay(event: CalendarEvent, day: Date) {
  const eventDay = new Date(event.startDate.replace(/^[A-Za-z]+,\s*/, ''));
  return (
    eventDay.getDate() === day.getDate() &&
    eventDay.getMonth() === day.getMonth() &&
    eventDay.getFullYear() === day.getFullYear()
  );
}

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

// --- Event detail ---
function EventDetail({ event, onClose, onDelete }: {
  event: CalendarEvent; onClose: () => void; onDelete: () => void;
}) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={modal.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={modal.detailCard} activeOpacity={1}>
          <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={modal.detailTitle}>{event.title}</Text>

          {[
            { icon: 'calendar-outline' as const, text: event.startDate },
            { icon: 'time-outline' as const, text: event.allDay ? 'All day' : `${event.startTime} – ${event.endTime}` },
            event.repeats ? { icon: 'repeat' as const, text: 'Repeating' } : null,
          ].filter(Boolean).map((row, i) => (
            <View key={i} style={modal.detailRow}>
              <Ionicons name={row!.icon} size={15} color={colors.accentSoft} />
              <Text style={modal.detailText}>{row!.text}</Text>
            </View>
          ))}

          {event.notes ? (
            <View style={modal.notesBox}>
              <Text style={modal.notesText}>{event.notes}</Text>
            </View>
          ) : null}

          <Text style={modal.createdBy}>Created by {event.createdBy}</Text>

          <TouchableOpacity style={modal.deleteBtn} onPress={onDelete}>
            <Ionicons name="trash-outline" size={15} color={colors.danger} />
            <Text style={modal.deleteBtnText}>Delete event</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// --- Add event modal ---
function EventModal({ visible, onClose, onSave, initialDate, initialHour }: {
  visible: boolean; onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  initialDate: Date; initialHour: number;
}) {
  const defaultStr = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

  const [title,     setTitle]     = useState('');
  const [allDay,    setAllDay]    = useState(false);
  const [repeats,   setRepeats]   = useState(false);
  const [notes,     setNotes]     = useState('');
  const [dateStr,   setDateStr]   = useState(defaultStr(initialDate));
  const [startTime, setStartTime] = useState(formatHour(initialHour));
  const [endTime,   setEndTime]   = useState(formatHour(Math.min(initialHour + 1, 23)));

  React.useEffect(() => {
    if (visible) {
      setDateStr(defaultStr(initialDate));
      setStartTime(formatHour(initialHour));
      setEndTime(formatHour(Math.min(initialHour + 1, 23)));
      setTitle(''); setNotes(''); setAllDay(false); setRepeats(false);
    }
  }, [visible, initialDate, initialHour]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ id: Date.now().toString(), title: title.trim(), allDay, startDate: dateStr, startTime, endDate: dateStr, endTime, repeats, notes: notes.trim(), createdBy: 'You' });
    setTitle(''); setNotes(''); setAllDay(false); setRepeats(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.sheetHeader}>
            <TouchableOpacity onPress={onClose} style={modal.sheetCloseBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={modal.sheetTitle}>New event</Text>
            <TouchableOpacity style={modal.saveBtn} onPress={handleSave}>
              <Text style={modal.saveBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={modal.titleInput}
            placeholder="Event name"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <View style={modal.divider} />

          <Text style={modal.fieldLabel}>Date</Text>
          <TextInput style={modal.fieldInput} value={dateStr} onChangeText={setDateStr} placeholderTextColor={colors.textMuted} />

          {!allDay && (
            <View style={modal.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={modal.fieldLabel}>Start</Text>
                <TextInput style={modal.fieldInput} value={startTime} onChangeText={setStartTime} placeholderTextColor={colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modal.fieldLabel}>End</Text>
                <TextInput style={modal.fieldInput} value={endTime} onChangeText={setEndTime} placeholderTextColor={colors.textMuted} />
              </View>
            </View>
          )}

          {[
            { label: 'All day', value: allDay, onChange: setAllDay },
            { label: 'Repeats', value: repeats, onChange: setRepeats },
          ].map(({ label, value, onChange }) => (
            <View key={label} style={modal.toggleRow}>
              <Text style={modal.toggleLabel}>{label}</Text>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: colors.surfaceRaised, true: colors.success }}
                thumbColor={colors.textPrimary}
              />
            </View>
          ))}

          <View style={modal.divider} />

          <TextInput
            style={modal.notesInput}
            placeholder="Add notes..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>
    </Modal>
  );
}

// --- Main ---
export default function CalendarScreen({ navigation }: Props) {
  const { events, setEvents } = useSyncContext();
  const [modalVisible,  setModalVisible]  = useState(false);
  const [selectedHour,  setSelectedHour]  = useState(12);
  const [selectedDay,   setSelectedDay]   = useState(new Date());
  const [viewingEvent,  setViewingEvent]  = useState<CalendarEvent | null>(null);
  const [weekOffset,    setWeekOffset]    = useState(0);

  const today    = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + weekOffset * 3);
  const days      = useMemo(() => getDays(baseDate, 3), [weekOffset]);
  const monthName = MONTH_NAMES[baseDate.getMonth()];
  const HOURS     = Array.from({ length: 18 }, (_, i) => i + 6);

  const getEventsForSlot = (day: Date, hour: number) =>
    events.filter((e) => {
      if (!eventMatchesDay(e, day)) return false;
      if (e.allDay) return hour === HOURS[0];
      const startH = parseEventHour(e.startTime);
      const endH   = parseEventHour(e.endTime);
      return hour >= startH && hour < endH;
    });

  const isEventStart = (event: CalendarEvent, hour: number) =>
    event.allDay ? hour === HOURS[0] : parseEventHour(event.startTime) === hour;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={monthName}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setWeekOffset(0)}>
            <Text style={styles.todayBtn}>Today</Text>
          </TouchableOpacity>
        }
      />

      {/* Week nav */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.dayHeaders}>
          {days.map((d) => {
            const isToday = isSameDay(d, today);
            return (
              <View key={d.toISOString()} style={styles.dayHeader}>
                <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                  {DAY_NAMES[d.getDay()]}
                </Text>
                <View style={[styles.dayNumberWrap, isToday && styles.dayNumberWrapToday]}>
                  <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
                    {d.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Time grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {HOURS.map((hour) => (
          <View key={hour} style={styles.hourRow}>
            <Text style={styles.hourLabel}>{formatHour(hour)}</Text>
            <View style={styles.slotsRow}>
              {days.map((day) => {
                const slotEvents = getEventsForSlot(day, hour);
                return (
                  <TouchableOpacity
                    key={day.toISOString() + hour}
                    style={styles.slot}
                    onPress={() => { setSelectedDay(day); setSelectedHour(hour); setModalVisible(true); }}
                    activeOpacity={0.5}
                  >
                    {slotEvents.map((ev) => {
                      const isStart = isEventStart(ev, hour);
                      return (
                        <TouchableOpacity
                          key={ev.id}
                          style={[styles.eventChip, !isStart && styles.eventChipCont]}
                          onPress={() => setViewingEvent(ev)}
                          activeOpacity={0.8}
                        >
                          {isStart && (
                            <Text style={styles.eventText} numberOfLines={1}>{ev.title}</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setSelectedDay(today); setSelectedHour(12); setModalVisible(true); }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color={colors.textPrimary} />
      </TouchableOpacity>

      <EventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(event) => setEvents([...events, event])}
        initialDate={selectedDay}
        initialHour={selectedHour}
      />

      {viewingEvent && (
        <EventDetail
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onDelete={() => { setEvents(events.filter((e) => e.id !== viewingEvent.id)); setViewingEvent(null); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  todayBtn: { color: colors.accent, fontSize: 14, fontWeight: '500' },

  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: spacing.xs,
  },
  dayHeaders: { flex: 1, flexDirection: 'row' },
  dayHeader:  { flex: 1, alignItems: 'center', gap: 4 },
  dayName: {
    color: colors.textMuted, fontSize: 10, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  dayNameToday: { color: colors.accent },
  dayNumberWrap: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  dayNumberWrapToday: { backgroundColor: colors.accent },
  dayNumber: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  dayNumberToday: { color: colors.textPrimary },

  hourRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  hourLabel: {
    width: 46, color: colors.textMuted, fontSize: 10,
    textAlign: 'right', paddingRight: 6, paddingTop: 2,
  },
  slotsRow: { flex: 1, flexDirection: 'row' },
  slot: {
    flex: 1, minHeight: 46,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    paddingHorizontal: 1, paddingTop: 2,
  },
  eventChip: {
    backgroundColor: colors.accent,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flex: 1,
    justifyContent: 'center',
  },
  eventChipCont: {
    backgroundColor: colors.accentDim,
    borderRadius: 0,
    paddingVertical: 0,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  eventText: { color: colors.textPrimary, fontSize: 11, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Add sheet
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sheetCloseBtn: {
    width: 30, height: 30, borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetTitle: {
    flex: 1, textAlign: 'center',
    color: colors.textPrimary, fontSize: 16, fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  saveBtnText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  titleInput: {
    color: colors.textPrimary, fontSize: 17, fontWeight: '500', paddingVertical: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  fieldLabel: {
    color: colors.textMuted, fontSize: 11, fontWeight: '600',
    letterSpacing: 0.5, textTransform: 'uppercase',
    marginBottom: 4, marginTop: spacing.sm,
  },
  fieldInput: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  timeRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 10,
  },
  toggleLabel: { color: colors.textPrimary, fontSize: 15 },
  notesInput: {
    color: colors.textPrimary, fontSize: 14, height: 72, lineHeight: 21,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.sm,
  },

  // Detail card
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 340,
  },
  closeBtn: { position: 'absolute', top: 12, right: 12, padding: 4, zIndex: 1 },
  detailTitle: {
    color: colors.textPrimary, fontSize: 20, fontWeight: '600',
    marginBottom: spacing.md, paddingRight: 28, lineHeight: 28,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7,
  },
  detailText: { color: colors.textSecondary, fontSize: 14 },
  notesBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  notesText: { color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
  createdBy: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm, marginBottom: spacing.md },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  deleteBtnText: { color: colors.danger, fontSize: 14, fontWeight: '500' },
});
