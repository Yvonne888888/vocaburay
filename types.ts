
export interface VocabItem {
  id: string;
  word: string;
  contextSentence: string; // Auto-filled from Dictionary Example
  userMeaning: string; // Auto-filled from Dictionary Definition
  notes: string; // User remarks/notes
  createdAt: number;
  lastReviewed: number;
  masteryLevel: MasteryLevel;
  dictionaryData?: DictionaryData; // Cached external API data
}

export interface DictionaryData {
  phonetic: string;
  audioUrl: string;
  meanings: {
    partOfSpeech: string;
    definition: string;
    example?: string;
  }[];
}

// AI Search Result Structure
export interface AISearchResult {
  word: string;
  definition: string;
  context: string;
}

export enum MasteryLevel {
  New = 'New',
  Learning = 'Learning',
  Mastered = 'Mastered'
}

export type ViewMode = 'home' | 'library' | 'list' | 'add' | 'edit' | 'review' | 'settings';

export interface FilterState {
  search: string;
  mastery: MasteryLevel | 'All';
}