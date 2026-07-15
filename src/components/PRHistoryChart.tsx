import { createElement, useState, useMemo } from 'react';
import { Exercise, Workout } from '../types';
import { formatDateShort } from '../utils/formatters';

interface PRHistoryChartProps {
  workouts: Workout[];
  exercises: Exercise[];
}

export default function PRHistoryChart({ workouts, exercises }: PRHistoryChartProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  // 1. Find all exercises that have been performed at least once
  const performedExercises = useMemo(() => {
    const performed = new Set<string>();
    workouts.forEach(w => w.exercises.forEach(ex => performed.add(ex.id)));
    return exercises.filter(e => performed.has(e.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [workouts, exercises]);

  // Set default selection
  useMemo(() => {
    if (!selectedExerciseId && performedExercises.length > 0) {
      setSelectedExerciseId(performedExercises[0].id);
    }
  }, [performedExercises, selectedExerciseId]);

  // 2. Compute history for the selected exercise
  const chartData = useMemo(() => {
    if (!selectedExerciseId) return [];

    const exerciseData = exercises.find(e => e.id === selectedExerciseId);
    const isBodyweight = exerciseData?.type === 'bodyweight';
    const isTimed = exerciseData?.type === 'timed';

    const history: { date: Date, value: number, label: string }[] = [];

    // Traverse workouts from oldest to newest
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedWorkouts.forEach(w => {
      const exInWorkout = w.exercises.find(ex => ex.id === selectedExerciseId);
      if (exInWorkout) {
        let maxVal = 0;
        exInWorkout.sets.forEach(s => {
          if (!s.done) return;
          const wt = parseFloat(s.weight) || 0;
          const rp = parseInt(s.reps) || 0;
          
          if (isBodyweight) {
            if (rp > maxVal) maxVal = rp;
          } else {
            // For weight, we might want max weight
            if (wt > maxVal) maxVal = wt;
          }
        });

        if (maxVal > 0) {
          history.push({
            date: new Date(w.date),
            value: maxVal,
            label: isTimed ? `${maxVal} sec` : isBodyweight ? `${maxVal} reps` : `${maxVal}kg`
          });
        }
      }
    });

    return history;
  }, [workouts, selectedExerciseId, exercises]);

  if (performedExercises.length === 0) {
    return createElement(
      'div',
      { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-5 text-center text-xs text-neutral-500' },
      'No exercises performed yet.'
    );
  }

  // Calculate max value for chart scaling
  const maxChartValue = Math.max(...chartData.map(d => d.value), 10); // Minimum 10 scale

  return createElement(
    'div',
    { className: 'bg-[#121212]/80 backdrop-blur-xl border border-neutral-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50' },
    // Header & Select
    createElement(
      'div',
      { className: 'mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4' },
      createElement(
        'div',
        null,
        createElement('h3', { className: 'text-lg font-extrabold text-neutral-100 tracking-tight' }, 'Strength Progression'),
        createElement('p', { className: 'text-xs text-neutral-500 mt-1' }, 'Track your personal records over time')
      ),
      createElement(
        'div',
        { className: 'relative min-w-[200px]' },
        createElement(
          'select',
          {
            value: selectedExerciseId,
            onChange: (e: any) => setSelectedExerciseId(e.target.value),
            className: 'w-full appearance-none bg-neutral-900/80 border border-neutral-700/50 rounded-2xl pl-4 pr-10 py-3 text-sm font-semibold text-neutral-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer shadow-inner'
          },
          performedExercises.map(ex =>
            createElement('option', { key: ex.id, value: ex.id }, ex.name)
          )
        ),
        // Custom Chevron
        createElement(
          'div',
          { className: 'absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400' },
          createElement(
            'svg',
            { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
            createElement('path', { d: 'm6 9 6 6 6-6' })
          )
        )
      )
    ),

    // Chart Area
    chartData.length === 0
      ? createElement(
          'div',
          { className: 'flex flex-col items-center justify-center h-48 bg-neutral-900/30 rounded-2xl border border-neutral-800/50 border-dashed' },
          createElement('p', { className: 'text-sm font-medium text-neutral-500' }, 'No data available for this exercise.')
        )
      : createElement(
          'div',
          { className: 'relative h-56 w-full flex items-end justify-between gap-2 sm:gap-4 mt-6 pt-10' },
          // Background grid lines
          createElement(
            'div',
            { className: 'absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-neutral-800/50 z-0' },
            createElement('div', { className: 'w-full border-t border-neutral-800/30 h-0 opacity-50' }),
            createElement('div', { className: 'w-full border-t border-neutral-800/30 h-0 opacity-50' }),
            createElement('div', { className: 'w-full border-t border-neutral-800/30 h-0 opacity-50' })
          ),
          
          chartData.map((dataPoint, idx) => {
            const heightPercent = Math.max((dataPoint.value / maxChartValue) * 100, 8); // min 8% for visibility
            
            return createElement(
              'div',
              { key: idx, className: 'flex-1 flex flex-col items-center justify-end h-full group relative z-10 cursor-crosshair' },
              
              // Tooltip
              createElement(
                'div',
                { className: 'absolute -top-12 bg-neutral-800/95 backdrop-blur-sm border border-neutral-700/60 shadow-xl rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:-translate-y-1 scale-95 group-hover:scale-100 pointer-events-none flex flex-col items-center z-20' },
                createElement('span', { className: 'text-xs font-black text-emerald-400' }, dataPoint.label),
                createElement('span', { className: 'text-[9px] font-medium text-neutral-400 mt-0.5' }, formatDateShort(dataPoint.date.toISOString()))
              ),
              
              // Bar
              createElement('div', {
                className: 'w-full max-w-[40px] bg-gradient-to-t from-emerald-600/80 to-emerald-400 rounded-t-lg transition-all duration-700 ease-out min-h-[4px] relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(52,211,153,0.4)] group-hover:from-emerald-500 group-hover:to-emerald-300',
                style: { height: `${heightPercent}%` }
              },
                // Inner highlight
                createElement('div', { className: 'absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none' })
              ),
              
              // Date Label
              createElement(
                'div',
                { className: 'mt-3 text-[9px] sm:text-[10px] font-medium text-neutral-500 text-center uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis w-full group-hover:text-neutral-300 transition-colors' },
                formatDateShort(dataPoint.date.toISOString())
              )
            );
          })
        )
  );
}
