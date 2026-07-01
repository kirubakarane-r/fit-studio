import { Exercise, Template } from '../types';

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'e1', name: 'Bench Press', muscle: 'chest', type: 'weight' },
  { id: 'e2', name: 'Incline Dumbbell Press', muscle: 'chest', type: 'weight' },
  { id: 'e3', name: 'Cable Fly', muscle: 'chest', type: 'weight' },
  { id: 'e4', name: 'Push-Up', muscle: 'chest', type: 'bodyweight' },
  { id: 'e5', name: 'Pull-Up', muscle: 'back', type: 'bodyweight' },
  { id: 'e6', name: 'Barbell Row', muscle: 'back', type: 'weight' },
  { id: 'e7', name: 'Lat Pulldown', muscle: 'back', type: 'weight' },
  { id: 'e8', name: 'Deadlift', muscle: 'back', type: 'weight' },
  { id: 'e9', name: 'Squat', muscle: 'legs', type: 'weight' },
  { id: 'e10', name: 'Leg Press', muscle: 'legs', type: 'weight' },
  { id: 'e11', name: 'Romanian Deadlift', muscle: 'legs', type: 'weight' },
  { id: 'e12', name: 'Leg Curl', muscle: 'legs', type: 'weight' },
  { id: 'e13', name: 'Calf Raise', muscle: 'legs', type: 'weight' },
  { id: 'e14', name: 'Overhead Press', muscle: 'shoulders', type: 'weight' },
  { id: 'e15', name: 'Lateral Raise', muscle: 'shoulders', type: 'weight' },
  { id: 'e16', name: 'Face Pull', muscle: 'shoulders', type: 'weight' },
  { id: 'e17', name: 'Bicep Curl', muscle: 'arms', type: 'weight' },
  { id: 'e18', name: 'Tricep Pushdown', muscle: 'arms', type: 'weight' },
  { id: 'e19', name: 'Hammer Curl', muscle: 'arms', type: 'weight' },
  { id: 'e20', name: 'Dip', muscle: 'arms', type: 'bodyweight' },
  { id: 'e21', name: 'Plank', muscle: 'core', type: 'bodyweight' },
  { id: 'e22', name: 'Crunch', muscle: 'core', type: 'bodyweight' },
  { id: 'e23', name: 'Running', muscle: 'cardio', type: 'cardio' },
  { id: 'e24', name: 'Cycling', muscle: 'cardio', type: 'cardio' },
];

export const DEFAULT_TEMPLATES: Template[] = [
  { name: 'Push Day', exercises: ['e1', 'e2', 'e3', 'e14', 'e15', 'e18'] },
  { name: 'Pull Day', exercises: ['e6', 'e7', 'e5', 'e17', 'e19', 'e16'] },
  { name: 'Leg Day', exercises: ['e9', 'e10', 'e11', 'e12', 'e13'] },
  { name: 'Upper Body', exercises: ['e1', 'e6', 'e14', 'e17', 'e18'] },
  { name: 'Full Body', exercises: ['e1', 'e6', 'e9', 'e17', 'e21'] },
];
