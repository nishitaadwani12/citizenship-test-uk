import { Question } from './types';

/** True when a question requires a premium subscription. */
export function isPremiumQuestion(question: Question): boolean {
  return question.tier === 'premium';
}

/** The questions a user may study: everything for premium, only free-tier
 *  questions otherwise. */
export function accessibleQuestions(all: Question[], isPremium: boolean): Question[] {
  if (isPremium) {
    return all;
  }
  return all.filter((q) => !isPremiumQuestion(q));
}

/** The distinct categories present in a set of questions, in first-seen order. */
export function categoriesOf(questions: Question[]): string[] {
  const seen: string[] = [];
  for (const q of questions) {
    if (!seen.includes(q.category)) {
      seen.push(q.category);
    }
  }
  return seen;
}

/** The questions belonging to a given category. */
export function questionsInCategory(questions: Question[], category: string): Question[] {
  return questions.filter((q) => q.category === category);
}

/** How many free vs premium questions exist, for display on the paywall. */
export function tierCounts(all: Question[]): { free: number; premium: number } {
  let premium = 0;
  for (const q of all) {
    if (isPremiumQuestion(q)) {
      premium += 1;
    }
  }
  return { free: all.length - premium, premium };
}
