import React, { useState } from 'react';
import { Plus, Trash2, Flame, Settings, X, Check } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';
import { MealType } from '../types';
import AddFoodModal from './AddFoodModal';

export default function NutritionScreen() {
  const { dailyNutrition, goals, updateGoals, removeFoodLog, loading } = useNutrition();
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Edit Goals Form State
  const [editCals, setEditCals] = useState(goals.calories.toString());
  const [editProtein, setEditProtein] = useState(goals.protein.toString());
  const [editCarbs, setEditCarbs] = useState(goals.carbs.toString());
  const [editFat, setEditFat] = useState(goals.fat.toString());

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

  const calProgress = Math.min((totalCalories / goals.calories) * 100, 100) || 0;
  const proProgress = Math.min((totalProtein / goals.protein) * 100, 100) || 0;
  const carbProgress = Math.min((totalCarbs / goals.carbs) * 100, 100) || 0;
  const fatProgress = Math.min((totalFat / goals.fat) * 100, 100) || 0;

  const handleSaveGoals = async () => {
    await updateGoals({
      calories: Number(editCals) || 2500,
      protein: Number(editProtein) || 150,
      carbs: Number(editCarbs) || 250,
      fat: Number(editFat) || 80
    });
    setShowGoalModal(false);
  };

  const openGoalModal = () => {
    setEditCals(goals.calories.toString());
    setEditProtein(goals.protein.toString());
    setEditCarbs(goals.carbs.toString());
    setEditFat(goals.fat.toString());
    setShowGoalModal(true);
  };

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
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-extrabold text-neutral-200 uppercase tracking-wider">Nutrition Tracker</h2>
        <button 
          onClick={openGoalModal}
          className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 rounded-xl transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
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
              <span className="text-[9px] font-bold text-neutral-500 uppercase">/ {goals.calories}</span>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-neutral-200">Daily Calories</h3>
            <p className="text-[10px] text-neutral-400 leading-relaxed pr-2">
              You have <span className="text-emerald-400 font-bold">{Math.max(goals.calories - totalCalories, 0)}</span> kcal remaining for today. Keep hitting those macros!
            </p>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {/* Protein */}
          <div className="bg-neutral-900/50 rounded-2xl p-3">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Protein</span>
              <span className="text-xs font-mono text-neutral-200">{Math.round(totalProtein)}g</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${proProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1.5 text-right">{goals.protein}g goal</p>
          </div>

          {/* Carbs */}
          <div className="bg-neutral-900/50 rounded-2xl p-3">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Carbs</span>
              <span className="text-xs font-mono text-neutral-200">{Math.round(totalCarbs)}g</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${carbProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1.5 text-right">{goals.carbs}g goal</p>
          </div>

          {/* Fat */}
          <div className="bg-neutral-900/50 rounded-2xl p-3">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Fat</span>
              <span className="text-xs font-mono text-neutral-200">{Math.round(totalFat)}g</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${fatProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1.5 text-right">{goals.fat}g goal</p>
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

      {/* Edit Goals Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-neutral-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-neutral-900 flex justify-between items-center bg-[#161618]">
              <h3 className="text-sm font-extrabold text-neutral-100 uppercase tracking-wider">Set Daily Goals</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Calories (kcal)</label>
                <input
                  type="number"
                  value={editCals}
                  onChange={e => setEditCals(e.target.value)}
                  className="w-full bg-neutral-900 border-none focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl p-3 text-neutral-200 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Protein (g)</label>
                  <input
                    type="number"
                    value={editProtein}
                    onChange={e => setEditProtein(e.target.value)}
                    className="w-full bg-neutral-900 border-none focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl p-3 text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Carbs (g)</label>
                  <input
                    type="number"
                    value={editCarbs}
                    onChange={e => setEditCarbs(e.target.value)}
                    className="w-full bg-neutral-900 border-none focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl p-3 text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Fat (g)</label>
                  <input
                    type="number"
                    value={editFat}
                    onChange={e => setEditFat(e.target.value)}
                    className="w-full bg-neutral-900 border-none focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl p-3 text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveGoals}
                className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl flex justify-center items-center gap-2 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Goals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
