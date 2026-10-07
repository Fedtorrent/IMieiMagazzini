import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface NoNetworkModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onExit: () => void;
  isRetrying?: boolean;
}

export const NoNetworkModal: React.FC<NoNetworkModalProps> = ({
  isOpen,
  onRetry,
  onExit,
  isRetrying = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff size={32} />
          </div>

          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            Connessione Assente
          </h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-6 leading-relaxed">
            Non posso caricare l'archivio per mancanza di connessione, riprova più tardi
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onExit}
              disabled={isRetrying}
              className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-2xl font-bold transition-colors text-sm disabled:opacity-50"
            >
              OK
            </button>
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white py-3.5 px-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Riprovo...</span>
                </>
              ) : (
                <span>Riprova</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
