import React, { useState } from 'react';
import { VocabItem, MasteryLevel, DictionaryData } from '../types';
import { fetchDictionaryData } from '../services/dictionaryService';
import { generateWordDetails, getApiKey } from '../services/geminiService';
import { Save, X, Sparkles, Loader2, Volume2 } from 'lucide-react';

interface WordFormProps {
  initialData?: VocabItem | null;
  onSave: (item: VocabItem) => void;
  onCancel: () => void;
}

export const WordForm: React.FC<WordFormProps> = ({ initialData, onSave, onCancel }) => {
  const [word, setWord] = useState(initialData?.word || '');
  const [meaning, setMeaning] = useState(initialData?.userMeaning || '');
  const [context, setContext] = useState(initialData?.contextSentence || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [dictionaryData, setDictionaryData] = useState<DictionaryData | undefined>(initialData?.dictionaryData);
  
  const [loading, setLoading] = useState(false);

  const performLookup = async () => {
    if (!word) return;
    setLoading(true);
    
    // 1. Fetch Basic Dictionary Data (Phonetics/Audio) - Always try this first
    const dictData = await fetchDictionaryData(word);
    if (dictData) {
      setDictionaryData(dictData);
    }

    // 2. Decide Source for Meaning/Context
    const apiKey = getApiKey();
    let aiSuccess = false;
    
    if (apiKey) {
      // Try using AI if Key is available
      try {
        const aiData = await generateWordDetails(word);
        if (aiData) {
          if (!meaning) setMeaning(aiData.definition);
          if (!context) setContext(aiData.context);
          aiSuccess = true;
        }
      } catch (err) {
        console.warn("AI generation failed, falling back to dictionary", err);
        aiSuccess = false;
      }
    } 
    
    // Fallback to Free Dictionary API if AI failed or no key
    if (!aiSuccess && dictData) {
      if (!meaning && dictData.meanings.length > 0) {
        const firstDef = dictData.meanings[0];
        setMeaning(`${firstDef.partOfSpeech}: ${firstDef.definition}`);
      }
      if (!context && dictData.meanings.length > 0) {
        // Find a definition with an example
        let exampleText = '';
        for (const m of dictData.meanings) {
          if (m.example) {
            exampleText = m.example;
            break;
          }
        }
        if (exampleText && !context) {
          setContext(exampleText);
        }
      }
    }
    
    setLoading(false);
  };

  const handleBlurWord = () => {
    if (word && !dictionaryData && !initialData) {
      performLookup();
    }
  };

  const playAudio = () => {
    if (dictionaryData?.audioUrl) {
      const audio = new Audio(dictionaryData.audioUrl);
      audio.play().catch(e => console.error("Audio play error", e));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: VocabItem = {
      id: initialData?.id || crypto.randomUUID(),
      word,
      userMeaning: meaning,
      contextSentence: context,
      notes,
      dictionaryData, 
      createdAt: initialData?.createdAt || Date.now(),
      lastReviewed: initialData?.lastReviewed || Date.now(),
      masteryLevel: initialData?.masteryLevel || MasteryLevel.New,
    };
    onSave(newItem);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {initialData ? 'Edit Word' : 'New Entry'}
        </h2>
        <button onClick={onCancel} className="text-zinc-400 hover:text-zinc-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Word Input */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Word / Phrase</label>
          <div className="relative">
            <input 
              value={word}
              onChange={e => setWord(e.target.value)}
              onBlur={handleBlurWord}
              className="w-full text-lg font-bold p-3 pr-12 bg-zinc-50 dark:bg-zinc-800 rounded-lg border-2 border-transparent focus:border-primary-500 outline-none"
              placeholder="e.g. Serendipity"
              required
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <button
                type="button"
                onClick={performLookup}
                disabled={!word || loading}
                className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-zinc-700 rounded-lg transition-colors group relative"
              >
                 {loading ? <Loader2 size={20} className="animate-spin"/> : <Sparkles size={20} />}
                 
                 {/* Tooltip */}
                 <span className="absolute right-0 -top-8 w-max px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                   Click to auto-generate definition & examples
                 </span>
              </button>
            </div>
          </div>
          
          {/* Dictionary Preview */}
          {(dictionaryData) && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">
                      Dictionary
                    </span>
                    <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                      {dictionaryData.phonetic}
                    </span>
                  </div>
                  {dictionaryData.audioUrl && (
                    <button 
                      type="button" 
                      onClick={playAudio}
                      className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300 hover:bg-blue-200"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Meaning */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Meaning (Definition)</label>
          <input 
            value={meaning}
            onChange={e => setMeaning(e.target.value)}
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="Definition will appear here..."
          />
        </div>

        {/* Context */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Context Sentence</label>
          <textarea 
            value={context}
            onChange={e => setContext(e.target.value)}
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 min-h-[80px]"
            placeholder="Example sentence..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Notes / Origin</label>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 min-h-[60px]"
            placeholder="e.g. Heard on 'The Daily' podcast..."
          />
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
        >
          <Save className="inline mr-2" size={20} />
          Save Word
        </button>
      </form>
    </div>
  );
};