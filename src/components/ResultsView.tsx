import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { pressBtn, pressFade } from '../app/press';
import { colors, styles } from '../app/theme';
import { ScoreResult } from '../core/types';

export interface ResultsViewProps {
  result: ScoreResult;
  onRetry(): void;
  onHome(): void;
}

/** Shows the outcome of a completed practice run or mock exam. */
export function ResultsView({ result, onRetry, onHome }: ResultsViewProps): React.JSX.Element {
  return (
    <View style={[styles.screen, { justifyContent: 'center' }]}>
      <View style={styles.card}>
        <Text
          style={[styles.title, { color: result.passed ? colors.correct : colors.wrong }]}
          testID="results-verdict"
        >
          {result.passed ? 'You passed! 🎉' : 'Not quite yet'}
        </Text>
        <Text style={styles.subtitle} testID="results-score">
          You scored {result.correct} out of {result.total} ({result.percentage}%)
        </Text>
        <Pressable style={pressBtn} testID="retry-button" onPress={onRetry}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
        <Pressable testID="home-button" style={pressFade} onPress={onHome}>
          <Text style={styles.secondaryText}>Back to home</Text>
        </Pressable>
      </View>
    </View>
  );
}
