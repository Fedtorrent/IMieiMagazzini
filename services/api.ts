
import { InventoryItem, GoogleSheetResponse, CATEGORIES } from '../types';

// Helper per ottenere l'URL salvato
const getApiUrl = () => localStorage.getItem('GSHEET_API_URL');

export const isApiConfigured = () => !!getApiUrl();

export const setApiUrl = (url: string) => localStorage.setItem('GSHEET_API_URL', url);

// Helper per formattare la data in DD/MM/YYYY
const formatDate = (raw: any): string => {
  if (!raw) return '';
  
  const str = String(raw);
  
  // Se è già nel formato corretto DD/MM/YYYY o DD-MM-YYYY
  if (str.match(/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/)) {
    return str.replace(/-/g, '/');
  }

  // Gestione formato ISO (es. 2026-11-11T23:00:00.000Z) o YYYY-MM-DD
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return str;
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
          // Consideriamo in scadenza se mancano 30 giorni o meno (e non è già scaduto)
          else if (diffDays <= 30) isExpiring = true;
        }
      }
    } catch (e) {
      // Fail silently
    }
  }

  return { isExpired, isExpiring, diffDays };
};

export const fetchInventory = async (): Promise<InventoryItem[]> => {
  const url = getApiUrl();
  
  // MODIFICA: Se non c'è URL, non lanciare errore ma ritorna lista vuota
  // Questo permette all'app di avviarsi per la prima configurazione
  if (!url) {
      console.log("App non configurata, avvio in modalità vuota.");
      return []; 
  }

  // Aggiungiamo un timestamp per evitare che il browser mostri dati vecchi (caching)
  const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;

  try {
    const response = await fetch(fetchUrl, {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
    }

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("Non è stato possibile leggere il JSON:", text);
        throw new Error("Risposta non valida dallo script. Controlla che l'URL termini con '/exec'.");
    }
    
    if (data.status === 'error') throw new Error(data.error || data.message);
    
    // Se ritorna un array, sono i dati.
    if (Array.isArray(data)) {
      // CONTROLLO DI SICUREZZA:
      if (data.length > 0) {
         const firstItem = data[0];
         if (firstItem.IdLista === undefined && firstItem.Descrizione === undefined) {
             console.warn("Dati ricevuti ma le chiavi sembrano errate. Probabilmente mancano le intestazioni nel Foglio Google.");
         }
      }

      const cleanData = data
        // Filtra righe vuote o spurie
        .filter((item: any) => item && (item.Descrizione || item.IdLista))
        .map((item: any) => ({
          IdLista: String(item.IdLista || Math.random().toString(36).substr(2, 9)),
          Categoria: item.Categoria || CATEGORIES[0],
          Descrizione: item.Descrizione || 'Senza Nome',
          Qta: Number(item['Qta'] !== undefined ? item['Qta'] : (item['Q.tà'] !== undefined ? item['Q.tà'] : 0)),
          // Applica la formattazione data
          DataScadenza: formatDate(item['DataScadenza'] || item['Data Scadenza'] || item['DataScadenza'] || ''),
          Posizione: item.Posizione || 'Cantina',
          Note: item.Note || '-'
        }));
      
      return cleanData;
    }
    
    return [];
  } catch (error: any) {
    console.error("Fetch Error:", error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error("Impossibile connettersi. Verifica: 1. Nome foglio 'Prodotti' 2. Permessi 'Chiunque' 3. Intestazioni presenti.");
    }
    throw error;
  }
};

const handlePost = async (action: string, payload: any): Promise<GoogleSheetResponse> => {
  const url = getApiUrl();
  if (!url) throw new Error("URL API non configurato");

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify({ action, ...payload })
    });
    
    const text = await response.text();
    
    if (text.trim().startsWith('<!DOCTYPE html') || text.includes('Google Drive - Error')) {
        throw new Error("Errore Script Google. Assicurati che il foglio abbia le intestazioni nella riga 1 (IdLista, Descrizione, ecc).");
    }

    try {
        const json = JSON.parse(text);
        if (json.status === 'error') throw new Error(json.message || json.error);
        return json;
    } catch (e) {
        throw new Error("Errore nel salvataggio. Assicurati di aver pubblicato lo script come 'Nuova Versione'.");
    }
  } catch (error: any) {
    console.error("API POST Error:", error);
    throw error;
  }
};

export const addInventoryItem = async (item: InventoryItem): Promise<GoogleSheetResponse> => {
  return handlePost('create', { item });
};

export const updateInventoryItem = async (item: InventoryItem): Promise<GoogleSheetResponse> => {
  return handlePost('update', { item });
};

export const deleteInventoryItem = async (id: string): Promise<GoogleSheetResponse> => {
  return handlePost('delete', { id });
};

/**
 * Verifica la connettività con il GSheet senza scaricare tutti i dati.
 * Lo script GAS deve supportare l'azione 'ping' (vedi SetupGuide).
 */
export const pingApi = async (): Promise<boolean> => {
  const url = getApiUrl();
  if (!url) return false;
  try {
    const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=ping&t=${Date.now()}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const text = await res.text();
    // Il GAS risponde con qualcosa di valido (array JSON o oggetto)
    return text.trim().startsWith('[') || text.includes('"status"');
  } catch {
    return false;
  }
};
