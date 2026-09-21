import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { makeServices, renderWithApp } from '../testkit';
import { AuthScreen } from './AuthScreen';

describe('AuthScreen', () => {
  it('defaults to login mode and toggles to signup', () => {
    renderWithApp(<AuthScreen />, makeServices());
    expect(screen.getByText('Welcome back')).toBeTruthy();
    fireEvent.press(screen.getByTestId('toggle-mode'));
    expect(screen.getByText('Create an account')).toBeTruthy();
    fireEvent.press(screen.getByTestId('toggle-mode'));
    expect(screen.getByText('Welcome back')).toBeTruthy();
  });

  it('signs up successfully without showing an error', async () => {
    const services = makeServices();
    renderWithApp(<AuthScreen />, services);
    fireEvent.press(screen.getByTestId('toggle-mode'));
    fireEvent.changeText(screen.getByTestId('email-input'), 'new@example.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'secret1');
    fireEvent.press(screen.getByTestId('submit-button'));
    await waitFor(() => expect(services.entitlements.isPremium()).resolves.toBe(false));
    expect(screen.queryByTestId('auth-error')).toBeNull();
  });

  it('shows a validation error on failed login', async () => {
    renderWithApp(<AuthScreen />, makeServices());
    fireEvent.changeText(screen.getByTestId('email-input'), 'missing@example.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'secret1');
    fireEvent.press(screen.getByTestId('submit-button'));
    await waitFor(() =>
      expect(screen.getByTestId('auth-error')).toHaveTextContent(
        'No account found for this email.',
      ),
    );
    // Toggling mode clears the error.
    fireEvent.press(screen.getByTestId('toggle-mode'));
    expect(screen.queryByTestId('auth-error')).toBeNull();
  });

  it('shows a generic message when a non-Error is thrown', async () => {
    const services = makeServices();
    services.auth.login = jest.fn().mockRejectedValue('boom');
    renderWithApp(<AuthScreen />, services);
    fireEvent.changeText(screen.getByTestId('email-input'), 'a@b.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'secret1');
    fireEvent.press(screen.getByTestId('submit-button'));
    await waitFor(() =>
      expect(screen.getByTestId('auth-error')).toHaveTextContent('Something went wrong.'),
    );
  });

  it('disables the button while a submit is in flight', () => {
    const services = makeServices();
    services.auth.login = jest.fn().mockReturnValue(new Promise(() => undefined));
    renderWithApp(<AuthScreen />, services);
    fireEvent.changeText(screen.getByTestId('email-input'), 'a@b.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'secret1');
    fireEvent.press(screen.getByTestId('submit-button'));
    expect(screen.getByTestId('submit-button').props.accessibilityState.disabled).toBe(true);
  });
});
