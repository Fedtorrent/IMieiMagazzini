
import React, { useState, useEffect } from 'react';
import { InventoryItem, DEFAULT_LOCATIONS } from '../types';
import { X, Save, Loader2, Plus, List } from 'lucide-react';

interface EditFormProps {
  initialItem?: InventoryItem;
  onSave: (item: InventoryItem) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  availableCategories: string[];
  availableLocations: string[];
}

export const EditForm: React.FC<EditFormProps> = ({ 
    initialItem, 
    onSave, 
    onCancel, 
    isSaving, 
    availableCategories,
    availableLocations 
}) => {
  // Use passed availableLocations or fallback to default if empty
  const locations = availableLocations.length > 0 ? availableLocations : DEFAULT_LOCATIONS;

  const [formData, setFormData] = useState<InventoryItem>({
    IdLista: Math.random().toString(36).substr(2, 9),
    Categoria: availableCategories[0] || 'Alimentari',
    Descrizione: '',
    Qta: 1,
    DataScadenza: '',
    Posizione: locations[0],
    Note: '-'
  });

  const [qtaInput, setQtaInput] = useState<string>('1');
  const [dateInput, setDateInput] = useState<string>('');
  
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomLocation, setIsCustomLocation] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setFormData(initialItem);
      setQtaInput(initialItem.Qta.toString());
      
      if (initialItem.DataScadenza) {
        const parts = initialItem.DataScadenza.split('/');
        if (parts.length === 3) {
            setDateInput(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
            setDateInput('');
        }
      }
    }
  }, [initialItem]);

  const handleQtaChange = (val: string) => {
    setQtaInput(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed)) {
        setFormData(prev => ({ ...prev, Qta: parsed }));
    } else {
        setFormData(prev => ({ ...prev, Qta: 0 }));
    }
  };

  const handleDateChange = (val: string) => {
    setDateInput(val);
    if (val) {
        const [year, month, day] = val.split('-');
        setFormData(prev => ({ ...prev, DataScadenza: `${day}/${month}/${year}` }));
    } else {
        setFormData(prev => ({ ...prev, DataScadenza: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const toggleCategoryMode = () => {
    setIsCustomCategory(!isCustomCategory);
    if (isCustomCategory) {
        // Switching back to select: ensure value is in list, otherwise default to first
        if (!availableCategories.includes(formData.Categoria)) {
            setFormData(prev => ({ ...prev, Categoria: availableCategories[0] }));
        }
    } else {
        setFormData(prev => ({ ...prev, Categoria: '' }));
    }
  };

  const toggleLocationMode = () => {
    setIsCustomLocation(!isCustomLocation);
    if (isCustomLocation) {
        // Switching back to select
        if (!locations.includes(formData.Posizione)) {
            setFormData(prev => ({ ...prev, Posizione: locations[0] }));
        }
    } else {
        setFormData(prev => ({ ...prev, Posizione: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {initialItem ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
          </h2>
          <button 
            onClick={onCancel} 
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrizione</label>
            <input
              required
              disabled={isSaving}
              type="text"
              value={formData.Descrizione}
              onChange={e => setFormData({...formData, Descrizione: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              placeholder="Es. Passata di Pomodoro"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantità</label>
              <input
                type="number"
                min="0"
                disabled={isSaving}
                value={qtaInput}
                onChange={e => handleQtaChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scadenza</label>
              <input
                type="date"
                disabled={isSaving}
                value={dateInput}
                onChange={e => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Categoria - Full Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
            <div className="flex gap-2">
              {isCustomCategory ? (
                 <input
                  type="text"
                  required
                  disabled={isSaving}
                  value={formData.Categoria}
                  onChange={e => setFormData({...formData, Categoria: e.target.value})}
                  placeholder="Nuova..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  autoFocus
                />
              ) : (
                <select
                  disabled={isSaving}
                  value={formData.Categoria}
                  onChange={e => setFormData({...formData, Categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              
              <button
                  type="button"
                  disabled={isSaving}
                  onClick={toggleCategoryMode}
                  className="px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition-colors"
                  title={isCustomCategory ? "Scegli da lista" : "Aggiungi Categoria"}
              >
                  {isCustomCategory ? <List size={20} /> : <Plus size={20} />}
              </button>
            </div>
          </div>

          {/* Posizione - Full Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Posizione</label>
            <div className="flex gap-2">
              {isCustomLocation ? (
                 <input
                  type="text"
                  required
                  disabled={isSaving}
                  value={formData.Posizione}
                  onChange={e => setFormData({...formData, Posizione: e.target.value})}
                  placeholder="Nuova..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  autoFocus
                />
              ) : (
                <select
                  disabled={isSaving}
                  value={formData.Posizione}
                  onChange={e => setFormData({...formData, Posizione: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              )}
              
              <button
                  type="button"
                  disabled={isSaving}
                  onClick={toggleLocationMode}
                  className="px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition-colors"
                  title={isCustomLocation ? "Scegli da lista" : "Aggiungi Posizione"}
              >
                  {isCustomLocation ? <List size={20} /> : <Plus size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
            <textarea
              disabled={isSaving}
              value={formData.Note}
              onChange={e => setFormData({...formData, Note: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none h-20 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              placeholder="Dettagli aggiuntivi..."
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Salva
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
