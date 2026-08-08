
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, X, Check } from 'lucide-react';

interface Step {
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  forceCircle?: boolean;     // Forza la forma a cerchio perfetto
  highlightPadding?: number; // Aggiunge spazio extra attorno all'elemento
}

const STEPS: Step[] = [
  {
    targetId: 'tour-compact-mode',
    title: 'Modalità Compatta',
    description: 'Tocca qui per passare dalla vista a schede dettagliate a una lista veloce e compatta (sola lettura).',
    position: 'bottom',
    forceCircle: true,
    highlightPadding: 8
  },
  {
    targetId: 'tour-filters',
    title: 'Filtri Avanzati',
    description: 'Filtra rapidamente per disponibili, esauriti, scadenze imminenti o per posizione specifica.',
    position: 'bottom',
    highlightPadding: 8
  },
  {
    targetId: 'tour-home-btn',
    title: 'Home / Reset',
    description: 'Tocca qui per tornare alla lista principale e resettare immediatamente tutti i filtri di ricerca.',
    position: 'top',
    forceCircle: true,
    highlightPadding: 20 // Abbondante per includere icona e testo
  },
  {
    targetId: 'tour-add-btn',
    title: 'Aggiungi Prodotto',
    description: 'Premi questo pulsante per inserire un nuovo prodotto nel magazzino o duplicarne uno esistente.',
    position: 'top',
    forceCircle: true,
    highlightPadding: 10
  },
  {
    targetId: 'tour-stats-btn',
    title: 'Statistiche',
    description: 'Visualizza grafici dettagliati sulla composizione del tuo magazzino e il valore della merce.',
    position: 'top',
    forceCircle: true,
    highlightPadding: 20 // Abbondante per includere icona e testo
  },
  {
    targetId: 'tour-settings',
    title: 'Impostazioni',
    description: 'Qui trovi la configurazione del Cloud, il tema scuro, la gestione posizioni e questa guida.',
    position: 'bottom',
    forceCircle: true,
    highlightPadding: 8
  }
];

interface AppTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppTutorial: React.FC<AppTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = STEPS[currentStepIndex];

  const updateTargetPosition = useCallback(() => {
    if (!isOpen) return;
    
    // Piccolo ritardo per assicurarsi che il DOM sia stabile (es. dopo apertura menu)
    setTimeout(() => {
        const element = document.getElementById(currentStep.targetId);
        if (element) {
        setTargetRect(element.getBoundingClientRect());
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
  }, [currentStep.targetId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      updateTargetPosition();
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition);
    }
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [isOpen, currentStepIndex, updateTargetPosition]);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
      // Reset index for next time
      setTimeout(() => setCurrentStepIndex(0), 300); 
    }
  };

  if (!isOpen || !targetRect) return null;

  // Calcolo Geometria Evidenziazione
  const padding = currentStep.highlightPadding || 4;
  let hlWidth = targetRect.width + (padding * 2);
  let hlHeight = targetRect.height + (padding * 2);
  let hlTop = targetRect.top - padding;
  let hlLeft = targetRect.left - padding;
  let hlRadius = '12px';

  // Se forziamo il cerchio, prendiamo il lato maggiore per fare un quadrato perfetto
  // e ricalcoliamo top/left per centrarlo sull'elemento originale
  if (currentStep.forceCircle) {
      const size = Math.max(hlWidth, hlHeight);
      hlWidth = size;
      hlHeight = size;
      // Ricalcola il centro
      const centerX = targetRect.left + (targetRect.width / 2);
      const centerY = targetRect.top + (targetRect.height / 2);
      
      hlTop = centerY - (size / 2);
      hlLeft = centerX - (size / 2);
      hlRadius = '50%';
  }

  // Calcolo posizione tooltip
  let tooltipStyle: React.CSSProperties = {};
  const tooltipWidth = 300;
  const spacing = 20;

  // Logica semplice per posizionare il box descrittivo
  if (currentStep.position === 'bottom') {
    tooltipStyle = {
      top: hlTop + hlHeight + spacing,
      left: hlLeft + (hlWidth / 2) - (tooltipWidth / 2),
    };
  } else if (currentStep.position === 'top') {
    tooltipStyle = {
      bottom: window.innerHeight - hlTop + spacing,
      left: hlLeft + (hlWidth / 2) - (tooltipWidth / 2),
    };
  }

  // Correzione bordi schermo (responsive)
  if (typeof tooltipStyle.left === 'number') {
      const safeMargin = 10;
      if (tooltipStyle.left < safeMargin) tooltipStyle.left = safeMargin;
      if (tooltipStyle.left + tooltipWidth > window.innerWidth) {
          tooltipStyle.left = window.innerWidth - tooltipWidth - safeMargin;
      }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Sfondo oscurato con "buco" (clip-path) non è animabile facilmente in React puro senza canvas.
          Usiamo box-shadow gigante sul div target simulato per creare l'effetto focus.
      */}
      <div 
        className="absolute inset-0 transition-all duration-500 ease-in-out"
        style={{
            // Questo div simula il "buco". 
            // Usiamo un'ombra gigantesca per oscurare il resto.
            position: 'absolute',
            top: hlTop,
            left: hlLeft,
            width: hlWidth,
            height: hlHeight,
            borderRadius: hlRadius,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            pointerEvents: 'none', // Lascia passare i click? No, il tutorial deve bloccare.
        }}
      />
      
      {/* Overlay cliccabile trasparente per bloccare le interazioni sotto (tranne il buco se volessimo) */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Tooltip */}
      <div 
        className="absolute bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-3 transition-all duration-300 animate-fade-in-up w-[300px]"
        style={tooltipStyle}
      >
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                {currentStep.title}
            </h3>
            <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                {currentStepIndex + 1}/{STEPS.length}
            </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {currentStep.description}
        </p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium px-2 py-1"
            >
                Salta
            </button>
            
            <button 
                onClick={handleNext}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2"
            >
                {currentStepIndex === STEPS.length - 1 ? (
                    <>Finito <Check size={16} /></>
                ) : (
                    <>Avanti <ArrowRight size={16} /></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
