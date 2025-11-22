import React, { useState } from 'react';
import { VocabItem, MasteryLevel } from '../types';
import { ChevronDown, ChevronUp, Clock, Edit2, Trash2, StickyNote } from 'lucide-react';

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

  const masteryColor = {
    [MasteryLevel.New]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    [MasteryLevel.Learning]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    [MasteryLevel.Mastered]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  // Helper to style IPA specifically if present
  const renderMeaning = (text: string) => {
    if (text.includes('/')) {
      const parts = text.split(/(\/.*?\/)/);
      return (
        <>
          {parts.map((part, i) => 
            part.startsWith('/') && part.endsWith('/') ? (
              <span key={i} className="font-mono text-zinc-400 dark:text-zinc-500 mr-2 text-xs">{part}</span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </>
      );
    }
    return text;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{item.word}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${masteryColor[item.masteryLevel]}`}>
              {item.masteryLevel}
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 font-medium mt-0.5 line-clamp-1">
            {renderMeaning(item.userMeaning)}
          </p>
        </div>
        <div className="flex items-center gap-1">
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