
import React, { useState } from 'react';
import { VocabItem, MasteryLevel } from '../types';
import { ChevronDown, ChevronUp, Clock, Edit2, Trash2, StickyNote, Volume2, Book } from 'lucide-react';

interface WordCardProps {
  item: VocabItem;
  onEdit: (item: VocabItem) => void;
  onDelete: (id: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({ item, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.word}"?`)) {
      onDelete(item.id);
    }
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.dictionaryData?.audioUrl) {
      const audio = new Audio(item.dictionaryData.audioUrl);
      audio.play().catch(err => console.error("Audio playback failed", err));
    }
  };

  const masteryColor = {
    [MasteryLevel.New]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    [MasteryLevel.Learning]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    [MasteryLevel.Mastered]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{item.word}</h3>
            
            {/* Speaker Icon for Dictionary Audio */}
            {item.dictionaryData?.audioUrl && (
              <button 
                onClick={playAudio}
                className="p-1 rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 hover:bg-primary-100 transition-colors"
                title="Play Pronunciation"
              >
                <Volume2 size={16} />
              </button>
            )}

            {/* Phonetic Text */}
            {item.dictionaryData?.phonetic && (
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {item.dictionaryData.phonetic}
              </span>
            )}

            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ml-auto sm:ml-0 ${masteryColor[item.masteryLevel]}`}>
              {item.masteryLevel}
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 font-medium mt-1 line-clamp-1">
            {item.userMeaning}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button 
            onClick={() => onEdit(item)}
            className="p-1.5 text-zinc-400 hover:text-primary-600 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Preview Context (if not expanded) */}
      {!expanded && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 border-l-2 border-zinc-200 dark:border-zinc-700 pl-3 py-1 italic">
          "{item.contextSentence.slice(0, 50)}{item.contextSentence.length > 50 ? '...' : ''}"
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Dictionary Definitions (Fetched Data) */}
          {item.dictionaryData && item.dictionaryData.meanings.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/20">
               <div className="flex items-center gap-2 mb-2">
                 <Book size={12} className="text-blue-500" />
                 <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Dictionary Definitions</p>
               </div>
               {item.dictionaryData.meanings.map((m, idx) => (
                 <div key={idx} className="mb-2 last:mb-0 text-xs">
                   <span className="italic font-medium text-zinc-500 mr-1">({m.partOfSpeech})</span>
                   <span className="text-zinc-800 dark:text-zinc-200">{m.definition}</span>
                   {m.example && <div className="text-zinc-500 italic mt-0.5 pl-2 border-l border-blue-200 dark:border-blue-800">"{m.example}"</div>}
                 </div>
               ))}
            </div>
          )}

          {/* Context Section */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-zinc-400 uppercase mb-1">Common Context</p>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">{item.contextSentence}</p>
          </div>

          {/* Collocations */}
          {item.collocations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase mb-2">Collocations</p>
              <div className="flex flex-wrap gap-2">
                {item.collocations.map((col, idx) => (
                  <span key={idx} className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {item.notes && (
            <div className="flex gap-2 items-start text-zinc-500 dark:text-zinc-400 mt-2">
              <StickyNote size={14} className="mt-0.5 shrink-0" />
              <p className="text-xs italic">{item.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 ml-auto">
             <span className="flex items-center">
               <Clock size={12} className="mr-1" /> 
               Added: {new Date(item.createdAt).toLocaleDateString()}
             </span>
          </div>
        </div>
      )}

      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-primary-500 transition-colors"
      >
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
    </div>
  );
};
