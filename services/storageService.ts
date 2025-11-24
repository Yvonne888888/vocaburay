
import { VocabItem, MasteryLevel } from '../types';

const STORAGE_KEY = 'vocabflow_data_v1';

export const getItems = (): VocabItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load items", error);
    return [];
  }
};

export const saveItem = (item: VocabItem): void => {
  const items = getItems();
  const index = items.findIndex((i) => i.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const deleteItem = (id: string): void => {
  const items = getItems().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const updateMastery = (id: string, level: MasteryLevel): void => {
  const items = getItems();
  const item = items.find(i => i.id === id);
  if (item) {
    item.masteryLevel = level;
    item.lastReviewed = Date.now();
    saveItem(item);
  }
};

/**
 * Ebbinghaus Review Logic
 * Calculates which items are due for review based on time elapsed since last review.
 */
export const getDueItems = (): VocabItem[] => {
  const items = getItems();
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  return items.filter(item => {
    const timeSinceLastReview = now - item.lastReviewed;
    
    // Ebbinghaus Intervals (Simplified)
    switch (item.masteryLevel) {
      case MasteryLevel.New:
        // Review after 1 day (or immediately if just created and never reviewed properly)
        return timeSinceLastReview > ONE_DAY;
      
      case MasteryLevel.Learning:
        // Review after 3 days
        return timeSinceLastReview > (3 * ONE_DAY);
      
      case MasteryLevel.Mastered:
        // Review after 7 days
        return timeSinceLastReview > (7 * ONE_DAY);
        
      default:
        return true;
    }
  });
};
