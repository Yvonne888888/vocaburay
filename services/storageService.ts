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
