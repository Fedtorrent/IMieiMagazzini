
import React from 'react';
import { CloudCog, BookOpen, ArrowRight } from 'lucide-react';
import appImage from '../I_Miei_Magazzini.png';

interface WelcomeScreenProps {
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenSettings, onOpenGuide }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center animate-fade-in-up">
      {/* Hero Image */}
      <div className="relative mb-8">
        <img
          src={appImage}
          alt="I Miei Magazzini"
          className="w-36 h-36 object-contain drop-shadow-xl select-none"
        />
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
        Benvenuto in <span className="text-emerald-600 dark:text-emerald-400">Magazzini</span>
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-10 leading-relaxed">
        L'app privata per gestire le tue scorte domestiche usando Google Sheets come database sicuro e gratuito.
      </p>

      <div className="grid gap-4 w-full max-w-xs mx-auto">
        <button
          onClick={onOpenSettings}
          className="group flex items-center justify-between p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl text-white">
              <CloudCog size={20} />
            </div>
            <div className="text-left">
              <div className="font-bold">Configura Cloud</div>
              <div className="text-xs text-emerald-100">Collega il tuo foglio</div>
            </div>
          </div>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onOpenGuide}
          className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-emerald-600 dark:text-emerald-400">
              <BookOpen size={20} />
            </div>
            <div className="text-left">
              <div className="font-bold">Guida Setup</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Come creare il file</div>
            </div>
          </div>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform opacity-50" />
        </button>
      </div>

      <div className="mt-16 text-xs text-gray-400 dark:text-gray-600 flex flex-col items-center gap-2 italic">
        <p>I tuoi dati rimangono sotto il tuo controllo.</p>
        <div className="flex items-center gap-1.5 opacity-60 grayscale">
          <span>By</span>
          <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
            <span className="font-mono text-[8px] font-bold">fp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
