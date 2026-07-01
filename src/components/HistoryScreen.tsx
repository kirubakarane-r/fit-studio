import { createElement, Fragment } from 'react';
import { History, Trash2, ChevronRight } from 'lucide-react';
import { formatDateFull, formatDuration, capitalize, getMuscleColor } from '../utils/formatters';
import { useWorkout } from '../context/WorkoutContext';

export default function HistoryScreen() {
  const {
    workouts,
    exercises,
    setSelectedWorkoutId,
    setPendingDeleteWorkoutId,
  } = useWorkout();

  const listContent = workouts.length === 0
    ? createElement(
        'div',
        { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-8 text-center space-y-3' },
        createElement(
          'div',
          { className: 'inline-flex p-3 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-500' },
          createElement(History, { className: 'w-6 h-6' })
        ),
        createElement(
          'div',
          null,
          createElement('h4', { className: 'text-sm font-semibold text-neutral-200' }, 'No logs completed'),
          createElement('p', { className: 'text-xs text-neutral-500 mt-1' }, 'Finish your active workout to track history metrics here.')
        )
      )
    : createElement(
        'div',
        { className: 'space-y-3' },
        workouts.map(w => {
          const totalSets = w.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done).length, 0);
          const totalVol = w.exercises.reduce((acc, ex) => acc + ex.sets.reduce((b, s) => b + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0), 0);
          const muscList = Array.from(new Set(w.exercises.map(ex => exercises.find(e => e.id === ex.id)?.muscle).filter(Boolean))) as string[];

          return createElement(
            'div',
            {
              key: w.id,
              onClick: () => setSelectedWorkoutId(w.id),
              className: 'bg-[#121212] hover:bg-[#1a1a1a] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between gap-2 relative group'
            },
            
            // Log Header Info
            createElement(
              'div',
              { className: 'flex justify-between items-start' },
              createElement(
                'div',
                null,
                createElement('h4', { className: 'font-bold text-sm text-neutral-200' }, w.name),
                createElement('span', { className: 'text-xs text-neutral-500 mt-0.5 inline-block' }, formatDateFull(w.date))
              ),
              createElement(
                'div',
                { className: 'flex items-center gap-1.5' },
                createElement(
                  'button',
                  {
                    onClick: (e: any) => {
                      e.stopPropagation();
                      setPendingDeleteWorkoutId(w.id);
                    },
                    className: 'p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors'
                  },
                  createElement(Trash2, { className: 'w-4 h-4' })
                ),
                createElement(ChevronRight, { className: 'w-4 h-4 text-neutral-500' })
              )
            ),

            // Metrics row
            createElement(
              'div',
              { className: 'flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-900 pt-2.5 mt-1' },
              createElement(
                'div',
                { className: 'flex items-center gap-2' },
                createElement('span', null, `${w.exercises.length} Exercises`),
                createElement('span', { className: 'text-neutral-700' }, '•'),
                createElement('span', null, `${totalSets} sets`),
                createElement('span', { className: 'text-neutral-700' }, '•'),
                createElement('span', null, `${Math.round(totalVol)} kg`),
                w.duration
                  ? createElement(
                      Fragment,
                      null,
                      createElement('span', { className: 'text-neutral-700' }, '•'),
                      createElement('span', null, formatDuration(w.duration))
                    )
                  : null
              )
            ),

            // Muscle group badges
            muscList.length > 0
              ? createElement(
                  'div',
                  { className: 'flex flex-wrap gap-1 mt-1' },
                  muscList.map(muscle =>
                    createElement(
                      'span',
                      {
                        key: muscle,
                        className: `text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${getMuscleColor(muscle || '')}`
                      },
                      capitalize(muscle || '')
                    )
                  )
                )
              : null
          );
        })
      );

  return createElement(
    'div',
    { className: 'space-y-4' },
    createElement('h2', { className: 'text-base font-extrabold text-neutral-200 uppercase tracking-wider' }, 'Workout Log History'),
    listContent
  );
}
