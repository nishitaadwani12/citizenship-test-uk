import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { pressAdvanceBtn, pressBtn, pressOption } from '../app/press';
import { styles } from '../app/theme';
import {
  answerCurrent,
  createQuiz,
  currentQuestion,
  finish,
  next,
  result,
} from '../core/quizEngine';
import { ScoreResult } from '../core/types';

export type QuizMode = 'practice' | 'exam';

export interface QuizRunnerProps {
  questions: import('../core/types').Question[];
  mode: QuizMode;
  onFinish(result: ScoreResult): void;
}

/** Runs a user through a list of questions. In practice mode the answer can be
 *  checked (revealing correctness) before advancing; in exam mode answers are
 *  recorded without feedback until the end. */
export function QuizRunner({ questions, mode, onFinish }: QuizRunnerProps): React.JSX.Element {
  const [quiz, setQuiz] = useState(() => createQuiz(questions));
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const question = currentQuestion(quiz);
  const isMulti = !!question && question.correctIndices.length > 1;
  const isLast = quiz.currentIndex === quiz.questions.length - 1;
  const canCheck = mode === 'practice' && !checked && selected.length > 0;
  const canAdvance = selected.length > 0 && !(mode === 'practice' && !checked);

  if (!question) {
    return (
      <View style={styles.screen} testID="quiz-empty">
        <Text style={styles.subtitle}>No questions available.</Text>
      </View>
    );
  }

  function toggleOption(index: number): void {
    if (checked) {
      return;
    }
    if (isMulti) {
      setSelected((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
      );
    } else {
      setSelected([index]);
    }
  }

  function optionStyle(index: number) {
    if (checked && question) {
      if (question.correctIndices.includes(index)) {
        return [styles.option, styles.optionCorrect];
      }
      if (selected.includes(index)) {
        return [styles.option, styles.optionWrong];
      }
      return [styles.option];
    }
    if (selected.includes(index)) {
      return [styles.option, styles.optionSelected];
    }
    return [styles.option];
  }

  function advance(): void {
    const committed = answerCurrent(quiz, selected);
    if (isLast) {
      onFinish(result(finish(committed)));
      return;
    }
    setQuiz(next(committed));
    setSelected([]);
    setChecked(false);
  }

  return (
    <ScrollView style={styles.screen} testID="quiz-runner">
      <Text style={styles.label}>
        Question {quiz.currentIndex + 1} of {quiz.questions.length}
      </Text>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {isMulti ? <Text style={styles.label}>Select all that apply</Text> : null}
      {question.options.map((option, index) => (
        <Pressable
          key={option}
          testID={`option-${index}`}
          style={pressOption(optionStyle(index), checked)}
          onPress={() => toggleOption(index)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </Pressable>
      ))}
      {canCheck ? (
        <Pressable style={pressBtn} testID="check-button" onPress={() => setChecked(true)}>
          <Text style={styles.buttonText}>Check answer</Text>
        </Pressable>
      ) : null}
      <Pressable
        style={pressAdvanceBtn(canAdvance)}
        testID="advance-button"
        disabled={!canAdvance}
        onPress={advance}
      >
        <Text style={styles.buttonText}>{isLast ? 'Finish' : 'Next'}</Text>
      </Pressable>
    </ScrollView>
  );
}
