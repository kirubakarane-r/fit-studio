export interface Exercise {
  id: string;
  name: string;
  muscle: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  type: 'weight' | 'bodyweight' | 'cardio';
}

export interface Template {
  name: string;
  exercises: string[]; // Exercise IDs
}

export interface WorkoutSet {
  weight: string; // Keep as string for input handling, parse when calculating
  reps: string;   // Keep as string for input handling, parse when calculating
  done: boolean;
}

export interface WorkoutExercise {
  id: string; // References Exercise.id
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  date: string; // ISO string
  startTime: number; // timestamp
  duration?: number; // seconds
  exercises: WorkoutExercise[];
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  cookingDetails?: string;
  image?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface MealEntry {
  id: string;
  foodId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  mealType: MealType;
  date: string;
}

export interface DailyNutritionTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface BodyMeasurement {
  id: string;
  date: string;       // YYYY-MM-DD local format
  weight: number;     // in kg
  waist: number;      // in cm
  chest: number;      // in cm
  arm?: number;       // in cm (legacy)
  armLeft: number;    // left arm in cm
  armRight: number;   // right arm in cm
  createdAt: string;  // ISO timestamp
}

