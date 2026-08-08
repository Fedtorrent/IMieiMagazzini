
import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, CalendarClock, MapPin, Check, Trash2, CalendarX } from 'lucide-react';

interface FilterBarProps {
  locationFilter: string;
  stockFilter: 'all' | 'available' | 'out_of_stock' | 'expiring' | 'expired';
  availableLocations: string[];
  onLocationSelect: (loc: string) => void;
  onStockFilterToggle: (type: 'available' | 'out_of_stock' | 'expiring' | 'expired') => void;
  onResetFilters: () => void;
  onHideLocation: (loc: string, e: React.MouseEvent) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  locationFilter,
  stockFilter,
  availableLocations,
  onLocationSelect,
  onStockFilterToggle,
  onResetFilters,
  onHideLocation
}) => {
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  const getFilterButtonStyle = (type: 'Tutti' | 'Disponibili' | 'Esauriti' | 'InScadenza' | 'Scaduti' | 'Posizione') => {
    
    if (type === 'Tutti') {
        const isActive = locationFilter === 'Tutti' && stockFilter === 'all';
        return isActive 
          ? 'bg-blue-100 text-blue-600 border-blue-300 ring-2 ring-blue-500 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-700' 
          : 'bg-white text-gray-400 border-gray-200 hover:border-blue-300 hover:text-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 dark:hover:text-blue-400';
    }

    if (type === 'Disponibili') {
        const isActive = stockFilter === 'available';
        return isActive 
          ? 'bg-emerald-100 text-emerald-600 border-emerald-300 ring-2 ring-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-700' 
          : 'bg-white text-gray-400 border-gray-200 hover:border-emerald-300 hover:text-emerald-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 dark:hover:text-emerald-400';
    }

    if (type === 'Esauriti') {
       const isActive = stockFilter === 'out_of_stock';
       return isActive 
         ? 'bg-red-100 text-red-600 border-red-300 ring-2 ring-red-500 dark:bg-red-900/40 dark:text-red-400 dark:border-red-700' 
         : 'bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 dark:hover:text-red-400';
    }

    if (type === 'InScadenza') {
        const isActive = stockFilter === 'expiring';
        return isActive 
          ? 'bg-amber-100 text-amber-600 border-amber-300 ring-2 ring-amber-500 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700' 
          : 'bg-white text-gray-400 border-gray-200 hover:border-amber-300 hover:text-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 dark:hover:text-amber-400';
    }

    if (type === 'Scaduti') {
      const isActive = stockFilter === 'expired';
      return isActive 
        ? 'bg-red-900 text-white border-red-950 ring-2 ring-red-700 dark:bg-red-950 dark:text-red-100 dark:border-red-900' 
        : 'bg-white text-gray-400 border-gray-200 hover:border-red-800 hover:text-red-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 dark:hover:text-red-500';
    }

    if (type === 'Posizione') {
        const isActive = locationFilter !== 'Tutti';
        return isActive 
            ? 'bg-violet-100 text-violet-600 border-violet-300 ring-2 ring-violet-500 dark:bg-violet-900/40 dark:text-violet-400 dark:border-violet-700' 
            : 'bg-white text-gray-400 border-gray-200 hover:border-violet-300 hover:text-violet-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 dark:hover:text-violet-400';
    }

    return '';
  };

  const handleSelect = (loc: string) => {
    onLocationSelect(loc);
    setIsLocationMenuOpen(false);
  };

  return (
    <div id="tour-filters" className="sticky top-[57px] z-30 bg-gray-50 dark:bg-gray-900 flex flex-wrap justify-center gap-3 sm:gap-4 py-4 mb-2 transition-colors duration-200 overflow-visible">
      <button
        onClick={onResetFilters}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-sm border shrink-0 transition-all ${getFilterButtonStyle('Tutti')}`}
        title="Reset Filtri (Tutti)"
      >
        <Layers size={22} className="sm:size-6" />
      </button>
      
      <button
        onClick={() => onStockFilterToggle('available')}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-sm border shrink-0 transition-all ${getFilterButtonStyle('Disponibili')}`}
        title="Disponibili"
      >
        <CheckCircle2 size={22} className="sm:size-6" />
      </button>

      <button
        onClick={() => onStockFilterToggle('out_of_stock')}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-sm border shrink-0 transition-all ${getFilterButtonStyle('Esauriti')}`}
        title="Esauriti"
      >
        <AlertTriangle size={22} className="sm:size-6" />
      </button>

      <button
        onClick={() => onStockFilterToggle('expiring')}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-sm border shrink-0 transition-all ${getFilterButtonStyle('InScadenza')}`}
        title="In Scadenza (entro 30gg)"
      >
        <CalendarClock size={22} className="sm:size-6" />
      </button>

      <button
        onClick={() => onStockFilterToggle('expired')}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-sm border shrink-0 transition-all ${getFilterButtonStyle('Scaduti')}`}
        title="Scaduti"
      >
        <CalendarX size={22} className="sm:size-6" />
      </button>

      {/* Custom Location Dropdown */}
      <div className="relative shrink-0">
          {isLocationMenuOpen && (
            <div className="fixed inset-0 z-[45]" onClick={() => setIsLocationMenuOpen(false)}></div>
          )}
          
          <button
              onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-sm border transition-all relative z-[50] ${getFilterButtonStyle('Posizione')}`}
              title="Filtra per Posizione"
          >
               <MapPin size={22} className="sm:size-6" />
          </button>

          {isLocationMenuOpen && (
            <div className="absolute top-full mt-2 right-[-20px] sm:right-[-40px] w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[100] animate-fade-in-up">
              <div className="max-h-60 overflow-y-auto">
                 <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                    Scegli Posizione
                 </div>
                 
                 <div className="flex items-center group w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors pr-2">
                     <button
                          onClick={() => handleSelect('Tutti')}
                          className={`flex-1 text-left px-4 py-3 text-sm flex items-center justify-between
                          ${locationFilter === 'Tutti'
                              ? 'text-blue-700 dark:text-blue-400 font-medium' 
                              : 'text-gray-700 dark:text-gray-200'
                          }`}
                      >
                          <span>Tutte le posizioni</span>
                          {locationFilter === 'Tutti' && <Check size={16} />}
                      </button>
                 </div>

                 {availableLocations.map(loc => (
                    <div key={loc} className={`flex items-center group w-full transition-colors pr-2 ${locationFilter === loc ? 'bg-violet-50 dark:bg-violet-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <button
                          onClick={() => handleSelect(loc)}
                          className={`flex-1 text-left px-4 py-3 text-sm flex items-center justify-between
                            ${locationFilter === loc 
                              ? 'text-violet-700 dark:text-violet-400 font-medium' 
                              : 'text-gray-700 dark:text-gray-200'
                            }`}
                        >
                          <span>{loc}</span>
                          {locationFilter === loc && <Check size={16} />}
                        </button>
                        
                        <button
                           onClick={(e) => onHideLocation(loc, e)}
                           className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                           title="Elimina posizione"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                 ))}
                 {availableLocations.length === 0 && (
                   <div className="px-4 py-3 text-sm text-gray-400 italic">Nessuna posizione disponibile</div>
                 )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
