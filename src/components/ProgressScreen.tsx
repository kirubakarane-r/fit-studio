import { createElement, Fragment } from 'react';
import { TrendingUp, Medal, Calendar } from 'lucide-react';
import MuscleDistributionChart from './MuscleDistributionChart';
import { useWorkout } from '../context/WorkoutContext';
import { formatDateShort } from '../utils/formatters';

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
        // Group PRs by muscle
        const groupedRecords = personalRecords.reduce((acc, pr) => {
          const muscle = pr.muscle || 'other';
          if (!acc[muscle]) acc[muscle] = [];
          acc[muscle].push(pr);
          return acc;
        }, {} as Record<string, typeof personalRecords>);

        // Sort muscles alphabetically
        const sortedMuscles = Object.keys(groupedRecords).sort();

        // Color mapping for muscle groups
        const colorMap: Record<string, string> = {
          chest: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
          back: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
          legs: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
          shoulders: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
          arms: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
          core: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
          cardio: 'text-orange-400 bg-orange-400/10 border-orange-400/20'
        };

        const getMuscleStyle = (muscle: string) => {
          return colorMap[muscle.toLowerCase()] || 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        };

        return createElement(
          Fragment,
          null,
          createElement(MuscleDistributionChart, { workouts, exercises }),
          
          createElement(
            'div',
            { className: 'mt-8' },
            createElement(
              'div',
              { className: 'flex items-center gap-2 mb-6' },
              createElement(Medal, { className: 'w-5 h-5 text-emerald-400' }),
              createElement('h3', { className: 'text-lg font-extrabold text-neutral-100 tracking-tight' }, 'Personal Records')
            ),
            
            Object.keys(groupedRecords).length === 0
              ? createElement(
                  'div',
                  { className: 'text-center py-8 border border-dashed border-neutral-800/50 rounded-2xl bg-neutral-900/30' },
                  createElement('span', { className: 'text-sm font-medium text-neutral-500' }, 'No personal records established yet.')
                )
              : createElement(
                  'div',
                  { className: 'space-y-6' },
                  sortedMuscles.map(muscle => {
                    const prs = groupedRecords[muscle];
                    const muscleStyle = getMuscleStyle(muscle);
                    
                    return createElement(
                      'div',
                      { key: muscle, className: 'space-y-4' },
                      createElement(
                        'h4',
                        { className: `inline-flex items-center px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-widest ${muscleStyle}` },
                        muscle
                      ),
                      createElement(
                        'div',
                        { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
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
                            { key: index, className: 'bg-[#121212]/80 backdrop-blur-md border border-neutral-800/60 rounded-2xl p-4 shadow-xl flex flex-col hover:border-emerald-500/50 transition-colors group' },
                            createElement(
                              'div',
                              { className: 'flex justify-between items-start mb-2' },
                              createElement('div', { className: 'font-bold text-sm text-neutral-200 group-hover:text-emerald-400 transition-colors' }, pr.exerciseName),
                              createElement(
                                'div',
                                { className: 'bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider' },
                                'PR'
                              )
                            ),
                            createElement(
                              'div',
                              { className: 'flex items-end justify-between mt-auto pt-2' },
                              createElement(
                                'div',
                                { className: 'flex items-center gap-1.5 text-xs text-neutral-500 font-medium' },
                                createElement(Calendar, { className: 'w-3.5 h-3.5' }),
                                formatDateShort(pr.date)
                              ),
                              createElement(
                                'div',
                                { className: 'text-base font-extrabold text-neutral-100 tracking-tight' },
                                prValue
                              )
                            )
                          );
                        })
                      )
                    );
                  })
                )
          )
        );
      })();

  return createElement(
    'div',
    { className: 'space-y-6 pb-20' },
    createElement('h2', { className: 'text-base font-extrabold text-neutral-200 uppercase tracking-wider' }, 'Metrics & Analytics'),
    content
  );
}
