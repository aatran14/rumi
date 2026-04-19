import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, radius } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import type { StackScreenNavigation } from '../types';

type Props = { navigation: StackScreenNavigation };

const USERS: Record<string, string> = {
  daniel: 'password',
  gaya: 'password',
  adriel: 'password',
  andy: 'password',
  guest: 'password',
};

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = () => {
    const key = username.trim().toLowerCase();
    if (USERS[key] && USERS[key] === password) {
      setError('');
      signIn(key);
      navigation.replace('MainTabs');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.wordmark}>Rumi</Text>
        <Text style={styles.subtitle}>Welcome back</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={username}
            onChangeText={(t) => { setUsername(t); setError(''); }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.textMuted}
            placeholder="your username"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
            secureTextEntry
            placeholderTextColor={colors.textMuted}
            placeholder="••••••••"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSignIn}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Sign in</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('SignUp')}
        style={styles.footer}
        activeOpacity={0.7}
      >
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text style={styles.footerLink}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  wordmark: {
    fontSize: 64,
    color: colors.textPrimary,
    fontStyle: 'italic',
    fontFamily: 'serif',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 2,
  },
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
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: -4,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: colors.accentSoft,
    fontWeight: '500',
  },
});
