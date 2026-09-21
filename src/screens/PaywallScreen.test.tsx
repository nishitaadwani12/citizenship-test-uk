import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AppProvider } from '../app/AppContext';
import { LIFETIME_PRODUCT_ID } from '../services/iapService';
import { makeFakeBackend, makeServices, makeServicesWithBackend, renderWithApp } from '../testkit';
import { PaywallScreen } from './PaywallScreen';

describe('PaywallScreen', () => {
  it('shows a default price and loaded product price', async () => {
    const withPrice = makeServicesWithBackend(makeFakeBackend({
        getProducts: jest
          .fn()
          .mockResolvedValue([
            { productId: LIFETIME_PRODUCT_ID, title: 't', description: 'd', price: '£9.99' },
          ]),
      }),
    );
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, withPrice);
    await waitFor(() =>
      expect(screen.getByTestId('paywall-price')).toHaveTextContent('One-time payment of £9.99'),
    );
  });

  it('shows a store-unavailable message when loading products fails', async () => {
    const services = makeServicesWithBackend(makeFakeBackend({ getProducts: jest.fn().mockRejectedValue(new Error('down')) }),
    );
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, services);
    await waitFor(() =>
      expect(screen.getByTestId('paywall-message')).toHaveTextContent(
        'Store unavailable. Please try again later.',
      ),
    );
  });

  it('buys the unlock and returns home', async () => {
    const onNavigate = jest.fn();
    renderWithApp(<PaywallScreen onNavigate={onNavigate} />, makeServices());
    fireEvent.press(screen.getByTestId('buy-button'));
    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('Home'));
  });

  it('shows a message when the purchase fails', async () => {
    const services = makeServicesWithBackend(makeFakeBackend({ purchase: jest.fn().mockRejectedValue(new Error('nope')) }),
    );
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, services);
    fireEvent.press(screen.getByTestId('buy-button'));
    await waitFor(() =>
      expect(screen.getByTestId('paywall-message')).toHaveTextContent(
        'Purchase failed. Please try again.',
      ),
    );
  });

  it('restores a previous purchase and returns home', async () => {
    const onNavigate = jest.fn();
    const services = makeServicesWithBackend(makeFakeBackend({
        getPurchasedProductIds: jest.fn().mockResolvedValue([LIFETIME_PRODUCT_ID]),
      }),
    );
    renderWithApp(<PaywallScreen onNavigate={onNavigate} />, services);
    fireEvent.press(screen.getByTestId('restore-button'));
    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('Home'));
  });

  it('reports when there is nothing to restore', async () => {
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, makeServices());
    fireEvent.press(screen.getByTestId('restore-button'));
    await waitFor(() =>
      expect(screen.getByTestId('paywall-message')).toHaveTextContent(
        'No previous purchase found.',
      ),
    );
  });

  it('shows a message when restore fails', async () => {
    const services = makeServicesWithBackend(makeFakeBackend({
        getPurchasedProductIds: jest.fn().mockRejectedValue(new Error('boom')),
      }),
    );
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, services);
    fireEvent.press(screen.getByTestId('restore-button'));
    await waitFor(() =>
      expect(screen.getByTestId('paywall-message')).toHaveTextContent(
        'Restore failed. Please try again.',
      ),
    );
  });

  it('disables the buy button while a purchase is in flight', () => {
    const services = makeServicesWithBackend(makeFakeBackend({ purchase: jest.fn().mockReturnValue(new Promise(() => undefined)) }),
    );
    renderWithApp(<PaywallScreen onNavigate={jest.fn()} />, services);
    fireEvent.press(screen.getByTestId('buy-button'));
    expect(screen.getByTestId('buy-button').props.accessibilityState.disabled).toBe(true);
  });

  it('dismisses with the not-now action', () => {
    const onNavigate = jest.fn();
    renderWithApp(<PaywallScreen onNavigate={onNavigate} />, makeServices());
    fireEvent.press(screen.getByTestId('paywall-home'));
    expect(onNavigate).toHaveBeenCalledWith('Home');
  });

  it('ignores product load results after unmount', async () => {
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
