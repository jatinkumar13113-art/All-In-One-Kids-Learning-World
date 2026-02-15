
export enum CategoryId {
  ALPHABET = 'ALPHABET',
  NUMBERS = 'NUMBERS',
  FRUITS = 'FRUITS',
  VEGETABLES = 'VEGETABLES',
  FARM_ANIMALS = 'FARM_ANIMALS',
  WILD_ANIMALS = 'WILD_ANIMALS',
  BIRDS = 'BIRDS',
  INSECTS = 'INSECTS',
  FLOWERS = 'FLOWERS',
  COLOURS = 'COLOURS',
  SHAPES = 'SHAPES',
  VEHICLES = 'VEHICLES',
  DAYS = 'DAYS',
  MONTHS = 'MONTHS',
  OPPOSITES = 'OPPOSITES',
  RHYMES = 'RHYMES',
  JOBS = 'JOBS',
  MUSICAL_INSTRUMENTS = 'MUSICAL_INSTRUMENTS'
}

export interface LearningItem {
  id: string;
  name: string;
  image: string;
  color: string;
  audioText?: string;
  soundPhonetic?: string; // New property for animal sounds
}

export interface RhymeItem {
  id: string;
  title: string;
  image: string;
  lyrics: string;
  color: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  items: LearningItem[] | RhymeItem[];
}

export type GameState = 'HOME' | 'CATEGORY_SELECT' | 'LEARNING' | 'QUIZ' | 'REWARDS' | 'PARENT_LOCK';

export interface UserProgress {
  stars: number;
  completedCategories: string[];
  level: number;
  language: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' }
];
