
import React from 'react';
import { X, Moon, Sun, CloudCog, Info, RefreshCcw, BookOpen, GraduationCap, Unlink } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCloudSettings: () => void;
  onOpenSetupGuide: () => void;
  onDisconnectRequest: () => void;
  isConfigured: boolean;
  currentTheme: 'light' | 'dark';
  onToggleTheme: (theme: 'light' | 'dark') => void;
  hiddenLocations: string[];
  onRestoreLocation: (loc: string) => void;
  onRestartTutorial: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onOpenCloudSettings, 
  onOpenSetupGuide,
  onDisconnectRequest,
  isConfigured,
  currentTheme, 
  onToggleTheme,
  hiddenLocations,
  onRestoreLocation,
  onRestartTutorial
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 right-0 w-72 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-x-hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Impostazioni</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 space-y-8 overflow-y-auto">
            
            {/* Theme Section */}
            <section>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Aspetto
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onToggleTheme('light')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    currentTheme === 'light'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-400'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Sun size={20} className="mb-1" />
                  <span className="text-xs font-medium">Chiaro</span>
                </button>
                <button
                  onClick={() => onToggleTheme('dark')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    currentTheme === 'dark'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-400'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Moon size={20} className="mb-1" />
                  <span className="text-xs font-medium">Scuro</span>
                </button>
              </div>
            </section>

             {/* Hidden Locations Section */}
             {hiddenLocations.length > 0 && (
                <section>
                    <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                        Posizioni Nascoste
                    </h3>
                    <div className="space-y-2">
                        {hiddenLocations.map(loc => (
                            <div key={loc} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{loc}</span>
                                <button
                                    onClick={() => onRestoreLocation(loc)}
                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                    title="Ripristina"
                                >
                                    <RefreshCcw size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Cloud Section */}
            <section>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Dati e Sincronizzazione
              </h3>
              <div className="space-y-3">
                <button
                    onClick={() => {
                      onClose();
                      onOpenCloudSettings();
                    }}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-colors"
                >
                    <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-emerald-600 dark:text-emerald-400">
                        <CloudCog size={20} />
                    </div>
                    <div className="text-left">
                        <div className="font-semibold text-gray-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Configura Cloud</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Modifica URL Sheet</div>
                    </div>
                    </div>
                </button>

                {isConfigured && (
                  <button
                      onClick={onDisconnectRequest}
                      className="w-full flex items-center justify-between p-4 bg-red-50/30 dark:bg-red-900/10 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors border border-red-100/50 dark:border-red-900/30"
                  >
                      <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-red-600 dark:text-red-400">
                          <Unlink size={20} />
                      </div>
                      <div className="text-left">
                          <div className="font-semibold text-red-800 dark:text-red-300 group-hover:text-red-900 transition-colors">Scollega Database</div>
                          <div className="text-xs text-red-500/70">Reset connessione cloud</div>
                      </div>
                      </div>
                  </button>
                )}

                <button
                    onClick={() => {
                        onClose();
                        onOpenSetupGuide();
                    }}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-colors"
                >
                    <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-emerald-600 dark:text-emerald-400">
                        <BookOpen size={20} />
                    </div>
                    <div className="text-left">
                        <div className="font-semibold text-gray-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Guida Configurazione</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Crea il tuo foglio</div>
                    </div>
                    </div>
                </button>
              </div>
            </section>

             {/* Info Section */}
             <section>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Info
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400 space-y-3">
                 <p className="flex items-center gap-2 font-medium">
                    <Info size={16} /> Versione 1.0.0
                 </p>
                 <button 
                    onClick={() => {
                        onClose();
                        onRestartTutorial();
                    }}
                    className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline text-xs"
                 >
                    <GraduationCap size={14} />
                    Riavvia Tutorial App
                 </button>
                 <p className="text-xs opacity-70">
                    App per la gestione del magazzino domestico. I dati rimangono privati sul tuo Google Sheet.
                 </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Sviluppato da</span>
              <img
                src="/IconaPersonale.png"
                alt="FP Logo"
                className="w-12 h-12 object-contain"
              />
            </div>

            <a
              href="https://fedtorrent.github.io/LeMieApp.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              Visita il Sito
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
