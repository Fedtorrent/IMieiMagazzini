
import React from 'react';
import { Search, Settings, RefreshCw, X, LayoutList, Rows, CloudOff } from 'lucide-react';

interface HeaderProps {
  onSearch: (term: string) => void;
  searchTerm: string;
  onOpenSettings: () => void;
  onRefresh: () => void;
  loading: boolean;
  isCompactMode: boolean;
  onToggleCompactMode: () => void;
  pendingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
    onSearch, 
    searchTerm, 
    onOpenSettings, 
    onRefresh, 
    loading,
    isCompactMode,
    onToggleCompactMode,
    pendingCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3 transition-colors duration-200">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Toggle View Mode Button */}
          <button 
            id="tour-compact-mode"
            onClick={onToggleCompactMode}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 shrink-0 ${
                isCompactMode 
                ? 'bg-blue-600 shadow-blue-200 dark:shadow-none' 
                : 'bg-emerald-600 shadow-emerald-200 dark:shadow-none'
            }`}
            title={isCompactMode ? "Passa a vista estesa" : "Passa a vista compatta"}
          >
            {isCompactMode ? <LayoutList size={22} /> : <Rows size={22} />}
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white hidden sm:block">Magazzino</h1>
        </div>
        
        <div className="flex-1 relative max-w-xs sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-full leading-5 focus:outline-none focus:placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Cerca..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => onSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Badge operazioni in attesa */}
          {pendingCount > 0 && (
            <div
              title={`${pendingCount} modifica${pendingCount > 1 ? 'he' : ''} in attesa di sincronizzazione`}
              className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-bold animate-pulse cursor-default"
            >
              <CloudOff size={13} />
              <span>{pendingCount}</span>
            </div>
          )}

          <button 
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${loading ? 'animate-spin' : ''}`}
            title="Aggiorna Dati"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            id="tour-settings"
            onClick={onOpenSettings}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Impostazioni"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
