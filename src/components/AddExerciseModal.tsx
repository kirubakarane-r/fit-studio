import { createElement, ChangeEvent } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { capitalize, getMuscleColor } from '../utils/formatters';
import { useWorkout } from '../context/WorkoutContext';

export default function AddExerciseModal() {
  const {
    showAddExerciseModal,
    setShowAddExerciseModal,
    exerciseSearch,
    setExerciseSearch,
    muscleFilter,
    setMuscleFilter,
    exercises,
    handleAddExerciseToActive,
    setShowCreateLibraryModal,
  } = useWorkout();

  if (!showAddExerciseModal) return null;

  const filtered = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle = !muscleFilter || e.muscle === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const hasMatch = exercises.some(e => e.name.toLowerCase().includes(exerciseSearch.trim().toLowerCase()));
  const showCreateMovementBtn = exerciseSearch.trim().length > 0 && !hasMatch;

  const handleSelectExercise = (id: string) => {
    handleAddExerciseToActive(id);
    setShowAddExerciseModal(false);
  };

  const handleCreateNewExercise = () => {
    setShowAddExerciseModal(false);
    setShowCreateLibraryModal(true);
  };

  // Render list of filtered exercises
  const exerciseListContent = filtered.length === 0
    ? createElement(
        'div',
        { className: 'text-center py-6 text-sm text-neutral-500' },
        'No matching exercises found.'
      )
    : filtered.map(ex =>
        createElement(
          'div',
          {
            key: ex.id,
            onClick: () => handleSelectExercise(ex.id),
            className: 'bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 p-3 rounded-2xl flex justify-between items-center transition-all cursor-pointer'
          },
          createElement(
            'div',
            null,
            createElement('h4', { className: 'text-sm font-bold text-neutral-200' }, ex.name),
            createElement(
              'span',
              { className: 'text-xs text-neutral-500 font-mono mt-0.5 inline-block' },
              ex.type === 'weight' ? 'Weighted' : ex.type === 'bodyweight' ? 'Bodyweight' : 'Cardio'
            )
          ),
          createElement(
            'span',
            { className: `text-xs font-mono px-2 py-0.5 rounded-full border ${getMuscleColor(ex.muscle)}` },
            capitalize(ex.muscle)
          )
        )
      );

  return createElement(
    'div',
    { className: 'fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4' },
    createElement(
      'div',
      { className: 'bg-[#161618] border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[95vh] flex flex-col shadow-2xl overflow-hidden' },
      
      // Handle bar on mobile
      createElement('div', { className: 'w-12 h-1 bg-neutral-800 rounded-full mx-auto mt-3 mb-2 sm:hidden' }),

      // Header block
      createElement(
        'div',
        { className: 'p-4 border-b border-neutral-900 flex justify-between items-center' },
        createElement(
          'div',
          null,
          createElement('h3', { className: 'text-base font-extrabold text-neutral-100' }, 'Add Exercise Movement'),
          createElement('p', { className: 'text-sm text-neutral-500 mt-1' }, 'Select an active exercise block from the library list.')
        ),
        createElement(
          'button',
          {
            onClick: () => setShowAddExerciseModal(false),
            className: 'text-neutral-500 hover:text-neutral-300 p-1 rounded-lg hover:bg-neutral-900 cursor-pointer'
          },
          createElement(X, { className: 'w-4 h-4' })
        )
      ),

      // Filters Block
      createElement(
        'div',
        { className: 'p-4 space-y-3 bg-neutral-950/20 border-b border-neutral-900' },
        
        // Search bar
        createElement(
          'div',
          { className: 'flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-2.5 rounded-xl focus-within:border-emerald-500' },
          createElement(Search, { className: 'w-4 h-4 text-neutral-500' }),
          createElement('input', {
            type: 'text',
            placeholder: 'Search exercise catalog...',
            value: exerciseSearch,
            onChange: (e: ChangeEvent<HTMLInputElement>) => setExerciseSearch(e.target.value),
            className: 'w-full bg-transparent border-none text-sm text-neutral-200 focus:outline-none'
          })
        ),

        // Muscle Selector Chips
        createElement(
          'div',
          { className: 'flex flex-wrap gap-1.5 overflow-x-auto pb-1 max-h-24' },
          createElement(
            'button',
            {
              onClick: () => setMuscleFilter(''),
              className: `px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
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
                className: `px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  muscleFilter === m
                    ? 'bg-emerald-500 text-black border-emerald-500'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`
              },
              capitalize(m)
            )
          )
        )
      ),

      // Scrollable exercise library list
      createElement(
        'div',
        { className: 'flex-1 overflow-y-auto p-4 space-y-2' },
        exerciseListContent
      ),

      // Footer create action button
      showCreateMovementBtn && createElement(
        'div',
        { className: 'p-4 border-t border-neutral-900 bg-neutral-950/20 flex flex-col' },
        createElement(
          'button',
          {
            onClick: handleCreateNewExercise,
            className: 'w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer'
          },
          createElement(Plus, { className: 'w-4 h-4 text-emerald-400' }),
          createElement('span', null, 'Create New Movement Type')
        )
      )
    )
  );
}
