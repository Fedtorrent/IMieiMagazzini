import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InventoryCard } from './components/InventoryCard';
import { EditForm } from './components/EditForm';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { FilterBar } from './components/FilterBar';
import { AppTutorial } from './components/AppTutorial';
import { WelcomeScreen } from './components/WelcomeScreen';
import { UpdateLogModal } from './components/UpdateLogModal';
import { InventoryItem, AppView, DEFAULT_LOCATIONS, CATEGORIES } from './types';
import {
  fetchInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  isApiConfigured,
  getExpirationStatus,
  clearLocationInventory,
  truncateInventory,
  clearFamilyCode,
  getFamilyCode
} from './services/api';
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
import { Home, Plus, BarChart2, Filter, Loader2, WifiOff, RefreshCw, RotateCcw } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { Network } from '@capacitor/network';

const StatsDashboard = lazy(() => import('./components/StatsDashboard').then(m => ({ default: m.StatsDashboard })));

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [backgroundSync, setBackgroundSync] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(() => getPendingCount());

  useEffect(() => {
    if (typeof (window as any).__hideSplash === 'function') {
      (window as any).__hideSplash();
    }
  }, []);

  const [view, setView] = useState<AppView>(AppView.LIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCompactMode, setIsCompactMode] = useState(() => {
    const saved = localStorage.getItem('isCompactMode');
    return saved !== null ? JSON.parse(saved) : false; // Default a false per avere le schede
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
  const [settingsMode, setSettingsMode] = useState<'create' | 'join'>('join');
  const [needsConfig, setNeedsConfig] = useState(() => !isApiConfigured());
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showUpdateLog, setShowUpdateLog] = useState(false);

  // Controllo versione per apertura automatica Log Aggiornamenti
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const info = await CapApp.getInfo();
        const currentVersion = info.version; // Prende il versionName dal build.gradle
        const lastSeenVersion = localStorage.getItem('last_seen_version');

        if (lastSeenVersion !== currentVersion && !needsConfig) {
          const timer = setTimeout(() => {
            setShowUpdateLog(true);
            localStorage.setItem('last_seen_version', currentVersion);
          }, 2500);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.error("Impossibile recuperare info versione nativa", e);
      }
    };

    checkVersion();
  }, [needsConfig]);

  // Trigger Tutorial Automatico
  useEffect(() => {
    const seen = localStorage.getItem('tutorial_seen');
    if (!seen && !showSettings && !needsConfig) {
        const timer = setTimeout(() => setShowTutorial(true), 1500);
        return () => clearTimeout(timer);
    }
  }, [showSettings, needsConfig]);

  const restartTutorial = () => {
      setView(AppView.LIST);
      setIsSidebarOpen(false);
      setShowTutorial(true);
  };

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [locationToHide, setLocationToHide] = useState<string | null>(null);
  const [warningConfig, setWarningConfig] = useState<{title: string, message: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [showTotalResetConfirm, setShowTotalResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showInventoryClearConfirm, setShowInventoryClearConfirm] = useState(false);
  const [showInventoryClearModal, setShowInventoryClearModal] = useState(false);
  const [isClearingInventory, setIsClearingInventory] = useState(false);
  const [inventoryAttempt, setInventoryAttempt] = useState(0);

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
             return items.some(i => i.Posizione === loc);
        }
        return true;
    });
  }, [items, hiddenLocations]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const flushPendingQueue = useCallback(async (): Promise<boolean> => {
    const queue = getPendingQueue();
    if (queue.length === 0) {
      setPendingCount(0);
      return true;
    }

    let allOk = true;
    for (const op of queue) {
      try {
        if (op.action === 'create' && op.item) await addInventoryItem(op.item);
        else if (op.action === 'update' && op.item) await updateInventoryItem(op.item);
        else if (op.action === 'delete' && op.itemId) await deleteInventoryItem(op.itemId);
        removeFromPendingQueue(op.id);
      } catch {
        allOk = false;
        break;
      }
    }

    setPendingCount(getPendingCount());
    return allOk;
  }, []);

  const loadData = useCallback(async (silent = false) => {
    if (!isApiConfigured()) return;

    // Svuota la coda prima di caricare
    await flushPendingQueue();

    if (silent) setBackgroundSync(true);
    else setLoading(true);

    setError(null);

    try {
      const data = await fetchInventory();
      setItems(data || []);
      saveCachedItems(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Errore caricamento:", err);
      setError(err.message || "Errore di connessione al database.");
    } finally {
      setLoading(false);
      setBackgroundSync(false);
    }
  }, [flushPendingQueue]);

  // Caricamento Iniziale + Sensore Rete Nativo (Capacitor)
  useEffect(() => {
    if (needsConfig) return;

    const cached = loadCachedItems();
    if (cached.length > 0) setItems(cached);

    if (isCacheStale() || cached.length === 0) {
        loadData(cached.length > 0);
    }

    // Gestore per la sincronizzazione automatica quando torna la rete
    const handleNetworkChange = async (status: any) => {
      if (status.connected) {
        console.log("Monitor Rete: Dispositivo ONLINE. Avvio sincronizzazione...");
        const success = await flushPendingQueue();
        if (success) {
           // Sincronizzazione silenziosa dei dati dopo il ritorno online
           const data = await fetchInventory();
           if (data) {
             setItems(data);
             saveCachedItems(data);
           }
        }
      } else {
        console.log("Monitor Rete: Dispositivo OFFLINE.");
      }
    };

    // Attivazione sensore nativo Android
    const setupListener = Network.addListener('networkStatusChange', handleNetworkChange);

    return () => {
      setupListener.then(l => l.remove());
    };
  }, [needsConfig, flushPendingQueue, loadData]);

  const handleManualSync = useCallback(async () => {
    await flushPendingQueue();
    await loadData(false);
  }, [flushPendingQueue, loadData]);

  const handleConfigSave = () => {
    setNeedsConfig(false);
    setShowSettings(false);
  };

  const handleDisconnect = () => {
    clearFamilyCode();
    clearCache();
    clearPendingQueue();
    setItems([]);
    setPendingCount(0);
    setNeedsConfig(true);
    setShowDisconnectConfirm(false);
    setIsSidebarOpen(false);
  };

  const handleInventoryClear = async (location: string) => {
    setIsClearingInventory(true);
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    let lastError = "";

    while (attempts < maxAttempts && !success) {
      attempts++;
      setInventoryAttempt(attempts);
      try {
        await clearLocationInventory(location);
        await loadData(true);
        const cached = loadCachedItems();
        const stillGreater = cached.filter(i => i.Posizione === location && i.Qta > 0);
        if (stillGreater.length === 0) success = true;
        else {
            lastError = "Sincronizzazione incompleta.";
            if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 1500));
        }
      } catch (err: any) {
          lastError = err.message || "Errore di connessione.";
          if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 1500));
      }
    }

    if (success) {
      setShowInventoryClearModal(false);
      setIsSidebarOpen(false);
      setView(AppView.LIST);
      setWarningConfig({ title: "Completato", message: `Magazzino "${location}" azzerato.` });
    } else {
      await loadData(false);
      setWarningConfig({ title: "Errore", message: lastError });
    }
    setIsClearingInventory(false);
  };

  const handleTotalReset = async () => {
    setIsResetting(true);
    try {
      await truncateInventory();
      handleDisconnect();
      setShowTotalResetConfirm(false);
    } catch (err: any) {
      setWarningConfig({ title: "Errore Reset", message: "Impossibile svuotare il database remoto." });
    } finally {
      setIsResetting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        // Protezione contro valori null o undefined che causano crash
        const descrizione = item.Descrizione || '';
        const note = item.Note || '';
        const search = searchTerm.toLowerCase();

        const matchesSearch = descrizione.toLowerCase().includes(search) ||
                              note.toLowerCase().includes(search);

        const matchesLocation = locationFilter === 'Tutti' || item.Posizione === locationFilter;
        let matchesStock = true;
        if (stockFilter === 'available') matchesStock = item.Qta > 0;
        else if (stockFilter === 'out_of_stock') matchesStock = item.Qta === 0;
        else if (stockFilter === 'expiring') {
          const { isExpiring, isExpired } = getExpirationStatus(item.DataScadenza);
          matchesStock = isExpiring && !isExpired && item.Qta > 0;
        } else if (stockFilter === 'expired') {
          const { isExpired } = getExpirationStatus(item.DataScadenza);
          matchesStock = isExpired && item.Qta > 0;
        }
        return matchesSearch && matchesLocation && matchesStock;
      })
      .sort((a, b) => (a.Descrizione || '').localeCompare(b.Descrizione || ''));
  }, [items, searchTerm, locationFilter, stockFilter]);

  if (needsConfig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <WelcomeScreen
          onOpenSettings={(mode) => {
            setSettingsMode(mode || 'join');
            setShowSettings(true);
          }}
        />
        {showSettings && (
          <SettingsModal
            onSave={handleConfigSave}
            onCancel={() => setShowSettings(false)}
            onForceSync={handleManualSync}
            initialMode={settingsMode}
          />
        )}
      </div>
    );
  }

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
        onDisconnectRequest={() => setShowDisconnectConfirm(true)}
        isConfigured={true}
        currentTheme={theme}
        onToggleTheme={setTheme}
        hiddenLocations={hiddenLocations}
        onRestoreLocation={(loc) => setHiddenLocations(prev => prev.filter(l => l !== loc))}
        onRestartTutorial={restartTutorial}
        onTotalResetRequest={() => setShowTotalResetConfirm(true)}
        onInventoryClearRequest={() => {
          setIsSidebarOpen(false);
          setShowInventoryClearConfirm(true);
        }}
        onOpenUpdateLog={() => setShowUpdateLog(true)}
      />

      <main className="max-w-3xl mx-auto px-4 py-6">
          <>
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-start gap-3">
                 <WifiOff size={24} className="mt-1 shrink-0" />
                 <div className="flex-1">
                   <p className="font-bold text-sm uppercase tracking-wider">Errore Database</p>
                   <p className="text-xs mt-1 opacity-80">{error}</p>
                 </div>
                 <button onClick={() => loadData(false)} className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 px-3 py-1 rounded-lg text-xs font-black uppercase hover:bg-red-50 transition-colors">
                   Riprova
                 </button>
              </div>
            )}

            {backgroundSync && (
              <div className="mb-4 flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 animate-pulse px-1 font-black uppercase tracking-widest">
                <RefreshCw size={12} className="animate-spin" />
                <span>Sincronizzazione Cloud...</span>
              </div>
            )}

            {view === AppView.LIST && (
                <FilterBar
                    locationFilter={locationFilter}
                    stockFilter={stockFilter}
                    availableLocations={availableLocations}
                    onLocationSelect={setLocationFilter}
                    onStockFilterToggle={(type) => setStockFilter(stockFilter === type ? 'all' : type)}
                    onResetFilters={() => { setLocationFilter('Tutti'); setStockFilter('all'); }}
                    onHideLocation={(loc) => setLocationToHide(loc)}
                />
            )}

            {loading && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-black uppercase tracking-[0.2em] text-[10px]">Accesso al Magazzino...</p>
              </div>
            ) : view === AppView.LIST ? (
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 inline-block max-w-md w-full">
                        <Filter size={48} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
                        <h3 className="text-lg font-black text-gray-800 dark:text-white mb-2 uppercase tracking-tight">Nessun prodotto</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-bold">La lista è vuota.</p>
                        <button onClick={() => { setLocationFilter('Tutti'); setStockFilter('all'); setSearchTerm(''); }} className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] hover:underline">Resetta Filtri</button>
                    </div>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${isCompactMode ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                    {filteredItems.map(item => (
                      <InventoryCard
                        key={item.IdLista}
                        item={item}
                        onDelete={setItemToDelete}
                        onEdit={setEditingItem}
                        onCopy={(item) => {
                          const newItem = { ...item, IdLista: Math.random().toString(36).substr(2, 9), Descrizione: `${item.Descrizione} (Copia)` };
                          setItemToDuplicate(newItem);
                          setIsAdding(true);
                        }}
                        onQuantityChange={async (id, delta) => {
                          const target = items.find(i => i.IdLista === id);
                          if (!target) return;
                          const updated = { ...target, Qta: Math.max(0, target.Qta + delta) };
                          setItems(items.map(i => i.IdLista === id ? updated : i));
                          try {
                            await updateInventoryItem(updated);
                            // Se riesce, prova a svuotare anche il resto della coda
                            flushPendingQueue();
                          } catch {
                            addToPendingQueue('update', updated);
                            setPendingCount(getPendingCount());
                          }
                        }}
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
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 py-4 px-8 z-40 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-2xl">
        <div className="max-w-3xl mx-auto flex justify-around items-center">
          <button id="tour-home-btn" onClick={() => { setView(AppView.LIST); setSearchTerm(''); }} className={`flex flex-col items-center gap-1 ${view === AppView.LIST ? 'text-emerald-600' : 'text-gray-400'}`}>
            <Home size={24} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </button>
          <button id="tour-add-btn" onClick={() => setIsAdding(true)} className={`-mt-12 w-16 h-16 rounded-full shadow-2xl shadow-emerald-500/20 flex items-center justify-center text-white border-8 border-gray-50 dark:border-gray-900 transition-all active:scale-90 bg-emerald-500 hover:bg-emerald-600`}>
            <Plus size={32} strokeWidth={3} />
          </button>
          <button id="tour-stats-btn" onClick={() => setView(AppView.STATS)} className={`flex flex-col items-center gap-1 ${view === AppView.STATS ? 'text-emerald-600' : 'text-gray-400'}`}>
            <BarChart2 size={24} />
            <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
          </button>
        </div>
      </nav>

      {showSettings && (
        <SettingsModal 
          onSave={handleConfigSave}
          onCancel={() => setShowSettings(false)}
          onForceSync={handleManualSync}
        />
      )}
      
      {(isAdding || editingItem) && (
        <EditForm 
          initialItem={editingItem || itemToDuplicate || undefined}
          onCancel={() => { setIsAdding(false); setEditingItem(null); setItemToDuplicate(null); }}
          onSave={async (item) => {
             if (editingItem) {
                setItems(items.map(i => i.IdLista === item.IdLista ? item : i));
                setEditingItem(null);
                try {
                  await updateInventoryItem(item);
                  flushPendingQueue();
                } catch {
                  addToPendingQueue('update', item);
                  setPendingCount(getPendingCount());
                }
             } else {
                const itemWithFamily = { ...item, IdFamiglia: getFamilyCode() || '' };
                setItems([itemWithFamily, ...items]);
                setIsAdding(false);
                setItemToDuplicate(null);
                try {
                  await addInventoryItem(itemWithFamily);
                  flushPendingQueue();
                } catch {
                  addToPendingQueue('create', itemWithFamily);
                  setPendingCount(getPendingCount());
                }
             }
          }}
          isSaving={false}
          availableCategories={availableCategories}
          availableLocations={availableLocations}
        />
      )}

      {!!itemToDelete && (
        <ConfirmationModal 
          isOpen={true}
          title="Elimina"
          message="Sei sicuro?"
          onConfirm={async () => {
             const id = itemToDelete;
             setItems(items.filter(i => i.IdLista !== id));
             setItemToDelete(null);
             try {
               await deleteInventoryItem(id);
               flushPendingQueue();
             } catch {
               addToPendingQueue('delete', undefined, id);
               setPendingCount(getPendingCount());
             }
          }}
          onCancel={() => setItemToDelete(null)}
          isProcessing={isDeleting}
        />
      )}

      {showDisconnectConfirm && (
        <ConfirmationModal 
          isOpen={true}
          title="Esci"
          message="Scollegare il codice?"
          onConfirm={handleDisconnect}
          onCancel={() => setShowDisconnectConfirm(false)}
          confirmText="Esci"
        />
      )}

      {!!locationToHide && (
        <ConfirmationModal 
          isOpen={true}
          title="Nascondi"
          message={`Nascondere "${locationToHide}"?`}
          onConfirm={() => { setHiddenLocations(prev => [...prev, locationToHide!]); setLocationToHide(null); }}
          onCancel={() => setLocationToHide(null)}
        />
      )}

      {!!warningConfig && (
        <ConfirmationModal 
          isOpen={true}
          title={warningConfig.title}
          message={warningConfig.message}
          onConfirm={() => setWarningConfig(null)}
          confirmText="OK"
        />
      )}

      {showTutorial && (
        <AppTutorial 
          isOpen={true}
          onClose={() => { setShowTutorial(false); localStorage.setItem('tutorial_seen', 'true'); }}
        />
      )}

      {showUpdateLog && (
        <UpdateLogModal
          isOpen={true}
          onClose={() => setShowUpdateLog(false)}
        />
      )}

      {showTotalResetConfirm && (
        <ConfirmationModal
          isOpen={true}
          title="RESET TOTALE"
          message="ATTENZIONE: Questa azione eliminerà TUTTI i prodotti della tua famiglia dal database. Non potrai tornare indietro. Procediamo?"
          onConfirm={handleTotalReset}
          onCancel={() => setShowTotalResetConfirm(false)}
          isProcessing={isResetting}
          confirmText="Sì, Reset Totale"
        />
      )}

      {showInventoryClearConfirm && (
        <ConfirmationModal
          isOpen={true}
          title="Azzera Quantità"
          message="Questo comando azzera tutte le quantità dei prodotti nel magazzino scelto per facilitare l'inventario dei prodotti esistenti. Procediamo?"
          onConfirm={() => {
            setShowInventoryClearConfirm(false);
            setShowInventoryClearModal(true);
          }}
          onCancel={() => setShowInventoryClearConfirm(false)}
          confirmText="Procedi"
          cancelText="Annulla"
        />
      )}

      {showInventoryClearModal && !isClearingInventory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Seleziona Magazzino</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quale magazzino vuoi azzerare?</p>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
               {availableLocations.map(loc => (
                 <button
                    key={loc}
                    onClick={() => handleInventoryClear(loc)}
                    className="w-full text-left p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl flex items-center justify-between group transition-colors"
                 >
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{loc}</span>
                    <RotateCcw size={18} className="text-gray-400 group-hover:text-emerald-500" />
                 </button>
               ))}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 flex gap-3">
              <button
                onClick={() => setShowInventoryClearModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {(isClearingInventory || isResetting) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] shadow-2xl flex flex-col items-center max-w-xs w-full animate-in zoom-in-95 duration-300">
                <Loader2 size={64} className="animate-spin text-emerald-500 mb-8" />
                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2 uppercase tracking-tighter">Sincronizzazione</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed">Aggiornamento in corso...</p>
            </div>
        </div>
      )}
    </div>
  );
}