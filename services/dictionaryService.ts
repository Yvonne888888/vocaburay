
import { DictionaryData } from '../types';

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

interface APIResponse {
  phonetic?: string;
  phonetics: {
    text?: string;
    audio?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

export const fetchDictionaryData = async (word: string): Promise<DictionaryData | null> => {
  try {
    const response = await fetch(`${API_BASE}${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Network response was not ok');
    }

    const data: APIResponse[] = await response.json();
    const entry = data[0];

    // Extract audio (find first entry with audio)
    const audioEntry = entry.phonetics.find(p => p.audio && p.audio.length > 0);
    let audioUrl = audioEntry?.audio || '';
    
    // Fix missing protocol in some API responses
    if (audioUrl && audioUrl.startsWith('//')) {
      audioUrl = 'https:' + audioUrl;
    }

    // Extract phonetic text
    const phonetic = entry.phonetic || entry.phonetics.find(p => p.text)?.text || '';

    // Extract up to 3 meanings/definitions
    const meanings = entry.meanings.slice(0, 3).map(m => ({
      partOfSpeech: m.partOfSpeech,
      definition: m.definitions[0]?.definition || '',
      example: m.definitions[0]?.example
    }));

    return {
      phonetic,
      audioUrl,
      meanings
    };

  } catch (error) {
    console.error("Dictionary Fetch Error:", error);
    return null;
  }
};
