import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { LIFETIME_PRODUCT_ID } from '../services/iapService';
import { makeFakeBackend, makeServices, renderWithApp } from '../testkit';
import { SettingsScreen } from './SettingsScreen';

describe('SettingsScreen', () => {
  it('shows the account and free plan, and navigates to upgrade and home', async () => {
    const services = makeServices();
    await services.auth.signUp('a@b.com', 'secret1');
    const onNavigate = jest.fn();
    renderWithApp(<SettingsScreen onNavigate={onNavigate} />, services);

    await waitFor(() =>
      expect(screen.getByTestId('settings-account')).toHaveTextContent('Signed in as a@b.com'),
    );
    expect(screen.getByTestId('settings-plan')).toHaveTextContent('Plan: Free');

    fireEvent.press(screen.getByTestId('settings-upgrade'));
    expect(onNavigate).toHaveBeenCalledWith('Paywall');
    fireEvent.press(screen.getByTestId('settings-home'));
    expect(onNavigate).toHaveBeenCalledWith('Home');
  });

  it('restores a purchase and confirms', async () => {
    const services = makeServices(
      makeFakeBackend({
        getPurchasedProductIds: jest.fn().mockResolvedValue([LIFETIME_PRODUCT_ID]),
      }),
    );
    renderWithApp(<SettingsScreen onNavigate={jest.fn()} />, services);
    fireEvent.press(screen.getByTestId('settings-restore'));
    await waitFor(() =>
      expect(screen.getByTestId('settings-message')).toHaveTextContent('Purchase restored.'),
    );
  });

  it('reports when there is nothing to restore', async () => {
    renderWithApp(<SettingsScreen onNavigate={jest.fn()} />, makeServices());
    fireEvent.press(screen.getByTestId('settings-restore'));
    await waitFor(() =>
      expect(screen.getByTestId('settings-message')).toHaveTextContent(
        'No previous purchase found.',
      ),
    );
  });

  it('hides upgrade for premium users', async () => {
    const services = makeServices();
    await services.entitlements.grantPremium();
    renderWithApp(<SettingsScreen onNavigate={jest.fn()} />, services);
    await waitFor(() =>
      expect(screen.getByTestId('settings-plan')).toHaveTextContent('Plan: Premium'),
    );
    expect(screen.queryByTestId('settings-upgrade')).toBeNull();
  });

  it('logs out and clears the account', async () => {
    const services = makeServices();
    await services.auth.signUp('a@b.com', 'secret1');
    renderWithApp(<SettingsScreen onNavigate={jest.fn()} />, services);
    await waitFor(() =>
      expect(screen.getByTestId('settings-account')).toHaveTextContent('Signed in as a@b.com'),
    );
    fireEvent.press(screen.getByTestId('settings-logout'));
    await waitFor(() =>
      expect(screen.getByTestId('settings-account')).toHaveTextContent('Signed in as unknown'),
    );
  });
});
