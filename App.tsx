
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { WordCard } from './components/WordCard';
import { WordForm } from './components/WordForm';
import { ReviewSession } from './components/ReviewSession';
import { SearchTool } from './components/SearchTool';
import { Settings } from './components/Settings';
import { getItems, saveItem, deleteItem } from './services/storageService';
import { VocabItem, ViewMode, FilterState } from './types';
import { Search as SearchIcon, PlusCircle, AlertTriangle } from 'lucide-react';
import { getApiKey } from './services/geminiService';

export default function App() {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [view, setView] = useState<ViewMode>('home');
  const [editingItem, setEditingItem] = useState<VocabItem | null>(null);
  
  // Filter State
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    mastery: 'All'
  });

  useEffect(() => {
    setItems(getItems());
  }, [view]); 

  const handleSave = (item: VocabItem) => {
    saveItem(item);
    setItems(getItems()); 
    setView('home'); 
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    setItems(getItems()); 
  };

  const handleEdit = (item: VocabItem) => {
    setEditingItem(item);
    setView('edit');
  };

  // Derived filtered list
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.word.toLowerCase().includes(filter.search.toLowerCase()) || 
                            item.userMeaning.toLowerCase().includes(filter.search.toLowerCase());
      const matchesMastery = filter.mastery === 'All' ? true : item.masteryLevel === filter.mastery;
      return matchesSearch && matchesMastery;
    });
  }, [items, filter]);

  const hasKey = !!getApiKey();

  return (
    <Layout currentView={view} setView={setView}>
      {/* 1. HOME VIEW */}
      {view === 'home' && (
        <div className="space-y-6 animate-in fade-in duration-300 pb-10">
          
          {/* Section 1: Chinese Search */}
          <section>
             <div className="px-4 mb-3 flex items-center gap-2">
                <div className="h-5 w-1.5 bg-primary-600 rounded-full"></div>
                <h2 className="text-sm font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
                  Feature 1: AI Search
                </h2>
             </div>
             <SearchTool 
               onAddWord={(item) => {
                 saveItem(item);
                 setItems(getItems());
                 alert(`Added "${item.word}" to library!`);
               }} 
               onGoToSettings={() => setView('settings')}
             />
          </section>

          {/* Section 2: Compact Add Button */}
          <section className="flex flex-col px-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="mb-3 flex items-center gap-2">
                <div className="h-5 w-1.5 bg-primary-600 rounded-full"></div>
                <h2 className="text-sm font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
                  Feature 2: My Vocabulary
                </h2>
             </div>

            <div className="w-full">
              <button 
                onClick={() => setView('add')}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:opacity-90 text-white p-4 rounded-xl shadow-md flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
              >
                <PlusCircle size={24} />
                <span className="text-lg font-bold">Add New Word</span>
              </button>
            </div>
          </section>

          {/* Section 3: API Key Hint */}
          {!hasKey && (
            <section className="mx-4 mt-4">
              <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30">
                 <div className="flex gap-3">
                   <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                   <div className="space-y-1">
                     <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                       <strong>Enhance experience:</strong> Add a free Google Gemini API Key for AI translations & Chinese search.
                     </p>
                     <button 
                       onClick={() => setView('settings')}
                       className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline"
                     >
                       Settings &rarr;
                     </button>
                   </div>
                 </div>
              </div>
            </section>
          )}

          {hasKey && (
             <div className="text-center text-[10px] text-zinc-300 dark:text-zinc-600 uppercase tracking-widest mt-8">
               AI Features Active
             </div>
          )}
        </div>
      )}

      {/* 2. LIBRARY VIEW */}
      {(view === 'library' || view === 'list') && (
        <div className="space-y-4">
          {/* Top Filter Bar */}
          <div className="sticky top-0 bg-gray-50 dark:bg-zinc-950 z-10 pb-2 pt-2 px-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text"
                placeholder="Search your library..."
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
              />
            </div>
          </div>

          {/* List Content */}
          {filteredItems.length === 0 ? (
             <div className="text-center py-20 text-zinc-400">
               <p>No words found.</p>
               <p className="text-sm mt-2">Go Home to add some!</p>
             </div>
          ) : (
             <div className="space-y-3 px-1">
               {filteredItems.map(item => (
                 <WordCard 
                   key={item.id} 
                   item={item} 
                   onEdit={handleEdit} 
                   onDelete={handleDelete} 
                 />
               ))}
             </div>
          )}
        </div>
      )}

      {/* 3. SETTINGS VIEW */}
      {view === 'settings' && (
        <Settings onBack={() => setView('home')} />
      )}

      {/* 4. ADD / EDIT FORM */}
      {(view === 'add' || view === 'edit') && (
        <WordForm 
          initialData={view === 'edit' ? editingItem : null}
          onSave={handleSave}
          onCancel={() => {
            setEditingItem(null);
            setView(view === 'edit' ? 'library' : 'home');
          }}
        />
      )}

      {/* 5. REVIEW MODE */}
      {view === 'review' && (
        <ReviewSession 
          items={items} 
          onFinish={() => setView('home')} 
        />
      )}
    </Layout>
  );
}
