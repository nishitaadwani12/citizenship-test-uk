import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../app/AppContext';
import { styles } from '../app/theme';
import { displayIdentity } from '../services/auth/model';
import { MainRoute } from '../navigation/routes';

export interface SettingsScreenProps {
  onNavigate(route: MainRoute): void;
}

const LEGAL_LINKS: { route: MainRoute; label: string }[] = [
  { route: 'Privacy', label: 'Privacy Policy' },
  { route: 'Terms', label: 'Terms of Service' },
  { route: 'About', label: 'About & Disclaimer' },
];

/** Account and purchase management, legal links, and account deletion (required
 *  by both app stores). Logging out or deleting returns to the auth screen. */
export function SettingsScreen({ onNavigate }: SettingsScreenProps): React.JSX.Element {
  const { user, isPremium, logout, deleteAccount, services, refreshPremium } = useApp();
  const [message, setMessage] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function restore(): Promise<void> {
    setMessage('');
    const restored = await services.iap.restore();
    if (restored) {
      await refreshPremium();
      setMessage('Subscription restored.');
    } else {
      setMessage('No active subscription found.');
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
          <Text style={styles.buttonText}>Go Premium</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity testID="settings-restore" style={styles.card} onPress={restore}>
        <Text style={styles.prompt}>Restore purchase</Text>
      </TouchableOpacity>

      {LEGAL_LINKS.map((link) => (
        <TouchableOpacity
          key={link.route}
          testID={`settings-link-${link.route}`}
          onPress={() => onNavigate(link.route)}
        >
          <Text style={styles.secondaryText}>{link.label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity testID="settings-home" onPress={() => onNavigate('Home')}>
        <Text style={styles.secondaryText}>Back to home</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="settings-logout" style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>

      {confirmingDelete ? (
        <TouchableOpacity
          testID="settings-delete-confirm"
          style={[styles.button, styles.buttonDisabled]}
          onPress={deleteAccount}
        >
          <Text style={styles.buttonText}>Tap again to permanently delete your account</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity testID="settings-delete" onPress={() => setConfirmingDelete(true)}>
          <Text style={styles.secondaryText}>Delete account</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
