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
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodLogEntry {
  id: string;
  foodId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  servings: number;
  timestamp: number;
}

export interface DailyNutrition {
  id: string; // Format: YYYY-MM-DD
  date: string; // Format: YYYY-MM-DD
  logs: FoodLogEntry[];
}
