import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { makeFakeAuthGateway, makeServices } from '../testkit';
import { AppProvider, useApp } from './AppContext';

function Probe(): React.JSX.Element {
  const {
    user,
    isPremium,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    startPhoneSignIn,
    confirmPhone,
    logout,
    deleteAccount,
    refreshPremium,
    services,
  } = useApp();
  return (
    <>
      <Text testID="user">{user ? `${user.provider}:${user.id}` : 'none'}</Text>
      <Text testID="premium">{String(isPremium)}</Text>
      <TouchableOpacity testID="signup" onPress={() => signUpWithEmail('a@b.com', 'secret1')}>
        <Text>signup</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="login" onPress={() => signInWithEmail('a@b.com', 'secret1')}>
        <Text>login</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="google" onPress={() => signInWithGoogle()}>
        <Text>google</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="apple" onPress={() => signInWithApple()}>
        <Text>apple</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="phone"
        onPress={async () => {
          const verification = await startPhoneSignIn('+447700900123');
          await confirmPhone(verification, '123456');
        }}
      >
        <Text>phone</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="logout" onPress={() => logout()}>
        <Text>logout</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="delete" onPress={() => deleteAccount()}>
        <Text>delete</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="grant"
        onPress={async () => {
          await services.entitlements.grantPremium();
          await refreshPremium();
        }}
      >
        <Text>grant</Text>
      </TouchableOpacity>
    </>
  );
}

function renderProbe(auth?: ReturnType<typeof makeFakeAuthGateway>) {
  const services = auth ? makeServices({ auth }) : makeServices();
  return render(
    <AppProvider services={services}>
      <Probe />
    </AppProvider>,
  );
}

describe('useApp', () => {
  it('throws when used outside a provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow('useApp must be used within an AppProvider');
    spy.mockRestore();
  });
});

describe('AppProvider email flow', () => {
  it('signs up, logs out, and logs back in', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));

    fireEvent.press(screen.getByTestId('signup'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('email:a@b.com'));

    fireEvent.press(screen.getByTestId('logout'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));

    fireEvent.press(screen.getByTestId('login'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('email:a@b.com'));
  });

  it('deletes the account and clears the user', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    fireEvent.press(screen.getByTestId('signup'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('email:a@b.com'));
    fireEvent.press(screen.getByTestId('delete'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
  });

  it('refreshes premium state', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('premium')).toHaveTextContent('false'));
    fireEvent.press(screen.getByTestId('grant'));
    await waitFor(() => expect(screen.getByTestId('premium')).toHaveTextContent('true'));
  });
});

describe('AppProvider social and phone flows', () => {
  it('signs in with Google', async () => {
    renderProbe(makeFakeAuthGateway());
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    fireEvent.press(screen.getByTestId('google'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('google:g@x.com'));
  });

  it('signs in with Apple', async () => {
    renderProbe(makeFakeAuthGateway());
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    fireEvent.press(screen.getByTestId('apple'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('apple:a@x.com'));
  });

  it('signs in with phone via a verification code', async () => {
    renderProbe(makeFakeAuthGateway());
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    fireEvent.press(screen.getByTestId('phone'));
    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('phone:+447700900123'),
    );
  });
});

describe('AppProvider lifecycle', () => {
  it('builds default services when none are provided', async () => {
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
  });

  it('ignores async results after unmount', async () => {
    const { unmount } = renderProbe();
    unmount();
    await Promise.resolve();
    await Promise.resolve();
  });
});
