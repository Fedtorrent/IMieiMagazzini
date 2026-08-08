
import React, { useState } from 'react';
import { X, Copy, Check, FileSpreadsheet, Code, Globe, Play } from 'lucide-react';

interface SetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const scriptCode = `// ============================================================
// I Miei Magazzini - Google Apps Script Backend
// Lo script crea automaticamente il foglio "Prodotti" se non esiste.
// ============================================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();

    // --- PING: verifica connettività leggera ---
    const getParam = e && e.parameter ? e.parameter.action : null;
    if (getParam === 'ping') {
      return responseJSON({ status: 'success', message: 'pong' });
    }

    // --- Crea in automatico il foglio "Prodotti" se non esiste ---
    let sheet = doc.getSheetByName('Prodotti');
    if (!sheet) {
      sheet = doc.insertSheet('Prodotti');
      const headers = ['IdLista', 'Categoria', 'Descrizione', 'Qta', 'DataScadenza', 'Posizione', 'Note'];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Gestione Richiesta POST (Modifica/Creazione)
    if (e.postData) {
      const data = JSON.parse(e.postData.contents);
      const action = data.action;
      const item = data.item;

      // Ping via POST (alternativa)
      if (action === 'ping') {
        return responseJSON({ status: 'success', message: 'pong' });
      }

      const values = sheet.getDataRange().getValues();

      if (action === 'create') {
        const newRow = [
          item.IdLista, item.Categoria, item.Descrizione,
          item.Qta, item.DataScadenza, item.Posizione, item.Note
        ];
        sheet.appendRow(newRow);
        return responseJSON({ status: 'success', message: 'Creato' });
      }

      else if (action === 'update') {
        for (let i = 1; i < values.length; i++) {
          if (values[i][0] == item.IdLista) {
            const rowToUpdate = i + 1;
            sheet.getRange(rowToUpdate, 1, 1, 7).setValues([[
              item.IdLista, item.Categoria, item.Descrizione,
              item.Qta, item.DataScadenza, item.Posizione, item.Note
            ]]);
            return responseJSON({ status: 'success', message: 'Aggiornato' });
          }
        }
        return responseJSON({ status: 'error', message: 'ID non trovato' });
      }

      else if (action === 'delete') {
        const idToDelete = data.id;
        for (let i = 1; i < values.length; i++) {
          if (values[i][0] == idToDelete) {
            sheet.deleteRow(i + 1);
            return responseJSON({ status: 'success', message: 'Eliminato' });
          }
        }
        return responseJSON({ status: 'error', message: 'ID non trovato' });
      }
    }

    // Gestione Richiesta GET (Lettura)
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const rawData = rows.slice(1);

    const jsonData = rawData.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return responseJSON(jsonData);

  } catch (e) {
    return responseJSON({ status: 'error', error: e.toString() });
  } finally {
    lock.releaseLock();
  }
}

function responseJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[60] overflow-y-auto">
      {/* Header Fisso */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 flex justify-between items-center z-10 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="text-emerald-600" />
          Guida Configurazione
        </h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={24} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-6 pb-20 space-y-12">
        
        {/* Intro */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800">
          <p className="text-emerald-800 dark:text-emerald-200">
            Questa app non usa database esterni. I tuoi dati risiedono privatamente sul <strong>tuo account Google</strong>.
            Segui questi <strong>4 passaggi</strong> per creare il tuo "Backend" gratuito in meno di 2 minuti.
            Lo script creerà automaticamente il foglio con le intestazioni corrette.
          </p>
        </div>

        {/* Step 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">1</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Crea il Foglio Google</h3>
          </div>
          <div className="pl-14 text-gray-600 dark:text-gray-300">
            <p>Vai su <strong>Google Sheets</strong> e crea un nuovo foglio vuoto.</p>
            <p className="mt-2 opacity-80">(Non serve rinominarlo o aggiungere intestazioni: lo script ci pensa lui in automatico).</p>
          </div>
        </section>

        {/* Step 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">2</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Apri l'Editor di Script</h3>
          </div>
          <div className="pl-14 space-y-3 text-gray-600 dark:text-gray-300">
            <p className="flex items-center gap-2">
              Nel menu in alto, clicca su:
              <strong>Estensioni</strong> <Code size={16} /> <strong>Apps Script</strong>.
            </p>
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl">3</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Copia il Codice</h3>
          </div>
          <div className="pl-14 space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Cancella tutto il codice che trovi nell'editor e incolla questo script:
            </p>
            <div className="relative">
              <div className="absolute top-2 right-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copied 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copiato!' : 'Copia Codice'}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs sm:text-sm overflow-x-auto h-64 font-mono leading-relaxed border border-gray-700">
                {scriptCode}
              </pre>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Clicca l'icona del disco 💾 per salvare il progetto (dai un nome qualsiasi, es. "MagazzinoAPI").
            </p>
          </div>
        </section>

        {/* Step 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">4</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Pubblica come Web App</h3>
          </div>
          <div className="pl-14 space-y-4 text-gray-600 dark:text-gray-300">
            <p>Clicca sul pulsante blu in alto a destra <strong>Pubblica</strong> (Deploy) &gt; <strong>Nuova distribuzione</strong>.</p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold w-32">Tipo:</span>
                <span>Applicazione Web</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold w-32">Descrizione:</span>
                <span>(Qualsiasi, es. v1)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold w-32">Esegui come:</span>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-xs">Me (Il tuo indirizzo email)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold w-32">Chi può accedere:</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-xs font-bold">Chiunque (Anyone)</span>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-amber-800 dark:text-amber-200 text-sm">
              <Globe size={18} className="shrink-0 mt-0.5" />
              <p>È fondamentale selezionare <strong>"Chiunque"</strong> altrimenti l'app non potrà collegarsi.</p>
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xl">5</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Collega e Usa</h3>
          </div>
          <div className="pl-14 text-gray-600 dark:text-gray-300">
            <p>
              Copia l'<strong>URL Applicazione Web</strong> che ti viene fornito (finisce con <code>/exec</code>) e incollalo nelle impostazioni di questa App.
            </p>
            <div className="mt-6 flex justify-center">
                <button 
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                    <Play size={20} fill="currentColor" />
                    Inizia a Configurare
                </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
