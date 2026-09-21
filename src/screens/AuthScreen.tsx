import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../app/AppContext';
import { styles } from '../app/theme';

/** Combined sign-in / sign-up screen. On success the app context updates the
 *  current user, which switches the root navigator to the main app. */
export function AuthScreen(): React.JSX.Element {
  const { login, signUp } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  async function submit(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      if (isSignup) {
        await signUp(email, password);
      } else {
        await login(email, password);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Life in the UK Test</Text>
      <Text style={styles.subtitle}>{isSignup ? 'Create an account' : 'Welcome back'}</Text>
      {error ? (
        <Text style={styles.error} testID="auth-error">
          {error}
        </Text>
      ) : null}
      <Text style={styles.label}>Email</Text>
      <TextInput
        testID="email-input"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        testID="password-input"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        testID="submit-button"
        style={[styles.button, busy ? styles.buttonDisabled : null]}
        disabled={busy}
        onPress={submit}
      >
        <Text style={styles.buttonText}>{isSignup ? 'Sign up' : 'Log in'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="toggle-mode"
        onPress={() => {
          setMode(isSignup ? 'login' : 'signup');
          setError('');
        }}
      >
        <Text style={styles.secondaryText}>
          {isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
