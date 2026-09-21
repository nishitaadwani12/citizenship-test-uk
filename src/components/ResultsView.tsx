import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../app/theme';
import { ScoreResult } from '../core/types';

export interface ResultsViewProps {
  result: ScoreResult;
  onRetry(): void;
  onHome(): void;
}

/** Shows the outcome of a completed practice run or mock exam. */
export function ResultsView({ result, onRetry, onHome }: ResultsViewProps): React.JSX.Element {
  return (
    <View style={styles.screen}>
      <Text style={styles.title} testID="results-verdict">
        {result.passed ? 'You passed! 🎉' : 'Not quite yet'}
      </Text>
      <Text style={styles.subtitle} testID="results-score">
        You scored {result.correct} out of {result.total} ({result.percentage}%)
      </Text>
      <TouchableOpacity style={styles.button} testID="retry-button" onPress={onRetry}>
        <Text style={styles.buttonText}>Try again</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="home-button" onPress={onHome}>
        <Text style={styles.secondaryText}>Back to home</Text>
      </TouchableOpacity>
    </View>
  );
}
