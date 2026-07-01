import { createElement } from 'react';
import { Workout, Exercise } from '../types';

interface WeeklyVolumeChartProps {
  workouts: Workout[];
  exercises: Exercise[];
}

export default function WeeklyVolumeChart({ workouts, exercises }: WeeklyVolumeChartProps) {
  // Generate the last 8 weeks intervals
  const now = new Date();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  
  const intervals = Array.from({ length: 8 }).map((_, i) => {
    const end = new Date(now.getTime() - i * ONE_WEEK_MS);
    const start = new Date(end.getTime() - ONE_WEEK_MS);
    return {
      start,
      end,
      label: i === 0 ? 'This' : `${i}w`,
      volume: 0,
    };
  }).reverse();

  // Find exercise helper
  const getExercise = (id: string) => exercises.find(e => e.id === id);

  // Compute volumes
  workouts.forEach(w => {
    const wDate = new Date(w.date);
    const wTime = wDate.getTime();

    // Find which interval this workout falls into
    const interval = intervals.find(inv => wTime >= inv.start.getTime() && wTime < inv.end.getTime() + 1000);
    if (interval) {
      w.exercises.forEach(ex => {
        const exData = getExercise(ex.id);
        if (exData && exData.type === 'weight') {
          ex.sets.forEach(s => {
            if (s.done) {
              const weight = parseFloat(s.weight) || 0;
              const reps = parseInt(s.reps) || 0;
              interval.volume += weight * reps;
            }
          });
        }
      });
    }
  });

  const maxVolume = Math.max(...intervals.map(inv => inv.volume), 1000);

  // Programmatically build elements to respect USER INTENT (no raw HTML JSX templates)
  return createElement(
    'div',
    { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-5 mb-6' },
    // Header div
    createElement(
      'div',
      { className: 'flex justify-between items-center mb-6' },
      createElement(
        'div',
        null,
        createElement(
          'h3',
          { className: 'text-sm font-semibold text-neutral-200 uppercase tracking-wider' },
          'Weekly Training Volume'
        ),
        createElement(
          'p',
          { className: 'text-xs text-neutral-400 mt-1' },
          'Total weight (kg) lifted per week'
        )
      ),
      createElement(
        'div',
        { className: 'text-right' },
        createElement(
          'span',
          { className: 'text-xs text-emerald-400 font-mono font-medium' },
          `Peak: ${Math.round(maxVolume).toLocaleString()} kg`
        )
      )
    ),
    // Chart Bars div
    createElement(
      'div',
      { className: 'flex items-end justify-between h-40 gap-1 sm:gap-2 px-1' },
      intervals.map((inv, index) => {
        const percentage = (inv.volume / maxVolume) * 100;
        const barHeight = Math.max(percentage, 4);

        return createElement(
          'div',
          { key: index, className: 'flex-1 min-w-0 flex flex-col items-center group relative' },
          // Tooltip div
          createElement(
            'div',
            { className: 'absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10' },
            createElement(
              'div',
              { className: 'bg-neutral-900 border border-neutral-700 text-[10px] text-neutral-200 font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap' },
              `${Math.round(inv.volume).toLocaleString()} kg`
            ),
            createElement('div', {
              className: 'w-1.5 h-1.5 bg-neutral-900 border-r border-b border-neutral-700 transform rotate-45 -mt-1'
            })
          ),
          // Bar container
          createElement(
            'div',
            { className: 'w-full bg-neutral-900/60 rounded-t-lg h-32 flex items-end overflow-hidden border border-neutral-800/40' },
            createElement('div', {
              className: `w-full rounded-t-md transition-all duration-500 ease-out ${
                index === intervals.length - 1
                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                  : 'bg-gradient-to-t from-neutral-700 to-emerald-500/70'
              }`,
              style: { height: `${barHeight}%` }
            })
          ),
          // Axis label
          createElement(
            'span',
            { className: 'text-[10px] text-neutral-500 mt-2 font-mono truncate max-w-full text-center' },
            inv.label
          )
        );
      })
    )
  );
}
