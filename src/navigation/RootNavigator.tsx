import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useApp } from '../app/AppContext';
import { colors, styles } from '../app/theme';
import { AuthScreen } from '../screens/AuthScreen';
import { HandbookScreen } from '../screens/HandbookScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MockExamScreen } from '../screens/MockExamScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { PracticeScreen } from '../screens/PracticeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MainRoute } from './routes';

/** Root router: shows the auth screen until a user is signed in, then a simple
 *  stack-free navigator over the main screens. */
export function RootNavigator(): React.JSX.Element {
  const { loading, user } = useApp();
  const [route, setRoute] = useState<MainRoute>('Home');

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  switch (route) {
    case 'Practice':
      return <PracticeScreen onNavigate={setRoute} />;
    case 'MockExam':
      return <MockExamScreen onNavigate={setRoute} />;
    case 'Handbook':
      return <HandbookScreen onNavigate={setRoute} />;
    case 'Paywall':
      return <PaywallScreen onNavigate={setRoute} />;
    case 'Settings':
      return <SettingsScreen onNavigate={setRoute} />;
    default:
      return <HomeScreen onNavigate={setRoute} />;
  }
}
