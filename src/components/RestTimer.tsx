import { createElement } from 'react';
import { Clock } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function RestTimer() {
  const { showRestTimer, restTimeRemaining, skipRestTimer } = useWorkout();

  if (!showRestTimer) return null;

  return createElement(
    'div',
    { className: 'fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300' },
    // Backdrop
    createElement('div', { 
      className: 'absolute inset-0 bg-black/60 backdrop-blur-sm'
    }),
    
    // Modal Content
    createElement(
      'div',
      { className: 'relative bg-[#161618] border border-emerald-500/30 shadow-2xl rounded-3xl p-8 flex flex-col items-center justify-center text-center max-w-xs w-full scale-in-95' },
      
      // Spinner / Icon
      createElement(
        'div',
        { className: 'bg-emerald-500/10 p-4 rounded-full text-emerald-400 border border-emerald-500/25 mb-4' },
        createElement(Clock, { className: 'w-10 h-10 animate-spin', style: { animationDuration: '4s' } })
      ),
      
      // Timer Text
      createElement(
        'span',
        { className: 'text-xs text-emerald-500 font-bold uppercase tracking-widest block mb-1' },
        'Rest Interval'
      ),
      createElement(
        'span',
        { className: 'text-5xl font-extrabold text-neutral-100 font-mono tracking-tighter mb-8 block' },
        `${Math.floor(restTimeRemaining / 60)}:${(restTimeRemaining % 60).toString().padStart(2, '0')}`
      ),
      
      // Skip Button
      createElement(
        'button',
        {
          onClick: skipRestTimer,
          className: 'w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-sm font-bold rounded-xl border border-neutral-800 cursor-pointer transition-colors'
        },
        'Skip'
      )
    )
  );
}
