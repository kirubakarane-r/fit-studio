import React, { useState } from 'react';
import { X, Search, Plus, Trash2 } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';
import { FoodItem } from '../types';

export default function AddFoodModal() {
  const { 
    showAddFoodModal, setShowAddFoodModal, 
    setShowCreateFoodModal, 
    foods, activeMealType, 
    handleAddMealEntry, selectedDate, handleDeleteFood
  } = useNutrition();
  
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodToDelete, setFoodToDelete] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState('1');

  if (!showAddFoodModal || !activeMealType) return null;

  const filteredFoods = foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!selectedFood) return;
    const s = parseFloat(servings) || 1;
    await handleAddMealEntry({
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      calories: selectedFood.calories * s,
      protein: selectedFood.protein * s,
      carbs: selectedFood.carbs * s,
      fat: selectedFood.fat * s,
      servings: s,
      mealType: activeMealType,
      date: selectedDate
    });
    setSelectedFood(null);
    setSearch('');
    setServings('1');
    setShowAddFoodModal(false);
  };

  const closeModal = () => {
    setSelectedFood(null);
    setSearch('');
    setShowAddFoodModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
      
      <div className="relative bg-[#161618] w-full max-w-md h-[90vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col border-t sm:border border-neutral-800 shadow-2xl overflow-hidden slide-in-from-bottom-full sm:slide-in-from-bottom-8">
        
        {/* Handle bar on mobile */}
        <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0"></div>

        {/* Header */}
        <div className="p-4 border-b border-neutral-900 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-extrabold text-neutral-100">Add to {activeMealType}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Search or create a custom food to log.</p>
          </div>
          <button onClick={closeModal} className="text-neutral-500 hover:text-neutral-300 p-1.5 rounded-lg hover:bg-neutral-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-[#09090b]">
          <div className="space-y-4">
            
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-2.5 rounded-xl focus-within:border-emerald-500 shrink-0">
              <Search className="w-4 h-4 text-neutral-500 shrink-0" />
              <input
                type="text"
                placeholder="Search for a food..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-neutral-200 focus:outline-none placeholder-neutral-600"
              />
            </div>

            <button 
              onClick={() => {
                setShowAddFoodModal(false);
                setShowCreateFoodModal(true);
              }}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Create Custom Food</span>
            </button>

            <div className="space-y-2 mt-4 pb-4">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Your Foods</h4>
              {filteredFoods.length > 0 ? (
                filteredFoods.map(food => (
                  <div key={food.id} className="relative group flex items-center gap-2">
                    <button
                      onClick={() => setSelectedFood(food)}
                      className={`flex-1 text-left bg-neutral-900/30 hover:bg-neutral-900 border rounded-xl p-3 transition-colors flex justify-between items-center cursor-pointer ${
                        selectedFood?.id === food.id 
                          ? 'border-emerald-500/50 bg-emerald-500/5' 
                          : 'border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-200">{food.name}</span>
                        <span className="text-xs text-neutral-500 mt-0.5">{food.servingSize}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-bold text-emerald-400">{Math.round(food.calories)} kcal</span>
                        <span className="text-[10px] text-neutral-500 mt-0.5 inline-block font-mono">
                          P:{Math.round(food.protein)} C:{Math.round(food.carbs)} F:{Math.round(food.fat)}
                        </span>
                      </div>
                    </button>
                    {/* Delete Custom Food Button */}
                    {food.id.startsWith('f') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFoodToDelete(food);
                        }}
                        className="p-3 text-neutral-600 hover:text-red-400 hover:bg-neutral-900 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Delete Food"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 text-center py-8">
                  No foods found. Create a custom food to get started!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-900 bg-[#161618] flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Servings</span>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              disabled={!selectedFood}
              className="w-16 bg-neutral-900 border border-neutral-800 focus:border-emerald-500 text-sm rounded-lg px-2 py-2.5 text-center text-white disabled:opacity-50 transition-colors focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <button
              onClick={handleAdd}
              disabled={!selectedFood}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-sm font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer"
            >
              Add to Diary
            </button>
          </div>
        </div>
      </div>

      {/* Delete Food Modal */}
      {foodToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFoodToDelete(null)} />
          <div className="relative bg-[#161618] w-full max-w-sm rounded-3xl p-6 border border-neutral-800 shadow-2xl scale-in-95">
            <h3 className="text-xl font-bold text-white mb-2">Delete Custom Food</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Are you sure you want to delete <span className="font-bold text-neutral-200">{foodToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setFoodToDelete(null)}
                className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteFood(foodToDelete.id);
                  if (selectedFood?.id === foodToDelete.id) setSelectedFood(null);
                  setFoodToDelete(null);
                }}
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
