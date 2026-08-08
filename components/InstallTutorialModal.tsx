import React from 'react';
import { Share, PlusSquare, MoreVertical, Download, X } from 'lucide-react';

interface InstallTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
}

export const InstallTutorialModal: React.FC<InstallTutorialModalProps> = ({ isOpen, onClose, isIOS }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-700">
        
        {/* Header */}
        <div className="bg-emerald-600 p-5 text-white flex justify-between items-start">
          <div>
             <h3 className="text-xl font-bold">Installa App</h3>
             <p className="text-emerald-100 text-sm mt-1">Aggiungi alla schermata Home</p>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isIOS ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 text-blue-500">
                  <Share size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">1. Tocca "Condividi"</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cerca l'icona con il quadrato e la freccia nella barra in basso del browser.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 text-gray-800 dark:text-white">
                  <PlusSquare size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">2. Aggiungi a Home</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Scorri verso il basso nel menu e seleziona "Aggiungi alla schermata Home".</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 text-gray-800 dark:text-white">
                  <MoreVertical size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">1. Apri il Menu</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tocca i tre puntini in alto a destra nel browser Chrome.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 text-emerald-600">
                  <Download size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">2. Installa App</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Seleziona "Installa app" o "Aggiungi a schermata Home" dal menu.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-center">
            <button 
                onClick={onClose}
                className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:underline"
            >
                Ho capito, chiudi
            </button>
        </div>

      </div>
    </div>
  );
};