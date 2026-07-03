import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from './WorkoutContext';
import { FoodItem, MealEntry, DailyNutritionTarget } from '../types';

export interface NutritionContextType {
  foods: FoodItem[];
  meals: MealEntry[];
  target: DailyNutritionTarget;
  loading: boolean;
  selectedDate: string; // ISO date string without time
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  
  // Modals
  showAddFoodModal: boolean;
  setShowAddFoodModal: React.Dispatch<React.SetStateAction<boolean>>;
  showCreateFoodModal: boolean;
  setShowCreateFoodModal: React.Dispatch<React.SetStateAction<boolean>>;
  showEditTargetModal: boolean;
  setShowEditTargetModal: React.Dispatch<React.SetStateAction<boolean>>;
  activeMealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | null;
  setActiveMealType: React.Dispatch<React.SetStateAction<'breakfast' | 'lunch' | 'dinner' | 'snacks' | null>>;
  editingFood: FoodItem | null;
  setEditingFood: React.Dispatch<React.SetStateAction<FoodItem | null>>;
  
  handleAddFood: (food: FoodItem) => Promise<void>;
  handleDeleteFood: (id: string) => Promise<void>;
  handleAddMealEntry: (entry: Omit<MealEntry, 'id'>) => Promise<void>;
  handleUpdateMealEntry: (entry: MealEntry) => Promise<void>;
  handleDeleteMealEntry: (id: string) => Promise<void>;
  handleUpdateTarget: (newTarget: DailyNutritionTarget) => Promise<void>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

const DEFAULT_TARGET: DailyNutritionTarget = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65
};

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [target, setTarget] = useState<DailyNutritionTarget>(DEFAULT_TARGET);
  const [loading, setLoading] = useState(true);
  
  // Date state (default today YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Use local time instead of UTC to prevent date mismatch
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset*60*1000));
    return localDate.toISOString().split('T')[0];
  });

  // Modal states
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showCreateFoodModal, setShowCreateFoodModal] = useState(false);
  const [showEditTargetModal, setShowEditTargetModal] = useState(false);
  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks' | null>(null);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Sync Foods
  useEffect(() => {
    if (!user) {
      setFoods([]);
      return;
    }
    const path = `users/${user.uid}/foods`;
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'foods'), (snap) => {
      const list: FoodItem[] = [];
      snap.forEach(d => list.push(d.data() as FoodItem));
      setFoods(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, path));
    return () => unsub();
  }, [user]);

  // Sync Meals
  useEffect(() => {
    if (!user) {
      setMeals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const path = `users/${user.uid}/meals`;
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'meals'), (snap) => {
      const list: MealEntry[] = [];
      snap.forEach(d => list.push(d.data() as MealEntry));
      setMeals(list);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Sync Target
  useEffect(() => {
    if (!user) {
      setTarget(DEFAULT_TARGET);
      return;
    }
    const path = `users/${user.uid}/nutritionTarget`;
    const unsub = onSnapshot(doc(db, 'users', user.uid, 'nutritionTarget', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        setTarget(docSnap.data() as DailyNutritionTarget);
      } else {
        setTarget(DEFAULT_TARGET);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, path));
    return () => unsub();
  }, [user]);

  const handleAddFood = async (food: FoodItem) => {
    if (!user) return;
    const path = `users/${user.uid}/foods`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'foods', food.id), food);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleDeleteFood = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/foods`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'foods', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleAddMealEntry = async (entry: Omit<MealEntry, 'id'>) => {
    if (!user) return;
    const id = 'm' + Date.now();
    const newEntry: MealEntry = { ...entry, id };
    const path = `users/${user.uid}/meals`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'meals', id), newEntry);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleDeleteMealEntry = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/meals`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'meals', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleUpdateMealEntry = async (entry: MealEntry) => {
    if (!user) return;
    const path = `users/${user.uid}/meals`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'meals', entry.id), entry);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleUpdateTarget = async (newTarget: DailyNutritionTarget) => {
    if (!user) return;
    const path = `users/${user.uid}/nutritionTarget/current`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'nutritionTarget', 'current'), newTarget);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  return (
    <NutritionContext.Provider value={{
      foods, meals, target, loading, selectedDate, setSelectedDate,
      showAddFoodModal, setShowAddFoodModal, showCreateFoodModal, setShowCreateFoodModal,
      showEditTargetModal, setShowEditTargetModal,
      activeMealType, setActiveMealType,
      editingFood, setEditingFood,
      handleAddFood, handleDeleteFood, handleAddMealEntry, handleUpdateMealEntry, handleDeleteMealEntry, handleUpdateTarget
    }}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};
