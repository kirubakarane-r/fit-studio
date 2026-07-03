import { createElement, useMemo } from 'react';
import { Workout } from '../types';

interface ActivityHeatmapProps {
  workouts: Workout[];
}

export default function ActivityHeatmap({ workouts }: ActivityHeatmapProps) {
  const { weeks, totalWorkouts } = useMemo(() => {
    // We want to show the last 12 weeks of data (including current week)
    const weeksCount = 12;
    const now = new Date();
    
    // Find the Sunday of the current week
    const currentWeekEnd = new Date(now);
    currentWeekEnd.setDate(now.getDate() + (6 - now.getDay())); // Saturday of current week
    currentWeekEnd.setHours(23, 59, 59, 999);

    const startDate = new Date(currentWeekEnd);
    startDate.setDate(startDate.getDate() - (weeksCount * 7) + 1);
    startDate.setHours(0, 0, 0, 0);

    // Create a map of workout dates (YYYY-MM-DD)
    const workoutDays = new Set<string>();
    let total = 0;
    workouts.forEach(w => {
      const wDate = new Date(w.date);
      if (wDate >= startDate && wDate <= currentWeekEnd) {
        workoutDays.add(wDate.toISOString().split('T')[0]);
        total++;
      }
    });

    const weeksArray = [];
    let currentDay = new Date(startDate);
    
    for (let w = 0; w < weeksCount; w++) {
      const daysInWeek = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDay.toISOString().split('T')[0];
        daysInWeek.push({
          date: new Date(currentDay),
          isActive: workoutDays.has(dateStr),
          isFuture: currentDay > now
        });
        currentDay.setDate(currentDay.getDate() + 1);
      }
      weeksArray.push(daysInWeek);
    }

    return { weeks: weeksArray, totalWorkouts: total };
  }, [workouts]);

  return createElement(
    'div',
    { className: 'bg-[#121212]/80 backdrop-blur-xl border border-neutral-800/60 rounded-3xl p-6 shadow-2xl shadow-black/50 overflow-hidden relative group' },
    createElement('div', { className: 'absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none' }),
    
    createElement(
      'div',
      { className: 'flex justify-between items-end mb-6' },
      createElement(
        'div',
        null,
        createElement('h3', { className: 'text-lg font-extrabold text-neutral-100 tracking-tight' }, 'Activity'),
        createElement('p', { className: 'text-xs text-neutral-500 mt-1' }, 'Last 12 weeks of training')
      ),
      createElement(
        'div',
        { className: 'text-right' },
        createElement('div', { className: 'text-sm font-black text-emerald-400' }, totalWorkouts, ' Sessions')
      )
    ),

    createElement(
      'div',
      { className: 'flex justify-between gap-1 overflow-x-auto pb-2 scrollbar-hide' },
      weeks.map((week, wIdx) => 
        createElement(
          'div',
          { key: wIdx, className: 'flex flex-col gap-1' },
          week.map((day, dIdx) => {
            let bgClass = 'bg-neutral-800/50 border border-neutral-700/30'; // empty
            if (day.isFuture) {
              bgClass = 'bg-neutral-900 border border-neutral-800/20 opacity-30';
            } else if (day.isActive) {
              bgClass = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
            }
            
            return createElement('div', {
              key: dIdx,
              className: `w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] ${bgClass} transition-all duration-300 hover:scale-110 cursor-default`,
              title: day.date.toDateString()
            });
          })
        )
      )
    ),

    createElement(
      'div',
      { className: 'flex items-center gap-2 mt-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest justify-end' },
      createElement('span', null, 'Less'),
      createElement('div', { className: 'flex gap-1' },
        createElement('div', { className: 'w-3 h-3 rounded-[3px] bg-neutral-800/50 border border-neutral-700/30' }),
        createElement('div', { className: 'w-3 h-3 rounded-[3px] bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' })
      ),
      createElement('span', null, 'More')
    )
  );
}
