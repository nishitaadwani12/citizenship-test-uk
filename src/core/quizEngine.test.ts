import {
  answerCurrent,
  createQuiz,
  currentQuestion,
  finish,
  goTo,
  isComplete,
  next,
  previous,
  result,
} from './quizEngine';
import { Question } from './types';

const questions: Question[] = [
  { id: 'a', prompt: 'A', options: ['x', 'y'], correctIndices: [0], category: 'c' },
  { id: 'b', prompt: 'B', options: ['x', 'y'], correctIndices: [1], category: 'c' },
];

describe('quizEngine', () => {
  it('starts at the first question', () => {
    const state = createQuiz(questions);
    expect(state.currentIndex).toBe(0);
    expect(currentQuestion(state)?.id).toBe('a');
    expect(state.finished).toBe(false);
  });

  it('returns undefined current question for an empty quiz', () => {
    expect(currentQuestion(createQuiz([]))).toBeUndefined();
  });

  it('records an answer for the current question', () => {
    const state = answerCurrent(createQuiz(questions), [0]);
    expect(state.answers).toEqual({ a: [0] });
  });

  it('does not record an answer on an empty quiz', () => {
    const empty = createQuiz([]);
    expect(answerCurrent(empty, [0])).toBe(empty);
  });

  it('does not record an answer once finished', () => {
    const finished = finish(createQuiz(questions));
    expect(answerCurrent(finished, [0])).toBe(finished);
  });

  it('advances and clamps at the last question', () => {
    const s1 = next(createQuiz(questions));
    expect(s1.currentIndex).toBe(1);
    expect(next(s1).currentIndex).toBe(1);
  });

  it('goes back and clamps at the first question', () => {
    const s1 = next(createQuiz(questions));
    expect(previous(s1).currentIndex).toBe(0);
    expect(previous(createQuiz(questions)).currentIndex).toBe(0);
  });

  it('jumps to a valid index and ignores out-of-range jumps', () => {
    const state = createQuiz(questions);
    expect(goTo(state, 1).currentIndex).toBe(1);
    expect(goTo(state, -1)).toBe(state);
    expect(goTo(state, 5)).toBe(state);
  });

  it('reports completeness only when all questions are answered', () => {
    expect(isComplete(createQuiz([]))).toBe(false);
    let state = answerCurrent(createQuiz(questions), [0]);
    expect(isComplete(state)).toBe(false);
    state = answerCurrent(next(state), [1]);
    expect(isComplete(state)).toBe(true);
  });

  it('scores the quiz from recorded answers', () => {
    let state = answerCurrent(createQuiz(questions), [0]);
    state = answerCurrent(next(state), [1]);
    expect(result(state)).toEqual({
      correct: 2,
      total: 2,
      percentage: 100,
      passed: true,
    });
  });
});
