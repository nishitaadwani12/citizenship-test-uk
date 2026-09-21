import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AppProvider } from '../app/AppContext';
import { QUARTERLY_PLAN_ID, WEEKLY_PLAN_ID } from '../services/plans';
import { makeFakeBackend, makeServices, makeServicesWithBackend, renderWithApp } from '../testkit';
import { PaywallScreen } from './PaywallScreen';

const weeklyTile = `plan-${WEEKLY_PLAN_ID}`;

describe('PaywallScreen', () => {
  it('shows fallback prices then the loaded store price', async () => {
    const withPrice = makeServicesWithBackend(
      makeFakeBackend({
        getSubscriptions: jest
          .fn()
          .mockResolvedValue([
            { productId: WEEKLY_PLAN_ID, title: 'Weekly', description: 'd', price: '₹149' },
          ]),
      }),
    );
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, withPrice);
    // Quarterly has no store price -> fallback shown.
    expect(screen.getByTestId(`plan-${QUARTERLY_PLAN_ID}`)).toHaveTextContent(
      '3 months — ₹1,500 every 3 months · Best value',
    );
    await waitFor(() =>
      expect(screen.getByTestId(weeklyTile)).toHaveTextContent('Weekly — ₹149 per week'),
    );
  });

  it('shows a store-unavailable message when loading plans fails', async () => {
    const services = makeServicesWithBackend(
      makeFakeBackend({ getSubscriptions: jest.fn().mockRejectedValue(new Error('down')) }),
    );
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, services);
    await waitFor(() =>
      expect(screen.getByTestId('paywall-message')).toHaveTextContent(
        'Store unavailable. Please try again later.',
      ),
    );
  });

  it('subscribes and returns home', async () => {
    const onNavigate = jest.fn();
    renderWithApp(<PaywallScreen onNavigate={onNavigate} />, makeServices());
    fireEvent.press(screen.getByTestId(weeklyTile));
    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('Home'));
  });

  it('shows a message when the purchase fails', async () => {
    const services = makeServicesWithBackend(
      makeFakeBackend({ purchaseSubscription: jest.fn().mockRejectedValue(new Error('nope')) }),
    );
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, services);
    fireEvent.press(screen.getByTestId(weeklyTile));
    await waitFor(() =>
      expect(screen.getByTestId('paywall-message')).toHaveTextContent(
        'Purchase failed. Please try again.',
      ),
    );
  });

  it('restores an active subscription and returns home', async () => {
    const onNavigate = jest.fn();
    const services = makeServicesWithBackend(
      makeFakeBackend({ getOwnedProductIds: jest.fn().mockResolvedValue([WEEKLY_PLAN_ID]) }),
    );
    renderWithApp(<PaywallScreen onNavigate={onNavigate} />, services);
    fireEvent.press(screen.getByTestId('restore-button'));
    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('Home'));
  });

  it('reports when there is nothing to restore', async () => {
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, makeServices());
    fireEvent.press(screen.getByTestId('restore-button'));
    await waitFor(() =>
      expect(screen.getByTestId('paywall-message')).toHaveTextContent('No active subscription found.'),
    );
  });

  it('shows a message when restore fails', async () => {
    const services = makeServicesWithBackend(
      makeFakeBackend({ getOwnedProductIds: jest.fn().mockRejectedValue(new Error('boom')) }),
    );
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, services);
    fireEvent.press(screen.getByTestId('restore-button'));
    await waitFor(() =>
      expect(screen.getByTestId('paywall-message')).toHaveTextContent(
        'Restore failed. Please try again.',
      ),
    );
  });

  it('disables plans while a purchase is in flight', () => {
    const services = makeServicesWithBackend(
      makeFakeBackend({
        purchaseSubscription: jest.fn().mockReturnValue(new Promise(() => undefined)),
      }),
    );
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, services);
    fireEvent.press(screen.getByTestId(weeklyTile));
    expect(screen.getByTestId(weeklyTile).props.accessibilityState.disabled).toBe(true);
  });

  it('links to terms, privacy, and dismisses', () => {
    const onNavigate = jest.fn();
    renderWithApp(<PaywallScreen onNavigate={onNavigate} />, makeServices());
    fireEvent.press(screen.getByTestId('paywall-terms-link'));
    expect(onNavigate).toHaveBeenCalledWith('Terms');
    fireEvent.press(screen.getByTestId('paywall-privacy-link'));
    expect(onNavigate).toHaveBeenCalledWith('Privacy');
    fireEvent.press(screen.getByTestId('paywall-home'));
    expect(onNavigate).toHaveBeenCalledWith('Home');
  });

  it('ignores plan load results after unmount', async () => {
    const { unmount } = render(
      <AppProvider services={makeServices()}>
        <PaywallScreen onNavigate={jest.fn()} />
      </AppProvider>,
    );
    unmount();
    await Promise.resolve();
    await Promise.resolve();
  });
});
