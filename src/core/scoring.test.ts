import {
  computeScore,
  hasPassed,
  isAnswerCorrect,
  PASS_PERCENTAGE,
} from './scoring';
import { Question } from './types';

const single: Question = {
  id: 'q1',
  prompt: 'Single',
  options: ['a', 'b', 'c'],
  correctIndices: [1],
  category: 'x',
};

const multi: Question = {
  id: 'q2',
  prompt: 'Multi',
  options: ['a', 'b', 'c', 'd'],
  correctIndices: [0, 2],
  category: 'x',
};

describe('isAnswerCorrect', () => {
  it('accepts the exact single answer', () => {
    expect(isAnswerCorrect(single, [1])).toBe(true);
  });

  it('rejects a wrong single answer', () => {
    expect(isAnswerCorrect(single, [0])).toBe(false);
  });

  it('accepts a multi-answer regardless of order', () => {
    expect(isAnswerCorrect(multi, [2, 0])).toBe(true);
  });

  it('rejects a multi-answer with the wrong count', () => {
    expect(isAnswerCorrect(multi, [0])).toBe(false);
  });

  it('rejects a multi-answer with a wrong member', () => {
    expect(isAnswerCorrect(multi, [0, 3])).toBe(false);
  });
});

describe('hasPassed', () => {
  it('passes at exactly the pass mark', () => {
    expect(hasPassed(18, 24)).toBe(true);
  });

  it('fails below the pass mark', () => {
    expect(hasPassed(17, 24)).toBe(false);
  });

  it('fails when there are no questions', () => {
    expect(hasPassed(0, 0)).toBe(false);
  });

  it('exposes the 75% pass constant', () => {
    expect(PASS_PERCENTAGE).toBe(75);
  });
});

describe('computeScore', () => {
  it('scores a mix of correct, wrong and unanswered questions', () => {
    const result = computeScore(
      [single, multi],
      [
        { questionId: 'q1', selectedIndices: [1] },
        { questionId: 'q2', selectedIndices: [0] },
      ],
    );
    expect(result).toEqual({ correct: 1, total: 2, percentage: 50, passed: false });
  });

  it('treats a missing answer as incorrect', () => {
    const result = computeScore([single], []);
    expect(result).toEqual({ correct: 0, total: 1, percentage: 0, passed: false });
  });

  it('returns zeroed result for an empty question set', () => {
    expect(computeScore([], [])).toEqual({
      correct: 0,
      total: 0,
      percentage: 0,
      passed: false,
    });
  });

  it('marks a fully correct exam as passed', () => {
    const result = computeScore(
      [single, multi],
      [
        { questionId: 'q1', selectedIndices: [1] },
        { questionId: 'q2', selectedIndices: [0, 2] },
      ],
    );
    expect(result).toEqual({ correct: 2, total: 2, percentage: 100, passed: true });
  });
});
