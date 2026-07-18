export type Language = 'english' | 'german' | 'russian' | 'french' | 'japanese';

export const LANGUAGE_NAMES: Record<Language, string> = {
  english: '英语', german: '德语', russian: '俄语', french: '法语', japanese: '日语',
};
export const LANGUAGE_FLAGS: Record<Language, string> = {
  english: '🇬🇧', german: '🇩🇪', russian: '🇷🇺', french: '🇫🇷', japanese: '🇯🇵',
};

export const MAX_HEARTS = 5;
export const REGEN_INTERVAL_MS = 5 * 60 * 1000;

export interface Question {
  id: string; type: 'translation' | 'multiple-choice' | 'fill-blank';
  question: string; options: string[]; answer: string; hint: string; word: string;
}
export interface Level {
  id: number; language: Language; isHard: boolean; questionCount: number; reward: number; timeLimit: number;
}
export interface UserData {
  email: string; password: string; nickname: string; avatar: string;
  hearts: number; points: number; lastHeartRegen: number;
  progress: Record<Language, number>;
}
export interface PhoneticEntry {
  char: string; ipa: string; example: string; sound: string;
}