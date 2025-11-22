import React, { useState } from 'react';
import { VocabItem, MasteryLevel } from '../types';
import { generateCollocations, generateContext, generateMeaning } from '../services/geminiService';
import { Save, X, Wand2, Loader2, PlusCircle, Sparkles } from 'lucide-react';

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
  const [collocations, setCollocations] = useState<string[]>(initialData?.collocations || []);
  
  // AI States
  const [loadingCollocations, setLoadingCollocations] = useState(false);
  const [loadingAutoFill, setLoadingAutoFill] = useState(false);

  const handleAutoFill = async () => {
    if (!word) return;
    setLoadingAutoFill(true);

    // Parallel requests for speed
    const [newContext, newMeaning] = await Promise.all([
      !context ? generateContext(word) : Promise.resolve(''),
      !meaning ? generateMeaning(word) : Promise.resolve('')
    ]);

    if (newContext) setContext(newContext);
    if (newMeaning) setMeaning(newMeaning);
    
    setLoadingAutoFill(false);
  };

  const handleBlurWord = () => {
    // Auto-trigger if word exists but meaning/context are empty
    if (word && (!meaning || !context) && !initialData) {
      handleAutoFill();
    }
  };

  const handleAISuggestCollocations = async () => {
    if (!word) return;
    setLoadingCollocations(true);
    const results = await generateCollocations(word);
    setCollocations([...collocations, ...results]);
    setLoadingCollocations(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: VocabItem = {
      id: initialData?.id || crypto.randomUUID(),
      word,
      userMeaning: meaning,
      contextSentence: context,
      collocations,
      notes,
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
        
        {/* Word & Meaning */}
        <div className="space-y-4">
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
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={!word || loadingAutoFill}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                title="Auto-generate Meaning & Context"
              >
                 {loadingAutoFill ? <Loader2 size={20} className="animate-spin"/> : <Sparkles size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Meaning (IPA & Chinese)</label>
            <input 
              value={meaning}
              onChange={e => setMeaning(e.target.value)}
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="e.g. /wɜːd/ 词; 话语"
            />
          </div>
        </div>

        {/* Context */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase">Context Sentences (2)</label>
            <button 
              type="button" 
              onClick={handleAutoFill} 
              className="text-[10px] text-primary-600 hover:underline flex items-center gap-1"
            >
              <Wand2 size={10} /> Regenerate
            </button>
          </div>
          <textarea 
            value={context}
            onChange={e => setContext(e.target.value)}
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 min-h-[80px]"
            placeholder="Example sentences showing common usage..."
          />
        </div>

        {/* Collocations */}
        <div>
           <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase">Collocations</label>
            <button 
              type="button"
              onClick={handleAISuggestCollocations}
              disabled={!word || loadingCollocations}
              className="text-xs text-purple-600 flex items-center hover:underline disabled:opacity-50"
            >
              {loadingCollocations ? <Loader2 size={12} className="animate-spin mr-1"/> : <PlusCircle size={12} className="mr-1"/>}
              AI Suggest
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {collocations.map((col, i) => (
              <span key={i} className="inline-flex items-center text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                {col}
                <button 
                  type="button"
                  onClick={() => setCollocations(collocations.filter((_, idx) => idx !== i))}
                  className="ml-2 text-zinc-400 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
            {collocations.length === 0 && <span className="text-xs text-zinc-400 italic">No collocations added yet.</span>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Notes / Origin</label>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 min-h-[60px]"
            placeholder="e.g. Heard on 'The Daily' podcast, or read in a BBC article about travel..."
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