import { createElement, ChangeEvent } from 'react';
import { X, Play } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function NewWorkoutModal() {
  const {
    showNewWorkoutModal,
    setShowNewWorkoutModal,
    newWorkoutName,
    setNewWorkoutName,
    saveAsTemplate,
    setSaveAsTemplate,
    templates,
    handleStartWorkout,
  } = useWorkout();

  if (!showNewWorkoutModal) return null;

  // Setup template row checkbox conditionally
  const isTemplateAlreadySaved = templates.some(t => t.name.toLowerCase() === newWorkoutName.trim().toLowerCase());
  const showCheckbox = newWorkoutName.trim() && !isTemplateAlreadySaved;

  const checkboxElement = showCheckbox
    ? createElement(
        'label',
        { className: 'flex items-center gap-2 text-xs text-neutral-400 select-none cursor-pointer' },
        createElement('input', {
          type: 'checkbox',
          checked: saveAsTemplate,
          onChange: (e: ChangeEvent<HTMLInputElement>) => setSaveAsTemplate(e.target.checked),
          className: 'rounded border-neutral-800 bg-neutral-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4'
        }),
        createElement('span', null, 'Save this layout setup as a recurring template')
      )
    : null;

  return createElement(
    'div',
    { className: 'fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4' },
    createElement(
      'div',
      { className: 'bg-[#121212] border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl' },
      
      // Handle bar on mobile
      createElement('div', { className: 'w-12 h-1 bg-neutral-800 rounded-full mx-auto mt-3 mb-2 sm:hidden' }),

      // Header
      createElement(
        'div',
        { className: 'p-5 border-b border-neutral-900 flex justify-between items-center' },
        createElement(
          'div',
          null,
          createElement('h3', { className: 'text-base font-extrabold text-neutral-100' }, 'Setup New Gym Session'),
          createElement('p', { className: 'text-xs text-neutral-500 mt-1' }, 'Provide a name or quick-start with custom templates.')
        ),
        createElement(
          'button',
          {
            onClick: () => setShowNewWorkoutModal(false),
            className: 'text-neutral-500 hover:text-neutral-300 p-1 rounded-lg hover:bg-neutral-900 cursor-pointer'
          },
          createElement(X, { className: 'w-4 h-4' })
        )
      ),

      // Form body
      createElement(
        'div',
        { className: 'p-5 space-y-5' },
        
        // Input group
        createElement(
          'div',
          { className: 'space-y-1.5' },
          createElement('label', { className: 'text-xs font-bold text-neutral-400 uppercase tracking-wider block' }, 'Workout Name'),
          createElement('input', {
            type: 'text',
            placeholder: 'e.g. Push Day, Pull Day, Leg Day...',
            value: newWorkoutName,
            onChange: (e: ChangeEvent<HTMLInputElement>) => setNewWorkoutName(e.target.value),
            className: 'w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 text-sm rounded-xl px-3.5 py-3 text-neutral-100 focus:outline-none placeholder-neutral-600'
          })
        ),

        // Checkbox element
        checkboxElement,

        // Quick start templates list
        templates.length > 0
          ? createElement(
              'div',
              { className: 'space-y-2' },
              createElement('span', { className: 'text-xs font-bold text-neutral-400 uppercase tracking-wider block' }, 'Select Gym Template'),
              createElement(
                'div',
                { className: 'flex flex-wrap gap-2' },
                templates.map(tpl =>
                  createElement(
                    'button',
                    {
                      key: tpl.name,
                      onClick: () => setNewWorkoutName(tpl.name),
                      className: `px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        newWorkoutName.toLowerCase() === tpl.name.toLowerCase()
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                      }`
                    },
                    tpl.name
                  )
                )
              )
            )
          : null,

        // Launch buttons
        createElement(
          'div',
          { className: 'pt-2 flex flex-col gap-2' },
          createElement(
            'button',
            {
              onClick: handleStartWorkout,
              className: 'w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer'
            },
            createElement(Play, { className: 'w-4 h-4' }),
            createElement('span', null, 'Start Live Workout')
          ),
          createElement(
            'button',
            {
              onClick: () => setShowNewWorkoutModal(false),
              className: 'w-full py-3 bg-transparent text-neutral-400 hover:text-neutral-200 text-xs font-semibold rounded-xl cursor-pointer'
            },
            'Cancel'
          )
        )
      )
    )
  );
}
