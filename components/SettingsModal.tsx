
import React, { useState } from 'react';
import { Save, Link as LinkIcon, CheckCircle2, AlertCircle, Loader2, BookOpen, Database, RefreshCw, Trash2 } from 'lucide-react';
import { setApiUrl, fetchInventory } from '../services/api';
import { clearCache, clearPendingQueue, getPendingCount, getLastSyncLabel } from '../services/storageService';

interface SettingsModalProps {
  currentUrl: string | null;
  onSave: () => void;
  onCancel: () => void;
  forceOpen?: boolean;
  onOpenSetupGuide?: () => void;
  onForceSync?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  currentUrl, 
  onSave, 
  onCancel, 
  forceOpen = false,
  onOpenSetupGuide,
  onForceSync,
}) => {
  const [url, setUrl] = useState(currentUrl || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [pendingCount] = useState(() => getPendingCount());
  const [lastSync] = useState(() => getLastSyncLabel());

  const handleTest = async () => {
    if (!url.trim()) return;
    setApiUrl(url.trim());
    setTesting(true);
    setTestResult(null);
    setTestMessage('');
    
    try {
        await fetchInventory();
        setTestResult('success');
        setTestMessage('Connessione riuscita!');
    } catch (e: any) {
        setTestResult('error');
        setTestMessage(e.message || "Errore sconosciuto durante il test.");
    } finally {
        setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      setApiUrl(url.trim());
      onSave();
    }
  };

  const handleClearCache = () => {
    clearCache();
    alert('Cache locale svuotata. Al prossimo refresh i dati verranno ricaricati dal server.');
  };

  const handleClearQueue = () => {
    clearPendingQueue();
    alert('Coda operazioni pendenti cancellata. Le modifiche offline non sincronizzate sono state scartate.');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        <div className="bg-emerald-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <LinkIcon size={24} />
            <h2 className="text-xl font-bold">Connessione Google Sheet</h2>
          </div>
          <p className="text-emerald-100 text-sm">
            Inserisci l'URL della Web App del tuo Google Script.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {onOpenSetupGuide && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-sm text-emerald-800 dark:text-emerald-200">
                Non hai ancora il file?
              </div>
              <button
                type="button"
                onClick={() => {
                   onOpenSetupGuide();
                   onCancel(); // Close settings to show guide
                }}
                className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:underline shrink-0"
              >
                <BookOpen size={16} />
                Come creare il file
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Google Apps Script Web App URL
            </label>
            <input
              required
              type="url"
              value={url}
              onChange={(e) => {
                  setUrl(e.target.value);
                  setTestResult(null);
              }}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

           {/* Test Section */}
           <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
             <div className="text-sm text-gray-600 dark:text-gray-400">Stato Connessione</div>
             <button
                type="button"
                onClick={handleTest}
                disabled={testing || !url}
                className="text-emerald-700 dark:text-emerald-400 font-medium text-sm hover:underline disabled:opacity-50 flex items-center gap-2"
             >
                {testing && <Loader2 size={14} className="animate-spin" />}
                {testing ? 'Test in corso...' : 'Verifica Ora'}
             </button>
           </div>

           {testResult === 'success' && (
               <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 p-3 rounded-lg text-sm border border-emerald-200 dark:border-emerald-800 flex items-start gap-2">
                   <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                   <span>{testMessage}</span>
               </div>
           )}

           {testResult === 'error' && (
               <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800 flex items-start gap-2">
                   <AlertCircle size={18} className="shrink-0 mt-0.5" />
                   <span>{testMessage}</span>
               </div>
           )}

          {/* ── Sezione Dati Locali ── */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Database size={16} className="text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dati Locali</h3>
            </div>

            <div className="space-y-2">
              {/* Stato sync */}
              <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">Ultima sincronizzazione</span>
                <span className="font-medium text-gray-800 dark:text-white">{lastSync}</span>
              </div>

              {/* Operazioni pendenti */}
              {pendingCount > 0 && (
                <div className="flex items-center justify-between text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <span className="text-amber-700 dark:text-amber-300">
                    Modifiche offline in attesa: <strong>{pendingCount}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => { onForceSync?.(); onCancel(); }}
                    className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold text-xs hover:underline"
                  >
                    <RefreshCw size={12} />
                    Sincronizza ora
                  </button>
                </div>
              )}

              {/* Pulsanti azione */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw size={13} />
                  Svuota Cache
                </button>
                {pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearQueue}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={13} />
                    Scarta Modifiche
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!forceOpen && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annulla
              </button>
            )}
            <button
              type="submit"
              disabled={testResult === 'error'}
              className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
