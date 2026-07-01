import { createElement } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { COMPREHENSIVE_EXERCISES } from '../data/dbExercises';

export default function ExercisesScreen() {
  const {
    exercises,
    setShowCreateLibraryModal,
    handleDeleteExerciseFromLibrary,
  } = useWorkout();

  // List of exercises grouped by muscle
  const groupsList = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'].map(muscle => {
    const groupExercises = exercises.filter(e => e.muscle === muscle);
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

    // List by muscle groups
    createElement(
      'div',
      { className: 'space-y-6' },
      groupsList
    )
  );
}
