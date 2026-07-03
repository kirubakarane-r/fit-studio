import React, { useState, useEffect } from 'react';
import { X, Save, Apple, Sparkles, ChevronDown } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';
import { FoodItem } from '../types';
import { fetchFoodMacros } from '../utils/gemini';

export default function CreateFoodModal() {
  const { showCreateFoodModal, setShowCreateFoodModal, setShowAddFoodModal, handleAddFood } = useNutrition();

  const [name, setName] = useState('');
  const [servingAmount, setServingAmount] = useState('');
  const [servingUnit, setServingUnit] = useState('grams');
  
  // Read-only macro states
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [macrosGenerated, setMacrosGenerated] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const units = ['grams', 'scoop', 'cup', 'litre', 'count', 'ml', 'oz'];

  // Reset form when modal opens
  useEffect(() => {
    if (showCreateFoodModal) {
      setName('');
      setServingAmount('');
      setServingUnit('grams');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setMacrosGenerated(false);
      setIsGenerating(false);
    }
  }, [showCreateFoodModal]);

  if (!showCreateFoodModal) return null;

  const handleGenerateMacros = async () => {
    if (!name || !servingAmount) return;
    
    setIsGenerating(true);
    setMacrosGenerated(false);
    
    try {
      const data = await fetchFoodMacros(name, servingAmount, servingUnit);
      setCalories(String(Math.round(data.calories)));
      setProtein(String(Math.round(data.protein * 10) / 10));
      setCarbs(String(Math.round(data.carbs * 10) / 10));
      setFat(String(Math.round(data.fat * 10) / 10));
      
      setMacrosGenerated(true);
    } catch (error: any) {
      alert(error.message || 'Failed to generate macros. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !servingAmount || !macrosGenerated) return;

    const newFood: FoodItem = {
      id: 'f' + Date.now(),
      name: name.trim(),
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      servingSize: `${servingAmount} ${servingUnit}`
    };

    await handleAddFood(newFood);
    
    // Close this and reopen AddFood
    setShowCreateFoodModal(false);
    setShowAddFoodModal(true);
  };

  const closeModal = () => {
    setShowCreateFoodModal(false);
    setShowAddFoodModal(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
      
      <div className="relative bg-[#161618] w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col border-t sm:border border-neutral-800 shadow-2xl overflow-hidden slide-in-from-bottom-full sm:slide-in-from-bottom-8">
        
        {/* Handle bar on mobile */}
        <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>

        {/* Header */}
        <div className="p-4 border-b border-neutral-900 flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-neutral-100">Create Food</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Use AI to automatically fetch nutritional data.</p>
          </div>
          <button onClick={closeModal} className="text-neutral-500 hover:text-neutral-300 p-1.5 rounded-lg hover:bg-neutral-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-[#09090b]">
          <form id="createFoodForm" onSubmit={handleSave} className="space-y-4">
            
            <div className="p-4 bg-[#0c0c0d] border border-neutral-800/60 rounded-2xl space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Food Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cooked Chicken Breast"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setMacrosGenerated(false);
                  }}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-neutral-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Serving Size *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    placeholder="e.g. 200"
                    value={servingAmount}
                    onChange={(e) => {
                      setServingAmount(e.target.value);
                      setMacrosGenerated(false);
                    }}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-neutral-600"
                  />
                  <div className="relative w-28">
                    <button
                      type="button"
                      onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                      className="w-full flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    >
                      <span className="truncate mr-1">{servingUnit}</span>
                      <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${showUnitDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showUnitDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowUnitDropdown(false)} />
                        <div className="absolute top-full right-0 mt-2 w-32 bg-[#1c1c1f] border border-neutral-700/50 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                          {units.map(unit => (
                            <button
                              key={unit}
                              type="button"
                              onClick={() => {
                                setServingUnit(unit);
                                setShowUnitDropdown(false);
                                setMacrosGenerated(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-700/50 transition-colors cursor-pointer ${servingUnit === unit ? 'text-emerald-400 font-bold bg-neutral-800/50' : 'text-neutral-300'}`}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateMacros}
                disabled={!name || !servingAmount || isGenerating}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500 text-black text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:shadow-none cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Macros
                  </>
                )}
              </button>
            </div>

            <div className={`p-4 bg-[#0c0c0d] border border-neutral-800/60 rounded-2xl transition-opacity duration-300 ${macrosGenerated ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-3">AI Generated Macros</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Calories</label>
                  <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-bold">
                    {calories || '-'} kcal
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Protein (g)</label>
                  <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-blue-400 font-bold">
                    {protein || '-'} g
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Carbs (g)</label>
                  <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold">
                    {carbs || '-'} g
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Fat (g)</label>
                  <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-rose-400 font-bold">
                    {fat || '-'} g
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-900 bg-[#161618] flex items-center gap-3">
          <button
            type="submit"
            form="createFoodForm"
            disabled={!macrosGenerated}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Food</span>
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
