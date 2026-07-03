import React, { createElement, useMemo } from 'react';
import { Apple, Plus, Activity, Droplet, Wheat, ChevronLeft, ChevronRight, Calendar, Edit2, Trash2 } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';
import { MealEntry } from '../types';

export default function NutritionScreen() {
  const { meals, target, loading, selectedDate, setSelectedDate, setActiveMealType, setShowAddFoodModal, setShowEditTargetModal, handleDeleteMealEntry, handleUpdateMealEntry } = useNutrition();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const [itemToDelete, setItemToDelete] = React.useState<MealEntry | null>(null);
  const [itemToEdit, setItemToEdit] = React.useState<MealEntry | null>(null);
  const [editServings, setEditServings] = React.useState<string>('');

  const todaysMeals = useMemo(() => {
    return meals.filter(m => m.date === selectedDate);
  }, [meals, selectedDate]);

  const totals = useMemo(() => {
    return todaysMeals.reduce((acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fat += m.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todaysMeals]);

  const mealGroups = useMemo(() => {
    const groups: Record<string, MealEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };
    todaysMeals.forEach(m => {
      if (groups[m.mealType]) groups[m.mealType].push(m);
    });
    return groups;
  }, [todaysMeals]);

  const handleEditServings = (item: MealEntry) => {
    setItemToEdit(item);
    setEditServings(item.servings.toString());
  };

  const renderProgressBar = (label: string, current: number, max: number, color: string, icon: any) => {
    const percentage = Math.min(100, Math.round((current / max) * 100)) || 0;
    
    // Tailwind dynamic classes for text and bg colors
    const textColor = `text-${color}-400`;
    const bgColor = `bg-${color}-500`;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs font-bold text-neutral-300 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            {createElement(icon, { className: `w-3.5 h-3.5 ${textColor}` })}
            <span>{label}</span>
          </div>
          <span className="text-neutral-500">{Math.round(current)} / {max}g</span>
        </div>
        <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
          <div 
            className={`h-full ${bgColor} rounded-full transition-all duration-500`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const renderMealSection = (type: 'breakfast' | 'lunch' | 'dinner' | 'snacks', title: string) => {
    const items = mealGroups[type];
    const sectionCals = items.reduce((sum, item) => sum + item.calories, 0);

    return (
      <div className="bg-[#121212]/80 backdrop-blur-md border border-neutral-800/60 rounded-3xl p-5 shadow-xl flex flex-col mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-extrabold text-neutral-100 uppercase tracking-wider">{title}</h3>
          <span className="text-sm font-bold text-emerald-400">{Math.round(sectionCals)} kcal</span>
        </div>
        
        {items.length > 0 ? (
          <div className="space-y-3 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-neutral-800/50 last:border-0 group">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-200">{item.foodName}</span>
                  <span className="text-xs text-neutral-500 font-medium">{item.servings} serving(s)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right flex flex-col">
                    <span className="text-sm font-bold text-neutral-300">{Math.round(item.calories)} kcal</span>
                    <span className="text-[10px] text-neutral-500 uppercase font-black">
                      P: {Math.round(item.protein)} C: {Math.round(item.carbs)} F: {Math.round(item.fat)}
                    </span>
                  </div>
                  <div className="flex items-center -mr-2">
                    <button 
                      onClick={() => handleEditServings(item)}
                      className="p-1.5 text-neutral-500 hover:text-emerald-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit servings"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                      title="Remove food"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500 mb-4 font-medium">No food logged yet.</p>
        )}

        <button 
          onClick={() => {
            setActiveMealType(type);
            setShowAddFoodModal(true);
          }}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors outline-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Food
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider animate-pulse">
          Loading nutrition...
        </p>
      </div>
    );
  }

  const calPercentage = Math.min(100, Math.round((totals.calories / target.calories) * 100)) || 0;
  const remainingCals = target.calories - totals.calories;

  return (
    <div className="space-y-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-base font-extrabold text-neutral-200 uppercase tracking-wider">Nutrition Log</h2>
      {/* Date Navigation */}
      <div className="flex justify-between items-center bg-[#121212]/80 backdrop-blur-md border border-neutral-800/60 rounded-2xl p-3 shadow-xl">
        <button onClick={handlePrevDay} className="p-2 hover:bg-neutral-800 rounded-lg cursor-pointer">
          <ChevronLeft className="w-5 h-5 text-neutral-400" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-sm text-neutral-200">
            {(() => {
              const today = new Date();
              const offset = today.getTimezoneOffset();
              const localDate = new Date(today.getTime() - (offset*60*1000));
              const todayStr = localDate.toISOString().split('T')[0];
              return selectedDate === todayStr ? 'Today' : selectedDate;
            })()}
          </span>
        </div>
        <button onClick={handleNextDay} className="p-2 hover:bg-neutral-800 rounded-lg cursor-pointer">
          <ChevronRight className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      {/* Daily Summary */}
      <div className="bg-[#121212]/80 backdrop-blur-md border border-neutral-800/60 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-extrabold text-neutral-200 uppercase tracking-wider">
            Daily Summary
          </h2>
          <button 
            onClick={() => setShowEditTargetModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-emerald-400 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Goals
          </button>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-neutral-100">{Math.round(totals.calories)}</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Eaten</span>
          </div>
          
          <div className="relative w-32 h-32 flex-shrink-0 flex flex-col items-center justify-center mx-auto">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-neutral-800" />
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * calPercentage) / 100} className="text-emerald-500 transition-all duration-1000" />
            </svg>
            <div className="flex flex-col items-center justify-center z-10">
              <span className="text-2xl font-black text-emerald-400">{Math.round(remainingCals)}</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Remaining</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-neutral-100">{target.calories}</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Goal</span>
          </div>
        </div>

        <div className="space-y-4">
          {renderProgressBar('Protein', totals.protein, target.protein, 'blue', Activity)}
          {renderProgressBar('Carbs', totals.carbs, target.carbs, 'amber', Wheat)}
          {renderProgressBar('Fat', totals.fat, target.fat, 'rose', Droplet)}
        </div>
      </div>

      {/* Meals */}
      <div>
        {renderMealSection('breakfast', 'Breakfast')}
        {renderMealSection('lunch', 'Lunch')}
        {renderMealSection('dinner', 'Dinner')}
        {renderMealSection('snacks', 'Snacks')}
      </div>

      {/* Delete Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setItemToDelete(null)} />
          <div className="relative bg-[#161618] w-full max-w-sm rounded-3xl p-6 border border-neutral-800 shadow-2xl scale-in-95">
            <h3 className="text-xl font-bold text-white mb-2">Remove Food</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Are you sure you want to remove <span className="font-bold text-neutral-200">{itemToDelete.foodName}</span> from {itemToDelete.mealType}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteMealEntry(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {itemToEdit && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setItemToEdit(null)} />
          <div className="relative bg-[#161618] w-full max-w-sm rounded-3xl p-6 border border-neutral-800 shadow-2xl scale-in-95">
            <h3 className="text-xl font-bold text-white mb-2">Edit Servings</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Update the serving size for <span className="font-bold text-neutral-200">{itemToEdit.foodName}</span>.
            </p>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={editServings}
              onChange={(e) => setEditServings(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setItemToEdit(null)}
                className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newServings = parseFloat(editServings);
                  if (isNaN(newServings) || newServings <= 0) {
                    alert("Invalid serving amount");
                    return;
                  }
                  const factor = newServings / itemToEdit.servings;
                  const updatedEntry = {
                    ...itemToEdit,
                    servings: newServings,
                    calories: itemToEdit.calories * factor,
                    protein: itemToEdit.protein * factor,
                    carbs: itemToEdit.carbs * factor,
                    fat: itemToEdit.fat * factor
                  };
                  handleUpdateMealEntry(updatedEntry);
                  setItemToEdit(null);
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
