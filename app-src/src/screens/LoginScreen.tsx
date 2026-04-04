import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
      setError('Invalid username or password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <Text style={styles.title}>Rumi</Text>

      {/* Username */}
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

      {/* Password */}
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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Sign In */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSignIn}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Sign in</Text>
      </TouchableOpacity>

      {/* Link to Sign Up */}
      <TouchableOpacity
        onPress={() => navigation.navigate('SignUp')}
        style={styles.linkWrap}
      >
        <Text style={styles.linkText}>
          Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
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
  title: {
    fontSize: 72,
    color: colors.white,
    fontStyle: 'italic',
    fontFamily: 'serif',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 60,
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
  error: {
    color: colors.red,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.accentLight,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
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
