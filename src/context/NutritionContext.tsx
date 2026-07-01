import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FoodLogEntry, DailyNutrition, MealType, NutritionGoals } from '../types';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from './WorkoutContext';

export interface NutritionContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dailyNutrition: DailyNutrition | null;
  goals: NutritionGoals;
  updateGoals: (newGoals: NutritionGoals) => Promise<void>;
  loading: boolean;
  addFoodLog: (food: Omit<FoodLogEntry, 'id' | 'timestamp'>) => Promise<void>;
  removeFoodLog: (logId: string) => Promise<void>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

const DEFAULT_GOALS: NutritionGoals = {
  calories: 2500,
  protein: 150,
  carbs: 250,
  fat: 80
};

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Default to today
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync Daily Nutrition
  useEffect(() => {
    if (!user) {
      setDailyNutrition(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsub: (() => void) | undefined;
    const path = `users/${user.uid}/nutrition/${selectedDate}`;

    try {
      unsub = onSnapshot(doc(db, 'users', user.uid, 'nutrition', selectedDate), (docSnap) => {
        if (docSnap.exists()) {
          setDailyNutrition(docSnap.data() as DailyNutrition);
        } else {
          setDailyNutrition({
            id: selectedDate,
            date: selectedDate,
            logs: []
          });
        }
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        setLoading(false);
      });
    } catch (err) {
      console.error('Failed to setup onSnapshot for nutrition:', err);
      setLoading(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [user, selectedDate]);

  // Sync User Goals
  useEffect(() => {
    if (!user) return;
    
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(doc(db, 'users', user.uid, 'settings', 'goals'), (docSnap) => {
        if (docSnap.exists()) {
          setGoals(docSnap.data() as NutritionGoals);
        } else {
          setGoals(DEFAULT_GOALS);
        }
      });
    } catch (err) {
      console.error('Failed to setup onSnapshot for goals:', err);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [user]);

  const updateGoals = async (newGoals: NutritionGoals) => {
    if (!user) return;
    const path = `users/${user.uid}/settings/goals`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'goals'), newGoals);
      setGoals(newGoals); // Optimistic UI update
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const addFoodLog = async (foodData: Omit<FoodLogEntry, 'id' | 'timestamp'>) => {
    if (!user) return;
    
    const newLog: FoodLogEntry = {
      ...foodData,
      id: 'log_' + Date.now(),
      timestamp: Date.now()
    };

    const updatedLogs = dailyNutrition ? [...dailyNutrition.logs, newLog] : [newLog];
    
    const newDaily: DailyNutrition = {
      id: selectedDate,
      date: selectedDate,
      logs: updatedLogs
    };

    const path = `users/${user.uid}/nutrition/${selectedDate}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'nutrition', selectedDate), newDaily);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const removeFoodLog = async (logId: string) => {
    if (!user || !dailyNutrition) return;
    
    const updatedLogs = dailyNutrition.logs.filter(log => log.id !== logId);
    
    const newDaily: DailyNutrition = {
      ...dailyNutrition,
      logs: updatedLogs
    };

    const path = `users/${user.uid}/nutrition/${selectedDate}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'nutrition', selectedDate), newDaily);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  return (
    <NutritionContext.Provider value={{
      selectedDate,
      setSelectedDate,
      dailyNutrition,
      goals,
      updateGoals,
      loading,
      addFoodLog,
      removeFoodLog
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
