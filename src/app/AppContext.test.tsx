import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { makeServices } from '../testkit';
import { AppProvider, useApp } from './AppContext';

function Probe(): React.JSX.Element {
  const { loading, user, isPremium, signUp, login, logout, refreshPremium, services } = useApp();
  return (
    <>
      <Text testID="loading">{String(loading)}</Text>
      <Text testID="user">{user?.email ?? 'none'}</Text>
      <Text testID="premium">{String(isPremium)}</Text>
      <TouchableOpacity testID="signup" onPress={() => signUp('a@b.com', 'secret1')}>
        <Text>signup</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="login" onPress={() => login('a@b.com', 'secret1')}>
        <Text>login</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="logout" onPress={() => logout()}>
        <Text>logout</Text>
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

describe('useApp', () => {
  it('throws when used outside a provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow('useApp must be used within an AppProvider');
    spy.mockRestore();
  });
});

describe('AppProvider', () => {
  it('finishes loading with no user by default', async () => {
    render(
      <AppProvider services={makeServices()}>
        <Probe />
      </AppProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('premium')).toHaveTextContent('false');
  });

  it('signs up, logs out, and logs back in', async () => {
    render(
      <AppProvider services={makeServices()}>
        <Probe />
      </AppProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    fireEvent.press(screen.getByTestId('signup'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('a@b.com'));

    fireEvent.press(screen.getByTestId('logout'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));

    fireEvent.press(screen.getByTestId('login'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('a@b.com'));
  });

  it('refreshes premium state', async () => {
    render(
      <AppProvider services={makeServices()}>
        <Probe />
      </AppProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    fireEvent.press(screen.getByTestId('grant'));
    await waitFor(() => expect(screen.getByTestId('premium')).toHaveTextContent('true'));
  });

  it('builds default services when none are provided', async () => {
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('ignores async results after unmount', async () => {
    const { unmount } = render(
      <AppProvider services={makeServices()}>
        <Probe />
      </AppProvider>,
    );
    unmount();
    // Allow the pending load promise to settle against the inactive flag.
    await Promise.resolve();
    await Promise.resolve();
  });
});
