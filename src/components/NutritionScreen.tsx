import React, { useState } from 'react';
import { Plus, Trash2, Flame } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';
import { MealType } from '../types';
import AddFoodModal from './AddFoodModal';

export default function NutritionScreen() {
  const { dailyNutrition, removeFoodLog, loading } = useNutrition();
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);

  // Default goals
  const CALORIE_GOAL = 2500;
  const PROTEIN_GOAL = 150;
  const CARBS_GOAL = 250;
  const FAT_GOAL = 80;

  // Calculate totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (dailyNutrition && dailyNutrition.logs) {
    dailyNutrition.logs.forEach(log => {
      totalCalories += log.calories;
      totalProtein += log.protein;
      totalCarbs += log.carbs;
      totalFat += log.fat;
    });
  }

  const calProgress = Math.min((totalCalories / CALORIE_GOAL) * 100, 100);
  const proProgress = Math.min((totalProtein / PROTEIN_GOAL) * 100, 100);
  const carbProgress = Math.min((totalCarbs / CARBS_GOAL) * 100, 100);
  const fatProgress = Math.min((totalFat / FAT_GOAL) * 100, 100);

  const renderMealSection = (meal: MealType, title: string) => {
    const mealLogs = dailyNutrition?.logs.filter(l => l.mealType === meal) || [];
    
    return (
      <div className="bg-[#121212] border border-neutral-800/80 rounded-2xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">{title}</h3>
          <button
            onClick={() => setActiveMeal(meal)}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Food
          </button>
        </div>

        {mealLogs.length === 0 ? (
          <p className="text-xs text-neutral-600 font-medium pb-1">No foods logged yet.</p>
        ) : (
          <div className="space-y-3">
            {mealLogs.map(log => (
              <div key={log.id} className="flex justify-between items-center bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-850">
                <div>
                  <p className="text-xs font-bold text-neutral-200">{log.name}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {log.calories} kcal • {log.protein}g P • {log.carbs}g C • {log.fat}g F
                  </p>
                </div>
                <button
                  onClick={() => removeFoodLog(log.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 space-y-4">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider animate-pulse">
          Loading nutrition data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-extrabold text-neutral-200 uppercase tracking-wider">Nutrition Tracker</h2>
      </div>

      {/* Daily Summary Dashboard */}
      <div className="bg-[#121212] border border-neutral-800/80 rounded-3xl p-5 space-y-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

        {/* Calories Ring / Main Stat */}
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="42"
                className="stroke-neutral-800"
                strokeWidth="8" fill="none"
              />
              <circle
                cx="50" cy="50" r="42"
                className="stroke-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="8" fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - calProgress / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame className="w-4 h-4 text-emerald-400 mb-0.5" />
              <span className="text-xs font-black text-neutral-100">{totalCalories}</span>
              <span className="text-[9px] font-bold text-neutral-500 uppercase">/ {CALORIE_GOAL}</span>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-neutral-200">Daily Calories</h3>
            <p className="text-[10px] text-neutral-400 leading-relaxed pr-2">
              You have <span className="text-emerald-400 font-bold">{Math.max(CALORIE_GOAL - totalCalories, 0)}</span> kcal remaining for today. Keep hitting those macros!
            </p>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {/* Protein */}
          <div className="bg-neutral-900/50 rounded-2xl p-3">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-neutral-400 uppercase">Protein</span>
              <span className="text-xs font-mono text-neutral-200">{Math.round(totalProtein)}g</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${proProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1.5 text-right">{PROTEIN_GOAL}g goal</p>
          </div>

          {/* Carbs */}
          <div className="bg-neutral-900/50 rounded-2xl p-3">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-neutral-400 uppercase">Carbs</span>
              <span className="text-xs font-mono text-neutral-200">{Math.round(totalCarbs)}g</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${carbProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1.5 text-right">{CARBS_GOAL}g goal</p>
          </div>

          {/* Fat */}
          <div className="bg-neutral-900/50 rounded-2xl p-3">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-neutral-400 uppercase">Fat</span>
              <span className="text-xs font-mono text-neutral-200">{Math.round(totalFat)}g</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${fatProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1.5 text-right">{FAT_GOAL}g goal</p>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        {renderMealSection('breakfast', 'Breakfast')}
        {renderMealSection('lunch', 'Lunch')}
        {renderMealSection('dinner', 'Dinner')}
        {renderMealSection('snacks', 'Snacks')}
      </div>

      <AddFoodModal 
        isOpen={activeMeal !== null} 
        onClose={() => setActiveMeal(null)} 
        mealType={activeMeal} 
      />
    </div>
  );
}
