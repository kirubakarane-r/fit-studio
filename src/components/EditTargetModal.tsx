import React, { useState, useEffect } from 'react';
import { X, Save, Target } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';

export default function EditTargetModal() {
  const { showEditTargetModal, setShowEditTargetModal, target, handleUpdateTarget } = useNutrition();

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (showEditTargetModal) {
      setCalories(target.calories.toString());
      setProtein(target.protein.toString());
      setCarbs(target.carbs.toString());
      setFat(target.fat.toString());
    }
  }, [showEditTargetModal, target]);

  if (!showEditTargetModal) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calories || !protein || !carbs || !fat) return;

    await handleUpdateTarget({
      calories: parseInt(calories),
      protein: parseInt(protein),
      carbs: parseInt(carbs),
      fat: parseInt(fat)
    });
    
    setShowEditTargetModal(false);
  };

  const closeModal = () => {
    setShowEditTargetModal(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
      
      <div className="relative bg-[#161618] w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col border-t sm:border border-neutral-800 shadow-2xl overflow-hidden slide-in-from-bottom-full sm:slide-in-from-bottom-8">
        
        {/* Handle bar on mobile */}
        <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>

        {/* Header */}
        <div className="p-4 border-b border-neutral-900 flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-neutral-100">Edit Goals</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Update your daily nutritional targets.</p>
          </div>
          <button onClick={closeModal} className="text-neutral-500 hover:text-neutral-300 p-1.5 rounded-lg hover:bg-neutral-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-[#09090b]">
          <form id="editTargetForm" onSubmit={handleSave} className="space-y-4">
            
            <div className="p-4 bg-[#0c0c0d] border border-neutral-800/60 rounded-2xl space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Daily Calories</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 text-sm rounded-xl px-3 py-3 text-neutral-100 focus:outline-none placeholder-neutral-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Protein (g)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 text-sm rounded-xl px-3 py-3 text-neutral-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Carbs (g)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-sm rounded-xl px-3 py-3 text-neutral-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Fat (g)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-rose-500 text-sm rounded-xl px-3 py-3 text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-900 bg-[#161618] flex items-center gap-3">
          <button
            type="submit"
            form="editTargetForm"
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Save Goals</span>
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="px-5 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 text-sm font-semibold rounded-xl cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
