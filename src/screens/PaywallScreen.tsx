import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../app/AppContext';
import { styles } from '../app/theme';
import { UK_QUESTIONS } from '../core/questionBank';
import { tierCounts } from '../core/access';
import { IapProduct } from '../services/iapBackend';
import { SUBSCRIPTION_PLANS } from '../services/plans';
import { MainRoute } from '../navigation/routes';

export interface PaywallScreenProps {
  onNavigate(route: MainRoute): void;
}

/** Presents the subscription plans and restore flow using store subscriptions.
 *  Shows price, billing period, auto-renew terms, and links to Terms/Privacy as
 *  required by the app stores. */
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
        const loaded = await services.iap.loadPlans();
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

  const counts = tierCounts(UK_QUESTIONS);

  function priceFor(productId: string, fallback: string): string {
    return products.find((p) => p.productId === productId)?.price ?? fallback;
  }

  async function subscribe(productId: string): Promise<void> {
    setBusy(true);
    setMessage('');
    try {
      await services.iap.subscribe(productId);
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
        setMessage('No active subscription found.');
      }
    } catch {
      setMessage('Restore failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Go Premium</Text>
      <Text style={styles.subtitle} testID="paywall-benefits">
        Unlock all {counts.free + counts.premium} questions ({counts.premium} premium), full mock
        exams and ad-free study.
      </Text>

      {message ? (
        <Text style={styles.error} testID="paywall-message">
          {message}
        </Text>
      ) : null}

      {SUBSCRIPTION_PLANS.map((plan) => (
        <TouchableOpacity
          key={plan.productId}
          testID={`plan-${plan.productId}`}
          style={[styles.button, busy ? styles.buttonDisabled : null]}
          disabled={busy}
          onPress={() => subscribe(plan.productId)}
        >
          <Text style={styles.buttonText}>
            {plan.title} — {priceFor(plan.productId, plan.fallbackPrice)} {plan.period}
            {plan.note ? ` · ${plan.note}` : ''}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label} testID="paywall-terms">
        Subscriptions renew automatically until cancelled. Cancel anytime in your store account at
        least 24 hours before renewal. Payment is charged to your Apple or Google account.
      </Text>

      <TouchableOpacity testID="restore-button" disabled={busy} onPress={restore}>
        <Text style={styles.secondaryText}>Restore purchase</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="paywall-terms-link" onPress={() => onNavigate('Terms')}>
        <Text style={styles.secondaryText}>Terms of Service</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="paywall-privacy-link" onPress={() => onNavigate('Privacy')}>
        <Text style={styles.secondaryText}>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="paywall-home" onPress={() => onNavigate('Home')}>
        <Text style={styles.secondaryText}>Not now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
