import React, { useState, useMemo } from 'react';
import { Search, X, Check, Utensils } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';
import { COMPREHENSIVE_FOODS } from '../data/dbFoods';
import { MealType, FoodItem } from '../types';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType | null;
}

export default function AddFoodModal({ isOpen, onClose, mealType }: AddFoodModalProps) {
  const { addFoodLog } = useNutrition();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  
  // Custom Food Form
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customServing, setCustomServing] = useState('');

  const filteredFoods = useMemo(() => {
    if (!search.trim()) return COMPREHENSIVE_FOODS;
    return COMPREHENSIVE_FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  if (!isOpen || !mealType) return null;

  const handleAddExistingFood = async (food: FoodItem) => {
    await addFoodLog({
      foodId: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      mealType: mealType,
      servings: 1
    });
    onClose();
  };

  const handleAddCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    await addFoodLog({
      foodId: 'custom_' + Date.now(),
      name: customName.trim(),
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      mealType: mealType,
      servings: 1
    });
    
    // Reset form
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setCustomServing('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      
      <div className="relative bg-[#121214] border border-neutral-850 w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-900 bg-[#161618] flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
              <Utensils className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-neutral-100 uppercase tracking-wider">
                Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-900">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'search' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Database
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'custom' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Custom Food
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'search' ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-850 px-3 py-2.5 rounded-xl focus-within:border-emerald-500 transition-colors">
                <Search className="w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search food database..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none text-sm text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pb-6">
                {filteredFoods.map(food => (
                  <div key={food.id} className="bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-850 rounded-2xl p-3 flex justify-between items-center transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-200">{food.name}</h4>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {food.servingSize} • {food.calories} kcal • {food.protein}g P • {food.carbs}g C • {food.fat}g F
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddExistingFood(food)}
                      className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-xl transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <form onSubmit={handleAddCustomFood} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Food Name</label>
                  <input
                    required
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Homemade Lasagna"
                    className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-semibold transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Calories (kcal)</label>
                    <input
                      required
                      type="number"
                      value={customCalories}
                      onChange={e => setCustomCalories(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-mono transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Serving Size (optional)</label>
                    <input
                      type="text"
                      value={customServing}
                      onChange={e => setCustomServing(e.target.value)}
                      placeholder="e.g. 1 slice"
                      className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Protein (g)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={customProtein}
                      onChange={e => setCustomProtein(e.target.value)}
                      placeholder="0"
                      className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-mono transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Carbs (g)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={customCarbs}
                      onChange={e => setCustomCarbs(e.target.value)}
                      placeholder="0"
                      className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-mono transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Fat (g)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={customFat}
                      onChange={e => setCustomFat(e.target.value)}
                      placeholder="0"
                      className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-mono transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-900">
                  <button
                    type="submit"
                    disabled={!customName.trim()}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/5 cursor-pointer"
                  >
                    Add Food to Log
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
