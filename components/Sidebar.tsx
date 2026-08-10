
import React, { useState } from 'react';
import { X, Moon, Sun, Users, Info, RefreshCcw, GraduationCap, Unlink, ChevronDown, ChevronUp, Trash2, RotateCcw, History, ChevronRight } from 'lucide-react';
import { getFamilyCode } from '../services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCloudSettings: () => void;
  onDisconnectRequest: () => void;
  isConfigured: boolean;
  currentTheme: 'light' | 'dark';
  onToggleTheme: (theme: 'light' | 'dark') => void;
  hiddenLocations: string[];
  onRestoreLocation: (loc: string) => void;
  onRestartTutorial: () => void;
  onTotalResetRequest: () => void;
  onInventoryClearRequest: () => void;
  onOpenUpdateLog: () => void;
}

const CollapsibleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {isOpen && <div className="pb-4 space-y-3">{children}</div>}
    </section>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onOpenCloudSettings, 
  onDisconnectRequest,
  isConfigured,
  currentTheme, 
  onToggleTheme,
  hiddenLocations,
  onRestoreLocation,
  onRestartTutorial,
  onTotalResetRequest,
  onInventoryClearRequest,
  onOpenUpdateLog
}) => {
  const familyCode = getFamilyCode();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">Menu</h2>
              {familyCode && (
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">
                  ID: {familyCode}
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-1">
            <CollapsibleSection title="Personalizzazione" defaultOpen>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onToggleTheme('light')} className={`flex items-center gap-2 justify-center p-3 rounded-2xl border transition-all ${currentTheme === 'light' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-transparent text-gray-500'}`}><Sun size={18} /><span className="text-xs font-bold uppercase">Light</span></button>
                <button onClick={() => onToggleTheme('dark')} className={`flex items-center gap-2 justify-center p-3 rounded-2xl border transition-all ${currentTheme === 'dark' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'bg-gray-50 border-transparent text-gray-500'}`}><Moon size={18} /><span className="text-xs font-bold uppercase">Dark</span></button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Sincronizzazione">
              <div className="space-y-2">
                <button onClick={() => { onClose(); onOpenCloudSettings(); }} className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-emerald-50 transition-all">
                    <Users size={20} className="text-emerald-600" />
                    <div className="text-left">
                        <div className="text-xs font-black text-gray-800 dark:text-white uppercase">Codice Familiare</div>
                        <div className="text-[10px] text-gray-500 font-bold">Cambia ID</div>
                    </div>
                </button>
                {isConfigured && (
                  <button onClick={onDisconnectRequest} className="w-full flex items-center gap-4 p-4 bg-red-50/30 dark:bg-red-900/10 rounded-2xl border border-red-100/50">
                      <Unlink size={20} className="text-red-600" />
                      <div className="text-left">
                          <div className="text-xs font-black text-red-800 dark:text-red-300 uppercase">Esci dalla Famiglia</div>
                          <div className="text-[10px] text-red-500/70 font-bold">Scollega dispositivo</div>
                      </div>
                  </button>
                )}
              </div>
            </CollapsibleSection>

            {isConfigured && (
              <CollapsibleSection title="Utilità">
                <div className="space-y-2">
                  <button onClick={onInventoryClearRequest} className="w-full flex items-center gap-4 p-4 bg-amber-50/30 dark:bg-amber-900/10 rounded-2xl border border-amber-100/50 text-left">
                      <RotateCcw size={20} className="text-amber-600" />
                      <div>
                          <div className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase">Azzera Quantità</div>
                          <div className="text-[10px] text-amber-500/70 font-bold">Facilita l'inventario prodotti</div>
                      </div>
                  </button>
                  <button onClick={() => { onClose(); onRestartTutorial(); }} className="w-full flex items-center gap-4 p-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 text-left">
                      <GraduationCap size={20} className="text-emerald-600" />
                      <div>
                          <div className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase">Riavvia Tutorial</div>
                          <div className="text-[10px] text-emerald-500/70 font-bold">Guida rapida</div>
                      </div>
                  </button>
                  <button onClick={onTotalResetRequest} className="w-full flex items-center gap-4 p-4 bg-red-50/30 dark:bg-red-900/10 rounded-2xl border border-red-100/50 text-left">
                      <Trash2 size={20} className="text-red-600" />
                      <div>
                          <div className="text-xs font-black text-red-800 dark:text-red-300 uppercase">Reset Totale</div>
                          <div className="text-[10px] text-red-500/70 font-bold">Svuota DB e disconnetti</div>
                      </div>
                  </button>
                </div>
              </CollapsibleSection>
            )}

             <CollapsibleSection title="Informazioni">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 space-y-5 border border-gray-100 dark:border-gray-800">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Versione</span>
                    <span className="text-xs font-black text-emerald-600">1.1.0</span>
                 </div>

                 <button
                    onClick={() => {
                        onClose();
                        onOpenUpdateLog();
                    }}
                    className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-200 transition-all group"
                 >
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Log Aggiornamenti</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                 </button>

                 <p className="text-[11px] text-gray-500 font-bold leading-relaxed">App professionale per la gestione del magazzino domestico.</p>
              </div>
            </CollapsibleSection>
          </div>

          <div className="p-8 border-t border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Sviluppato da</span>
              <img src="/IconaPersonale.png" alt="FP Logo" className="w-10 h-10 object-contain" />
            </div>
            <a href="https://fedtorrent.github.io/LeMieApp.github.io/" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gray-50 dark:bg-gray-900 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-gray-100 hover:text-emerald-600">Visita il Sito</a>
          </div>
        </div>
      </div>
    </>
  );
};
