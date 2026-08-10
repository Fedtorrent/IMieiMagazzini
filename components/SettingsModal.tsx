
import React, { useState } from 'react';
import { Save, Database, CheckCircle2, AlertCircle, Loader2, RefreshCw, Users, ShieldCheck, Lock } from 'lucide-react';
import { fetchInventory, setFamilyCode, getFamilyCode, getFamilyData, createFamily } from '../services/api';
import { clearCache, getPendingCount, getLastSyncLabel } from '../services/storageService';

interface SettingsModalProps {
  onSave: () => void;
  onCancel: () => void;
  forceOpen?: boolean;
  onForceSync?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onSave,
  onCancel, 
  forceOpen = false,
  onForceSync,
}) => {
  const [code, setCode] = useState(() => getFamilyCode() || '');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'ID' | 'PIN'>('ID');

  const [isExistingFamily, setIsExistingFamily] = useState(false);
  const [serverPin, setServerPin] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [pendingCount] = useState(() => getPendingCount());
  const [lastSync] = useState(() => getLastSyncLabel());

  const handleIdentifyFamily = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
        const data = await getFamilyData(code);
        setIsExistingFamily(data.exists);
        setServerPin(data.pin || null);
        setStep('PIN');
    } catch (e: any) {
        setError('Errore di connessione. Riprova.');
    } finally {
        setLoading(false);
    }
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || pin.length < 4) {
        setError('Il PIN deve essere di almeno 4 cifre.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
        if (isExistingFamily) {
            // Verifica PIN per famiglia esistente
            if (pin !== serverPin) {
                setError('PIN errato. Inserisci il PIN corretto per questa famiglia.');
                setLoading(false);
                return;
            }
        } else {
            // Registrazione nuova famiglia
            await createFamily(code, pin);
        }

        // Tutto ok, salviamo e chiudiamo
        setFamilyCode(code);
        setSuccess(true);
        setTimeout(() => {
            onSave();
        }, 1000);

    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleClearCache = () => {
    clearCache();
    alert('Cache locale svuotata.');
  };

  if (success) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-w-xs w-full flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
                    <ShieldCheck size={48} />
                </div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Accesso Eseguito</h2>
                <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">Sincronizzazione magazzino...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-700">

        <div className="bg-emerald-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === 'ID' ? <Users size={32} /> : <Lock size={32} />}
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {step === 'ID' ? 'Area Famiglia' : (isExistingFamily ? 'Verifica PIN' : 'Crea PIN')}
          </h2>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-2 opacity-80">
            {step === 'ID' ? 'Identifica il tuo magazzino' : (isExistingFamily ? `Accesso a ${code}` : 'Proteggi i tuoi dati')}
          </p>
        </div>

        <div className="p-8 space-y-6">
          {step === 'ID' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">
                  Codice Familiare
                </label>
                <input
                  autoFocus
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ES: FAMIGLIA-ROSSI"
                  className="w-full p-5 border-2 border-gray-50 dark:border-gray-900 rounded-2xl focus:border-emerald-500 outline-none text-center font-black tracking-widest text-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="flex gap-3">
                {!forceOpen && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-5 text-sm font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
                  >
                    Annulla
                  </button>
                )}
                <button
                  onClick={handleIdentifyFamily}
                  disabled={loading || !code}
                  className={`${forceOpen ? 'w-full' : 'flex-[2]'} bg-emerald-500 text-white py-5 rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50`}
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Continua'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFinalize} className="space-y-6">
               <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">
                  {isExistingFamily ? 'Inserisci PIN di Accesso' : 'Imposta un nuovo PIN'}
                </label>
                <input
                  autoFocus
                  required
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g,''))}
                  placeholder="••••"
                  className="w-full p-5 border-2 border-gray-50 dark:border-gray-900 rounded-2xl focus:border-emerald-500 outline-none text-center font-black tracking-[1em] text-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all"
                />
                {!isExistingFamily && (
                    <p className="text-[10px] text-gray-400 font-bold text-center mt-3 uppercase tracking-wide">
                        Il PIN servirà agli altri familiari per accedere.
                    </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => setStep('ID')}
                    className="flex-1 py-5 text-sm font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
                >
                    Indietro
                </button>
                <button
                    type="submit"
                    disabled={loading || pin.length < 4}
                    className="flex-[2] bg-emerald-500 text-white py-5 rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Conferma'}
                </button>
              </div>
            </form>
          )}

          {step === 'ID' && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                 <button
                    type="button"
                    onClick={handleClearCache}
                    className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
                 >
                    <RefreshCw size={12} /> Svuota Cache Locale
                 </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
