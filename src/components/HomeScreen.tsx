import { createElement } from 'react';
import { Plus, Play, ArrowRight, Trash2, Eye } from 'lucide-react';
import { Exercise } from '../types';
import { formatTime, capitalize } from '../utils/formatters';
import { useWorkout } from '../context/WorkoutContext';

export default function HomeScreen() {
  const {
    weekStats,
    activeWorkout,
    elapsedTime,
    exercises,
    templates,
    setScreen,
    setShowCreatePlanModal,
    handleStartWorkoutFromTemplate,
    handleDeleteTemplate,
    setSelectedTemplateToView,
  } = useWorkout();

  const activeWorkoutBanner = activeWorkout
    ? createElement(
        'div',
        { className: 'bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 flex justify-between items-center' },
        createElement(
          'div',
          null,
          createElement('h4', { className: 'text-sm font-semibold text-emerald-400' }, 'Workout In Progress'),
          createElement('p', { className: 'text-xs text-neutral-400 mt-0.5' }, `${activeWorkout.name} • ${formatTime(elapsedTime)}`)
        ),
        createElement(
          'button',
          {
            onClick: () => setScreen('active'),
            className: 'px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer'
          },
          createElement('span', null, 'Resume'),
          createElement(ArrowRight, { className: 'w-3.5 h-3.5' })
        )
      )
    : null;

  const workoutPlansContent = templates.length === 0
    ? createElement(
        'div',
        { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-6 text-center space-y-3' },
        createElement(
          'div',
          { className: 'text-xs text-neutral-500 font-medium' },
          'No custom workout plans created yet.'
        ),
        createElement(
          'button',
          {
            onClick: () => setShowCreatePlanModal(true),
            className: 'px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer'
          },
          createElement(Plus, { className: 'w-3.5 h-3.5 text-emerald-400' }),
          createElement('span', null, 'Create First Plan')
        )
      )
    : createElement(
        'div',
        { className: 'space-y-3' },
        templates.map(tpl => {
          const tplExercises = tpl.exercises
            .map(eid => exercises.find(e => e.id === eid))
            .filter((e): e is Exercise => !!e);
            
          const exerciseNames = tplExercises.map(e => e.name).join(', ') || 'No movements added';

          return createElement(
            'div',
            {
              key: tpl.name,
              className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-4 flex flex-col gap-2'
            },
            createElement(
              'div',
              { className: 'flex justify-between items-start' },
              createElement(
                'div',
                null,
                createElement('h4', { className: 'font-bold text-sm text-neutral-200' }, tpl.name),
                createElement(
                  'span',
                  { className: 'text-xs text-neutral-500 mt-0.5 inline-block font-semibold' },
                  `${tplExercises.length} movements`
                )
              ),
              createElement(
                'button',
                {
                  onClick: (e: any) => {
                    e.stopPropagation();
                    handleDeleteTemplate(tpl.name);
                  },
                  className: 'p-1.5 text-neutral-500 hover:text-red-400 hover:bg-[#1a1a1c] rounded-lg cursor-pointer transition-colors'
                },
                createElement(Trash2, { className: 'w-4 h-4' })
              )
            ),
            tplExercises.length > 0
              ? createElement(
                  'p',
                  { className: 'text-xs text-neutral-400 line-clamp-1 italic font-mono mb-1' },
                  exerciseNames
                )
              : null,
            createElement(
              'div',
              { className: 'grid grid-cols-2 gap-2 mt-1' },
              createElement(
                'button',
                {
                  onClick: () => setSelectedTemplateToView(tpl),
                  className: 'py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors'
                },
                createElement(Eye, { className: 'w-3.5 h-3.5' }),
                createElement('span', null, 'View Plan')
              ),
              createElement(
                'button',
                {
                  onClick: () => handleStartWorkoutFromTemplate(tpl),
                  className: 'py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors'
                },
                createElement(Play, { className: 'w-3.5 h-3.5 fill-black' }),
                createElement('span', null, 'Start Session')
              )
            )
          );
        })
      );

  return createElement(
    'div',
    { className: 'space-y-6' },
    


    // Active Workout Banner
    activeWorkoutBanner,

    // Workout Plans (Created Gym Blueprints)
    createElement(
      'div',
      { className: 'space-y-3' },
      createElement(
        'div',
        { className: 'flex justify-between items-center' },
        createElement('h3', { className: 'text-base font-extrabold text-neutral-200 uppercase tracking-wider' }, 'Workout Plans'),
        createElement(
          'button',
          {
            onClick: () => setShowCreatePlanModal(true),
            className: 'px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer border border-emerald-500/15'
          },
          createElement(Plus, { className: 'w-3.5 h-3.5' }),
          createElement('span', null, 'Create Plan')
        )
      ),
      workoutPlansContent
    )
  );
}
