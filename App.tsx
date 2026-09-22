import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AppProvider } from './src/app/AppContext';
import { colors } from './src/app/theme';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initAds } from './src/services/ads/initAds';

export default function App(): React.JSX.Element {
  useEffect(() => {
    initAds();
  }, []);

  return (
    <AppProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
