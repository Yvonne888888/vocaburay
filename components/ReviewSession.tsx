import React, { useState, useMemo } from 'react';
import { VocabItem, MasteryLevel } from '../types';
import { updateMastery } from '../services/storageService';
import { RefreshCw, Eye, EyeOff, Check, X as XIcon, ArrowRight } from 'lucide-react';

interface ReviewSessionProps {
  items: VocabItem[];
  onFinish: () => void;
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({ items, onFinish }) => {
  const [mode, setMode] = useState<'menu' | 'daily3' | 'flashcard'>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Filter logic
  const dueItems = useMemo(() => {
    return items.filter(i => i.masteryLevel !== MasteryLevel.Mastered)
                .sort((a, b) => a.lastReviewed - b.lastReviewed);
  }, [items]);

  const daily3Items = useMemo(() => {
    // Random 3 from dueItems
    const shuffled = [...dueItems].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [dueItems]);

  const activeSet = mode === 'daily3' ? daily3Items : dueItems;
  const currentItem = activeSet[currentIndex];

  const handleNext = (success: boolean) => {
    // Logic to update mastery
    if (currentItem) {
      if (success) {
        const nextLevel = currentItem.masteryLevel === MasteryLevel.New 
          ? MasteryLevel.Learning 
          : MasteryLevel.Mastered;
        updateMastery(currentItem.id, nextLevel);
      } else {
        // Reset to Learning if failed
        updateMastery(currentItem.id, MasteryLevel.Learning);
      }
    }

    setShowAnswer(false);
    if (currentIndex < activeSet.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(); // End session
    }
  };

  if (mode === 'menu') {
    return (
      <div className="space-y-6 pt-10 px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Time to Review</h2>
          <p className="text-zinc-500">Choose your workout for today.</p>
        </div>

        <button 
          onClick={() => setMode('daily3')}
          className="w-full bg-gradient-to-br from-orange-400 to-pink-500 text-white p-6 rounded-2xl shadow-lg shadow-orange-500/20 text-left relative overflow-hidden group"
          disabled={daily3Items.length === 0}
        >
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Daily 3 Challenge</h3>
            <p className="text-white/90 text-sm">Make 3 sentences. Get feedback.</p>
          </div>
          <RefreshCw className="absolute right-4 bottom-4 text-white/20 group-hover:rotate-180 transition-transform duration-500" size={64} />
        </button>

        <button 
          onClick={() => setMode('flashcard')}
          className="w-full bg-zinc-800 text-white p-6 rounded-2xl shadow-lg text-left relative overflow-hidden"
          disabled={dueItems.length === 0}
        >
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Flashcard Mode</h3>
            <p className="text-zinc-400 text-sm">Review {dueItems.length} pending words.</p>
          </div>
          <div className="absolute right-4 bottom-4 flex gap-1 opacity-20">
            <div className="w-8 h-12 bg-white rounded-sm transform -rotate-12"></div>
            <div className="w-8 h-12 bg-white rounded-sm transform rotate-6"></div>
          </div>
        </button>

        {dueItems.length === 0 && (
           <div className="text-center text-zinc-400 mt-8">
             <p>All caught up! Great job.</p>
           </div>
        )}
      </div>
    );
  }

  if (!currentItem) return <div className="p-10 text-center">Loading session...</div>;

  return (
    <div className="h-full flex flex-col justify-center px-4 pt-4 pb-10">
      {/* Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mb-8">
        <div 
          className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / activeSet.length) * 100}%` }}
        ></div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 min-h-[320px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        
        <span className="absolute top-4 right-4 text-xs text-zinc-400 uppercase tracking-widest">
          {mode === 'daily3' ? 'Make a Sentence' : 'Recall Meaning'}
        </span>

        <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 mb-6">
          {currentItem.word}
        </h2>

        {showAnswer ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
            <div className="mb-6">
              <p className="text-zinc-500 uppercase text-xs font-bold mb-1">Meaning</p>
              <p className="text-lg text-zinc-800 dark:text-zinc-200">{currentItem.userMeaning}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl text-left">
              <p className="text-zinc-500 uppercase text-xs font-bold mb-2">Context</p>
              <p className="text-zinc-700 dark:text-zinc-300 italic">"{currentItem.contextSentence}"</p>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowAnswer(true)}
            className="text-zinc-400 flex flex-col items-center hover:text-primary-500 transition-colors"
          >
            <Eye size={32} className="mb-2" />
            <span className="text-sm font-medium">Tap to reveal</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {!showAnswer ? (
           <button 
             onClick={() => setShowAnswer(true)}
             className="col-span-2 bg-zinc-900 dark:bg-zinc-700 text-white py-4 rounded-xl font-bold shadow-lg"
           >
             Show Answer
           </button>
        ) : (
          <>
            <button 
              onClick={() => handleNext(false)}
              className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <XIcon size={20} /> Needs Practice
            </button>
            <button 
              onClick={() => handleNext(true)}
              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Check size={20} /> Got it
            </button>
          </>
        )}
      </div>
    </div>
  );
};