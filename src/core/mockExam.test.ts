import {
  generateMockExam,
  MOCK_EXAM_DURATION_SECONDS,
  MOCK_EXAM_PASS_MARK,
  MOCK_EXAM_SIZE,
  shuffle,
} from './mockExam';
import { Question } from './types';

function makeBank(n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i}`,
    prompt: `Q${i}`,
    options: ['a', 'b'],
    correctIndices: [0],
    category: 'x',
  }));
}

describe('constants', () => {
  it('match the official test format', () => {
    expect(MOCK_EXAM_SIZE).toBe(24);
    expect(MOCK_EXAM_PASS_MARK).toBe(18);
    expect(MOCK_EXAM_DURATION_SECONDS).toBe(2700);
  });
});

describe('shuffle', () => {
  it('does not mutate the input', () => {
    const bank = makeBank(3);
    const copy = [...bank];
    shuffle(bank, () => 0);
    expect(bank).toEqual(copy);
  });

  it('reorders deterministically for a fixed rng', () => {
    const bank = makeBank(3);
    // rng always 0 => each swap picks index 0
    const result = shuffle(bank, () => 0);
    expect(result.map((q) => q.id)).toEqual(['q1', 'q2', 'q0']);
  });

  it('uses Math.random by default without throwing', () => {
    expect(shuffle(makeBank(3))).toHaveLength(3);
  });
});

describe('generateMockExam', () => {
  it('returns the requested number of unique questions', () => {
    const exam = generateMockExam(makeBank(50), 24, () => 0.5);
    expect(exam).toHaveLength(24);
    expect(new Set(exam.map((q) => q.id)).size).toBe(24);
  });

  it('caps at the bank size when the bank is smaller than the exam', () => {
    const exam = generateMockExam(makeBank(10), 24, () => 0.5);
    expect(exam).toHaveLength(10);
  });

  it('defaults to the standard size and Math.random', () => {
    const exam = generateMockExam(makeBank(30));
    expect(exam).toHaveLength(MOCK_EXAM_SIZE);
  });
});
