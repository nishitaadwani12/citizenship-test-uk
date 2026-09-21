import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../app/AppContext';
import { styles } from '../app/theme';
import { PhoneVerification } from '../services/auth/model';

type Mode = 'email' | 'phone';

/** Sign-in / sign-up screen supporting email, phone OTP, Google and Apple.
 *  Social and phone methods require Firebase to be configured; until then they
 *  surface a clear message. On success the app context updates the user and the
 *  root navigator switches to the main app. */
export function AuthScreen(): React.JSX.Element {
  const {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    startPhoneSignIn,
    confirmPhone,
  } = useApp();

  const [mode, setMode] = useState<Mode>('email');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verification, setVerification] = useState<PhoneVerification | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>): Promise<void> {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Life in the UK Test</Text>
      <Text style={styles.subtitle}>Sign in or create an account</Text>

      {error ? (
        <Text style={styles.error} testID="auth-error">
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        testID="google-button"
        style={[styles.button, busy ? styles.buttonDisabled : null]}
        disabled={busy}
        onPress={() => run(signInWithGoogle)}
      >
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="apple-button"
        style={[styles.button, busy ? styles.buttonDisabled : null]}
        disabled={busy}
        onPress={() => run(signInWithApple)}
      >
        <Text style={styles.buttonText}>Continue with Apple</Text>
      </TouchableOpacity>

      <View style={{ height: 12 }} />
      <TouchableOpacity testID="mode-email" onPress={() => setMode('email')}>
        <Text style={mode === 'email' ? styles.prompt : styles.label}>Email</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="mode-phone" onPress={() => setMode('phone')}>
        <Text style={mode === 'phone' ? styles.prompt : styles.label}>Phone number</Text>
      </TouchableOpacity>

      {mode === 'email' ? (
        <View>
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
            onPress={() =>
              run(() =>
                isSignup ? signUpWithEmail(email, password) : signInWithEmail(email, password),
              )
            }
          >
            <Text style={styles.buttonText}>{isSignup ? 'Sign up' : 'Log in'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="toggle-mode"
            onPress={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
          >
            <Text style={styles.secondaryText}>
              {isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.label}>Phone number (international, e.g. +447700900123)</Text>
          <TextInput
            testID="phone-input"
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {verification ? (
            <View>
              <Text style={styles.label}>Enter the code we sent you</Text>
              <TextInput
                testID="code-input"
                style={styles.input}
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
              <TouchableOpacity
                testID="confirm-code-button"
                style={[styles.button, busy ? styles.buttonDisabled : null]}
                disabled={busy}
                onPress={() => run(() => confirmPhone(verification, code))}
              >
                <Text style={styles.buttonText}>Verify and continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              testID="send-code-button"
              style={[styles.button, busy ? styles.buttonDisabled : null]}
              disabled={busy}
              onPress={() =>
                run(async () => {
                  setVerification(await startPhoneSignIn(phone));
                })
              }
            >
              <Text style={styles.buttonText}>Send code</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}
