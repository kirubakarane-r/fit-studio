import { createElement, Fragment } from 'react';
import { TrendingUp } from 'lucide-react';
import WeeklyVolumeChart from './WeeklyVolumeChart';
import { formatDateShort } from '../utils/formatters';
import { useWorkout } from '../context/WorkoutContext';

export default function ProgressScreen() {
  const { workouts, exercises, personalRecords } = useWorkout();

  const content = workouts.length === 0
    ? createElement(
        'div',
        { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-8 text-center space-y-3' },
        createElement(
          'div',
          { className: 'inline-flex p-3 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-500' },
          createElement(TrendingUp, { className: 'w-6 h-6' })
        ),
        createElement(
          'div',
          null,
          createElement('h4', { className: 'text-sm font-semibold text-neutral-200' }, 'Insufficient workout data'),
          createElement('p', { className: 'text-xs text-neutral-500 mt-1' }, 'Finish more sessions to generate volume history and PR tracking metrics.')
        )
      )
    : createElement(
        Fragment,
        null,
        
        // Volume Chart Component
        createElement(WeeklyVolumeChart, { workouts, exercises }),

        // Personal Records section
        createElement(
          'div',
          { className: 'space-y-3' },
          createElement(
            'div',
            { className: 'flex justify-between items-center' },
            createElement('h3', { className: 'text-sm font-bold text-neutral-300 uppercase tracking-wider' }, 'Personal Records (1RM)'),
            createElement('span', { className: 'text-xs text-neutral-500' }, 'Estimated 1-Rep Max')
          ),

          personalRecords.length === 0
            ? createElement(
                'div',
                { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-5 text-center text-xs text-neutral-500' },
                'No weighted exercise logs with valid weights and reps found to calculate 1RM.'
              )
            : createElement(
                'div',
                { className: 'space-y-2' },
                personalRecords.map((pr, index) =>
                  createElement(
                    'div',
                    { key: index, className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-4 flex justify-between items-center' },
                    createElement(
                      'div',
                      null,
                      createElement('h4', { className: 'font-bold text-sm text-neutral-200' }, pr.exerciseName),
                      createElement(
                        'div',
                        { className: 'flex items-center gap-1.5 text-xs text-neutral-500 mt-1' },
                        createElement('span', null, `Set: ${pr.weight}kg × ${pr.reps} reps`),
                        createElement('span', null, '•'),
                        createElement('span', null, formatDateShort(pr.date))
                      )
                    ),
                    createElement(
                      'div',
                      { className: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-3.5 py-2 font-mono text-center' },
                      createElement('div', { className: 'text-[10px] text-neutral-500 uppercase tracking-wider' }, 'Est. Max'),
                      createElement('div', { className: 'text-base font-extrabold' }, `${Math.round(pr.oneRM)} kg`)
                    )
                  )
                )
              )
        )
      );

  return createElement(
    'div',
    { className: 'space-y-6' },
    createElement('h2', { className: 'text-base font-extrabold text-neutral-200 uppercase tracking-wider' }, 'Metrics & Analytics'),
    content
  );
}
