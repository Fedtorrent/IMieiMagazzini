import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InventoryCard } from './components/InventoryCard';
import { EditForm } from './components/EditForm';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { FilterBar } from './components/FilterBar';
import { SetupGuide } from './components/SetupGuide';
import { AppTutorial } from './components/AppTutorial';
import { WelcomeScreen } from './components/WelcomeScreen';
import { InventoryItem, AppView, DEFAULT_LOCATIONS, CATEGORIES } from './types';
import { fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, isApiConfigured, getExpirationStatus } from './services/api';
import {
  loadCachedItems,
  saveCachedItems,
  isCacheStale,
  clearCache,
  getPendingQueue,
  addToPendingQueue,
  clearPendingQueue,
  removeFromPendingQueue,
  getPendingCount,
} from './services/storageService';
import { Home, Plus, BarChart2, Filter, Loader2, WifiOff, RefreshCw } from 'lucide-react';

// Ottimizzazione chunk: Caricamento differito del dashboard statistiche (pesante per via di recharts)
const StatsDashboard = lazy(() => import('./components/StatsDashboard').then(m => ({ default: m.StatsDashboard })));

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  // true = caricamento silenzioso in background (dati dalla cache già visibili)
  const [backgroundSync, setBackgroundSync] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(() => getPendingCount());

  // ─── Rimuove lo splash screen al mount di React ───────────────────────────
  useEffect(() => {
    if (typeof (window as any).__hideSplash === 'function') {
      (window as any).__hideSplash();
    }
  }, []);

  const [view, setView] = useState<AppView>(AppView.LIST);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCompactMode, setIsCompactMode] = useState(() => {
    const isConfigured = isApiConfigured();
    if (!isConfigured) return false;
    const saved = localStorage.getItem('isCompactMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('isCompactMode', JSON.stringify(isCompactMode));
  }, [isCompactMode]);
  
  const [locationFilter, setLocationFilter] = useState<string>('Tutti');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'out_of_stock' | 'expiring' | 'expired'>('all');
  
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemToDuplicate, setItemToDuplicate] = useState<InventoryItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [needsConfig, setNeedsConfig] = useState(!isApiConfigured());
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    const seen = localStorage.getItem('tutorial_seen');
    if (!seen && !showSettings && !showSetupGuide && !needsConfig) {
        const timer = setTimeout(() => setShowTutorial(true), 1500);
        return () => clearTimeout(timer);
    }
  }, [showSettings, showSetupGuide, needsConfig]);

  const handleTutorialClose = () => {
      setShowTutorial(false);
      localStorage.setItem('tutorial_seen', 'true');
  };

  const restartTutorial = () => {
      if (view !== AppView.LIST) setView(AppView.LIST);
      setShowTutorial(true);
  };
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [locationToHide, setLocationToHide] = useState<string | null>(null);
  const [warningConfig, setWarningConfig] = useState<{title: string, message: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const [hiddenLocations, setHiddenLocations] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem('hiddenLocations');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('hiddenLocations', JSON.stringify(hiddenLocations));
  }, [hiddenLocations]);

  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    CATEGORIES.forEach(c => categoriesSet.add(c));
    items.forEach(item => {
        if (item.Categoria) categoriesSet.add(item.Categoria);
    });
    return Array.from(categoriesSet).sort();
  }, [items]);

  const availableLocations = useMemo(() => {
    const locationsSet = new Set<string>();
    DEFAULT_LOCATIONS.forEach(l => locationsSet.add(l));
    items.forEach(item => {
        if (item.Posizione) locationsSet.add(item.Posizione);
    });
    
    const allLocs = Array.from(locationsSet).sort();
    return allLocs.filter(loc => {
        if (hiddenLocations.includes(loc)) {
             const hasItems = items.some(i => i.Posizione === loc);
             return hasItems; 
        }
        return true;
    });
  }, [items, hiddenLocations]);

  useEffect(() => {
    const root = window.document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#059669');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ─── Svuota la pending queue sincronizzando con il server ──────────────────
  const flushPendingQueue = useCallback(async (): Promise<boolean> => {
    const queue = getPendingQueue();
    if (queue.length === 0) return true;

    let allOk = true;
    for (const op of queue) {
      try {
        if (op.action === 'create' && op.item) {
          await addInventoryItem(op.item);
        } else if (op.action === 'update' && op.item) {
          await updateInventoryItem(op.item);
        } else if (op.action === 'delete' && op.itemId) {
          await deleteInventoryItem(op.itemId);
        }
        removeFromPendingQueue(op.id);
      } catch {
        allOk = false;
        // Lascia le operazioni fallite nella coda per il prossimo tentativo
      }
    }
    setPendingCount(getPendingCount());
    return allOk;
  }, []);

  // ─── Caricamento dati (con supporto Local-First) ───────────────────────────
  const loadData = useCallback(async (silent = false) => {
    if (!isApiConfigured()) return;

    // Prima svuota le operazioni pendenti
    await flushPendingQueue();

    if (silent) {
      setBackgroundSync(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchInventory();
      setItems(data);
      saveCachedItems(data);
    } catch (err: any) {
      console.warn('loadData: fetch fallito, uso cache locale', err);
      // In caso di errore di rete, non blocchiamo l'UI se abbiamo già dati in cache
      if (items.length === 0) {
        setError(err.message || "Impossibile caricare i dati.");
      }
    } finally {
      setLoading(false);
      setBackgroundSync(false);
    }
  }, [flushPendingQueue, items.length]);

  // ─── Avvio: carica la cache immediatamente, poi aggiorna dal server ────────
  useEffect(() => {
    if (!isApiConfigured()) return;

    // 1. Carica subito dalla cache locale (UX istantanea)
    const cached = loadCachedItems();
    if (cached.length > 0) {
      setItems(cached);
    }

    // 2. Se la cache è stale (o vuota), aggiorna dal server
    if (isCacheStale() || cached.length === 0) {
      // Se abbiamo già dati in cache, il fetch è silenzioso (background)
      loadData(cached.length > 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Solo al mount — loadData è stabile ma lo escludiamo per evitare loop

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesSearch = item.Descrizione.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.Note.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = locationFilter === 'Tutti' || item.Posizione === locationFilter;
        let matchesStock = true;
        if (stockFilter === 'available') {
          matchesStock = item.Qta > 0;
        } else if (stockFilter === 'out_of_stock') {
          matchesStock = item.Qta === 0;
        } else if (stockFilter === 'expiring') {
          const { isExpiring, isExpired } = getExpirationStatus(item.DataScadenza);
          matchesStock = isExpiring && !isExpired && item.Qta > 0; 
        } else if (stockFilter === 'expired') {
          const { isExpired } = getExpirationStatus(item.DataScadenza);
          matchesStock = isExpired && item.Qta > 0;
        }
        return matchesSearch && matchesLocation && matchesStock;
      })
      .sort((a, b) => a.Descrizione.localeCompare(b.Descrizione, undefined, { sensitivity: 'base' }));
  }, [items, searchTerm, locationFilter, stockFilter]);

  // ─── Modifica quantità con ottimistic update + fallback a queue ───────────
  const handleQuantityChange = async (id: string, delta: number) => {
    const targetItem = items.find(i => i.IdLista === id);
    if (!targetItem) return;

    const newQta = Math.max(0, targetItem.Qta + delta);
    const updatedItem = { ...targetItem, Qta: newQta };

    // Ottimistic update immediato
    const newItems = items.map(item => item.IdLista === id ? updatedItem : item);
    setItems(newItems);
    saveCachedItems(newItems);

    try {
      await updateInventoryItem(updatedItem);
    } catch {
      // Se offline → aggiungi alla coda (mantieni l'ottimistic update)
      addToPendingQueue('update', updatedItem);
      setPendingCount(getPendingCount());
    }
  };

  const handleDeleteRequest = (id: string) => {
    setItemToDelete(id);
  };

  // ─── Eliminazione con ottimistic update + fallback a queue ────────────────
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const id = itemToDelete;

    // Ottimistic delete immediato
    const newItems = items.filter(item => item.IdLista !== id);
    setItems(newItems);
    saveCachedItems(newItems);
    setItemToDelete(null);

    try {
      await deleteInventoryItem(id);
    } catch {
      // Se offline → aggiungi alla coda
      addToPendingQueue('delete', undefined, id);
      setPendingCount(getPendingCount());
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (item: InventoryItem) => {
    const newItem: InventoryItem = {
      ...item,
      IdLista: Math.random().toString(36).substr(2, 9),
      Descrizione: `${item.Descrizione} (Copia)`,
    };
    setItemToDuplicate(newItem);
    setIsAdding(true);
  };

  // ─── Salvataggio (create/update) con ottimistic update + queue ────────────
  const handleSaveItem = async (item: InventoryItem) => {
    if (editingItem) {
      // UPDATE: ottimistic
      const newItems = items.map(i => i.IdLista === item.IdLista ? item : i);
      setItems(newItems);
      saveCachedItems(newItems);
      setEditingItem(null);

      try {
        await updateInventoryItem(item);
      } catch {
        addToPendingQueue('update', item);
        setPendingCount(getPendingCount());
      }
    } else {
      // CREATE: ottimistic
      const newItems = [item, ...items];
      setItems(newItems);
      saveCachedItems(newItems);
      setSearchTerm('');
      setLocationFilter('Tutti');
      setStockFilter('all');
      setIsAdding(false);
      setItemToDuplicate(null);

      try {
        await addInventoryItem(item);
      } catch {
        addToPendingQueue('create', item);
        setPendingCount(getPendingCount());
      }
    }
  };

  const handleConfigSave = () => {
    setNeedsConfig(false);
    setShowSettings(false);
    loadData(false);
  };

  // ─── Disconnect: pulisce tutto ─────────────────────────────────────────────
  const handleDisconnect = () => {
    localStorage.removeItem('GSHEET_API_URL');
    clearCache();
    clearPendingQueue();
    setItems([]);
    setPendingCount(0);
    setNeedsConfig(true);
    setShowDisconnectConfirm(false);
    setIsSidebarOpen(false);
  };

  const handleHomeClick = () => {
    setView(AppView.LIST);
    setSearchTerm('');
    setLocationFilter('Tutti');
    setStockFilter('all');
  };

  const handleAddClick = () => {
     if (needsConfig) {
         setShowSettings(true);
     } else {
         setIsAdding(true);
     }
  };

  const handleHideLocation = (loc: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const count = items.filter(i => i.Posizione === loc).length;
    if (count > 0) {
        setWarningConfig({
            title: "Impossibile eliminare",
            message: `Impossibile eliminare "${loc}".\nCi sono ${count} prodotti associati.`
        });
        return;
    }
    setLocationToHide(loc);
  };

  const confirmHideLocation = () => {
    if (locationToHide) {
        setHiddenLocations(prev => [...prev, locationToHide]);
        if (locationFilter === locationToHide) {
            setLocationFilter('Tutti');
        }
        setLocationToHide(null);
    }
  };

  const handleRestoreLocation = (loc: string) => {
      setHiddenLocations(prev => prev.filter(l => l !== loc));
  };

  const toggleStockFilter = (type: 'available' | 'out_of_stock' | 'expiring' | 'expired') => {
      if (stockFilter === type) {
          setStockFilter('all');
      } else {
          setStockFilter(type);
      }
  };

  const resetFilters = () => {
      setLocationFilter('Tutti');
      setStockFilter('all');
  };

  // Forza sync manuale (dal SettingsModal)
  const handleForceSync = useCallback(async () => {
    await flushPendingQueue();
    await loadData(false);
  }, [flushPendingQueue, loadData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-24 font-sans transition-colors duration-200">
      <Header 
        onSearch={setSearchTerm} 
        searchTerm={searchTerm} 
        onOpenSettings={() => setIsSidebarOpen(true)}
        onRefresh={() => loadData(false)}
        loading={loading}
        isCompactMode={isCompactMode}
        onToggleCompactMode={() => setIsCompactMode(!isCompactMode)}
        pendingCount={pendingCount}
      />

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenCloudSettings={() => setShowSettings(true)}
        onOpenSetupGuide={() => setShowSetupGuide(true)}
        onDisconnectRequest={() => setShowDisconnectConfirm(true)}
        isConfigured={!needsConfig}
        currentTheme={theme}
        onToggleTheme={setTheme}
        hiddenLocations={hiddenLocations}
        onRestoreLocation={handleRestoreLocation}
        onRestartTutorial={restartTutorial}
      />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {needsConfig ? (
          <WelcomeScreen 
            onOpenSettings={() => setShowSettings(true)}
            onOpenGuide={() => setShowSetupGuide(true)}
          />
        ) : (
          <>
            {/* Banner errore di rete (non bloccante se abbiamo dati in cache) */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-start gap-3 animate-fade-in-up">
                 <WifiOff size={24} className="mt-1 shrink-0" />
                 <div className="flex-1">
                   <p className="font-bold">Errore di Comunicazione</p>
                   <p className="text-sm mt-1 opacity-80">{error}</p>
                   {items.length > 0 && (
                     <p className="text-xs mt-2 opacity-60">Stai visualizzando i dati salvati in locale.</p>
                   )}
                 </div>
                 <button onClick={() => loadData(false)} className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors">
                   Riprova
                 </button>
              </div>
            )}

            {/* Banner sync in background */}
            {backgroundSync && (
              <div className="mb-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 animate-pulse px-1">
                <RefreshCw size={12} className="animate-spin" />
                <span>Sincronizzazione in corso...</span>
              </div>
            )}

            {view === AppView.LIST && (
              <>
                <div className="mb-2 px-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {stockFilter === 'all' && "Tutti i Prodotti"}
                  {stockFilter === 'available' && "Prodotti Esistenti"}
                  {stockFilter === 'out_of_stock' && "Prodotti Esauriti"}
                  {stockFilter === 'expiring' && "Prodotti in Scadenza"}
                  {stockFilter === 'expired' && "Prodotti Scaduti"}
                </div>
                <FilterBar
                    locationFilter={locationFilter}
                    stockFilter={stockFilter}
                    availableLocations={availableLocations}
                    onLocationSelect={setLocationFilter}
                    onStockFilterToggle={toggleStockFilter}
                    onResetFilters={resetFilters}
                    onHideLocation={handleHideLocation}
                />
              </>
            )}

            {/* Caricamento iniziale (solo se cache vuota) */}
            {loading && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-emerald-600 dark:text-emerald-400">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-medium">Sincronizzazione dati...</p>
              </div>
            ) : view === AppView.LIST ? (
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 inline-block max-w-md w-full">
                        <Filter size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Nessun prodotto trovato</h3>
                        {searchTerm || locationFilter !== 'Tutti' || stockFilter !== 'all' ? (
                             <>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Nessun risultato per i filtri attuali.
                                </p>
                                <button onClick={resetFilters} className="mt-2 text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                                    Resetta Filtri
                                </button>
                             </>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">La lista è vuota. Aggiungi il primo prodotto!</p>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${isCompactMode ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-2'}`}>
                    {filteredItems.map(item => (
                      <InventoryCard
                        key={item.IdLista}
                        item={item}
                        onDelete={handleDeleteRequest}
                        onEdit={setEditingItem}
                        onCopy={handleCopy}
                        onQuantityChange={handleQuantityChange}
                        isCompact={isCompactMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>}>
                <StatsDashboard items={items} />
              </Suspense>
            )}
          </>
        )}
      </main>

      {!needsConfig && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 py-3 px-6 z-40 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-200">
          <div className="max-w-3xl mx-auto flex justify-around items-center">
            <button 
              id="tour-home-btn"
              onClick={handleHomeClick}
              className={`flex flex-col items-center gap-1 transition-colors ${view === AppView.LIST ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Home size={24} />
              <span className="text-[10px] font-medium uppercase tracking-wide">Home</span>
            </button>
            
            <button 
              id="tour-add-btn"
              onClick={handleAddClick}
              disabled={isCompactMode}
              className={`flex flex-col items-center gap-1 -mt-8 group ${isCompactMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-gray-50 dark:border-gray-900 group-active:scale-95 transition-transform ${isCompactMode ? 'bg-gray-400 dark:bg-gray-600' : 'bg-emerald-500 dark:bg-emerald-600'}`}>
                <Plus size={28} />
              </div>
            </button>

            <button 
              id="tour-stats-btn"
              onClick={() => setView(AppView.STATS)}
              className={`flex flex-col items-center gap-1 transition-colors ${view === AppView.STATS ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <BarChart2 size={24} />
              <span className="text-[10px] font-medium uppercase tracking-wide">Stats</span>
            </button>
          </div>
        </nav>
      )}

      {showSettings && (
        <SettingsModal 
          currentUrl={localStorage.getItem('GSHEET_API_URL')}
          onSave={handleConfigSave}
          onCancel={() => setShowSettings(false)}
          onOpenSetupGuide={() => setShowSetupGuide(true)}
          onForceSync={handleForceSync}
        />
      )}
      
      {(isAdding || editingItem) && !needsConfig && (
        <EditForm 
          initialItem={editingItem || itemToDuplicate || undefined}
          onCancel={() => { 
            setIsAdding(false); 
            setEditingItem(null); 
            setItemToDuplicate(null);
          }}
          onSave={handleSaveItem}
          isSaving={false}
          availableCategories={availableCategories}
          availableLocations={availableLocations}
        />
      )}

      {!!itemToDelete && (
        <ConfirmationModal 
          isOpen={true}
          title="Elimina Prodotto"
          message="Sei sicuro di voler eliminare definitivamente questo prodotto? L'azione non può essere annullata."
          onConfirm={confirmDelete}
          onCancel={() => setItemToDelete(null)}
          isProcessing={isDeleting}
        />
      )}

      {showDisconnectConfirm && (
        <ConfirmationModal 
          isOpen={true}
          title="Scollega Database"
          message="Vuoi scollegare il database attuale? Dovrai inserire nuovamente l'URL per accedere ai tuoi dati."
          onConfirm={handleDisconnect}
          onCancel={() => setShowDisconnectConfirm(false)}
          confirmText="Scollega"
        />
      )}

      {!!locationToHide && (
        <ConfirmationModal 
          isOpen={true}
          title="Nascondi Posizione"
          message={`Vuoi nascondere la posizione "${locationToHide}"? Potrai ripristinarla dalle impostazioni.`}
          onConfirm={confirmHideLocation}
          onCancel={() => setLocationToHide(null)}
          confirmText="Nascondi"
        />
      )}

      {!!warningConfig && (
        <ConfirmationModal 
          isOpen={true}
          title={warningConfig.title || ''}
          message={warningConfig.message || ''}
          onConfirm={() => setWarningConfig(null)}
          confirmText="Ho capito"
        />
      )}

      {showSetupGuide && (
        <SetupGuide 
          isOpen={true} 
          onClose={() => setShowSetupGuide(false)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {showTutorial && (
        <AppTutorial 
          isOpen={true}
          onClose={handleTutorialClose}
        />
      )}
    </div>
  );
}