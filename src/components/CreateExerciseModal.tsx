import { createElement, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function CreateExerciseModal() {
  const {
    showCreateLibraryModal,
    setShowCreateLibraryModal,
    newLibName,
    setNewLibName,
    newLibMuscle,
    setNewLibMuscle,
    newLibType,
    setNewLibType,
    handleCreateExerciseInLibrary,
  } = useWorkout();

  if (!showCreateLibraryModal) return null;

  return createElement(
    'div',
    { className: 'fixed inset-0 bg-black/60 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4' },
    createElement(
      'div',
      { className: 'bg-[#121212] border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-y-auto flex flex-col shadow-2xl' },
      
      // Header
      createElement(
        'div',
        { className: 'p-4 border-b border-neutral-900 flex justify-between items-center' },
        createElement('h3', { className: 'text-sm font-extrabold text-neutral-100' }, 'Create Custom Movement'),
        createElement(
          'button',
          {
            onClick: () => setShowCreateLibraryModal(false),
            className: 'text-neutral-500 hover:text-neutral-300 p-1 rounded-lg hover:bg-neutral-900 cursor-pointer'
          },
          createElement(X, { className: 'w-4 h-4' })
        )
      ),

      // Body Form
      createElement(
        'div',
        { className: 'p-4 space-y-4' },

        // Exercise Name Input
        createElement(
          'div',
          { className: 'space-y-1' },
          createElement('label', { className: 'text-[10px] font-bold text-neutral-400 uppercase tracking-wider block' }, 'Exercise Name'),
          createElement('input', {
            type: 'text',
            placeholder: 'e.g. Romanian Deadlift, Bulgarian Split Squat...',
            value: newLibName,
            onChange: (e: ChangeEvent<HTMLInputElement>) => setNewLibName(e.target.value),
            className: 'w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 text-xs rounded-lg p-2.5 text-neutral-100 focus:outline-none'
          })
        ),

        // Muscle Group Dropdown
        createElement(
          'div',
          { className: 'space-y-1' },
          createElement('label', { className: 'text-[10px] font-bold text-neutral-400 uppercase tracking-wider block' }, 'Muscle Group Grouping'),
          createElement(
            'select',
            {
              value: newLibMuscle,
              onChange: (e: ChangeEvent<HTMLSelectElement>) => setNewLibMuscle(e.target.value as any),
              className: 'w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 text-xs rounded-lg p-2.5 text-neutral-200 focus:outline-none'
            },
            createElement('option', { value: 'chest' }, 'Chest'),
            createElement('option', { value: 'back' }, 'Back'),
            createElement('option', { value: 'legs' }, 'Legs'),
            createElement('option', { value: 'shoulders' }, 'Shoulders'),
            createElement('option', { value: 'arms' }, 'Arms'),
            createElement('option', { value: 'core' }, 'Core'),
            createElement('option', { value: 'cardio' }, 'Cardio')
          )
        ),

        // Set Type Dropdown
        createElement(
          'div',
          { className: 'space-y-1' },
          createElement('label', { className: 'text-[10px] font-bold text-neutral-400 uppercase tracking-wider block' }, 'Exercise Set Type'),
          createElement(
            'select',
            {
              value: newLibType,
              onChange: (e: ChangeEvent<HTMLSelectElement>) => setNewLibType(e.target.value as any),
              className: 'w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 text-xs rounded-lg p-2.5 text-neutral-200 focus:outline-none'
            },
            createElement('option', { value: 'weight' }, 'Weighted (Weight + Reps)'),
            createElement('option', { value: 'bodyweight' }, 'Bodyweight (Reps Only)'),
            createElement('option', { value: 'cardio' }, 'Cardio (Time + Distance)')
          )
        ),

        // Submit & Cancel button
        createElement(
          'div',
          { className: 'pt-2 flex gap-2' },
          createElement(
            'button',
            {
              onClick: handleCreateExerciseInLibrary,
              className: 'flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg cursor-pointer'
            },
            'Add to Gym Library'
          ),
          createElement(
            'button',
            {
              onClick: () => setShowCreateLibraryModal(false),
              className: 'flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg cursor-pointer'
            },
            'Cancel'
          )
        )
      )
    )
  );
}
