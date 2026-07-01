export interface FoodItem {
  id: string;
  name: string;
  calories: number; // per 100g
  protein: number;  // per 100g
  carbs: number;    // per 100g
  fat: number;      // per 100g
  category: 'meat' | 'dairy' | 'carbs' | 'veg' | 'fruit' | 'snack';
}

export const COMPREHENSIVE_FOODS: FoodItem[] = [
  // MEAT & PROTEIN
  { id: 'f_chicken_breast', name: 'Chicken Breast (Raw)', calories: 120, protein: 22.5, carbs: 0, fat: 2.6, category: 'meat' },
  { id: 'f_chicken_thigh', name: 'Chicken Thigh (Raw)', calories: 177, protein: 17, carbs: 0, fat: 12, category: 'meat' },
  { id: 'f_beef_mince_5', name: 'Beef Mince (5% Fat)', calories: 137, protein: 21, carbs: 0, fat: 5, category: 'meat' },
  { id: 'f_salmon_raw', name: 'Salmon (Raw)', calories: 208, protein: 20, carbs: 0, fat: 13, category: 'meat' },
  { id: 'f_tuna_canned', name: 'Tuna (Canned in Water)', calories: 90, protein: 20, carbs: 0, fat: 1, category: 'meat' },
  { id: 'f_egg_whole', name: 'Whole Egg', calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, category: 'meat' },
  { id: 'f_egg_white', name: 'Egg White', calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, category: 'meat' },

  // DAIRY & ALTERNATIVES
  { id: 'f_milk_whole', name: 'Whole Milk', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, category: 'dairy' },
  { id: 'f_milk_skim', name: 'Skim Milk', calories: 35, protein: 3.4, carbs: 5, fat: 0.1, category: 'dairy' },
  { id: 'f_whey_protein', name: 'Whey Protein Powder', calories: 379, protein: 78, carbs: 6, fat: 4.5, category: 'dairy' },
  { id: 'f_greek_yogurt_0', name: 'Greek Yogurt (0% Fat)', calories: 59, protein: 10, carbs: 3.6, fat: 0, category: 'dairy' },
  { id: 'f_cheddar', name: 'Cheddar Cheese', calories: 402, protein: 25, carbs: 1.3, fat: 33, category: 'dairy' },

  // CARBS & GRAINS
  { id: 'f_rice_white_raw', name: 'White Rice (Raw)', calories: 360, protein: 6.6, carbs: 79, fat: 0.6, category: 'carbs' },
  { id: 'f_rice_white_cooked', name: 'White Rice (Cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'carbs' },
  { id: 'f_rice_brown_raw', name: 'Brown Rice (Raw)', calories: 367, protein: 7.5, carbs: 76, fat: 2.7, category: 'carbs' },
  { id: 'f_oats', name: 'Rolled Oats', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, category: 'carbs' },
  { id: 'f_pasta_raw', name: 'Pasta (Raw)', calories: 371, protein: 13, carbs: 75, fat: 1.5, category: 'carbs' },
  { id: 'f_potato_raw', name: 'White Potato (Raw)', calories: 77, protein: 2, carbs: 17, fat: 0.1, category: 'carbs' },
  { id: 'f_sweet_potato_raw', name: 'Sweet Potato (Raw)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'carbs' },
  { id: 'f_bread_white', name: 'White Bread', calories: 265, protein: 9, carbs: 49, fat: 3.2, category: 'carbs' },
  { id: 'f_bread_wholemeal', name: 'Wholemeal Bread', calories: 247, protein: 13, carbs: 41, fat: 3.4, category: 'carbs' },

  // VEGETABLES
  { id: 'f_broccoli', name: 'Broccoli', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, category: 'veg' },
  { id: 'f_spinach', name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'veg' },
  { id: 'f_carrot', name: 'Carrots', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, category: 'veg' },
  { id: 'f_onion', name: 'Onion', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, category: 'veg' },
  { id: 'f_tomato', name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'veg' },
  { id: 'f_bell_pepper', name: 'Bell Pepper (Red)', calories: 31, protein: 1, carbs: 6, fat: 0.3, category: 'veg' },

  // FRUITS
  { id: 'f_banana', name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'fruit' },
  { id: 'f_apple', name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, category: 'fruit' },
  { id: 'f_berries', name: 'Mixed Berries', calories: 43, protein: 0.9, carbs: 10, fat: 0.3, category: 'fruit' },
  { id: 'f_avocado', name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 15, category: 'fruit' },

  // FATS & SNACKS
  { id: 'f_peanut_butter', name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, category: 'snack' },
  { id: 'f_almonds', name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, category: 'snack' },
  { id: 'f_olive_oil', name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'snack' },
  { id: 'f_dark_chocolate', name: 'Dark Chocolate (70%)', calories: 598, protein: 8, carbs: 46, fat: 43, category: 'snack' }
];
