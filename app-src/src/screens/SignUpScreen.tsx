import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
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

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('create');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Create Home: generated code
  const homeCode = useMemo(() => generateCode(), []);

  // Join a Home: code input
  const [joinCode, setJoinCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const upper = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const next = [...joinCode];
    next[index] = upper.slice(-1);
    setJoinCode(next);
    if (upper && index < CODE_LENGTH - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }
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
      Alert.alert('Passwords do not match');
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Rumi</Text>

        {/* Fields */}
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Display{'\n'}Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            autoCorrect={false}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Reenter{'\n'}Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Mode toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'create' && styles.toggleActive]}
            onPress={() => setMode('create')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                mode === 'create' && styles.toggleTextActive,
              ]}
            >
              Create Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'join' && styles.toggleActive]}
            onPress={() => setMode('join')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                mode === 'join' && styles.toggleTextActive,
              ]}
            >
              Join a Home
            </Text>
          </TouchableOpacity>
        </View>

        {/* Code section */}
        {mode === 'create' ? (
          <View style={styles.codeSection}>
            <View style={styles.codeRow}>
              {homeCode.split('').map((char, i) => (
                <View key={i} style={styles.codeBox}>
                  <Text style={styles.codeChar}>{char}</Text>
                </View>
              ))}
              <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                <Ionicons name="copy-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.codeHint}>
              Copy this code and share with{'\n'}your roommates
            </Text>
          </View>
        ) : (
          <View style={styles.codeSection}>
            <View style={styles.codeRow}>
              {joinCode.map((char, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => { codeInputRefs.current[i] = ref; }}
                  style={styles.codeInput}
                  value={char}
                  onChangeText={(t) => handleCodeChange(t, i)}
                  onKeyPress={({ nativeEvent }) =>
                    handleCodeKeyPress(nativeEvent.key, i)
                  }
                  maxLength={1}
                  autoCapitalize="characters"
                  keyboardType="default"
                  textAlign="center"
                />
              ))}
            </View>
            <Text style={styles.codeHint}>
              Enter the code shared by your{'\n'}roommate
            </Text>
          </View>
        )}

        {/* Create Account */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCreateAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Link to Sign In */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.linkWrap}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  title: {
    fontSize: 72,
    color: colors.white,
    fontStyle: 'italic',
    fontFamily: 'serif',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 40,
  },
  fieldRow: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.white,
    fontSize: 16,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.textMuted,
    overflow: 'hidden',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  toggleButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.white,
  },

  // Code
  codeSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  codeBox: {
    width: 44,
    height: 52,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChar: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  codeInput: {
    width: 44,
    height: 52,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  copyButton: {
    marginLeft: 4,
    padding: 6,
  },
  codeHint: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },

  // Primary button
  primaryButton: {
    backgroundColor: colors.accentLight,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  linkWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkBold: {
    color: colors.accentLight,
    fontWeight: '600',
  },
});
