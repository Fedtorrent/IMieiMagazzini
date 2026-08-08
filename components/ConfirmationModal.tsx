import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Elimina',
  cancelText = 'Annulla',
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-700">
        <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed whitespace-pre-line">{message}</p>
            
            <div className="flex gap-3">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                )}
                <button
                    onClick={onConfirm}
                    disabled={isProcessing}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:bg-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isProcessing ? 'Elaborazione...' : confirmText}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};