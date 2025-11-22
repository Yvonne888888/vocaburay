export interface VocabItem {
  id: string;
  word: string;
  contextSentence: string; // Contains 2 sentences illustrating common usage
  userMeaning: string; // IPA + Chinese Meaning
  collocations: string[];
  notes: string; // User remarks/notes
  createdAt: number;
  lastReviewed: number;
  masteryLevel: MasteryLevel;
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