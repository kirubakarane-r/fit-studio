import { createElement } from 'react';
import { Clock } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function RestPromptModal() {
  const {
    showRestPrompt,
    setShowRestPrompt,
    startRestTimer,
  } = useWorkout();

  if (!showRestPrompt) return null;

  return createElement(
    'div',
    { className: 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm' },
    createElement(
      'div',
      { className: 'bg-[#121212] border border-neutral-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200' },
      
      // Header Info
      createElement(
        'div',
        { className: 'text-center space-y-2' },
        createElement(
          'div',
          { className: 'w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/15' },
          createElement(Clock, { className: 'w-6 h-6 animate-pulse' })
        ),
        createElement(
          'div',
          null,
          createElement('h3', { className: 'text-base font-extrabold text-neutral-100' }, 'Set Completed!'),
          createElement('p', { className: 'text-xs text-neutral-400 mt-1' }, 'Select rest duration to start the timer:')
        )
      ),

      // Duration Option Buttons
      createElement(
        'div',
        { className: 'grid grid-cols-3 gap-2.5' },
        [30, 60, 90].map(seconds =>
          createElement(
            'button',
            {
              key: seconds,
              onClick: () => {
                startRestTimer(seconds);
                setShowRestPrompt(false);
              },
              className: 'py-3.5 bg-neutral-900 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 border border-neutral-800 text-neutral-200 text-sm font-extrabold rounded-2xl cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center gap-1 font-mono'
            },
            createElement('span', { className: 'text-base' }, `${seconds}`),
            createElement('span', { className: 'text-[9px] font-sans font-bold uppercase tracking-wider text-neutral-500 hover:text-black/60' }, 'sec')
          )
        )
      ),

      // Skip & Cancel Button row
      createElement(
        'div',
        { className: 'pt-2 flex flex-col gap-2' },
        createElement(
          'button',
          {
            onClick: () => setShowRestPrompt(false),
            className: 'w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 text-xs font-semibold rounded-xl cursor-pointer text-center'
          },
          'Skip Rest'
        )
      )
    )
  );
}
