import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { WordCard } from './components/WordCard';
import { WordForm } from './components/WordForm';
import { ReviewSession } from './components/ReviewSession';
import { getItems, saveItem, deleteItem } from './services/storageService';
import { VocabItem, ViewMode, FilterState } from './types';
import { Search } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [view, setView] = useState<ViewMode>('list');
  const [editingItem, setEditingItem] = useState<VocabItem | null>(null);
  
  // Filter State
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    mastery: 'All'
  });

  useEffect(() => {
    setItems(getItems());
  }, [view]); // Refresh when view changes

  const handleSave = (item: VocabItem) => {
    saveItem(item);
    setItems(getItems()); // Refresh list
    setView('list');
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    setItems(getItems()); // Refresh list immediate
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

  return (
    <Layout currentView={view} setView={setView}>
      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text"
              placeholder="Search words..."
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
              className="w-full pl-10 pr-10 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* List Content */}
          {filteredItems.length === 0 ? (
             <div className="text-center py-20 text-zinc-400">
               <p>No words found.</p>
               <p className="text-sm mt-2">Tap + to add one.</p>
             </div>
          ) : (
             filteredItems.map(item => (
               <WordCard 
                 key={item.id} 
                 item={item} 
                 onEdit={handleEdit} 
                 onDelete={handleDelete} 
               />
             ))
          )}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {(view === 'add' || view === 'edit') && (
        <WordForm 
          initialData={view === 'edit' ? editingItem : null}
          onSave={handleSave}
          onCancel={() => {
            setEditingItem(null);
            setView('list');
          }}
        />
      )}

      {/* REVIEW MODE */}
      {view === 'review' && (
        <ReviewSession 
          items={items} 
          onFinish={() => setView('list')} 
        />
      )}
    </Layout>
  );
}
