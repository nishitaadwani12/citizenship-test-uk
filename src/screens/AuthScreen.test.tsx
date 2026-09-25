import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { makeFakeAuthGateway, makeServices, renderWithApp } from '../testkit';
import { AuthScreen } from './AuthScreen';

function renderAuth(auth = makeFakeAuthGateway()) {
  renderWithApp(<AuthScreen />, makeServices({ auth }));
  return auth;
}

describe('AuthScreen social sign-in', () => {
  it('signs in with Google', async () => {
    const auth = renderAuth();
    fireEvent.press(screen.getByTestId('google-button'));
    await waitFor(() => expect(auth.signInWithGoogle).toHaveBeenCalled());
    expect(screen.queryByTestId('auth-error')).toBeNull();
  });

  it('shows the provider error when a social sign-in fails', async () => {
    renderWithApp(<AuthScreen />, makeServices());
    fireEvent.press(screen.getByTestId('google-button'));
    await waitFor(() => expect(screen.getByTestId('auth-error')).toHaveTextContent(/Firebase/));
  });

  it('shows a generic message when a non-Error is thrown', async () => {
    renderAuth(makeFakeAuthGateway({ signInWithGoogle: jest.fn().mockRejectedValue('boom') }));
    fireEvent.press(screen.getByTestId('google-button'));
    await waitFor(() =>
      expect(screen.getByTestId('auth-error')).toHaveTextContent('Something went wrong.'),
    );
  });

  it('disables buttons while a sign-in is in flight', () => {
    renderAuth(
      makeFakeAuthGateway({ signInWithGoogle: jest.fn().mockReturnValue(new Promise(() => undefined)) }),
    );
    fireEvent.press(screen.getByTestId('google-button'));
    expect(screen.getByTestId('google-button').props.accessibilityState.disabled).toBe(true);
  });
});

describe('AuthScreen email', () => {
  it('logs in with email by default', async () => {
    const auth = renderAuth();
    fireEvent.press(screen.getByTestId('mode-email')); // stays on the email tab
    fireEvent.changeText(screen.getByTestId('email-input'), 'a@b.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'secret1');
    fireEvent.press(screen.getByTestId('submit-button'));
    await waitFor(() => expect(auth.signInWithEmail).toHaveBeenCalledWith('a@b.com', 'secret1'));
  });

  it('toggles to signup and creates an account', async () => {
    const auth = renderAuth();
    fireEvent.press(screen.getByTestId('toggle-mode'));
    expect(screen.getByText('Sign up')).toBeTruthy();
    fireEvent.changeText(screen.getByTestId('email-input'), 'new@b.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'secret1');
    fireEvent.press(screen.getByTestId('submit-button'));
    await waitFor(() => expect(auth.signUpWithEmail).toHaveBeenCalledWith('new@b.com', 'secret1'));
  });

  it('shows a validation error on failed email login', async () => {
    renderWithApp(<AuthScreen />, makeServices());
    fireEvent.changeText(screen.getByTestId('email-input'), 'missing@example.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'secret1');
    fireEvent.press(screen.getByTestId('submit-button'));
    await waitFor(() =>
      expect(screen.getByTestId('auth-error')).toHaveTextContent('No account found for this email.'),
    );
  });
});

describe('AuthScreen phone', () => {
  it('sends a code then verifies it', async () => {
    const auth = renderAuth();
    fireEvent.press(screen.getByTestId('mode-phone'));
    fireEvent.changeText(screen.getByTestId('phone-input'), '+447700900123');
    fireEvent.press(screen.getByTestId('send-code-button'));
    await waitFor(() => expect(screen.getByTestId('code-input')).toBeTruthy());
    expect(auth.startPhoneSignIn).toHaveBeenCalledWith('+447700900123');

    fireEvent.changeText(screen.getByTestId('code-input'), '123456');
    fireEvent.press(screen.getByTestId('confirm-code-button'));
    await waitFor(() => expect(screen.queryByTestId('auth-error')).toBeNull());
  });

  it('shows an error when sending the code fails', async () => {
    renderWithApp(<AuthScreen />, makeServices());
    fireEvent.press(screen.getByTestId('mode-phone'));
    fireEvent.changeText(screen.getByTestId('phone-input'), '+447700900123');
    fireEvent.press(screen.getByTestId('send-code-button'));
    await waitFor(() => expect(screen.getByTestId('auth-error')).toHaveTextContent(/Firebase/));
    expect(screen.queryByTestId('code-input')).toBeNull();
  });
});
