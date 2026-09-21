/** A single practice/exam question. Some Life in the UK questions require
 *  selecting more than one correct option, so `correctIndices` is a list. */
export interface Question {
  id: string;
  prompt: string;
  options: string[];
  /** Indices into `options` that are correct. Length > 1 => multi-select. */
  correctIndices: number[];
  category: string;
}

/** A user's recorded answer to a question: the option indices they selected. */
export interface Answer {
  questionId: string;
  selectedIndices: number[];
}

/** The outcome of scoring a completed set of questions. */
export interface ScoreResult {
  correct: number;
  total: number;
  percentage: number;
  passed: boolean;
}
