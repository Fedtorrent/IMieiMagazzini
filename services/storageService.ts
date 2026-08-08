import { InventoryItem } from '../types';

// ─── Chiavi localStorage ────────────────────────────────────────────────────
const CACHE_KEY           = 'magazzino_items_cache';
const CACHE_TIMESTAMP_KEY = 'magazzino_cache_ts';
const PENDING_QUEUE_KEY   = 'magazzino_pending_queue';

/** Durata massima della cache prima di considerarla stale (5 minuti) */
const CACHE_TTL_MS = 5 * 60 * 1000;

// ─── Tipi ───────────────────────────────────────────────────────────────────
export interface PendingOp {
  id: string;                            // UUID univoco dell'operazione
  action: 'create' | 'update' | 'delete';
  item?: InventoryItem;                  // Per create/update
  itemId?: string;                       // Per delete
  timestamp: number;                     // Epoch ms
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateOpId = (): string =>
  `op-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

// ─── Cache ───────────────────────────────────────────────────────────────────

/** Legge gli item dalla cache locale. Ritorna [] se la cache è vuota o corrotta. */
export const loadCachedItems = (): InventoryItem[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InventoryItem[];
  } catch {
    return [];
  }
};

/** Salva gli item nella cache locale e aggiorna il timestamp. */
export const saveCachedItems = (items: InventoryItem[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
  } catch (e) {
    console.warn('storageService: impossibile salvare cache', e);
  }
};

/** Ritorna true se la cache è assente o più vecchia di CACHE_TTL_MS. */
export const isCacheStale = (): boolean => {
  const ts = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!ts) return true;
  return Date.now() - Number(ts) > CACHE_TTL_MS;
};

/** Ritorna il timestamp dell'ultima sincronizzazione in formato leggibile. */
export const getLastSyncLabel = (): string => {
  const ts = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!ts) return 'Mai';
  return new Date(Number(ts)).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Svuota la cache locale (utile per forzare un re-fetch). */
export const clearCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
};

// ─── Pending Queue ────────────────────────────────────────────────────────────

/** Legge la pending queue. Ritorna [] se vuota o corrotta. */
export const getPendingQueue = (): PendingOp[] => {
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PendingOp[];
  } catch {
    return [];
  }
};

/** Aggiunge un'operazione alla pending queue. */
export const addToPendingQueue = (
  action: 'create' | 'update' | 'delete',
  item?: InventoryItem,
  itemId?: string
): void => {
  const queue = getPendingQueue();
  const op: PendingOp = {
    id: generateOpId(),
    action,
    timestamp: Date.now(),
    ...(item   ? { item }   : {}),
    ...(itemId ? { itemId } : {}),
  };
  queue.push(op);
  try {
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('storageService: impossibile salvare pending queue', e);
  }
};

/** Svuota completamente la pending queue (dopo sync riuscita). */
export const clearPendingQueue = (): void => {
  localStorage.removeItem(PENDING_QUEUE_KEY);
};

/** Rimuove le operazioni già sincronizzate lasciando quelle fallite. */
export const removeFromPendingQueue = (opId: string): void => {
  const queue = getPendingQueue().filter(op => op.id !== opId);
  localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
};

/** Numero di operazioni in attesa (usato per il badge nell'header). */
export const getPendingCount = (): number => getPendingQueue().length;
