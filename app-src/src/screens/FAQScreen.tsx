import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenNavigation } from '../types';
import { colors, spacing, radius } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = { navigation: StackScreenNavigation };

const FAQS = [
  {
    q: 'How do I invite my roommates?',
    a: 'When you sign up, you can create a home and share the 5-character code with your roommates. They enter the code on the "Join a Home" screen to link up.',
  },
  {
    q: 'What are task weights?',
    a: 'Each chore has a weight from 1–10 points representing effort. This helps keep the workload balanced — you can see how many total points each roommate is carrying when assigning tasks.',
  },
  {
    q: 'How does the Fridge work?',
    a: 'The Fridge is a shared bulletin board. Pin notes, mark them as important, and drag them around. Tap any note to react, edit, or archive it. Everyone in the house sees the same fridge.',
  },
  {
    q: 'Can I change my profile color?',
    a: 'Yes! Go to the Profile tab and tap "Change color" to pick from the available color palette.',
  },
  {
    q: 'What does "Roomie Status" mean?',
    a: "It shows whether each roommate is Home or Away, along with a custom status bubble so everyone knows if you're available to hang or need quiet time.",
  },
  {
    q: 'How do recurring tasks work?',
    a: 'When creating a task, toggle Repeat on and choose a frequency (Weekly, Biweekly, Monthly, or Custom). The task will automatically reappear on schedule.',
  },
  {
    q: 'Is my data private?',
    a: "Your data is only shared with the roommates in your home. We don't sell or share data with third parties.",
  },
];

export default function FAQScreen({ navigation }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <ScreenHeader title="FAQ" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {FAQS.map((faq, i) => {
          const open = expanded === i;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.card, open && styles.cardOpen]}
              onPress={() => setExpanded(open ? null : i)}
              activeOpacity={0.75}
            >
              <View style={styles.questionRow}>
                <Text style={styles.question}>{faq.q}</Text>
                <Ionicons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={open ? colors.accent : colors.textMuted}
                />
              </View>
              {open && (
                <Text style={styles.answer}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 15,
  },
  cardOpen: {
    borderColor: colors.accentBorder,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  question: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  answer: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
