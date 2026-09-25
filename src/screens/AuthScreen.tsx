import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useApp } from '../app/AppContext';
import { pressBusyBtn, pressFade } from '../app/press';
import { colors, styles } from '../app/theme';
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

  const btnStyle = pressBusyBtn(busy);
  const linkStyle = pressFade;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Life in the UK Test</Text>
      <Text style={styles.subtitle}>Sign in or create an account</Text>

      {error ? (
        <Text style={styles.error} testID="auth-error">
          {error}
        </Text>
      ) : null}

      <Pressable testID="google-button" style={btnStyle} disabled={busy} onPress={() => run(signInWithGoogle)}>
        <Text style={styles.buttonText}>Continue with Google</Text>
      </Pressable>
      <Pressable testID="apple-button" style={btnStyle} disabled={busy} onPress={() => run(signInWithApple)}>
        <Text style={styles.buttonText}>Continue with Apple</Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.tabs}>
        <Pressable
          testID="mode-email"
          style={[styles.tab, mode === 'email' && styles.tabActive]}
          onPress={() => setMode('email')}
        >
          <Text style={mode === 'email' ? styles.tabTextActive : styles.tabText}>Email</Text>
        </Pressable>
        <Pressable
          testID="mode-phone"
          style={[styles.tab, mode === 'phone' && styles.tabActive]}
          onPress={() => setMode('phone')}
        >
          <Text style={mode === 'phone' ? styles.tabTextActive : styles.tabText}>Phone</Text>
        </Pressable>
      </View>

      {mode === 'email' ? (
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            testID="email-input"
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            testID="password-input"
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            testID="submit-button"
            style={btnStyle}
            disabled={busy}
            onPress={() =>
              run(() =>
                isSignup ? signUpWithEmail(email, password) : signInWithEmail(email, password),
              )
            }
          >
            <Text style={styles.buttonText}>{isSignup ? 'Sign up' : 'Log in'}</Text>
          </Pressable>
          <Pressable
            testID="toggle-mode"
            style={linkStyle}
            onPress={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
          >
            <Text style={styles.secondaryText}>
              {isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <Text style={styles.label}>Phone number (international, e.g. +447700900123)</Text>
          <TextInput
            testID="phone-input"
            style={styles.input}
            placeholder="+447700900123"
            placeholderTextColor={colors.muted}
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
                placeholder="6-digit code"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
              <Pressable
                testID="confirm-code-button"
                style={btnStyle}
                disabled={busy}
                onPress={() => run(() => confirmPhone(verification, code))}
              >
                <Text style={styles.buttonText}>Verify and continue</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              testID="send-code-button"
              style={btnStyle}
              disabled={busy}
              onPress={() =>
                run(async () => {
                  setVerification(await startPhoneSignIn(phone));
                })
              }
            >
              <Text style={styles.buttonText}>Send code</Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  );
}
