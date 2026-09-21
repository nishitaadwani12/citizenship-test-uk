import { computeScore } from './scoring';
import { Answer, Question, ScoreResult } from './types';

/** Immutable snapshot of a quiz in progress. */
export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number[]>;
  finished: boolean;
}

/** Creates a fresh quiz session over the given questions. */
export function createQuiz(questions: Question[]): QuizState {
  return { questions, currentIndex: 0, answers: {}, finished: false };
}

/** Returns the question the user is currently on, or undefined if empty. */
export function currentQuestion(state: QuizState): Question | undefined {
  return state.questions[state.currentIndex];
}

/** Records the selected option indices for the current question. */
export function answerCurrent(state: QuizState, selectedIndices: number[]): QuizState {
  const question = currentQuestion(state);
  if (!question || state.finished) {
    return state;
  }
  return {
    ...state,
    answers: { ...state.answers, [question.id]: [...selectedIndices] },
  };
}

/** Advances to the next question, clamped to the last question. */
export function next(state: QuizState): QuizState {
  const lastIndex = state.questions.length - 1;
  if (state.currentIndex >= lastIndex) {
    return state;
  }
  return { ...state, currentIndex: state.currentIndex + 1 };
}

/** Moves back to the previous question, clamped to the first. */
export function previous(state: QuizState): QuizState {
  if (state.currentIndex <= 0) {
    return state;
  }
  return { ...state, currentIndex: state.currentIndex - 1 };
}

/** Jumps to a specific question index if it is in range. */
export function goTo(state: QuizState, index: number): QuizState {
  if (index < 0 || index >= state.questions.length) {
    return state;
  }
  return { ...state, currentIndex: index };
}

/** True when every question has a recorded answer. */
export function isComplete(state: QuizState): boolean {
  return (
    state.questions.length > 0 &&
    state.questions.every((q) => state.answers[q.id] !== undefined)
  );
}

/** Marks the quiz finished so no further answers are accepted. */
export function finish(state: QuizState): QuizState {
  return { ...state, finished: true };
}

/** Scores the quiz in its current state. */
export function result(state: QuizState): ScoreResult {
  const answers: Answer[] = Object.entries(state.answers).map(
    ([questionId, selectedIndices]) => ({ questionId, selectedIndices }),
  );
  return computeScore(state.questions, answers);
}
