
import React, { useState, useEffect } from 'react';
import { VocabItem, MasteryLevel } from '../types';
import { updateMastery, getDueItems } from '../services/storageService';
import { Eye, Check, X as XIcon } from 'lucide-react';

interface ReviewSessionProps {
  items: VocabItem[]; // Passed in but we primarily use getDueItems
  onFinish: () => void;
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({ onFinish }) => {
  const [reviewQueue, setReviewQueue] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    const due = getDueItems();
    setReviewQueue(due);
    setSessionLoaded(true);
  }, []);

  const currentItem = reviewQueue[currentIndex];

  const handleNext = (success: boolean) => {
    if (currentItem) {
      if (success) {
        // Ebbinghaus Progression
        const nextLevel = currentItem.masteryLevel === MasteryLevel.New 
          ? MasteryLevel.Learning 
          : MasteryLevel.Mastered;
        updateMastery(currentItem.id, nextLevel);
      } else {
        // Reset/Keep at Learning
        updateMastery(currentItem.id, MasteryLevel.Learning);
      }
    }

    setShowAnswer(false);
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(); // End session
    }
  };

  if (!sessionLoaded) return <div className="p-10 text-center text-zinc-500">Calculating memory curve...</div>;

  if (reviewQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-in zoom-in">
          <Check size={48} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">All Caught Up!</h2>
        <p className="text-zinc-500">
          According to the Ebbinghaus forgetting curve, you don't need to review anything right now.
        </p>
        <button 
          onClick={onFinish}
          className="bg-zinc-900 dark:bg-zinc-700 text-white px-8 py-3 rounded-xl font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center px-4 pt-4 pb-10">
      <div className="text-center mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Ebbinghaus Review • {reviewQueue.length - currentIndex} remaining
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mb-8">
        <div 
          className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / reviewQueue.length) * 100}%` }}
        ></div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 min-h-[320px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        
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
              <XIcon size={20} /> Forgot
            </button>
            <button 
              onClick={() => handleNext(true)}
              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Check size={20} /> Remembered
            </button>
          </>
        )}
      </div>
    </div>
  );
};
