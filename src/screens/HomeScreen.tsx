import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useApp } from '../app/AppContext';
import { pressBtn, pressCard } from '../app/press';
import { styles } from '../app/theme';
import { AdBanner } from '../components/AdBanner';
import { displayIdentity } from '../services/auth/model';
import { MainRoute } from '../navigation/routes';

export interface HomeScreenProps {
  onNavigate(route: MainRoute): void;
}

interface Tile {
  route: MainRoute;
  label: string;
}

const TILES: Tile[] = [
  { route: 'Practice', label: 'Practice questions' },
  { route: 'MockExam', label: 'Take a mock exam' },
  { route: 'Handbook', label: 'Study handbook' },
  { route: 'Settings', label: 'Settings' },
];

/** Landing screen after sign-in. Shows the study options and premium status. */
export function HomeScreen({ onNavigate }: HomeScreenProps): React.JSX.Element {
  const { user, isPremium } = useApp();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Hi, {displayIdentity(user)}</Text>
      <Text style={styles.subtitle} testID="premium-status">
        {isPremium ? 'Premium unlocked — full access' : 'Free plan'}
      </Text>
      {TILES.map((tile) => (
        <Pressable
          key={tile.route}
          testID={`tile-${tile.route}`}
          style={pressCard}
          onPress={() => onNavigate(tile.route)}
        >
          <Text style={styles.prompt}>{tile.label}</Text>
        </Pressable>
      ))}
      {isPremium ? null : (
        <Pressable
          testID="tile-Paywall"
          style={pressBtn}
          onPress={() => onNavigate('Paywall')}
        >
          <Text style={styles.buttonText}>Unlock full access</Text>
        </Pressable>
      )}
      <View />
      <AdBanner />
    </ScrollView>
  );
}
