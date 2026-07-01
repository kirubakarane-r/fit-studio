import React, { useState, useEffect } from 'react';
import { X, Utensils, Info, Search, Plus, ArrowLeft } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';
import { MealType } from '../types';
import { COMPREHENSIVE_FOODS, FoodItem } from '../data/dbFoods';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType | null;
}

export default function AddFoodModal({ isOpen, onClose, mealType }: AddFoodModalProps) {
  const { addFoodLog } = useNutrition();
  
  // Navigation State
  // 'search' = searching DB, 'custom' = manual entry, 'quantity' = entering qty for selected food
  const [step, setStep] = useState<'search' | 'quantity' | 'custom'>('search');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Form State (Custom & Quantity)
  const [foodName, setFoodName] = useState('');
  const [baseCalories, setBaseCalories] = useState('');
  const [baseProtein, setBaseProtein] = useState('');
  const [baseCarbs, setBaseCarbs] = useState('');
  const [baseFat, setBaseFat] = useState('');

  // Quantity Consumed
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'g' | 'ml' | 'kg' | 'L'>('g');

  // Calculated Totals
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);

  // Reset Modal on Close
  useEffect(() => {
    if (!isOpen) {
      setStep('search');
      setSearchQuery('');
      setSelectedFood(null);
      setFoodName('');
      setBaseCalories('');
      setBaseProtein('');
      setBaseCarbs('');
      setBaseFat('');
      setQuantity('');
      setUnit('g');
    }
  }, [isOpen]);

  // Auto-calculate totals whenever inputs change
  useEffect(() => {
    const qty = Number(quantity) || 0;
    
    // Normalize to 100g/ml multiplier
    let multiplier = 0;
    if (unit === 'g' || unit === 'ml') {
      multiplier = qty / 100;
    } else if (unit === 'kg' || unit === 'L') {
      multiplier = (qty * 1000) / 100;
    }

    setTotalCalories(Math.round((Number(baseCalories) || 0) * multiplier));
    setTotalProtein(Math.round((Number(baseProtein) || 0) * multiplier * 10) / 10);
    setTotalCarbs(Math.round((Number(baseCarbs) || 0) * multiplier * 10) / 10);
    setTotalFat(Math.round((Number(baseFat) || 0) * multiplier * 10) / 10);
  }, [baseCalories, baseProtein, baseCarbs, baseFat, quantity, unit]);

  if (!isOpen || !mealType) return null;

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setFoodName(food.name);
    setBaseCalories(food.calories.toString());
    setBaseProtein(food.protein.toString());
    setBaseCarbs(food.carbs.toString());
    setBaseFat(food.fat.toString());
    setStep('quantity');
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !quantity) return;

    await addFoodLog({
      foodId: selectedFood ? selectedFood.id : 'custom_' + Date.now(),
      name: `${foodName.trim()} (${quantity}${unit})`,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      mealType: mealType,
      servings: 1
    });
    
    onClose();
  };

  const filteredFoods = COMPREHENSIVE_FOODS.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      
      <div className="relative bg-[#121214] w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">
        
        {/* Handle bar on mobile */}
        <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mt-3 mb-1 sm:hidden absolute top-0 left-1/2 -translate-x-1/2 z-20" />

        {/* Header */}
        <div className="p-4 pt-6 sm:pt-4 border-b border-neutral-900 bg-[#161618] flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {step !== 'search' && (
              <button onClick={() => setStep('search')} className="p-1 mr-1 text-neutral-400 hover:text-neutral-200">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
              <Utensils className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-neutral-100 uppercase tracking-wider">
                Log {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#09090b]">
          
          {step === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search food database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 text-sm rounded-xl py-3.5 pl-11 pr-4 text-neutral-200 focus:outline-none transition-colors"
                />
              </div>

              <button 
                onClick={() => {
                  setSelectedFood(null);
                  setFoodName(searchQuery);
                  setStep('custom');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 border border-dashed border-neutral-700 hover:border-emerald-500 hover:bg-neutral-800 rounded-xl text-neutral-300 text-sm font-semibold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                Create Custom Food
              </button>

              <div className="space-y-2 mt-4 pb-20">
                {filteredFoods.length === 0 ? (
                  <p className="text-center text-xs text-neutral-500 py-6">No foods found. Create a custom food instead.</p>
                ) : (
                  filteredFoods.map(food => (
                    <button
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="w-full bg-[#121214] hover:bg-neutral-900 border border-neutral-900 rounded-2xl p-3 flex justify-between items-center transition-colors cursor-pointer text-left"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-neutral-200">{food.name}</h4>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          {food.calories} kcal • {food.protein}g P • {food.carbs}g C • {food.fat}g F (per 100g)
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-emerald-500" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {(step === 'quantity' || step === 'custom') && (
            <form onSubmit={handleAddFood} className="space-y-6">
              
              {/* 1. Food Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Food Name</label>
                <input
                  required
                  type="text"
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  disabled={step === 'quantity'}
                  className="w-full bg-neutral-900 border-none focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl p-3.5 text-neutral-200 focus:outline-none font-semibold transition-all disabled:opacity-70"
                />
              </div>

              {/* 2. Base Nutrition Info */}
              <div className="bg-[#121214] p-4 rounded-2xl border border-neutral-900 space-y-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    Base Nutritional Info <span className="text-neutral-500">(Per 100g / 100ml)</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Calories (kcal)</label>
                    <input
                      required
                      type="number"
                      value={baseCalories}
                      onChange={e => setBaseCalories(e.target.value)}
                      disabled={step === 'quantity'}
                      className="w-full bg-neutral-950 border-none focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl p-3 text-neutral-200 focus:outline-none font-mono disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Protein (g)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={baseProtein}
                      onChange={e => setBaseProtein(e.target.value)}
                      disabled={step === 'quantity'}
                      className="w-full bg-neutral-950 border-none focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl p-3 text-neutral-200 focus:outline-none font-mono disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Carbs (g)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={baseCarbs}
                      onChange={e => setBaseCarbs(e.target.value)}
                      disabled={step === 'quantity'}
                      className="w-full bg-neutral-950 border-none focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl p-3 text-neutral-200 focus:outline-none font-mono disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Fat (g)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={baseFat}
                      onChange={e => setBaseFat(e.target.value)}
                      disabled={step === 'quantity'}
                      className="w-full bg-neutral-950 border-none focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl p-3 text-neutral-200 focus:outline-none font-mono disabled:opacity-70"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Quantity Consumed */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Quantity Consumed</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="e.g. 250"
                    className="flex-1 bg-neutral-900 border border-emerald-500/30 focus:border-emerald-500 text-sm rounded-xl p-3.5 text-neutral-200 focus:outline-none font-mono transition-all"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-24 bg-neutral-900 border border-emerald-500/30 focus:border-emerald-500 text-sm font-bold text-emerald-400 rounded-xl p-3 focus:outline-none cursor-pointer"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>

              {/* 4. Calculated Result */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mt-6">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-3">Total Nutritional Value</p>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">Calories</p>
                    <p className="text-2xl font-black text-neutral-100">{totalCalories} <span className="text-xs text-neutral-500 font-medium">kcal</span></p>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Protein:</span>
                      <span className="font-mono font-bold text-neutral-200">{totalProtein}g</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Carbs:</span>
                      <span className="font-mono font-bold text-neutral-200">{totalCarbs}g</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Fat:</span>
                      <span className="font-mono font-bold text-neutral-200">{totalFat}g</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 pb-8">
                <button
                  type="submit"
                  disabled={!foodName.trim() || !quantity}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  Log to Diary
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
