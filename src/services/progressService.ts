import { ScoreResult } from '../core/types';
import { KeyValueStore } from './storage';

const PROGRESS_KEY = 'progress';

/** A running record of the user's mock-exam performance. */
export interface Progress {
  attempts: number;
  bestPercentage: number;
  everPassed: boolean;
}

const DEFAULT_PROGRESS: Progress = {
  attempts: 0,
  bestPercentage: 0,
  everPassed: false,
};

/** Persists cumulative practice/exam progress on device. */
export class ProgressService {
  constructor(private readonly store: KeyValueStore) {}

  async get(): Promise<Progress> {
    const raw = await this.store.getItem(PROGRESS_KEY);
    if (!raw) {
      return { ...DEFAULT_PROGRESS };
    }
    return { ...DEFAULT_PROGRESS, ...(JSON.parse(raw) as Partial<Progress>) };
  }

  /** Folds a completed exam result into the stored progress. */
  async record(result: ScoreResult): Promise<Progress> {
    const current = await this.get();
    const updated: Progress = {
      attempts: current.attempts + 1,
      bestPercentage: Math.max(current.bestPercentage, result.percentage),
      everPassed: current.everPassed || result.passed,
    };
    await this.store.setItem(PROGRESS_KEY, JSON.stringify(updated));
    return updated;
  }
}
