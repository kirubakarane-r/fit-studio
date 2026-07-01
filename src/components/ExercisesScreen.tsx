import { createElement, useState, ChangeEvent, useRef } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { COMPREHENSIVE_EXERCISES } from '../data/dbExercises';
import { capitalize } from '../utils/formatters';

export default function ExercisesScreen() {
  const {
    exercises,
    setShowCreateLibraryModal,
    handleDeleteExerciseFromLibrary,
  } = useWorkout();

  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const chipsRef = useRef<HTMLDivElement>(null);

  // List of exercises grouped by muscle
  const groupsList = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'].map(muscle => {
    if (muscleFilter && muscleFilter !== muscle) return null;

    const groupExercises = exercises.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
      return e.muscle === muscle && matchesSearch;
    });
    
    if (groupExercises.length === 0) return null;

    return createElement(
      'div',
      { key: muscle, className: 'space-y-2' },
      createElement('h3', { className: 'text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1' }, muscle),
      createElement(
        'div',
        { className: 'grid gap-2' },
        groupExercises.map(ex => {
          const isCustom = !COMPREHENSIVE_EXERCISES.some(de => de.id === ex.id);

          return createElement(
            'div',
            {
              key: ex.id,
              className: 'bg-[#121212] border border-neutral-800/80 rounded-2xl p-3.5 flex justify-between items-center'
            },
            createElement(
              'div',
              null,
              createElement('h4', { className: 'text-sm font-semibold text-neutral-200' }, ex.name),
              createElement(
                'span',
                { className: 'text-[10px] text-neutral-500 mt-1 inline-block font-mono' },
                ex.type === 'weight' ? 'Weight + Reps' : ex.type === 'bodyweight' ? 'Bodyweight' : 'Cardio'
              )
            ),
            isCustom
              ? createElement(
                  'button',
                  {
                    onClick: () => handleDeleteExerciseFromLibrary(ex.id),
                    className: 'p-1.5 text-neutral-500 hover:text-red-400 rounded-lg cursor-pointer hover:bg-neutral-900 transition-colors'
                  },
                  createElement(Trash2, { className: 'w-4 h-4' })
                )
              : null
          );
        })
      )
    );
  });

  return createElement(
    'div',
    { className: 'space-y-4' },
    createElement(
      'div',
      { className: 'flex justify-between items-center' },
      createElement('h2', { className: 'text-base font-extrabold text-neutral-200 uppercase tracking-wider' }, 'Exercise Library'),
      createElement(
        'button',
        {
          onClick: () => setShowCreateLibraryModal(true),
          className: 'px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer'
        },
        createElement(Plus, { className: 'w-3.5 h-3.5' }),
        createElement('span', null, 'Create Custom')
      )
    ),

    // Search and Filter Block
    createElement(
      'div',
      { className: 'space-y-3' },
      // Search
      createElement(
        'div',
        { className: 'flex items-center gap-2 bg-[#121212] border border-neutral-800 px-3 py-2.5 rounded-xl focus-within:border-emerald-500' },
        createElement(Search, { className: 'w-4 h-4 text-neutral-500' }),
        createElement('input', {
          type: 'text',
          placeholder: 'Search library movements...',
          value: search,
          onChange: (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
          className: 'w-full bg-transparent border-none text-sm text-neutral-200 focus:outline-none placeholder-neutral-600'
        })
      ),

      // Muscle Selector Chips
      createElement(
        'div',
        { className: 'relative flex items-center px-0' },
        createElement(
          'div',
          {
            ref: chipsRef,
            className: 'flex gap-2 overflow-x-auto py-1 no-scrollbar w-full'
          },
          createElement(
            'button',
            {
              onClick: () => setMuscleFilter(''),
              className: `px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                muscleFilter === ''
                  ? 'bg-emerald-500 text-black border-emerald-500'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800'
              }`
            },
            'All'
          ),
          ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'].map(m =>
            createElement(
              'button',
              {
                key: m,
                onClick: () => setMuscleFilter(m === muscleFilter ? '' : m),
                className: `px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                  muscleFilter === m
                    ? 'bg-emerald-500 text-black border-emerald-500'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`
              },
              capitalize(m)
            )
          )
        )
      )
    ),

    // List by muscle groups
    createElement(
      'div',
      { className: 'space-y-6 pb-6' },
      groupsList.some(g => g !== null) 
        ? groupsList 
        : createElement(
            'div',
            { className: 'text-center py-8 text-neutral-500 text-sm' },
            'No matching exercises found.'
          )
    )
  );
}
