import React, { useEffect, useState } from 'react';
import { ViewMode } from '../types';
import { BookOpen, PlusCircle, Dumbbell, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto border-x border-zinc-200 dark:border-zinc-800 shadow-2xl">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          VocabFlow
        </h1>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-zinc-600" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full max-w-md bg-surface-light dark:bg-surface-dark border-t border-zinc-200 dark:border-zinc-800 pb-safe">
        <div className="flex justify-around items-center h-16">
          <NavBtn 
            icon={<BookOpen size={24} />} 
            label="Library" 
            active={currentView === 'list'} 
            onClick={() => setView('list')} 
          />
          <div className="relative -top-6">
            <button 
              onClick={() => setView('add')}
              className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 active:scale-95 transition-transform"
            >
              <PlusCircle size={28} />
            </button>
          </div>
          <NavBtn 
            icon={<Dumbbell size={24} />} 
            label="Review" 
            active={currentView === 'review'} 
            onClick={() => setView('review')} 
          />
        </div>
      </nav>
    </div>
  );
};

const NavBtn = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 space-y-1 ${active ? 'text-primary-600' : 'text-zinc-400 dark:text-zinc-500'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);
