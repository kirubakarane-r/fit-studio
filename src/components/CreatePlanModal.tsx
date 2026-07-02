import { createElement, useState, ChangeEvent, useRef } from 'react';
import { X, Search, Check, ChevronLeft, ChevronRight, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { capitalize, getMuscleColor } from '../utils/formatters';
import { useWorkout } from '../context/WorkoutContext';

export default function CreatePlanModal() {
  const {
    showCreatePlanModal,
    setShowCreatePlanModal,
    exercises,
    handleCreatePlan,
    setShowCreateLibraryModal,
  } = useWorkout();

  if (!showCreatePlanModal) return null;

  const [planName, setPlanName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');

  const chipsRef = useRef<HTMLDivElement>(null);

  const scrollChips = (direction: 'left' | 'right') => {
    if (chipsRef.current) {
      const scrollAmount = 140;
      chipsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleToggleExercise = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleMoveUp = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const idx = prev.indexOf(id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
      return copy;
    });
  };

  const handleMoveDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const idx = prev.indexOf(id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const copy = [...prev];
      [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
      return copy;
    });
  };

  const handleSave = () => {
    const name = planName.trim();
    if (!name) return;
    handleCreatePlan(name, selectedIds);
    setPlanName('');
    setSelectedIds([]);
    setSearch('');
    setMuscleFilter('');
    setShowCreatePlanModal(false);
  };

  const filtered = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !muscleFilter || e.muscle === muscleFilter;
    return matchesSearch && matchesMuscle;
  }).sort((a, b) => {
    const aIdx = selectedIds.indexOf(a.id);
    const bIdx = selectedIds.indexOf(b.id);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });

  const hasMatch = exercises.some(e => e.name.toLowerCase().includes(search.trim().toLowerCase()));
  const showCreateMovementBtn = search.trim().length > 0 && !hasMatch;

  return createElement(
    'div',
    { className: 'fixed inset-0 bg-black/70 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4' },
    createElement(
      'div',
      { className: 'bg-[#161618] border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[95vh] flex flex-col shadow-2xl overflow-hidden' },
      
      // Handle bar on mobile
      createElement('div', { className: 'w-12 h-1 bg-neutral-800 rounded-full mx-auto mt-3 mb-1 sm:hidden' }),

      // Header
      createElement(
        'div',
        { className: 'p-4 border-b border-neutral-900 flex justify-between items-center' },
        createElement(
          'div',
          null,
          createElement('h3', { className: 'text-base font-extrabold text-neutral-100' }, 'Create New Workout Plan'),
          createElement('p', { className: 'text-xs text-neutral-500 mt-0.5' }, 'Design a workout blueprint to launch instantly anytime.')
        ),
        createElement(
          'button',
          {
            onClick: () => setShowCreatePlanModal(false),
            className: 'text-neutral-500 hover:text-neutral-300 p-1.5 rounded-lg hover:bg-neutral-900 cursor-pointer'
          },
          createElement(X, { className: 'w-4 h-4' })
        )
      ),

      // Plan Name Input Field
      createElement(
        'div',
        { className: 'p-4 border-b border-neutral-900 bg-[#0c0c0d] space-y-2' },
        createElement('label', { className: 'text-xs font-bold text-neutral-400 uppercase tracking-wider block' }, 'Plan Name'),
        createElement('input', {
          type: 'text',
          placeholder: 'e.g., Upper Body Blaster, Heavy Legs...',
          value: planName,
          onChange: (e: ChangeEvent<HTMLInputElement>) => setPlanName(e.target.value),
          className: 'w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 text-sm rounded-xl px-3 py-3 text-neutral-100 focus:outline-none placeholder-neutral-600'
        })
      ),

      // Exercise Selector Search & Filter Block
      createElement(
        'div',
        { className: 'p-4 space-y-3 bg-[#0e0e10]/80 border-b border-neutral-900' },
        createElement(
          'span',
          { className: 'text-xs font-bold text-neutral-400 uppercase tracking-wider block' },
          `Select Movements (${selectedIds.length} added)`
        ),
        
        // Search
        createElement(
          'div',
          { className: 'flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-2.5 rounded-xl focus-within:border-emerald-500' },
          createElement(Search, { className: 'w-4 h-4 text-neutral-500' }),
          createElement('input', {
            type: 'text',
            placeholder: 'Search library movements...',
            value: search,
            onChange: (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
            className: 'w-full bg-transparent border-none text-sm text-neutral-200 focus:outline-none placeholder-neutral-600'
          })
        ),

        // Muscle Selector Chips Carousel
        createElement(
          'div',
          { className: 'relative flex items-center px-0' },

          // Chips Container
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

      // Scrollable Exercise List
      createElement(
        'div',
        { className: 'flex-1 overflow-y-auto p-4 space-y-1.5 bg-[#09090b]' },
        filtered.length === 0
          ? createElement(
              'div',
              { className: 'text-center py-6 text-sm text-neutral-500' },
              'No exercises found matching current search.'
            )
          : filtered.map(ex => {
              const isSelected = selectedIds.includes(ex.id);
              return createElement(
                'div',
                {
                  key: ex.id,
                  onClick: () => handleToggleExercise(ex.id),
                  className: `border p-2.5 rounded-xl flex justify-between items-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-neutral-900/30 border-neutral-800/80 hover:bg-neutral-900 hover:border-neutral-700'
                  }`
                },
                createElement(
                  'div',
                  { className: 'flex items-center gap-2.5' },
                  createElement(
                    'div',
                    { className: `w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isSelected ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-neutral-700 bg-neutral-900'
                    }` },
                    isSelected && createElement(X, { className: 'w-3 h-3 stroke-[3.5]' })
                  ),
                  createElement(
                    'div',
                    null,
                    createElement('h4', { className: 'text-sm font-bold text-neutral-200' }, ex.name),
                    createElement(
                      'span',
                      { className: 'text-xs text-neutral-500 font-mono mt-0.5 inline-block' },
                      ex.type === 'weight' ? 'Weighted' : ex.type === 'bodyweight' ? 'Bodyweight' : 'Cardio'
                    )
                  )
                ),
                createElement(
                  'div',
                  { className: 'flex items-center gap-2' },
                  createElement(
                    'span',
                    { className: `text-xs font-mono px-2 py-0.5 rounded-full border ${getMuscleColor(ex.muscle)}` },
                    capitalize(ex.muscle)
                  ),
                  isSelected && createElement(
                    'div',
                    { className: 'flex flex-col gap-0.5 ml-1' },
                    createElement(
                      'button',
                      {
                        onClick: (e: any) => handleMoveUp(e, ex.id),
                        className: 'p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                      },
                      createElement(ChevronUp, { className: 'w-3 h-3' })
                    ),
                    createElement(
                      'button',
                      {
                        onClick: (e: any) => handleMoveDown(e, ex.id),
                        className: 'p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                      },
                      createElement(ChevronDown, { className: 'w-3 h-3' })
                    )
                  )
                )
              );
            })
      ),

      // Create Custom Exercise Action
      showCreateMovementBtn && createElement(
        'div',
        { className: 'p-4 border-t border-neutral-900 bg-neutral-950/20 flex flex-col' },
        createElement(
          'button',
          {
            onClick: () => setShowCreateLibraryModal(true),
            className: 'w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer'
          },
          createElement(Plus, { className: 'w-4 h-4 text-emerald-400' }),
          createElement('span', null, 'Create New Movement Type')
        )
      ),

      // Footer
      createElement(
        'div',
        { className: 'p-4 border-t border-neutral-900 bg-[#161618] flex items-center gap-3' },
        createElement(
          'button',
          {
            onClick: handleSave,
            disabled: !planName.trim() || selectedIds.length === 0,
            className: 'flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all'
          },
          createElement(Check, { className: 'w-4 h-4' }),
          createElement('span', null, 'Save Workout Plan')
        ),
        createElement(
          'button',
          {
            onClick: () => setShowCreatePlanModal(false),
            className: 'px-5 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 text-sm font-semibold rounded-xl cursor-pointer'
          },
          'Cancel'
        )
      )
    )
  );
}
