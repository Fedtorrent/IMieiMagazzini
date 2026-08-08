
// Mappatura esatta delle colonne del Google Sheet
export interface InventoryItem {
  IdLista: string;
  Categoria: string;
  Descrizione: string;
  Qta: number;
  DataScadenza: string; // Format: DD/MM/YYYY
  Posizione: string;
  Note: string;
}

export enum AppView {
  LIST = 'LIST',
  STATS = 'STATS',
  ADD = 'ADD'
}

export const CATEGORIES = [
  'Alimentari',
  'Casalinghi',
  'Igiene'
];

export const DEFAULT_LOCATIONS = [
  'Cantina',
  'Ripostiglio',
  'Garage'
];

export interface GoogleSheetResponse {
  status?: 'success' | 'error';
  message?: string;
  error?: string;
  [key: string]: any;
}
