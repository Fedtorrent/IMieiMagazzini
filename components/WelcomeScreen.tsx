
import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import appImage from '../I_Miei_Magazzini.png';

interface WelcomeScreenProps {
  onOpenSettings: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenSettings }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center animate-fade-in-up">
      {/* Hero Image */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
        <img
          src={appImage}
          alt="I Miei Magazzini"
          className="relative w-40 h-40 object-contain drop-shadow-2xl select-none animate-float"
        />
      </div>

      <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase italic">
        I Miei <span className="text-emerald-500">Magazzini</span>
      </h1>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-12 font-bold leading-relaxed text-sm">
        Gestisci le tue scorte domestiche in modo semplice, veloce e condiviso con la tua famiglia.
      </p>

      <div className="w-full max-w-xs mx-auto">
        <button
          onClick={onOpenSettings}
          className="group w-full flex items-center justify-between p-5 bg-emerald-500 text-white rounded-[24px] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Users size={24} />
            </div>
            <div className="text-left">
              <div className="font-black uppercase tracking-wider text-sm">Entra in Famiglia</div>
              <div className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest">Codice & PIN</div>
            </div>
          </div>
          <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      <div className="mt-20 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800/50 rounded-full border border-gray-200/50 dark:border-gray-700/50">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Database Cloud Attivo</span>
        </div>

        <div className="flex flex-col items-center gap-2 opacity-60">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">By</span>
          <img
            src="/IconaPersonale.png"
            alt="FP Logo"
            className="w-10 h-10 object-contain"
          />
        </div>
      </div>
    </div>
  );
};
