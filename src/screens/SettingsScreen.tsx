import React, { useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { useApp } from '../app/AppContext';
import { pressBtn, pressCard, pressDanger, pressFade } from '../app/press';
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
        <Pressable testID="settings-upgrade" style={pressBtn} onPress={() => onNavigate('Paywall')}>
          <Text style={styles.buttonText}>Go Premium</Text>
        </Pressable>
      )}
      <Pressable testID="settings-restore" style={pressCard} onPress={restore}>
        <Text style={styles.prompt}>Restore purchase</Text>
      </Pressable>

      {LEGAL_LINKS.map((item) => (
        <Pressable
          key={item.route}
          testID={`settings-link-${item.route}`}
          style={pressFade}
          onPress={() => onNavigate(item.route)}
        >
          <Text style={styles.secondaryText}>{item.label}</Text>
        </Pressable>
      ))}

      <Pressable testID="settings-home" style={pressFade} onPress={() => onNavigate('Home')}>
        <Text style={styles.secondaryText}>Back to home</Text>
      </Pressable>
      <Pressable testID="settings-logout" style={pressBtn} onPress={logout}>
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>

      {confirmingDelete ? (
        <Pressable testID="settings-delete-confirm" style={pressDanger} onPress={deleteAccount}>
          <Text style={styles.buttonText}>Tap again to permanently delete your account</Text>
        </Pressable>
      ) : (
        <Pressable testID="settings-delete" style={pressFade} onPress={() => setConfirmingDelete(true)}>
          <Text style={styles.secondaryText}>Delete account</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
