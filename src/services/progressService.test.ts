import { ScoreResult } from '../core/types';
import { ProgressService } from './progressService';
import { createMemoryStore } from './storage';

const pass: ScoreResult = { correct: 20, total: 24, percentage: 83, passed: true };
const fail: ScoreResult = { correct: 10, total: 24, percentage: 42, passed: false };

describe('ProgressService', () => {
  it('starts with empty progress', async () => {
    const service = new ProgressService(createMemoryStore());
    expect(await service.get()).toEqual({
      attempts: 0,
      bestPercentage: 0,
      everPassed: false,
    });
  });

  it('records an attempt and tracks best score and pass state', async () => {
    const service = new ProgressService(createMemoryStore());
    const afterFail = await service.record(fail);
    expect(afterFail).toEqual({ attempts: 1, bestPercentage: 42, everPassed: false });
    const afterPass = await service.record(pass);
    expect(afterPass).toEqual({ attempts: 2, bestPercentage: 83, everPassed: true });
  });

  it('keeps the best score when a later attempt is lower', async () => {
    const service = new ProgressService(createMemoryStore());
    await service.record(pass);
    const after = await service.record(fail);
    expect(after.bestPercentage).toBe(83);
    expect(after.everPassed).toBe(true);
  });

  it('merges stored partial data with defaults', async () => {
    const store = createMemoryStore({ progress: JSON.stringify({ attempts: 5 }) });
    const service = new ProgressService(store);
    expect(await service.get()).toEqual({
      attempts: 5,
      bestPercentage: 0,
      everPassed: false,
    });
  });
});
