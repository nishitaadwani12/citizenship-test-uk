import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../app/AppContext';
import { styles } from '../app/theme';
import { IapProduct } from '../services/iapBackend';
import { MainRoute } from '../navigation/routes';

export interface PaywallScreenProps {
  onNavigate(route: MainRoute): void;
}

const BENEFITS = [
  'All practice questions',
  'Full 24-question mock exams',
  'No adverts',
];

/** Presents the lifetime unlock and restore flow using store in-app purchases. */
export function PaywallScreen({ onNavigate }: PaywallScreenProps): React.JSX.Element {
  const { services, refreshPremium } = useApp();
  const [products, setProducts] = useState<IapProduct[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      let apply: () => void;
      try {
        const loaded = await services.iap.loadProducts();
        apply = () => setProducts(loaded);
      } catch {
        apply = () => setMessage('Store unavailable. Please try again later.');
      }
      if (active) {
        apply();
      }
    })();
    return () => {
      active = false;
    };
  }, [services]);

  const price = products[0]?.price ?? '£8.99';

  async function buy(): Promise<void> {
    setBusy(true);
    setMessage('');
    try {
      await services.iap.buyLifetime();
      await refreshPremium();
      onNavigate('Home');
    } catch {
      setMessage('Purchase failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function restore(): Promise<void> {
    setBusy(true);
    setMessage('');
    try {
      const restored = await services.iap.restore();
      if (restored) {
        await refreshPremium();
        onNavigate('Home');
      } else {
        setMessage('No previous purchase found.');
      }
    } catch {
      setMessage('Restore failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Unlock full access</Text>
      <Text style={styles.subtitle} testID="paywall-price">
        One-time payment of {price}
      </Text>
      {BENEFITS.map((benefit) => (
        <Text key={benefit} style={styles.optionText}>
          • {benefit}
        </Text>
      ))}
      {message ? (
        <Text style={styles.error} testID="paywall-message">
          {message}
        </Text>
      ) : null}
      <TouchableOpacity
        testID="buy-button"
        style={[styles.button, busy ? styles.buttonDisabled : null]}
        disabled={busy}
        onPress={buy}
      >
        <Text style={styles.buttonText}>Buy lifetime unlock</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="restore-button" disabled={busy} onPress={restore}>
        <Text style={styles.secondaryText}>Restore purchase</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="paywall-home" onPress={() => onNavigate('Home')}>
        <Text style={styles.secondaryText}>Not now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
