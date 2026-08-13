
import React from 'react';
import { InventoryItem } from '../types';
import { MapPin, Calendar, AlertCircle, Edit2, Trash2, Copy } from 'lucide-react';
import { getExpirationStatus } from '../services/api';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onCopy: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, delta: number) => void;
  isCompact?: boolean;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ 
    item, 
    onEdit, 
    onCopy, 
    onDelete, 
    onQuantityChange,
    isCompact = false
}) => {
  const isLowStock = item.Qta === 0;
  const { isExpired, isExpiring } = getExpirationStatus(item.DataScadenza);

  // --- COMPACT MODE RENDER ---
  if (isCompact) {
      return (
        <div
          onClick={() => onEdit(item)}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer active:scale-[0.98] ${
          item.Qta > 0
            ? 'border-emerald-500 dark:border-emerald-600'
            : 'border-red-500 dark:border-red-600 bg-red-50/30 dark:bg-red-900/10'
        }`}>
            <div className="flex items-center gap-3 overflow-hidden">
                {/* Status Dot */}
                <div className="shrink-0">
                    {isExpired ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" title="Scaduto"></div>
                    ) : isExpiring ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" title="In Scadenza"></div>
                    ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    )}
                </div>
                
                <span className={`text-sm font-medium truncate ${isLowStock ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {item.Descrizione}
                </span>
            </div>

            <div className={`shrink-0 ml-4 px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                item.Qta > 0 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800' 
                : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800'
            }`}>
                {item.Qta}
            </div>
        </div>
      );
  }

  // --- EXTENDED MODE RENDER (Standard Card) ---
  
  // Helper for category badge styles in light/dark mode
  const getCategoryStyle = (cat: string) => {
    switch (cat) {
        case 'Alimentari': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200';
        case 'Casalinghi': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-4 transition-all hover:shadow-md
        ${item.Qta > 0
            ? 'border-emerald-500 dark:border-emerald-600'
            : 'border-red-500 dark:border-red-600'
        }`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-1 ${getCategoryStyle(item.Categoria)}`}>
            {item.Categoria}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{item.Descrizione}</h3>
        </div>
        <div className="flex gap-1">
            <button 
              onClick={() => onEdit(item)} 
              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
              title="Modifica"
            >
                <Edit2 size={16} />
            </button>
            <button 
              onClick={() => onCopy(item)} 
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Duplica"
            >
                <Copy size={16} />
            </button>
            <button 
              onClick={() => onDelete(item.IdLista)} 
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Elimina"
            >
                <Trash2 size={16} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-gray-400 dark:text-gray-500" />
          <span>{item.Posizione}</span>
        </div>
        {item.DataScadenza && (
          <div className={`flex items-center gap-1.5 ${isExpired ? 'text-red-600 dark:text-red-400 font-medium' : isExpiring ? 'text-amber-600 dark:text-amber-400' : ''}`}>
            <Calendar size={14} className={isExpired ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'} />
            <span>{item.DataScadenza}</span>
          </div>
        )}
      </div>

      {item.Note && item.Note !== '-' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg mb-2 italic">
          "{item.Note}"
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
            {isLowStock && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold">
                    <AlertCircle size={14} />
                    ESAURITO
                </div>
            )}
        </div>
        
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-0.5 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => onQuantityChange(item.IdLista, -1)}
            disabled={item.Qta <= 0}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            -
          </button>
          <span className="w-8 text-center font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.Qta}</span>
          <button 
            onClick={() => onQuantityChange(item.IdLista, 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-500 shadow-sm text-white hover:bg-emerald-600 active:scale-95 transition-all"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
