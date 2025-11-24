
import React, { useState } from 'react';
import { Search, Loader2, Plus, AlertCircle, Key } from 'lucide-react';
import { searchEnglishFromChinese, getApiKey } from '../services/geminiService';
import { AISearchResult, VocabItem, MasteryLevel } from '../types';
import { fetchDictionaryData } from '../services/dictionaryService';

interface SearchToolProps {
  onAddWord: (item: VocabItem) => void;
  onGoToSettings: () => void;
}

export const SearchTool: React.FC<SearchToolProps> = ({ onAddWord, onGoToSettings }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AISearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);

  const hasKey = !!getApiKey();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (!hasKey) {
      setError("MISSING_KEY");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await searchEnglishFromChinese(query);
      setResults(data);
      if (data.length === 0) {
        setError("No results found. Try a different description.");
      }
    } catch (err: any) {
      if (err.message === 'MISSING_KEY') {
        setError("MISSING_KEY");
      } else {
        setError("Failed to connect to AI. Check your network.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch(e as any);
    }
  };

  const handleAdd = async (result: AISearchResult, index: number) => {
    setAddingIndex(index);
    
    // Optionally fetch audio/phonetics from dictionary to enrich the item
    const dictData = await fetchDictionaryData(result.word);

    const newItem: VocabItem = {
      id: crypto.randomUUID(),
      word: result.word,
      userMeaning: result.definition,
      contextSentence: result.context,
      notes: `Searched via AI: "${query}"`,
      dictionaryData: dictData || undefined,
      createdAt: Date.now(),
      lastReviewed: Date.now(),
      masteryLevel: MasteryLevel.New
    };

    onAddWord(newItem);
    setAddingIndex(null);
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600">
          <Key size={32} />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">API Key Required</h2>
        <p className="text-zinc-500">
          To use the AI Translator, you need a free Google Gemini API Key.
        </p>
        <button 
          onClick={onGoToSettings}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
        >
          Enter API Key
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">AI Thesaurus</h2>
        <p className="text-xs text-zinc-400">Describe it in Chinese, get English.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <textarea 
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="请输入你要查询的单词或句子或需求，&#10;比如“如何用英语夸别人好看”"
          rows={3}
          className="w-full pl-4 pr-12 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500/50 outline-none resize-none text-sm leading-relaxed"
        />
        <button 
          type="submit"
          disabled={loading || !query}
          className="absolute right-2 bottom-2 p-2 bg-primary-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </form>

      {error === 'MISSING_KEY' && (
        <div onClick={onGoToSettings} className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2 cursor-pointer">
          <AlertCircle size={16} />
          <span>API Key missing. Tap to configure.</span>
        </div>
      )}

      {error && error !== 'MISSING_KEY' && (
        <div className="text-center text-red-500 text-sm py-4">{error}</div>
      )}

      <div className="space-y-3">
        {results.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-primary-600 dark:text-primary-400">{item.word}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{item.definition}</p>
              </div>
              <button 
                onClick={() => handleAdd(item, idx)}
                disabled={addingIndex !== null}
                className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-primary-100 hover:text-primary-600 rounded-full transition-colors"
              >
                 {addingIndex === idx ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              </button>
            </div>
            <div className="text-xs italic text-zinc-500 border-l-2 border-zinc-200 pl-2 mt-2">
              "{item.context}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
