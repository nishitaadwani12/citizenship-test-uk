import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../app/AppContext';
import { styles } from '../app/theme';
import { displayIdentity } from '../services/auth/model';
import { MainRoute } from '../navigation/routes';

export interface SettingsScreenProps {
  onNavigate(route: MainRoute): void;
}

/** Account and purchase management. Logging out returns to the auth screen. */
export function SettingsScreen({ onNavigate }: SettingsScreenProps): React.JSX.Element {
  const { user, isPremium, logout, services, refreshPremium } = useApp();
  const [message, setMessage] = useState('');

  async function restore(): Promise<void> {
    setMessage('');
    const restored = await services.iap.restore();
    if (restored) {
      await refreshPremium();
      setMessage('Purchase restored.');
    } else {
      setMessage('No previous purchase found.');
    }
  }

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle} testID="settings-account">
        Signed in as {user ? displayIdentity(user) : 'unknown'}
      </Text>
      <Text style={styles.label} testID="settings-plan">
        Plan: {isPremium ? 'Premium' : 'Free'}
      </Text>
      {message ? (
        <Text style={styles.label} testID="settings-message">
          {message}
        </Text>
      ) : null}
      {isPremium ? null : (
        <TouchableOpacity testID="settings-upgrade" style={styles.button} onPress={() => onNavigate('Paywall')}>
          <Text style={styles.buttonText}>Upgrade to premium</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity testID="settings-restore" style={styles.card} onPress={restore}>
        <Text style={styles.prompt}>Restore purchase</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="settings-home" onPress={() => onNavigate('Home')}>
        <Text style={styles.secondaryText}>Back to home</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="settings-logout" style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
