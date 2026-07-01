import { createElement } from 'react';
import { Clock } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function RestTimer() {
  const { showRestTimer, restTimeRemaining, skipRestTimer } = useWorkout();

  if (!showRestTimer) return null;

  return createElement(
    'div',
    { className: 'fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40 transition-all duration-300' },
    createElement(
      'div',
      { className: 'bg-neutral-950/95 border border-emerald-500/30 shadow-2xl rounded-2xl p-4 flex items-center justify-between backdrop-blur-md' },
      createElement(
        'div',
        { className: 'flex items-center gap-3' },
        createElement(
          'div',
          { className: 'bg-emerald-500/10 p-2 rounded-xl text-emerald-400 border border-emerald-500/25' },
          createElement(Clock, { className: 'w-5 h-5 animate-spin', style: { animationDuration: '6s' } })
        ),
        createElement(
          'div',
          null,
          createElement(
            'span',
            { className: 'text-[10px] text-neutral-500 font-bold uppercase tracking-widest block' },
            'Rest Interval'
          ),
          createElement(
            'span',
            { className: 'text-xl font-extrabold text-neutral-100 font-mono tracking-tight' },
            `${Math.floor(restTimeRemaining / 60)}:${(restTimeRemaining % 60).toString().padStart(2, '0')}`
          )
        )
      ),
      createElement(
        'button',
        {
          onClick: skipRestTimer,
          className: 'px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-800 cursor-pointer'
        },
        'Skip'
      )
    )
  );
}
