import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from './WorkoutContext';
import { BodyMeasurement } from '../types';

export interface MeasurementsContextType {
  measurements: BodyMeasurement[];
  loading: boolean;
  handleSaveMeasurement: (date: string, weight: number, waist: number, chest: number, arm: number) => Promise<void>;
  handleDeleteMeasurement: (id: string) => Promise<void>;
}

const MeasurementsContext = createContext<MeasurementsContextType | undefined>(undefined);

export const MeasurementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setMeasurements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const path = `users/${user.uid}/measurements`;
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'measurements'), (snap) => {
      const list: BodyMeasurement[] = [];
      snap.forEach(d => {
        list.push(d.data() as BodyMeasurement);
      });
      // Sort measurements by date descending (latest first)
      list.sort((a, b) => b.date.localeCompare(a.date));
      setMeasurements(list);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleSaveMeasurement = async (date: string, weight: number, waist: number, chest: number, arm: number) => {
    if (!user) return;
    
    // Check if measurement for this date already exists to overwrite/update it, or generate new id
    const existing = measurements.find(m => m.date === date);
    const id = existing ? existing.id : 'bm_' + Date.now() + Math.random().toString(36).substring(2, 9);
    
    const measurement: BodyMeasurement = {
      id,
      date,
      weight,
      waist,
      chest,
      arm,
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    };

    const path = `users/${user.uid}/measurements`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'measurements', id), measurement);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleDeleteMeasurement = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/measurements`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'measurements', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <MeasurementsContext.Provider value={{ measurements, loading, handleSaveMeasurement, handleDeleteMeasurement }}>
      {children}
    </MeasurementsContext.Provider>
  );
};

export const useMeasurements = () => {
  const context = useContext(MeasurementsContext);
  if (context === undefined) {
    throw new Error('useMeasurements must be used within a MeasurementsProvider');
  }
  return context;
};
