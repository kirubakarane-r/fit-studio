import { createElement, Fragment } from 'react';
import { TrendingUp } from 'lucide-react';
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
    : (() => {
        const groupedRecords = personalRecords.reduce((acc, pr) => {
          if (!acc[pr.muscle]) acc[pr.muscle] = [];
          acc[pr.muscle].push(pr);
          return acc;
        }, {} as Record<string, typeof personalRecords>);

        return createElement(
          Fragment,
          null,
          // Personal Records section
          createElement(
            'div',
            { className: 'space-y-6' },
            Object.keys(groupedRecords).length === 0
              ? createElement(
                  'div',
                  { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-5 text-center text-xs text-neutral-500' },
                  'No exercise logs with valid weights and reps found to calculate PR.'
                )
              : Object.entries(groupedRecords).map(([muscle, prs]) =>
                  createElement(
                    'div',
                    { key: muscle, className: 'space-y-3' },
                    createElement(
                      'div',
                      { className: 'flex justify-between items-center' },
                      createElement(
                        'h3',
                        { className: 'text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2' },
                        createElement('span', { className: `w-2 h-2 rounded-full bg-emerald-500` }),
                        muscle
                      )
                    ),
                    createElement(
                      'div',
                      { className: 'space-y-2' },
                      prs.map((pr, index) => {
                        let prValue = '';
                        if (pr.type === 'weight') {
                          prValue = `${pr.weight}kg × ${pr.reps}`;
                        } else if (pr.type === 'bodyweight') {
                          prValue = `${pr.reps} reps`;
                        } else if (pr.type === 'cardio') {
                          prValue = `${pr.weight}m ${pr.reps > 0 ? `${pr.reps}km` : ''}`;
                        }
                        
                        return createElement(
                          'div',
                          { key: index, className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-4 flex justify-between items-center' },
                          createElement(
                            'div',
                            null,
                            createElement('h4', { className: 'font-bold text-sm text-neutral-200' }, pr.exerciseName),
                            createElement(
                              'div',
                              { className: 'flex items-center gap-1.5 text-xs text-neutral-500 mt-1' },
                              createElement('span', null, formatDateShort(pr.date))
                            )
                          ),
                          createElement(
                            'div',
                            { className: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-3.5 py-2 font-mono text-center min-w-[80px]' },
                            createElement('div', { className: 'text-[10px] text-neutral-500 uppercase tracking-wider' }, 'PR'),
                            createElement('div', { className: 'text-sm font-extrabold whitespace-nowrap mt-0.5' }, prValue)
                          )
                        );
                      })
                    )
                  )
                )
          )
        );
      })();

  return createElement(
    'div',
    { className: 'space-y-6' },
    createElement('h2', { className: 'text-base font-extrabold text-neutral-200 uppercase tracking-wider' }, 'Metrics & Analytics'),
    content
  );
}
