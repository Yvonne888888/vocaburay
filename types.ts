
export interface VocabItem {
  id: string;
  word: string;
  contextSentence: string; // Contains 2 sentences illustrating common usage
  userMeaning: string; // IPA + Chinese Meaning (User's custom or AI generated)
  collocations: string[];
  notes: string; // User remarks/notes
  createdAt: number;
  lastReviewed: number;
  masteryLevel: MasteryLevel;
  dictionaryData?: DictionaryData; // New field for cached external API data
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

export enum MasteryLevel {
  New = 'New',
  Learning = 'Learning',
  Mastered = 'Mastered'
}

export type ViewMode = 'list' | 'add' | 'edit' | 'review';

export interface FilterState {
  search: string;
  mastery: MasteryLevel | 'All';
}

// AI Response types
export interface AICollocationResponse {
  collocations: string[];
}
