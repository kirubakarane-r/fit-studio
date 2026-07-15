import { createElement } from 'react';
import { Dumbbell, History, Ruler, TrendingUp, BookOpen, Apple } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function BottomNav() {
  const { screen, navigateTo, activeWorkout } = useWorkout();

  return createElement(
    'nav',
    { className: 'fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-t border-neutral-900' },
    createElement(
      'div',
      { className: 'max-w-lg w-full mx-auto px-4 h-16 flex justify-between items-center' },
      
      // Home button
      createElement(
        'button',
        {
          onClick: () => navigateTo(activeWorkout ? 'active' : 'home'),
          className: `flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] font-bold tracking-tight cursor-pointer ${
            screen === 'home' || screen === 'active' ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
          }`
        },
        createElement(Dumbbell, { className: 'w-5 h-5' }),
        createElement('span', null, activeWorkout ? 'Workout' : 'Home')
      ),

      // History button
      createElement(
        'button',
        {
          onClick: () => navigateTo('history'),
          className: `flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] font-bold tracking-tight cursor-pointer ${
            screen === 'history' ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
          }`
        },
        createElement(History, { className: 'w-5 h-5' }),
        createElement('span', null, 'History')
      ),

      // Body button
      createElement(
        'button',
        {
          onClick: () => navigateTo('measurements'),
          className: `flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] font-bold tracking-tight cursor-pointer ${
            screen === 'measurements' ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
          }`
        },
        createElement(Ruler, { className: 'w-5 h-5' }),
        createElement('span', null, 'Body')
      ),

      // Progress button
      createElement(
        'button',
        {
          onClick: () => navigateTo('progress'),
          className: `flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] font-bold tracking-tight cursor-pointer ${
            screen === 'progress' ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
          }`
        },
        createElement(TrendingUp, { className: 'w-5 h-5' }),
        createElement('span', null, 'Progress')
      ),

      // Nutrition button
      createElement(
        'button',
        {
          onClick: () => navigateTo('nutrition'),
          className: `flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] font-bold tracking-tight cursor-pointer ${
            screen === 'nutrition' ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
          }`
        },
        createElement(Apple, { className: 'w-5 h-5' }),
        createElement('span', null, 'Nutrition')
      )
    )
  );
}
