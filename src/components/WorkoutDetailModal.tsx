import { createElement, Fragment } from 'react';
import { X, Trash2, Edit2, Check, Plus } from 'lucide-react';
import { formatDuration, formatDateFull } from '../utils/formatters';
import { useWorkout } from '../context/WorkoutContext';

export default function WorkoutDetailModal() {
  const {
    selectedWorkoutId,
    setSelectedWorkoutId,
    workouts,
    exercises,
    editingWorkoutDraft,
    setEditingWorkoutDraft,
    handleStartEditingWorkout,
    handleAddSetToDraft,
    handleRemoveSetFromDraft,
    handleRemoveExerciseFromDraft,
    handleUpdateDraftSet,
    handleToggleDraftSetDone,
    handleSaveWorkoutEdits,
    setPendingDeleteWorkoutId,
  } = useWorkout();

  if (!selectedWorkoutId) return null;

  const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId);
  if (!selectedWorkout) return null;

  const isEditing = editingWorkoutDraft !== null && editingWorkoutDraft.id === selectedWorkoutId;
  const currentWorkout = isEditing ? editingWorkoutDraft : selectedWorkout;
  
  const vol = currentWorkout.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0), 0);
  const dur = currentWorkout.duration ? formatDuration(currentWorkout.duration) : '—';

  // Render Stats Grid Header (Only show if not editing)
  const statsHeaderElement = !isEditing
    ? createElement(
        'div',
        { className: 'grid grid-cols-3 gap-2 bg-[#19191c] border border-neutral-800/80 p-3 rounded-2xl' },
        createElement(
          'div',
          { className: 'text-center' },
          createElement('span', { className: 'text-[9px] text-neutral-400 uppercase tracking-widest block font-bold' }, 'Volume'),
          createElement('span', { className: 'text-sm font-extrabold text-emerald-400 font-mono block mt-0.5' }, `${Math.round(vol).toLocaleString()} kg`)
        ),
        createElement(
          'div',
          { className: 'text-center border-x border-neutral-800' },
          createElement('span', { className: 'text-[9px] text-neutral-400 uppercase tracking-widest block font-bold' }, 'Duration'),
          createElement('span', { className: 'text-sm font-extrabold text-neutral-200 block mt-0.5' }, dur)
        ),
        createElement(
          'div',
          { className: 'text-center' },
          createElement('span', { className: 'text-[9px] text-neutral-400 uppercase tracking-widest block font-bold' }, 'Exercises'),
          createElement('span', { className: 'text-sm font-extrabold text-neutral-200 block mt-0.5' }, currentWorkout.exercises.length)
        )
      )
    : null;

  // Title edit input (Only show if editing)
  const titleEditElement = isEditing
    ? createElement(
        'div',
        { className: 'space-y-1 bg-neutral-950/20 p-2.5 border border-neutral-800 rounded-xl mb-2' },
        createElement('label', { className: 'text-[10px] font-bold text-neutral-400 uppercase tracking-wider block' }, 'Edit Session Title'),
        createElement('input', {
          type: 'text',
          value: currentWorkout.name,
          onChange: (e: any) => setEditingWorkoutDraft({ ...currentWorkout, name: e.target.value }),
          className: 'w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 text-xs rounded-lg p-2 text-neutral-200 focus:outline-none'
        })
      )
    : null;

  // Render exercises list
  const exercisesListContent = currentWorkout.exercises.map((ex, exIdx) => {
    const exData = exercises.find(e => e.id === ex.id);
    const isCardio = exData?.type === 'cardio';
    const isBW = exData?.type === 'bodyweight';

    return createElement(
      'div',
      { key: exIdx, className: 'bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-4 space-y-2' },
      
      // Exercise label/remove header
      createElement(
        'div',
        { className: 'flex justify-between items-center border-b border-neutral-800 pb-2' },
        createElement('span', { className: 'text-xs font-bold text-neutral-200' }, exData?.name || 'Unknown Exercise'),
        isEditing
          ? createElement(
              'button',
              {
                onClick: () => handleRemoveExerciseFromDraft(exIdx),
                className: 'text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 cursor-pointer'
              },
              createElement(Trash2, { className: 'w-3.5 h-3.5' }),
              createElement('span', null, 'Remove')
            )
          : null
      ),

      // Sets list block
      createElement(
        'div',
        { className: 'space-y-1.5' },
        ex.sets.map((set, setIdx) => {
          if (!isEditing) {
            // Read-only set row
            return createElement(
              'div',
              {
                key: setIdx,
                className: 'flex items-center justify-between text-xs text-neutral-400 py-1 border-b border-neutral-900/50 last:border-none'
              },
              createElement('span', null, `Set ${setIdx + 1}`),
              createElement(
                'div',
                { className: 'font-mono font-medium' },
                isCardio
                  ? createElement('span', null, `${set.weight || '0'} min • ${set.reps || '0'} km`)
                  : isBW
                    ? createElement('span', null, `${set.reps || '0'} reps`)
                    : createElement('span', null, `${set.weight || '0'}kg × ${set.reps || '0'} reps`)
              )
            );
          } else {
            // Editable draft set row
            let editInputs;
            if (isCardio) {
              editInputs = createElement(
                Fragment,
                null,
                createElement('input', {
                  type: 'number',
                  placeholder: 'min',
                  value: set.weight,
                  onChange: (e: any) => handleUpdateDraftSet(exIdx, setIdx, 'weight', e.target.value),
                  className: 'w-16 bg-neutral-900 border border-neutral-850 rounded p-1 text-xs text-center text-neutral-200 font-mono'
                }),
                createElement('input', {
                  type: 'number',
                  placeholder: 'km',
                  value: set.reps,
                  onChange: (e: any) => handleUpdateDraftSet(exIdx, setIdx, 'reps', e.target.value),
                  className: 'w-16 bg-neutral-900 border border-neutral-850 rounded p-1 text-xs text-center text-neutral-200 font-mono'
                })
              );
            } else if (isBW) {
              editInputs = createElement('input', {
                type: 'number',
                placeholder: 'reps',
                value: set.reps,
                onChange: (e: any) => handleUpdateDraftSet(exIdx, setIdx, 'reps', e.target.value),
                className: 'w-20 bg-neutral-900 border border-neutral-850 rounded p-1 text-xs text-center text-neutral-200 font-mono'
              });
            } else {
              editInputs = createElement(
                Fragment,
                null,
                createElement('input', {
                  type: 'number',
                  placeholder: 'kg',
                  value: set.weight,
                  onChange: (e: any) => handleUpdateDraftSet(exIdx, setIdx, 'weight', e.target.value),
                  className: 'w-16 bg-neutral-900 border border-neutral-850 rounded p-1 text-xs text-center text-neutral-200 font-mono'
                }),
                createElement('input', {
                  type: 'number',
                  placeholder: 'reps',
                  value: set.reps,
                  onChange: (e: any) => handleUpdateDraftSet(exIdx, setIdx, 'reps', e.target.value),
                  className: 'w-16 bg-neutral-900 border border-neutral-850 rounded p-1 text-xs text-center text-neutral-200 font-mono'
                })
              );
            }

            return createElement(
              'div',
              { key: setIdx, className: 'flex items-center gap-2 py-1 border-b border-neutral-900/40 last:border-none' },
              createElement('span', { className: 'text-xs text-neutral-500 w-10' }, `S${setIdx + 1}`),
              editInputs,
              createElement(
                'button',
                {
                  onClick: () => handleToggleDraftSetDone(exIdx, setIdx),
                  className: `px-2 py-1 rounded text-[10px] font-bold border ${
                    set.done
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`
                },
                'Done'
              ),
              createElement(
                'button',
                {
                  onClick: () => handleRemoveSetFromDraft(exIdx, setIdx),
                  className: 'p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded'
                },
                createElement(X, { className: 'w-3.5 h-3.5' })
              )
            );
          }
        })
      ),

      // Add set to draft button
      isEditing
        ? createElement(
            'button',
            {
              onClick: () => handleAddSetToDraft(exIdx),
              className: 'w-full mt-1.5 py-1.5 border border-dashed border-neutral-800 hover:border-neutral-700 bg-transparent text-neutral-500 hover:text-neutral-300 text-[11px] font-semibold rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer'
            },
            createElement(Plus, { className: 'w-3 h-3' }),
            createElement('span', null, 'Add Set To Draft')
          )
        : null
    );
  });

  // Footer Actions based on mode
  const footerActions = isEditing
    ? createElement(
        Fragment,
        null,
        createElement(
          'button',
          {
            onClick: handleSaveWorkoutEdits,
            className: 'flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer'
          },
          createElement(Check, { className: 'w-4 h-4' }),
          createElement('span', null, 'Save Changes')
        ),
        createElement(
          'button',
          {
            onClick: () => setEditingWorkoutDraft(null),
            className: 'flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-semibold rounded-xl cursor-pointer'
          },
          'Cancel'
        )
      )
    : createElement(
        Fragment,
        null,
        createElement(
          'button',
          {
            onClick: () => handleStartEditingWorkout(selectedWorkout),
            className: 'flex-1 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer'
          },
          createElement(Edit2, { className: 'w-3.5 h-3.5 text-emerald-400' }),
          createElement('span', null, 'Edit Workout')
        ),
        createElement(
          'button',
          {
            onClick: () => setPendingDeleteWorkoutId(selectedWorkout.id),
            className: 'py-3 px-4 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 hover:border-red-500/20 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer'
          },
          createElement(Trash2, { className: 'w-4 h-4' })
        )
      );

  return createElement(
    'div',
    { className: 'fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4' },
    createElement(
      'div',
      { className: 'bg-[#121212] border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden' },
      
      // Header block
      createElement(
        'div',
        { className: 'p-4 border-b border-neutral-900 flex justify-between items-center bg-[#161618]' },
        createElement(
          'div',
          null,
          createElement(
            'h3',
            { className: 'text-base font-extrabold text-neutral-100' },
            isEditing ? `Edit: ${currentWorkout.name}` : currentWorkout.name
          ),
          createElement(
            'span',
            { className: 'text-[11px] text-neutral-400 font-mono' },
            formatDateFull(currentWorkout.date)
          )
        ),
        createElement(
          'button',
          {
            onClick: () => {
              setSelectedWorkoutId(null);
              setEditingWorkoutDraft(null);
            },
            className: 'text-neutral-500 hover:text-neutral-300 p-1 rounded-lg cursor-pointer'
          },
          createElement(X, { className: 'w-4.5 h-4.5' })
        )
      ),

      // Scrollable Modal Body
      createElement(
        'div',
        { className: 'flex-1 overflow-y-auto p-4 space-y-4' },
        statsHeaderElement,
        titleEditElement,
        exercisesListContent
      ),

      // Footer
      createElement(
        'div',
        { className: 'p-4 border-t border-neutral-900 bg-[#161618] flex items-center justify-between gap-3' },
        footerActions
      )
    )
  );
}
