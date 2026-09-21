import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../app/AppContext';
import { styles } from '../app/theme';
import { QuizRunner } from '../components/QuizRunner';
import { ResultsView } from '../components/ResultsView';
import { generateMockExam, MOCK_EXAM_SIZE } from '../core/mockExam';
import { UK_QUESTIONS } from '../core/questionBank';
import { ScoreResult } from '../core/types';
import { MainRoute } from '../navigation/routes';

/** Free users get a short taster exam; premium unlocks the full 24-question exam. */
export const FREE_EXAM_SIZE = 5;

export interface MockExamScreenProps {
  onNavigate(route: MainRoute): void;
}

/** Timed-format mock exam. Records the result into progress on completion. */
export function MockExamScreen({ onNavigate }: MockExamScreenProps): React.JSX.Element {
  const { isPremium, services } = useApp();
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [runKey, setRunKey] = useState(0);

  const size = isPremium ? MOCK_EXAM_SIZE : FREE_EXAM_SIZE;
  const questions = useMemo(
    () => generateMockExam(UK_QUESTIONS, size),
    // Regenerate whenever a new run starts or access level changes.
    [size, runKey],
  );

  async function handleFinish(r: ScoreResult): Promise<void> {
    await services.progress.record(r);
    setResult(r);
  }

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
        <TouchableOpacity testID="exam-upsell" onPress={() => onNavigate('Paywall')}>
          <Text style={styles.label}>
            Free taster: {FREE_EXAM_SIZE} questions. Unlock the full {MOCK_EXAM_SIZE}-question exam →
          </Text>
        </TouchableOpacity>
      )}
      <QuizRunner key={runKey} questions={questions} mode="exam" onFinish={handleFinish} />
    </View>
  );
}
