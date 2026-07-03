import { createElement, useMemo } from 'react';
import { Activity, Weight, Hash, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Workout } from '../types';

interface WeeklySnapshotProps {
  workouts: Workout[];
}

export default function WeeklySnapshot({ workouts }: WeeklySnapshotProps) {
  const stats = useMemo(() => {
    const nowTime = new Date();
    
    // Current Week
    const currentWeekStart = new Date(nowTime);
    currentWeekStart.setDate(nowTime.getDate() - nowTime.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    // Last Week
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(currentWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    let currentWorkouts = 0, currentVolume = 0, currentSets = 0;
    let pastWorkouts = 0, pastVolume = 0, pastSets = 0;

    workouts.forEach(w => {
      const wDate = new Date(w.date);
      if (wDate >= currentWeekStart) {
        currentWorkouts++;
        w.exercises.forEach(ex => {
          ex.sets.forEach(s => {
            if (s.done) {
              currentSets++;
              const weight = parseFloat(s.weight) || 0;
              const reps = parseInt(s.reps) || 0;
              currentVolume += weight * reps;
            }
          });
        });
      } else if (wDate >= lastWeekStart && wDate <= lastWeekEnd) {
        pastWorkouts++;
        w.exercises.forEach(ex => {
          ex.sets.forEach(s => {
            if (s.done) {
              pastSets++;
              const weight = parseFloat(s.weight) || 0;
              const reps = parseInt(s.reps) || 0;
              pastVolume += weight * reps;
            }
          });
        });
      }
    });

    return {
      current: { workouts: currentWorkouts, volume: currentVolume, sets: currentSets },
      past: { workouts: pastWorkouts, volume: pastVolume, sets: pastSets }
    };
  }, [workouts]);

  const renderStatCard = (title: string, Icon: any, currentVal: number, pastVal: number, format: (v: number) => string) => {
    let trend = 0;
    if (pastVal > 0) {
      trend = ((currentVal - pastVal) / pastVal) * 100;
    } else if (currentVal > 0) {
      trend = 100;
    }

    const isPositive = trend > 0;
    const isNegative = trend < 0;
    const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
    const trendColor = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-neutral-500';
    const trendBg = isPositive ? 'bg-emerald-400/10' : isNegative ? 'bg-red-400/10' : 'bg-neutral-800';

    return createElement(
      'div',
      { className: 'bg-[#121212]/80 backdrop-blur-xl border border-neutral-800/60 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-2xl shadow-black/50 relative overflow-hidden group' },
      createElement('div', { className: 'absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' }),
      createElement(Icon, { className: 'w-5 h-5 text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' }),
      createElement('div', { className: 'text-2xl font-black text-neutral-100 tracking-tight' }, format(currentVal)),
      createElement('div', { className: 'text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-1' }, title),
      
      createElement(
        'div',
        { className: `mt-3 flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${trendBg} ${trendColor}` },
        createElement(TrendIcon, { className: 'w-3 h-3' }),
        createElement('span', null, pastVal === 0 && currentVal > 0 ? 'NEW' : `${Math.abs(Math.round(trend))}%`)
      )
    );
  };

  return createElement(
    'div',
    { className: 'grid grid-cols-3 gap-3 mb-6' },
    renderStatCard('Workouts', Activity, stats.current.workouts, stats.past.workouts, v => v.toString()),
    renderStatCard('Volume (kg)', Weight, stats.current.volume, stats.past.volume, v => Math.round(v).toLocaleString()),
    renderStatCard('Total Sets', Hash, stats.current.sets, stats.past.sets, v => v.toString())
  );
}
