
import React from 'react';
import { X, ChevronRight, History } from 'lucide-react';

interface UpdateLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UPDATE_LOG = [
  {
    version: '1.1.0',
    date: '10/08/2026',
    title: 'Migrazione Supabase & Sicurezza',
    changes: [
      'Migrazione backend da Google Sheets a Supabase (PostgreSQL)',
      'Introduzione Sistema di Sicurezza con Codice Familiare e PIN',
      'Isolamento dei dati per famiglia per una privacy completa',
      'Operazioni massive (Azzera Quantità e Reset) rese istantanee e atomiche',
      'Nuovo Welcome Screen semplificato per un accesso immediato',
      'Ottimizzazione performance caricamento e sincronizzazione cloud',
      'Ripristino e correzione del Tutorial interattivo dell\'app',
      'Miglioramenti grafici alla Sidebar e alle sezioni Utilità'
    ]
  },
  {
    version: '1.0.0',
    date: '01/04/2026',
    title: 'Rilascio Iniziale (Legacy)',
    changes: [
      'Rilascio 1° versione stabile dell\'applicazione',
      'Gestione database basata su Google Sheets tramite Apps Script',
      'Sincronizzazione dati tramite URL Web App dedicato',
      'Implementazione logica Local-First per l\'uso offline',
      'Struttura a schede estese e lista compatta'
    ]
  }
];

export const UpdateLogModal: React.FC<UpdateLogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700 max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <History size={24} />
             <h2 className="text-xl font-black uppercase tracking-tight">Log Aggiornamenti</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           {UPDATE_LOG.map((update, idx) => (
             <div key={update.version} className="relative">
                {idx !== UPDATE_LOG.length - 1 && (
                  <div className="absolute left-3 top-12 bottom-[-32px] w-0.5 bg-gray-100 dark:bg-gray-700" />
                )}

                <div className="flex items-center gap-4 mb-4">
                   <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-4 border-white dark:border-gray-800 flex shrink-0 z-10" />
                   <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-widest px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                        v{update.version}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {update.date}
                      </span>
                   </div>
                </div>

                <div className="ml-10 space-y-4">
                   <h3 className="text-lg font-black text-gray-800 dark:text-white leading-tight">
                     {update.title}
                   </h3>
                   <ul className="space-y-3">
                      {update.changes.map((change, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                           <ChevronRight size={14} className="shrink-0 mt-1 text-emerald-500" />
                           {change}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
           ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex justify-center shrink-0">
           <button
             onClick={onClose}
             className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all"
           >
             Ho capito
           </button>
        </div>
      </div>
    </div>
  );
};
