import { createElement, Fragment, useState } from 'react';
import { TrendingUp, Medal, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import MuscleDistributionChart from './MuscleDistributionChart';
import { useWorkout } from '../context/WorkoutContext';
import { formatDateShort } from '../utils/formatters';

export default function ProgressScreen() {
  const { workouts, exercises, personalRecords } = useWorkout();
  const [activeTab, setActiveTab] = useState<string>('');
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const getWeekStats = (offset: number) => {
    const nowTime = new Date();
    const weekStart = new Date(nowTime);
    // Adjust for offset (offset * 7 days)
    weekStart.setDate(nowTime.getDate() - nowTime.getDay() + (offset * 7));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekWorkouts = workouts.filter(w => {
      const d = new Date(w.date);
      return d >= weekStart && d < weekEnd;
    });

    let totalVolume = 0;
    let completedSetsCount = 0;

    weekWorkouts.forEach(w => {
      w.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.done) {
            completedSetsCount++;
            const weight = parseFloat(s.weight) || 0;
            const reps = parseInt(s.reps) || 0;
            totalVolume += weight * reps;
          }
        });
      });
    });

    const formatStr = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekEndDisplay = new Date(weekEnd);
    weekEndDisplay.setDate(weekEndDisplay.getDate() - 1);
    
    return {
      workoutsCount: weekWorkouts.length,
      volume: totalVolume,
      sets: completedSetsCount,
      dateRange: `${formatStr(weekStart)} - ${formatStr(weekEndDisplay)}`,
      weekWorkouts
    };
  };

  const weekStats = getWeekStats(weekOffset);

  const weekStatsContent = createElement(
    'div',
    { className: 'space-y-4 mb-8' },
    createElement(
      'div',
      { className: 'flex justify-between items-center bg-[#121212]/80 backdrop-blur-md border border-neutral-800/60 rounded-2xl p-3 shadow-xl' },
      createElement('button', { onClick: () => setWeekOffset(prev => prev - 1), className: 'p-2 hover:bg-neutral-800 rounded-lg cursor-pointer' }, createElement(ChevronLeft, { className: 'w-5 h-5 text-neutral-400' })),
      createElement('span', { className: 'font-bold text-sm text-neutral-200' }, weekOffset === 0 ? 'Current Week' : weekStats.dateRange),
      createElement('button', { onClick: () => setWeekOffset(prev => prev + 1), disabled: weekOffset >= 0, className: `p-2 rounded-lg ${weekOffset >= 0 ? 'opacity-50' : 'hover:bg-neutral-800 cursor-pointer'}` }, createElement(ChevronRight, { className: 'w-5 h-5 text-neutral-400' }))
    ),
    createElement(
      'div',
      { className: 'grid grid-cols-2 gap-3' },
      createElement(
        'div',
        { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg' },
        createElement('span', { className: 'text-[11px] font-semibold text-neutral-400 uppercase tracking-wider' }, 'Workouts'),
        createElement(
          'div',
          { className: 'mt-3 flex items-baseline gap-1' },
          createElement('span', { className: 'text-3xl font-extrabold text-neutral-100' }, weekStats.workoutsCount),
          createElement('span', { className: 'text-xs text-neutral-500' }, 'logged')
        ),
        createElement('span', { className: 'text-[10px] text-neutral-500 mt-1' }, 'workouts total')
      ),
      createElement(
        'div',
        { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg' },
        createElement('span', { className: 'text-[11px] font-semibold text-neutral-400 uppercase tracking-wider' }, 'Weekly Volume'),
        createElement(
          'div',
          { className: 'mt-3 flex items-baseline gap-1' },
          createElement('span', { className: 'text-3xl font-extrabold text-emerald-400' }, weekStats.volume >= 1000 ? `${(weekStats.volume / 1000).toFixed(1)}k` : weekStats.volume),
          createElement('span', { className: 'text-xs text-neutral-500' }, 'kg')
        ),
        createElement('span', { className: 'text-[10px] text-neutral-500 mt-1' }, `${weekStats.sets} working sets finished`)
      )
    )
  );

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

        const currentTab = activeTab || sortedMuscles[0];

        return createElement(
          Fragment,
          null,
          weekStatsContent,
          createElement(MuscleDistributionChart, { workouts: weekStats.weekWorkouts, exercises }),
          
          createElement(
            'div',
            { className: 'mt-8' },
            createElement('h2', { className: 'text-base font-extrabold text-neutral-200 uppercase tracking-wider mb-6' }, 'Personal Records'),
            
            Object.keys(groupedRecords).length === 0
              ? createElement(
                  'div',
                  { className: 'text-center py-8 border border-dashed border-neutral-800/50 rounded-2xl bg-neutral-900/30' },
                  createElement('span', { className: 'text-sm font-medium text-neutral-500' }, 'No personal records established yet.')
                )
              : createElement(
                  'div',
                  { className: 'space-y-6' },
                  // Tabs row
                  createElement(
                    'div',
                    { className: 'flex gap-2 overflow-x-auto pb-2 scrollbar-hide' },
                    sortedMuscles.map(muscle => {
                      const isActive = currentTab === muscle;
                      const muscleStyle = getMuscleStyle(muscle);
                      const tabClass = isActive 
                        ? muscleStyle 
                        : 'text-neutral-400 bg-neutral-900/50 border-neutral-800/50 hover:bg-neutral-800';
                      
                      return createElement(
                        'button',
                        { 
                          key: muscle,
                          className: `whitespace-nowrap px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest cursor-pointer transition-all outline-none ${tabClass}`,
                          onClick: () => setActiveTab(muscle)
                        },
                        muscle
                      );
                    })
                  ),
                  // Content grid for active tab
                  createElement(
                    'div',
                    { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4' },
                    (groupedRecords[currentTab] || []).map((pr, index) => {
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
                          createElement('div', { className: 'font-bold text-sm text-neutral-200 group-hover:text-emerald-400 transition-colors' }, pr.exerciseName)
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
                )
          )
        );
      })();

  return createElement(
    'div',
    { className: 'space-y-4 pb-20' },
    createElement('h2', { className: 'text-base font-extrabold text-neutral-200 uppercase tracking-wider' }, 'Metrics & Analytics'),
    content
  );
}
