import { UK_QUESTIONS } from './questionBank';

describe('UK_QUESTIONS', () => {
  it('has enough questions to build a full mock exam', () => {
    expect(UK_QUESTIONS.length).toBeGreaterThanOrEqual(24);
  });

  it('has unique ids', () => {
    const ids = UK_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has valid, in-range correct indices and at least two options each', () => {
    for (const q of UK_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctIndices.length).toBeGreaterThanOrEqual(1);
      for (const idx of q.correctIndices) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(q.options.length);
      }
    }
  });

  it('has a non-empty prompt and category for every question', () => {
    for (const q of UK_QUESTIONS) {
      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.category.length).toBeGreaterThan(0);
    }
  });
});
