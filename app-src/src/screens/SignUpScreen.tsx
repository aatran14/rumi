import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import type { StackScreenNavigation } from '../types';

type Props = { navigation: StackScreenNavigation };
type Mode = 'create' | 'join';

const CODE_LENGTH = 5;

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: CODE_LENGTH }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [mode,            setMode]            = useState<Mode>('create');
  const [displayName,     setDisplayName]     = useState('');
  const [username,        setUsername]        = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,           setError]           = useState('');

  const homeCode = useMemo(() => generateCode(), []);
  const [joinCode, setJoinCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const upper = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const next = [...joinCode];
    next[index] = upper.slice(-1);
    setJoinCode(next);
    if (upper && index < CODE_LENGTH - 1) codeInputRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !joinCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(homeCode);
    Alert.alert('Copied!', 'Home code copied to clipboard.');
  };

  const handleCreateAccount = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!displayName.trim() || !username.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    signUp(username, displayName);
    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.wordmark}>Rumi</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        {/* Fields */}
        {[
          { label: 'Display name', value: displayName, onChange: setDisplayName, placeholder: 'How roommates see you' },
          { label: 'Username',     value: username,    onChange: setUsername,    placeholder: 'lowercase, no spaces', auto: 'none' as const },
          { label: 'Password',     value: password,    onChange: setPassword,    placeholder: '••••••••', secure: true },
          { label: 'Confirm password', value: confirmPassword, onChange: setConfirmPassword, placeholder: '••••••••', secure: true },
        ].map((f) => (
          <View key={f.label} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={f.value}
              onChangeText={(t) => { f.onChange(t); setError(''); }}
              autoCapitalize={f.auto ?? 'words'}
              autoCorrect={false}
              secureTextEntry={f.secure}
              placeholder={f.placeholder}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        ))}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          {(['create', 'join'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => setMode(m)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                {m === 'create' ? 'Create home' : 'Join a home'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Code section */}
        <View style={styles.codeSection}>
          {mode === 'create' ? (
            <>
              <View style={styles.codeRow}>
                {homeCode.split('').map((char, i) => (
                  <View key={i} style={styles.codeBox}>
                    <Text style={styles.codeChar}>{char}</Text>
                  </View>
                ))}
                <TouchableOpacity onPress={handleCopyCode} style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.codeHint}>Share this code with your roommates</Text>
            </>
          ) : (
            <>
              <View style={styles.codeRow}>
                {joinCode.map((char, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => { codeInputRefs.current[i] = ref; }}
                    style={styles.codeInput}
                    value={char}
                    onChangeText={(t) => handleCodeChange(t, i)}
                    onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, i)}
                    maxLength={1}
                    autoCapitalize="characters"
                    keyboardType="default"
                    textAlign="center"
                  />
                ))}
              </View>
              <Text style={styles.codeHint}>Enter the code shared by your roommate</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleCreateAccount}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.footer}
          activeOpacity={0.7}
        >
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.footerLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },

  wordmark: {
    fontSize: 56,
    color: colors.textPrimary,
    fontStyle: 'italic',
    fontFamily: 'serif',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // Fields
  field: { gap: 6, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginLeft: 2 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 16,
  },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm, marginLeft: 2 },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 3,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: colors.accent },
  modeBtnText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  modeBtnTextActive: { color: colors.textPrimary, fontWeight: '600' },

  // Code
  codeSection: { alignItems: 'center', marginBottom: spacing.lg },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  codeBox: {
    width: 44, height: 52,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChar: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' },
  codeInput: {
    width: 44, height: 52,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  copyBtn: { marginLeft: 4, padding: 6 },
  codeHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  // Primary button
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryBtnText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },

  footer: { alignItems: 'center', paddingVertical: spacing.md },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.accentSoft, fontWeight: '500' },
});
