import { Answer, Question, ScoreResult } from './types';

/** The official Life in the UK test pass mark is 75% (18 of 24). */
export const PASS_PERCENTAGE = 75;

/** Compares two index lists as unordered sets. */
function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const sorted = [...a].sort((x, y) => x - y);
  const other = [...b].sort((x, y) => x - y);
  return sorted.every((value, i) => value === other[i]);
}

/** True when the selected options exactly match the question's correct set. */
export function isAnswerCorrect(question: Question, selectedIndices: number[]): boolean {
  return sameSet(question.correctIndices, selectedIndices);
}

/** Whether a given correct/total ratio meets the 75% pass mark. */
export function hasPassed(correct: number, total: number): boolean {
  if (total === 0) {
    return false;
  }
  return (correct / total) * 100 >= PASS_PERCENTAGE;
}

/** Scores a set of questions against the answers the user gave. Missing or
 *  wrong answers count as incorrect. */
export function computeScore(questions: Question[], answers: Answer[]): ScoreResult {
  const byId = new Map(answers.map((a) => [a.questionId, a.selectedIndices]));
  let correct = 0;
  for (const question of questions) {
    const selected = byId.get(question.id) ?? [];
    if (isAnswerCorrect(question, selected)) {
      correct += 1;
    }
  }
  const total = questions.length;
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, percentage, passed: hasPassed(correct, total) };
}
