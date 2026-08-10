
import { createClient } from '@supabase/supabase-js';
import { InventoryItem } from '../types';

// CREDENZIALI SUPABASE
const SUPABASE_URL = 'https://tueuodqqkmplntykovze.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZXVvZHFxa21wbG50eWtvdnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTg5NDUsImV4cCI6MjEwMTkzNDk0NX0.-umkINKCi-24qi6Yf7i3vdfXkoWI0ycQlQenf5T-aok';

// Inizializzazione del client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper per gestire il Codice Familiare nel localStorage
export const getFamilyCode = () => localStorage.getItem('FAMILY_CODE');
export const setFamilyCode = (code: string) => localStorage.setItem('FAMILY_CODE', code.trim().toUpperCase());
export const clearFamilyCode = () => localStorage.removeItem('FAMILY_CODE');

// L'app è configurata se esiste un codice familiare salvato
export const isApiConfigured = () => !!getFamilyCode();

// Nomi Tabelle e Colonne (Allineati alla tua struttura)
const TBL = {
    PRODOTTI: 'Prodotti',
    FAMIGLIE: 'Famiglie'
};

const COL = {
    FAMIGLIA_IN_PRODOTTI: 'IdFamiglia',
    FAMIGLIA_IN_FAMIGLIE: 'IdFamiglie' // Con la E finale come da tua indicazione
};

// Conversione data da GG/MM/AAAA (App) a AAAA-MM-GG (Supabase)
const toDbDate = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('/')) return null;
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m}-${d}`;
};

// Conversione data da AAAA-MM-GG (Supabase) a GG/MM/AAAA (App)
const fromDbDate = (dateStr: any) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
};

// Helper centralizzato per calcolare lo stato della scadenza
export const getExpirationStatus = (dateString: string) => {
  let isExpired = false;
  let isExpiring = false;
  let diffDays = null;

  if (dateString) {
    try {
      const parts = dateString.split(/[\/\-]/);
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const expDate = new Date(Number(year), Number(month) - 1, Number(day));
        
        if (!isNaN(expDate.getTime())) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const diffTime = expDate.getTime() - today.getTime();
          diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) isExpired = true;
          else if (diffDays <= 30) isExpiring = true;
        }
      }
    } catch (e) {}
  }

  return { isExpired, isExpiring, diffDays };
};

export const fetchInventory = async (): Promise<InventoryItem[]> => {
  const familyCode = getFamilyCode();
  if (!familyCode) return [];

  const { data, error } = await supabase
    .from(TBL.PRODOTTI)
    .select('*')
    .eq(COL.FAMIGLIA_IN_PRODOTTI, familyCode)
    .order('Descrizione', { ascending: true });

  if (error) {
    console.error("Supabase Fetch Error:", error);
    throw new Error(error.message);
  }

  return (data || []).map((item: any) => ({
      ...item,
      DataScadenza: fromDbDate(item.DataScadenza)
  })) as InventoryItem[];
};

export const addInventoryItem = async (item: InventoryItem): Promise<any> => {
  const familyCode = getFamilyCode();
  if (!familyCode) throw new Error("Codice familiare non impostato");

  const dbItem = {
      ...item,
      [COL.FAMIGLIA_IN_PRODOTTI]: familyCode,
      DataScadenza: toDbDate(item.DataScadenza)
  };

  const { data, error } = await supabase
    .from(TBL.PRODOTTI)
    .insert([dbItem]);

  if (error) throw new Error(error.message);
  return { status: 'success', data };
};

export const updateInventoryItem = async (item: InventoryItem): Promise<any> => {
  const familyCode = getFamilyCode();
  if (!familyCode) throw new Error("Codice familiare non impostato");

  const dbItem = {
      ...item,
      DataScadenza: toDbDate(item.DataScadenza)
  };

  const { error } = await supabase
    .from(TBL.PRODOTTI)
    .update(dbItem)
    .eq('IdLista', item.IdLista)
    .eq(COL.FAMIGLIA_IN_PRODOTTI, familyCode);

  if (error) throw new Error(error.message);
  return { status: 'success' };
};

export const deleteInventoryItem = async (id: string): Promise<any> => {
  const familyCode = getFamilyCode();
  if (!familyCode) throw new Error("Codice familiare non impostato");

  const { error } = await supabase
    .from(TBL.PRODOTTI)
    .delete()
    .eq('IdLista', id)
    .eq(COL.FAMIGLIA_IN_PRODOTTI, familyCode);

  if (error) throw new Error(error.message);
  return { status: 'success' };
};

export const clearLocationInventory = async (location: string): Promise<any> => {
    const familyCode = getFamilyCode();
    if (!familyCode) throw new Error("Codice familiare non impostato");

    const { error } = await supabase
        .from(TBL.PRODOTTI)
        .update({ Qta: 0 })
        .eq('Posizione', location)
        .eq(COL.FAMIGLIA_IN_PRODOTTI, familyCode);

    if (error) throw new Error(error.message);
    return { status: 'success' };
};

export const truncateInventory = async (): Promise<any> => {
    const familyCode = getFamilyCode();
    if (!familyCode) throw new Error("Codice familiare non impostato");

    const { error } = await supabase
        .from(TBL.PRODOTTI)
        .delete()
        .eq(COL.FAMIGLIA_IN_PRODOTTI, familyCode);

    if (error) throw new Error(error.message);
    return { status: 'success' };
};

export const getFamilyData = async (familyCode: string): Promise<{ exists: boolean; pin?: string }> => {
    try {
        const { data, error } = await supabase
            .from(TBL.FAMIGLIE)
            .select('Pin')
            .eq(COL.FAMIGLIA_IN_FAMIGLIE, familyCode.trim().toUpperCase())
            .maybeSingle();

        if (error) throw error;
        return { exists: !!data, pin: data?.Pin };
    } catch (err) {
        console.error("Errore verifica famiglia:", err);
        return { exists: false };
    }
};

export const createFamily = async (familyCode: string, pin: string): Promise<void> => {
    const payload = {
        [COL.FAMIGLIA_IN_FAMIGLIE]: familyCode.trim().toUpperCase(),
        Pin: pin
    };
    const { error } = await supabase
        .from(TBL.FAMIGLIE)
        .insert([payload]);

    if (error) {
        console.error("Errore creazione famiglia:", error);
        throw new Error(`Errore DB: ${error.message} (${error.code})`);
    }
};

export const pingApi = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from(TBL.PRODOTTI).select('IdLista').limit(1);
      return !error;
    } catch {
      return false;
    }
};

export const resetSupabaseClient = () => {};
