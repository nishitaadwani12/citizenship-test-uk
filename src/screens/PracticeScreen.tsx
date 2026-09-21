import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../app/AppContext';
import { styles } from '../app/theme';
import { QuizRunner } from '../components/QuizRunner';
import { ResultsView } from '../components/ResultsView';
import { accessibleQuestions } from '../core/access';
import { UK_QUESTIONS } from '../core/questionBank';
import { ScoreResult } from '../core/types';
import { MainRoute } from '../navigation/routes';

export interface PracticeScreenProps {
  onNavigate(route: MainRoute): void;
}

/** Practice mode with immediate feedback. Free users practise the free-tier
 *  questions; premium unlocks the full bank. */
export function PracticeScreen({ onNavigate }: PracticeScreenProps): React.JSX.Element {
  const { isPremium } = useApp();
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [runKey, setRunKey] = useState(0);

  const questions = useMemo(() => accessibleQuestions(UK_QUESTIONS, isPremium), [isPremium]);

  if (result) {
    return (
      <ResultsView
        result={result}
        onRetry={() => {
          setResult(null);
          setRunKey((k) => k + 1);
        }}
        onHome={() => onNavigate('Home')}
      />
    );
  }

  return (
    <View style={styles.screen}>
      {isPremium ? null : (
        <TouchableOpacity testID="practice-upsell" onPress={() => onNavigate('Paywall')}>
          <Text style={styles.label}>
            Free plan: {questions.length} questions. Go Premium to unlock them all →
          </Text>
        </TouchableOpacity>
      )}
      <QuizRunner key={runKey} questions={questions} mode="practice" onFinish={setResult} />
    </View>
  );
}
