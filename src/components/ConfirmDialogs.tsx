import { createElement, Fragment } from 'react';
import { useWorkout } from '../context/WorkoutContext';

export default function ConfirmDialogs() {
  const {
    showFinishConfirm,
    setShowFinishConfirm,
    handleFinishWorkout,
    pendingDeleteWorkoutId,
    setPendingDeleteWorkoutId,
    handleDeleteWorkout,
  } = useWorkout();

  const finishConfirmDialog = showFinishConfirm
    ? createElement(
        'div',
        { className: 'fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4' },
        createElement(
          'div',
          { className: 'bg-[#121212] border border-neutral-800 rounded-3xl w-full max-w-xs p-5 space-y-4 shadow-2xl' },
          createElement(
            'div',
            { className: 'space-y-1' },
            createElement('h3', { className: 'text-sm font-extrabold text-neutral-100' }, 'Finish session?'),
            createElement('p', { className: 'text-xs text-neutral-500' }, 'Your completed exercises and working sets will be safely logged into history tracker.')
          ),
          createElement(
            'div',
            { className: 'flex gap-2 pt-1' },
            createElement(
              'button',
              {
                onClick: handleFinishWorkout,
                className: 'flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg cursor-pointer'
              },
              'Log Session'
            ),
            createElement(
              'button',
              {
                onClick: () => setShowFinishConfirm(false),
                className: 'flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg cursor-pointer'
              },
              'Resume'
            )
          )
        )
      )
    : null;

  const deleteConfirmDialog = pendingDeleteWorkoutId
    ? createElement(
        'div',
        { className: 'fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4' },
        createElement(
          'div',
          { className: 'bg-[#121212] border border-neutral-800 rounded-3xl w-full max-w-xs p-5 space-y-4 shadow-2xl' },
          createElement(
            'div',
            { className: 'space-y-1' },
            createElement('h3', { className: 'text-sm font-extrabold text-red-400' }, 'Delete session log?'),
            createElement('p', { className: 'text-xs text-neutral-500' }, 'This action cannot be undone. The workout log will be permanently deleted from database.')
          ),
          createElement(
            'div',
            { className: 'flex gap-2 pt-1' },
            createElement(
              'button',
              {
                onClick: () => {
                  handleDeleteWorkout(pendingDeleteWorkoutId);
                  setPendingDeleteWorkoutId(null);
                },
                className: 'flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-black text-xs font-bold rounded-lg cursor-pointer'
              },
              'Delete Log'
            ),
            createElement(
              'button',
              {
                onClick: () => setPendingDeleteWorkoutId(null),
                className: 'flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg cursor-pointer'
              },
              'Cancel'
            )
          )
        )
      )
    : null;

  return createElement(
    Fragment,
    null,
    finishConfirmDialog,
    deleteConfirmDialog
  );
}
