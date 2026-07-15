import { createElement, Fragment } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { formatTime, capitalize, getMuscleColor } from '../utils/formatters';
import { useWorkout } from '../context/WorkoutContext';

export default function ActiveWorkoutScreen() {
  const {
    activeWorkout,
    elapsedTime,
    exercises,
    setShowFinishConfirm,
    setExerciseSearch,
    setMuscleFilter,
    setShowAddExerciseModal,
    handleRemoveExercise,
    handleUpdateSet,
    handleToggleSet,
    handleAddSet,
  } = useWorkout();

  if (!activeWorkout) return null;

  const handleOpenAddExercise = () => {
    setExerciseSearch('');
    setMuscleFilter('');
    setShowAddExerciseModal(true);
  };

  // Exercise Groups
  const exerciseGroupsContent = activeWorkout.exercises.length === 0
    ? createElement(
        'div',
        { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-8 text-center space-y-4' },
        createElement(
          'div',
          { className: 'inline-flex p-3 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-500' },
          createElement(Plus, { className: 'w-6 h-6' })
        ),
        createElement(
          'div',
          null,
          createElement('h4', { className: 'text-sm font-semibold text-neutral-300' }, 'No exercises added yet'),
          createElement('p', { className: 'text-xs text-neutral-500 mt-1' }, 'Start by adding your first movement tag or template exercise.')
        ),
        createElement(
          'button',
          {
            onClick: handleOpenAddExercise,
            className: 'px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer'
          },
          createElement(Plus, { className: 'w-3.5 h-3.5 text-emerald-400' }),
          createElement('span', null, 'Add Exercise')
        )
      )
    : activeWorkout.exercises.map((ex, exIndex) => {
        const exData = exercises.find(e => e.id === ex.id);
        const isCardio = exData?.type === 'cardio';
        const isBW = exData?.type === 'bodyweight';
        const isTimed = exData?.type === 'timed';

        return createElement(
          'div',
          {
            key: `${ex.id}-${exIndex}`,
            className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-4 space-y-3'
          },
          
          // Exercise Header
          createElement(
            'div',
            { className: 'flex justify-between items-center border-b border-neutral-900 pb-2' },
            createElement(
              'div',
              null,
              createElement('h4', { className: 'font-bold text-sm text-neutral-200' }, exData?.name || 'Unknown Exercise'),
              createElement(
                'span',
                { className: `text-[10px] font-mono px-2 py-0.5 rounded-full border mt-1 inline-block ${getMuscleColor(exData?.muscle || '')}` },
                capitalize(exData?.muscle || '')
              )
            ),
            createElement(
              'button',
              {
                onClick: () => handleRemoveExercise(exIndex),
                className: 'text-neutral-500 hover:text-red-400 p-1 rounded-lg hover:bg-neutral-900/60 transition-colors cursor-pointer'
              },
              createElement(X, { className: 'w-4 h-4' })
            )
          ),

          // Sets list
          createElement(
            'div',
            { className: 'space-y-2' },
            ex.sets.map((set, setIndex) => {
              let inputsContent;
              if (isCardio) {
                inputsContent = createElement(
                  Fragment,
                  null,
                  createElement(
                    'div',
                    { className: 'flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-2.5 py-1.5 rounded-lg focus-within:border-emerald-500' },
                    createElement('input', {
                      type: 'number',
                      placeholder: 'min',
                      value: set.weight,
                      onChange: (e: any) => handleUpdateSet(exIndex, setIndex, 'weight', e.target.value),
                      className: 'w-full bg-transparent border-none text-xs text-neutral-200 font-mono focus:outline-none'
                    }),
                    createElement('span', { className: 'text-[10px] text-neutral-500 font-medium font-mono' }, 'min')
                  ),
                  createElement(
                    'div',
                    { className: 'flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-2.5 py-1.5 rounded-lg focus-within:border-emerald-500' },
                    createElement('input', {
                      type: 'number',
                      placeholder: 'km',
                      value: set.reps,
                      onChange: (e: any) => handleUpdateSet(exIndex, setIndex, 'reps', e.target.value),
                      className: 'w-full bg-transparent border-none text-xs text-neutral-200 font-mono focus:outline-none'
                    }),
                    createElement('span', { className: 'text-[10px] text-neutral-500 font-medium font-mono' }, 'km')
                  )
                );
              } else if (isBW) {
                inputsContent = createElement(
                  'div',
                  { className: 'flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-2.5 py-1.5 rounded-lg focus-within:border-emerald-500' },
                  createElement('input', {
                    type: 'number',
                    placeholder: 'Reps',
                    value: set.reps,
                    onChange: (e: any) => handleUpdateSet(exIndex, setIndex, 'reps', e.target.value),
                    className: 'w-full bg-transparent border-none text-xs text-neutral-200 font-mono focus:outline-none'
                  }),
                  createElement('span', { className: 'text-[10px] text-neutral-500 font-medium font-mono' }, 'reps')
                );
              } else if (isTimed) {
                inputsContent = createElement(
                  'div',
                  { className: 'flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-2.5 py-1.5 rounded-lg focus-within:border-emerald-500' },
                  createElement('input', {
                    type: 'number',
                    placeholder: 'Time',
                    value: set.weight,
                    onChange: (e: any) => handleUpdateSet(exIndex, setIndex, 'weight', e.target.value),
                    className: 'w-full bg-transparent border-none text-xs text-neutral-200 font-mono focus:outline-none'
                  }),
                  createElement('span', { className: 'text-[10px] text-neutral-500 font-medium font-mono' }, 'sec')
                );
              } else {
                inputsContent = createElement(
                  Fragment,
                  null,
                  createElement(
                    'div',
                    { className: 'flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-2.5 py-1.5 rounded-lg focus-within:border-emerald-500' },
                    createElement('input', {
                      type: 'number',
                      placeholder: 'Weight',
                      value: set.weight,
                      onChange: (e: any) => handleUpdateSet(exIndex, setIndex, 'weight', e.target.value),
                      className: 'w-full bg-transparent border-none text-xs text-neutral-200 font-mono focus:outline-none'
                    }),
                    createElement('span', { className: 'text-[10px] text-neutral-500 font-medium font-mono' }, 'kg')
                  ),
                  createElement(
                    'div',
                    { className: 'flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-2.5 py-1.5 rounded-lg focus-within:border-emerald-500' },
                    createElement('input', {
                      type: 'number',
                      placeholder: 'Reps',
                      value: set.reps,
                      onChange: (e: any) => handleUpdateSet(exIndex, setIndex, 'reps', e.target.value),
                      className: 'w-full bg-transparent border-none text-xs text-neutral-200 font-mono focus:outline-none'
                    }),
                    createElement('span', { className: 'text-[10px] text-neutral-500 font-medium font-mono' }, 'reps')
                  ),
                  createElement(
                    'div',
                    { className: 'flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-2.5 py-1.5 rounded-lg focus-within:border-emerald-500' },
                    createElement('input', {
                      type: 'number',
                      placeholder: 'RIR',
                      value: set.rir || '',
                      onChange: (e: any) => handleUpdateSet(exIndex, setIndex, 'rir', e.target.value),
                      className: 'w-full bg-transparent border-none text-xs text-neutral-200 font-mono focus:outline-none'
                    }),
                    createElement('span', { className: 'text-[10px] text-neutral-500 font-medium font-mono' }, 'rir')
                  )
                );
              }

              const hasInputs = isBW 
                ? String(set.reps).trim() !== ''
                : isTimed
                  ? String(set.weight).trim() !== ''
                  : isCardio 
                    ? String(set.weight).trim() !== '' && String(set.reps).trim() !== ''
                    : String(set.weight).trim() !== '' && String(set.reps).trim() !== '';
              
              const isDisabled = set.done || !hasInputs;

              return createElement(
                'div',
                {
                  key: setIndex,
                  className: `grid items-center gap-2 py-1 px-2 rounded-xl transition-colors ${
                    set.done ? 'bg-emerald-950/10' : 'bg-transparent'
                  }`,
                  style: {
                    gridTemplateColumns: (isBW || isTimed)
                      ? '30px 1fr 40px' 
                      : isCardio 
                        ? '30px 1fr 1fr 40px' 
                        : '30px 1fr 1fr 1fr 40px'
                  }
                },
                createElement(
                  'span',
                  { className: 'text-xs font-mono font-bold text-neutral-500 text-center' },
                  isCardio ? 'C' : setIndex + 1
                ),
                inputsContent,
                createElement(
                  'button',
                  {
                    onClick: () => handleToggleSet(exIndex, setIndex),
                    disabled: isDisabled,
                    className: `w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      set.done
                        ? 'bg-emerald-500 text-black border border-emerald-500 cursor-not-allowed'
                        : hasInputs
                          ? 'bg-neutral-900 text-neutral-500 hover:text-neutral-300 border border-neutral-800 cursor-pointer'
                          : 'bg-neutral-900 text-neutral-700 border border-neutral-800/50 cursor-not-allowed opacity-50'
                    }`
                  },
                  createElement(Check, { className: 'w-4 h-4 stroke-[3]' })
                )
              );
            })
          ),

          // Add set button for this exercise block
          createElement(
            'button',
            {
              onClick: () => handleAddSet(exIndex),
              className: 'w-full mt-1.5 py-2 border border-dashed border-neutral-800 hover:border-neutral-700 bg-transparent text-neutral-400 hover:text-neutral-200 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1 cursor-pointer'
            },
            createElement(Plus, { className: 'w-3.5 h-3.5' }),
            createElement('span', null, 'Add Set')
          )
        );
      });

  const bottomAddExerciseButton = activeWorkout.exercises.length > 0
    ? createElement(
        'button',
        {
          onClick: handleOpenAddExercise,
          className: 'w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer'
        },
        createElement(Plus, { className: 'w-4 h-4 text-emerald-400' }),
        createElement('span', null, 'Add Exercise')
      )
    : null;

  return createElement(
    'div',
    { className: 'space-y-6' },

    // Header status bar
    createElement(
      'div',
      { className: 'sticky top-0 z-40 flex items-center justify-between bg-[#121212] border border-neutral-800 rounded-2xl p-4 shadow-2xl shadow-black/50' },
      createElement(
        'div',
        { className: 'space-y-1' },
        createElement('span', { className: 'text-[10px] font-bold text-emerald-400 uppercase tracking-widest' }, 'Active Gym Log'),
        createElement('h2', { className: 'font-extrabold text-base text-neutral-200' }, activeWorkout.name),
        createElement(
          'div',
          { className: 'flex items-center gap-2 mt-1.5' },
          createElement('span', { className: 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse' }),
          createElement(
            'span',
            { className: 'text-xs text-emerald-400 font-mono font-extrabold tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/15' },
            formatTime(elapsedTime)
          ),
          createElement('span', { className: 'text-[10px] text-neutral-400 font-semibold uppercase tracking-wider' }, 'Timer Enabled')
        )
      ),
      createElement(
        'button',
        {
          onClick: () => setShowFinishConfirm(true),
          className: 'px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer'
        },
        createElement(Check, { className: 'w-4 h-4' }),
        createElement('span', null, 'Finish')
      )
    ),

    // Exercises List Group Container
    createElement(
      'div',
      { className: 'space-y-4' },
      exerciseGroupsContent
    ),

    // Bottom Action buttons
    bottomAddExerciseButton
  );
}
