import { createElement } from 'react';
import { X, Play } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function TemplateDetailModal() {
  const {
    selectedTemplateToView,
    setSelectedTemplateToView,
    exercises,
    handleStartWorkoutFromTemplate
  } = useWorkout();

  if (!selectedTemplateToView) return null;

  const tplExercises = selectedTemplateToView.exercises.map(eid => {
    return exercises.find(e => e.id === eid);
  }).filter(Boolean);

  const handleStart = () => {
    handleStartWorkoutFromTemplate(selectedTemplateToView);
    setSelectedTemplateToView(null);
  };

  return createElement(
    'div',
    { className: 'fixed inset-0 bg-black/70 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4' },
    createElement(
      'div',
      { className: 'bg-[#161618] border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[95vh] flex flex-col shadow-2xl overflow-hidden' },
      
      // Handle bar on mobile
      createElement('div', { className: 'w-12 h-1 bg-neutral-800 rounded-full mx-auto mt-3 mb-1 sm:hidden' }),

      // Header
      createElement(
        'div',
        { className: 'p-4 border-b border-neutral-900 flex justify-between items-center' },
        createElement(
          'div',
          null,
          createElement('h3', { className: 'text-base font-extrabold text-neutral-100' }, selectedTemplateToView.name),
          createElement('p', { className: 'text-xs text-neutral-500 mt-0.5' }, `${tplExercises.length} movements in this plan`)
        ),
        createElement(
          'button',
          {
            onClick: () => setSelectedTemplateToView(null),
            className: 'text-neutral-500 hover:text-neutral-300 p-1.5 rounded-lg hover:bg-neutral-900 cursor-pointer transition-colors'
          },
          createElement(X, { className: 'w-4 h-4' })
        )
      ),

      // Exercises List
      createElement(
        'div',
        { className: 'flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar' },
        tplExercises.length === 0
          ? createElement(
              'div',
              { className: 'text-center py-6 text-sm text-neutral-500' },
              'No exercises in this plan.'
            )
          : tplExercises.map((ex, idx) =>
              createElement(
                'div',
                {
                  key: `${ex?.id}-${idx}`,
                  className: 'bg-neutral-900/40 border border-neutral-800/80 p-3 rounded-2xl flex items-center justify-between'
                },
                createElement(
                  'div',
                  { className: 'flex items-center gap-3' },
                  createElement(
                    'div',
                    { className: 'w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400' },
                    idx + 1
                  ),
                  createElement(
                    'div',
                    null,
                    createElement('h4', { className: 'text-sm font-bold text-neutral-200' }, ex?.name),
                    createElement('span', { className: 'text-xs text-neutral-500 capitalize' }, ex?.muscle)
                  )
                )
              )
            )
      ),

      // Footer
      createElement(
        'div',
        { className: 'p-4 border-t border-neutral-900 bg-[#161618] flex items-center gap-3 shrink-0' },
        createElement(
          'button',
          {
            onClick: handleStart,
            className: 'flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all'
          },
          createElement(Play, { className: 'w-4 h-4 fill-black' }),
          createElement('span', null, 'Start Session')
        )
      )
    )
  );
}
