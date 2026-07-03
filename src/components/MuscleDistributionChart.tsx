import { createElement, useMemo } from 'react';
import { Exercise, Workout } from '../types';

interface MuscleDistributionChartProps {
  workouts: Workout[];
  exercises: Exercise[];
}

export default function MuscleDistributionChart({ workouts, exercises }: MuscleDistributionChartProps) {
  const { distribution, totalSets } = useMemo(() => {
    const muscleCounts: Record<string, number> = {};
    let total = 0;

    workouts.forEach(w => {
      w.exercises.forEach(exInWorkout => {
        const exData = exercises.find(e => e.id === exInWorkout.id);
        if (exData) {
          const muscle = exData.muscle;
          exInWorkout.sets.forEach(s => {
            if (s.done) {
              muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
              total++;
            }
          });
        }
      });
    });

    const dist = Object.keys(muscleCounts).map(muscle => {
      const count = muscleCounts[muscle];
      return {
        muscle,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    }).sort((a, b) => b.percentage - a.percentage);

    return { distribution: dist, totalSets: total };
  }, [workouts, exercises]);

  // Color mapping for different muscle groups to make the segmented bar colorful
  const colorMap: Record<string, string> = {
    chest: 'bg-blue-500',
    back: 'bg-emerald-500',
    legs: 'bg-purple-500',
    shoulders: 'bg-amber-500',
    arms: 'bg-rose-500',
    core: 'bg-cyan-500',
    cardio: 'bg-orange-500'
  };

  const getColor = (muscle: string, index: number) => {
    const key = muscle.toLowerCase();
    if (colorMap[key]) return colorMap[key];
    const fallbackColors = ['bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-rose-400'];
    return fallbackColors[index % fallbackColors.length];
  };

  return createElement(
    'div',
    { className: 'bg-[#121212]/80 backdrop-blur-xl border border-neutral-800/60 rounded-3xl p-6 shadow-2xl shadow-black/50' },
    createElement(
      'div',
      { className: 'flex justify-between items-end mb-6' },
      createElement(
        'div',
        null,
        createElement('h3', { className: 'text-lg font-extrabold text-neutral-100 tracking-tight' }, 'Muscle Focus'),
        createElement('p', { className: 'text-xs text-neutral-500 mt-1' }, 'Sets performed in selected week')
      )
    ),

    totalSets === 0
      ? createElement(
          'div',
          { className: 'text-center py-6 border border-dashed border-neutral-800/50 rounded-2xl bg-neutral-900/30' },
          createElement('span', { className: 'text-xs font-medium text-neutral-500' }, 'No sets performed recently.')
        )
      : createElement(
          'div',
          { className: 'space-y-5' },
          // The Segmented Bar
          createElement(
            'div',
            { className: 'w-full h-3 rounded-full flex overflow-hidden shadow-inner bg-neutral-900' },
            distribution.map((d, idx) => 
              createElement('div', {
                key: d.muscle,
                className: `h-full ${getColor(d.muscle, idx)} transition-all duration-1000 ease-out hover:opacity-80`,
                style: { width: `${d.percentage}%` },
                title: `${d.muscle.toUpperCase()}: ${Math.round(d.percentage)}%`
              })
            )
          ),
          
          // The Legend Grid
          createElement(
            'div',
            { className: 'grid grid-cols-2 gap-3 sm:gap-4' },
            distribution.slice(0, 6).map((d, idx) => 
              createElement(
                'div',
                { key: d.muscle, className: 'flex items-center justify-between bg-neutral-900/40 rounded-xl p-3 border border-neutral-800/30' },
                createElement(
                  'div',
                  { className: 'flex items-center gap-2' },
                  createElement('div', { className: `w-2 h-2 rounded-full ${getColor(d.muscle, idx)} shadow-lg` }),
                  createElement('span', { className: 'text-[11px] sm:text-xs font-bold text-neutral-300 uppercase tracking-wider' }, d.muscle)
                ),
                createElement('span', { className: 'text-xs font-black text-neutral-100' }, `${Math.round(d.percentage)}%`)
              )
            )
          )
        )
  );
}
