import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { getApiKey, saveApiKey } from '../services/geminiService';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getApiKey();
    if (current) setKey(current);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h2>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex-1">
        <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100">AI Configuration</h3>
        <p className="text-sm text-zinc-500 mb-4">
          To enable the Chinese-to-English search feature, please provide a Google Gemini API Key.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Gemini API Key</label>
            <input 
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all ${saved ? 'bg-emerald-500' : 'bg-primary-600 hover:bg-primary-700'}`}
            >
              {saved ? <CheckCircle size={18} /> : <Save size={18} />}
              {saved ? 'Saved' : 'Save Key'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">
            Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary-600 underline">Get a free key from Google</a>.
          </p>
        </div>
      </div>
      
      <div className="mt-8 mb-4 text-center">
        <p className="text-[10px] text-zinc-300 dark:text-zinc-600 font-medium uppercase tracking-widest">
          Made by Yvonne Wang
        </p>
      </div>
    </div>
  );
};