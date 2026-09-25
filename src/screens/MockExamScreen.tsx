import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useApp } from '../app/AppContext';
import { pressUpsell } from '../app/press';
import { styles } from '../app/theme';
import { QuizRunner } from '../components/QuizRunner';
import { ResultsView } from '../components/ResultsView';
import { accessibleQuestions } from '../core/access';
import { maybeShowInterstitial } from '../services/ads/interstitialAds';
import { generateMockExam, MOCK_EXAM_SIZE } from '../core/mockExam';
import { UK_QUESTIONS } from '../core/questionBank';
import { ScoreResult } from '../core/types';
import { MainRoute } from '../navigation/routes';

export interface MockExamScreenProps {
  onNavigate(route: MainRoute): void;
}

/** Official-format mock exam (24 questions). Free users are examined on the
 *  free-tier pool; premium draws from the full bank. Records the result. */
export function MockExamScreen({ onNavigate }: MockExamScreenProps): React.JSX.Element {
  const { isPremium, services } = useApp();
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [runKey, setRunKey] = useState(0);

  const questions = useMemo(() => {
    const pool = accessibleQuestions(UK_QUESTIONS, isPremium);
    return generateMockExam(pool, MOCK_EXAM_SIZE);
    // Regenerate whenever a new run starts or access level changes.
  }, [isPremium, runKey]);

  async function handleFinish(r: ScoreResult): Promise<void> {
    await services.progress.record(r);
    maybeShowInterstitial(isPremium);
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
        <Pressable
          testID="exam-upsell"
          style={pressUpsell}
          onPress={() => onNavigate('Paywall')}
        >
          <Text style={styles.upsellText}>
            Go Premium for more questions across all categories →
          </Text>
        </Pressable>
      )}
      <QuizRunner key={runKey} questions={questions} mode="exam" onFinish={handleFinish} />
    </View>
  );
}
