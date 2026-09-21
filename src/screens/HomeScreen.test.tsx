import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { makeServices, renderWithApp } from '../testkit';
import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  it('greets a free user and shows the upsell', async () => {
    const services = makeServices();
    await services.auth.signUpWithEmail('a@b.com', 'secret1');
    const onNavigate = jest.fn();
    renderWithApp(<HomeScreen onNavigate={onNavigate} />, services);

    await waitFor(() => expect(screen.getByText('Hi, a@b.com')).toBeTruthy());
    expect(screen.getByTestId('premium-status')).toHaveTextContent('Free plan');
    expect(screen.getByTestId('tile-Paywall')).toBeTruthy();

    fireEvent.press(screen.getByTestId('tile-Practice'));
    expect(onNavigate).toHaveBeenCalledWith('Practice');
    fireEvent.press(screen.getByTestId('tile-Paywall'));
    expect(onNavigate).toHaveBeenCalledWith('Paywall');
  });

  it('hides the upsell for premium users', async () => {
    const services = makeServices();
    await services.auth.signUpWithEmail('a@b.com', 'secret1');
    await services.entitlements.grantPremium();
    renderWithApp(<HomeScreen onNavigate={jest.fn()} />, services);

    await waitFor(() =>
      expect(screen.getByTestId('premium-status')).toHaveTextContent(
        'Premium unlocked — full access',
      ),
    );
    expect(screen.queryByTestId('tile-Paywall')).toBeNull();
  });

  it('falls back to a generic greeting before the user loads', () => {
    renderWithApp(<HomeScreen onNavigate={jest.fn()} />, makeServices());
    expect(screen.getByText('Hi, there')).toBeTruthy();
  });
});
