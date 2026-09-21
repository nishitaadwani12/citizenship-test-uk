import {
  accessibleQuestions,
  categoriesOf,
  isPremiumQuestion,
  questionsInCategory,
  tierCounts,
} from './access';
import { Question } from './types';

const q = (id: string, category: string, tier?: 'free' | 'premium'): Question => ({
  id,
  prompt: id,
  options: ['a', 'b'],
  correctIndices: [0],
  category,
  tier,
});

const all: Question[] = [
  q('1', 'History'),
  q('2', 'History', 'free'),
  q('3', 'Society', 'premium'),
  q('4', 'Society', 'premium'),
];

describe('isPremiumQuestion', () => {
  it('is true only for premium-tier questions', () => {
    expect(isPremiumQuestion(q('x', 'c', 'premium'))).toBe(true);
    expect(isPremiumQuestion(q('x', 'c', 'free'))).toBe(false);
    expect(isPremiumQuestion(q('x', 'c'))).toBe(false);
  });
});

describe('accessibleQuestions', () => {
  it('returns everything for premium users', () => {
    expect(accessibleQuestions(all, true)).toHaveLength(4);
  });

  it('returns only free questions for non-premium users', () => {
    expect(accessibleQuestions(all, false).map((x) => x.id)).toEqual(['1', '2']);
  });
});

describe('categoriesOf', () => {
  it('lists distinct categories in first-seen order', () => {
    expect(categoriesOf(all)).toEqual(['History', 'Society']);
  });
});

describe('questionsInCategory', () => {
  it('filters by category', () => {
    expect(questionsInCategory(all, 'Society').map((x) => x.id)).toEqual(['3', '4']);
  });
});

describe('tierCounts', () => {
  it('counts free and premium questions', () => {
    expect(tierCounts(all)).toEqual({ free: 2, premium: 2 });
  });
});
