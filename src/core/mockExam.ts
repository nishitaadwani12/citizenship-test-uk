import { Question } from './types';

/** Real Life in the UK test: 24 questions, 45 minutes, pass at 18 correct. */
export const MOCK_EXAM_SIZE = 24;
export const MOCK_EXAM_PASS_MARK = 18;
export const MOCK_EXAM_DURATION_SECONDS = 45 * 60;

/** A random-number source in [0, 1). Injected so exams are deterministic in tests. */
export type Rng = () => number;

/** Returns a new array with `bank` shuffled using a Fisher–Yates shuffle. */
export function shuffle<T>(bank: T[], rng: Rng = Math.random): T[] {
  const result = [...bank];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Builds a mock exam by sampling up to `size` unique questions from the bank. */
export function generateMockExam(
  bank: Question[],
  size: number = MOCK_EXAM_SIZE,
  rng: Rng = Math.random,
): Question[] {
  return shuffle(bank, rng).slice(0, size);
}
