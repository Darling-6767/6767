import type { Language, Question } from '../../types';
import { getEnglishQuestions } from './english';
import { getGermanQuestions } from './german';
import { getRussianQuestions } from './russian';
import { getFrenchQuestions } from './french';
import { getJapaneseQuestions } from './japanese';
const fetchers: Record<Language, () => Question[]> = {
  english: getEnglishQuestions, german: getGermanQuestions, russian: getRussianQuestions,
  french: getFrenchQuestions, japanese: getJapaneseQuestions,
};
export function getQuestions(language: Language, count: number): Question[] {
  const all = fetchers[language](); return all.slice(0, Math.min(count, all.length));
}
export function getQuestionCount(language: Language): number { return fetchers[language]().length; }
