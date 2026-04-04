import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenNavigation, CalendarEvent } from '../types';
import { useSyncContext } from '../contexts/SyncContext';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = { navigation: StackScreenNavigation };

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDays(baseDate: Date, count: number = 3) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function parseEventHour(timeStr: string): number {
  const match = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)/i);
  if (!match) return 0;
  let hour = parseInt(match[1], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return hour;
}

function eventMatchesDay(event: CalendarEvent, day: Date): boolean {
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

// --- Event detail popup ---
function EventDetail({
  event,
  onClose,
  onDelete,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={modal.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={modal.detailCard} activeOpacity={1}>
          <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={modal.detailTitle}>{event.title}</Text>
          <View style={modal.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.accentLight} />
            <Text style={modal.detailText}>{event.startDate}</Text>
          </View>
          <View style={modal.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.accentLight} />
            <Text style={modal.detailText}>
              {event.allDay ? 'All day' : `${event.startTime} - ${event.endTime}`}
            </Text>
          </View>
          {event.repeats && (
            <View style={modal.detailRow}>
              <Ionicons name="repeat" size={16} color={colors.accentLight} />
              <Text style={modal.detailText}>Repeating</Text>
            </View>
          )}
          {event.notes ? (
            <View style={modal.notesBox}>
              <Text style={modal.notesText}>{event.notes}</Text>
            </View>
          ) : null}
          <Text style={modal.createdBy}>Created by {event.createdBy}</Text>
          <TouchableOpacity style={modal.deleteBtn} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color={colors.red} />
            <Text style={modal.deleteBtnText}>Delete Event</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// --- Add event modal ---
function EventModal({
  visible,
  onClose,
  onSave,
  initialDate,
  initialHour,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  initialDate: Date;
  initialHour: number;
}) {
  const defaultDateStr = initialDate.toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [repeats, setRepeats] = useState(false);
  const [notes, setNotes] = useState('');
  const [dateStr, setDateStr] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState(formatHour(initialHour));
  const [endTime, setEndTime] = useState(formatHour(Math.min(initialHour + 1, 23)));

  // Reset fields when modal opens with new date/hour
  React.useEffect(() => {
    if (visible) {
      setDateStr(initialDate.toLocaleDateString('en-US', {
        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
      }));
      setStartTime(formatHour(initialHour));
      setEndTime(formatHour(Math.min(initialHour + 1, 23)));
      setTitle('');
      setNotes('');
      setAllDay(false);
      setRepeats(false);
    }
  }, [visible, initialDate, initialHour]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      allDay,
      startDate: dateStr,
      startTime,
      endDate: dateStr,
      endTime,
      repeats,
      notes: notes.trim(),
      createdBy: 'You',
    });
    setTitle('');
    setNotes('');
    setAllDay(false);
    setRepeats(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modal.overlay}>
        <View style={modal.container}>
          <View style={modal.header}>
            <TouchableOpacity onPress={onClose} style={modal.headerCloseBtn}>
              <Ionicons name="close" size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={modal.headerTitle}>New Event</Text>
            <TouchableOpacity style={modal.saveBtn} onPress={handleSave}>
              <Text style={modal.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={modal.titleInput}
            placeholder="Event title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <View style={modal.divider} />

          <Text style={modal.fieldLabel}>Date</Text>
          <TextInput
            style={modal.fieldInput}
            value={dateStr}
            onChangeText={setDateStr}
            placeholderTextColor={colors.textMuted}
          />

          {!allDay && (
            <View style={modal.timeRow}>
              <View style={modal.timeFlex}>
                <Text style={modal.fieldLabel}>Start</Text>
                <TextInput
                  style={modal.fieldInput}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={modal.timeFlex}>
                <Text style={modal.fieldLabel}>End</Text>
                <TextInput
                  style={modal.fieldInput}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          )}

          <View style={modal.row}>
            <Text style={modal.label}>All Day</Text>
            <Switch
              value={allDay}
              onValueChange={setAllDay}
              trackColor={{ false: colors.surfaceLight, true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
          <View style={modal.row}>
            <Text style={modal.label}>Repeats</Text>
            <Switch
              value={repeats}
              onValueChange={setRepeats}
              trackColor={{ false: colors.surfaceLight, true: colors.green }}
              thumbColor={colors.white}
            />
          </View>

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

// --- Main Calendar ---
export default function CalendarScreen({ navigation }: Props) {
  const { events, setEvents } = useSyncContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + weekOffset * 3);
  const days = useMemo(() => getDays(baseDate, 3), [weekOffset]);
  const monthName = MONTH_NAMES[baseDate.getMonth()];

  // Show hours 6 AM - 11 PM (most useful range)
  const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);

  const handleSlotPress = (day: Date, hour: number) => {
    setSelectedDay(day);
    setSelectedHour(hour);
    setModalVisible(true);
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    setEvents([...events, event]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
    setViewingEvent(null);
  };

  const getEventsForSlot = (day: Date, hour: number) => {
    return events.filter((e) => {
      if (!eventMatchesDay(e, day)) return false;
      if (e.allDay) return hour === HOURS[0];
      const startH = parseEventHour(e.startTime);
      const endH = parseEventHour(e.endTime);
      return hour >= startH && hour < endH;
    });
  };

  const isEventStart = (event: CalendarEvent, hour: number) => {
    if (event.allDay) return hour === HOURS[0];
    return parseEventHour(event.startTime) === hour;
  };

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
          <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
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
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
                    onPress={() => handleSlotPress(day, hour)}
                    activeOpacity={0.6}
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
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Add event */}
      <EventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEvent}
        initialDate={selectedDay}
        initialHour={selectedHour}
      />

      {/* View event */}
      {viewingEvent && (
        <EventDetail
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onDelete={() => handleDeleteEvent(viewingEvent.id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 64 },

  todayBtn: { color: colors.accent, fontSize: 14, fontWeight: '600' },

  // Week navigation
  weekNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, marginBottom: spacing.sm,
  },
  dayHeaders: { flex: 1, flexDirection: 'row' },
  dayHeader: { flex: 1, alignItems: 'center', gap: 2 },
  dayName: {
    color: colors.textMuted, fontSize: 11, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  dayNameToday: { color: colors.accent },
  dayNumberWrap: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  dayNumberWrapToday: { backgroundColor: colors.accent },
  dayNumber: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
  dayNumberToday: { color: colors.white },

  // Grid
  hourRow: {
    flexDirection: 'row', alignItems: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  hourLabel: {
    width: 44, color: colors.textMuted, fontSize: 10,
    textAlign: 'right', paddingRight: 6, paddingTop: 2,
  },
  slotsRow: { flex: 1, flexDirection: 'row' },
  slot: {
    flex: 1, minHeight: 48,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 1, paddingTop: 2,
  },

  // Events
  eventChip: {
    backgroundColor: colors.accent, borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 2,
    flex: 1, justifyContent: 'center',
  },
  eventChipCont: {
    backgroundColor: colors.accentDim, borderRadius: 0,
    paddingVertical: 0,
  },
  eventText: { color: colors.white, fontSize: 12, fontWeight: '600' },

  // FAB
  fab: {
    position: 'absolute', right: 20, bottom: 100,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  container: {
    backgroundColor: colors.surface, borderRadius: 20,
    padding: spacing.lg, width: '88%', maxWidth: 380,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md,
  },
  headerCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, color: colors.white, fontSize: 18, fontWeight: '700', textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: colors.accent, borderRadius: radius.md,
    paddingHorizontal: 18, paddingVertical: 8,
  },
  saveBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  titleInput: {
    color: colors.white, fontSize: 18, fontWeight: '600',
    paddingVertical: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    justifyContent: 'space-between', paddingVertical: 10,
  },
  label: { color: colors.textPrimary, fontSize: 15, flex: 1 },
  fieldLabel: {
    color: colors.textMuted, fontSize: 12, fontWeight: '600',
    marginBottom: 4, marginTop: spacing.sm,
  },
  fieldInput: {
    backgroundColor: colors.surfaceLight, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    color: colors.white, fontSize: 15,
  },
  timeRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  timeFlex: { flex: 1 },
  notesInput: {
    color: colors.textPrimary, fontSize: 15, height: 80, lineHeight: 22,
    backgroundColor: colors.surfaceLight, borderRadius: radius.md,
    padding: spacing.sm,
  },

  // Detail popup
  detailCard: {
    backgroundColor: colors.surface, borderRadius: 20,
    padding: spacing.xl, width: '85%', maxWidth: 340, position: 'relative',
  },
  closeBtn: { position: 'absolute', top: 12, right: 12, padding: 4, zIndex: 1 },
  detailTitle: {
    color: colors.white, fontSize: 22, fontWeight: '700',
    marginBottom: spacing.md, paddingRight: 28,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8,
  },
  detailText: { color: colors.textSecondary, fontSize: 14 },
  notesBox: {
    backgroundColor: colors.surfaceLight, borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.sm, marginBottom: spacing.sm,
  },
  notesText: { color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
  createdBy: {
    color: colors.textMuted, fontSize: 12, marginTop: spacing.sm, marginBottom: spacing.md,
  },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  deleteBtnText: { color: colors.red, fontSize: 14, fontWeight: '500' },
});
