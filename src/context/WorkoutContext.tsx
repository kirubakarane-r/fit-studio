import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { COMPREHENSIVE_EXERCISES } from '../data/dbExercises';
import { Exercise, Template, Workout, WorkoutExercise } from '../types';
import { useAuth } from './AuthContext';

// --------------------------------------------------
// FIRESTORE ERROR HANDLING UTILITIES (PILLAR 3 RESTRICTION)
// --------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface WorkoutContextType {
  // Core Data State
  exercises: Exercise[];
  templates: Template[];
  workouts: Workout[];
  loading: boolean;
  activeWorkout: Workout | null;
  setActiveWorkout: React.Dispatch<React.SetStateAction<Workout | null>>;
  
  // Navigation
  screen: 'home' | 'history' | 'progress' | 'exercises' | 'active' | 'nutrition';
  setScreen: React.Dispatch<React.SetStateAction<'home' | 'history' | 'progress' | 'exercises' | 'active' | 'nutrition'>>;
  navigateTo: (target: 'home' | 'history' | 'progress' | 'exercises' | 'active' | 'nutrition') => void;

  // Timers State
  elapsedTime: number;
  restTimeRemaining: number;
  showRestTimer: boolean;
  startRestTimer: (secs?: number) => void;
  skipRestTimer: () => void;

  // Modal / Sheet States
  showNewWorkoutModal: boolean;
  setShowNewWorkoutModal: React.Dispatch<React.SetStateAction<boolean>>;
  showAddExerciseModal: boolean;
  setShowAddExerciseModal: React.Dispatch<React.SetStateAction<boolean>>;
  showCreateLibraryModal: boolean;
  setShowCreateLibraryModal: React.Dispatch<React.SetStateAction<boolean>>;
  showCreatePlanModal: boolean;
  setShowCreatePlanModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedWorkoutId: string | null;
  setSelectedWorkoutId: React.Dispatch<React.SetStateAction<string | null>>;
  editingWorkoutDraft: Workout | null;
  setEditingWorkoutDraft: React.Dispatch<React.SetStateAction<Workout | null>>;
  
  showFinishConfirm: boolean;
  setShowFinishConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  showRestPrompt: boolean;
  setShowRestPrompt: React.Dispatch<React.SetStateAction<boolean>>;
  pendingDeleteWorkoutId: string | null;
  setPendingDeleteWorkoutId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedTemplateToView: Template | null;
  setSelectedTemplateToView: React.Dispatch<React.SetStateAction<Template | null>>;
  editingTemplate: Template | null;
  setEditingTemplate: React.Dispatch<React.SetStateAction<Template | null>>;

  // Form / Input States
  newWorkoutName: string;
  setNewWorkoutName: React.Dispatch<React.SetStateAction<string>>;
  saveAsTemplate: boolean;
  setSaveAsTemplate: React.Dispatch<React.SetStateAction<boolean>>;
  exerciseSearch: string;
  setExerciseSearch: React.Dispatch<React.SetStateAction<string>>;
  muscleFilter: string;
  setMuscleFilter: React.Dispatch<React.SetStateAction<string>>;
  
  // Custom exercise creation state
  newLibName: string;
  setNewLibName: React.Dispatch<React.SetStateAction<string>>;
  newLibMuscle: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  setNewLibMuscle: React.Dispatch<React.SetStateAction<'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio'>>;
  newLibType: 'weight' | 'bodyweight' | 'cardio';
  setNewLibType: React.Dispatch<React.SetStateAction<'weight' | 'bodyweight' | 'cardio'>>;

  // Workout Management Handlers
  handleCreatePlan: (name: string, selectedExerciseIds: string[]) => Promise<void>;
  handleUpdatePlan: (oldName: string, name: string, selectedExerciseIds: string[]) => Promise<void>;
  handleStartWorkoutFromTemplate: (template: Template) => void;
  handleDeleteTemplate: (name: string) => Promise<void>;
  handleOpenNewWorkout: () => void;
  handleStartWorkout: () => Promise<void>;
  handleAddExerciseToActive: (exerciseId: string) => void;
  handleAddSet: (exerciseIndex: number) => void;
  handleRemoveExercise: (exerciseIndex: number) => void;
  handleUpdateSet: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => void;
  handleToggleSet: (exerciseIndex: number, setIndex: number) => void;
  handleFinishWorkout: () => Promise<void>;
  handleDeleteWorkout: (id: string) => Promise<void>;

  // Exercise Library Creators
  handleCreateExerciseInLibrary: () => Promise<void>;
  handleDeleteExerciseFromLibrary: (id: string) => Promise<void>;

  // Draft Editing Handlers
  handleStartEditingWorkout: (workout: Workout) => void;
  handleAddSetToDraft: (exerciseIndex: number) => void;
  handleRemoveSetFromDraft: (exerciseIndex: number, setIndex: number) => void;
  handleRemoveExerciseFromDraft: (exerciseIndex: number) => void;
  handleUpdateDraftSet: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => void;
  handleToggleDraftSetDone: (exerciseIndex: number, setIndex: number) => void;
  handleSaveWorkoutEdits: () => Promise<void>;

  // Computed Metrics
  weekStats: {
    workoutsCount: number;
    volume: number;
    sets: number;
  };
  personalRecords: Array<{
    muscle: string;
    exerciseName: string;
    type: string;
    weight: number;
    reps: number;
    date: string;
  }>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // --------------------------------------------------
  // CORE STATE
  // --------------------------------------------------
  const [exercises, setExercises] = useState<Exercise[]>(COMPREHENSIVE_EXERCISES);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(() => {
    try {
      const saved = localStorage.getItem('activeWorkout');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [screen, setScreen] = useState<'home' | 'history' | 'progress' | 'exercises' | 'active' | 'nutrition'>(() => {
    try {
      const saved = localStorage.getItem('activeWorkout');
      return saved ? 'active' : 'home';
    } catch {
      return 'home';
    }
  });

  // Sync Exercises and merge custom user exercises
  useEffect(() => {
    if (!user) {
      setExercises(COMPREHENSIVE_EXERCISES);
      return;
    }

    let unsub: (() => void) | undefined;
    const path = `users/${user.uid}/exercises`;
    try {
      unsub = onSnapshot(collection(db, 'users', user.uid, 'exercises'), (snap) => {
        const list: Exercise[] = [];
        snap.forEach(d => {
          list.push(d.data() as Exercise);
        });
        // Merge comprehensive base library with user-created exercises
        setExercises([...COMPREHENSIVE_EXERCISES, ...list]);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    } catch (err) {
      console.error('Failed to setup onSnapshot for exercises:', err);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [user]);

  // Sync Templates from DB for the signed-in user
  useEffect(() => {
    if (!user) {
      setTemplates([]);
      return;
    }

    let unsub: (() => void) | undefined;
    const path = `users/${user.uid}/templates`;
    try {
      unsub = onSnapshot(collection(db, 'users', user.uid, 'templates'), (snap) => {
        const list: Template[] = [];
        snap.forEach(d => {
          list.push(d.data() as Template);
        });
        setTemplates(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    } catch (err) {
      console.error('Failed to setup onSnapshot for templates:', err);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [user]);

  // Sync Workouts from DB for the signed-in user
  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsub: (() => void) | undefined;
    const path = `users/${user.uid}/workouts`;
    try {
      unsub = onSnapshot(collection(db, 'users', user.uid, 'workouts'), (snap) => {
        const list: Workout[] = [];
        snap.forEach(d => {
          list.push(d.data() as Workout);
        });
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setWorkouts(list);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    } catch (err) {
      console.error('Failed to setup onSnapshot for workouts:', err);
      setLoading(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem('activeWorkout', activeWorkout ? JSON.stringify(activeWorkout) : '');
    if (activeWorkout) {
      setScreen('active');
    }
  }, [activeWorkout]);

  // --------------------------------------------------
  // TIMERS STATE & LOGIC
  // --------------------------------------------------
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number>(0);
  const [showRestTimer, setShowRestTimer] = useState<boolean>(false);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | any>(null);

  // Active workout duration ticker
  useEffect(() => {
    let ticker: NodeJS.Timeout;
    if (activeWorkout) {
      ticker = setInterval(() => {
        const secs = Math.floor((Date.now() - activeWorkout.startTime) / 1000);
        setElapsedTime(secs);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(ticker);
  }, [activeWorkout]);

  // Play an arcade "level up" style success sound on rest completion
  const playRestCompletedTone = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square'; // 'square' gives it that arcade 8-bit feel
        
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        
        // Quick attack and release for that plucky arcade sound
        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + startTime + 0.02);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);
        
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      // Play a fast ascending major arpeggio
      playNote(392.00, 0.0, 0.1);    // G4
      playNote(523.25, 0.1, 0.1);    // C5
      playNote(659.25, 0.2, 0.1);    // E5
      playNote(783.99, 0.3, 0.3);    // G5 (held longer)
      
    } catch (error) {
      console.error('Failed to play notification tone:', error);
    }
  };

  // Rest timer ticker
  useEffect(() => {
    if (showRestTimer) {
      if (restTimeRemaining > 0) {
        restTimerRef.current = setTimeout(() => {
          setRestTimeRemaining(prev => prev - 1);
        }, 1000);
      } else {
        playRestCompletedTone();
        setShowRestTimer(false);
      }
    }
    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [showRestTimer, restTimeRemaining]);

  const startRestTimer = (secs: number = 90) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch (e) {}
    
    setRestTimeRemaining(secs);
    setShowRestTimer(true);
  };

  const skipRestTimer = () => {
    setRestTimeRemaining(0);
    setShowRestTimer(false);
  };

  // --------------------------------------------------
  // MODAL / SHEET STATES
  // --------------------------------------------------
  const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showCreateLibraryModal, setShowCreateLibraryModal] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [editingWorkoutDraft, setEditingWorkoutDraft] = useState<Workout | null>(null);
  
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showRestPrompt, setShowRestPrompt] = useState(false);
  const [pendingDeleteWorkoutId, setPendingDeleteWorkoutId] = useState<string | null>(null);
  const [selectedTemplateToView, setSelectedTemplateToView] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // --------------------------------------------------
  // FORM / INPUT STATES
  // --------------------------------------------------
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('');
  
  // Custom exercise creation state
  const [newLibName, setNewLibName] = useState('');
  const [newLibMuscle, setNewLibMuscle] = useState<'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio'>('chest');
  const [newLibType, setNewLibType] = useState<'weight' | 'bodyweight' | 'cardio'>('weight');

  // --------------------------------------------------
  // NAVIGATION ROUTER GUARD
  // --------------------------------------------------
  const navigateTo = (target: 'home' | 'history' | 'progress' | 'exercises' | 'active' | 'nutrition') => {
    if (activeWorkout) {
      setScreen('active');
    } else {
      setScreen(target);
    }
  };

  // --------------------------------------------------
  // WORKOUT MANAGEMENT
  // --------------------------------------------------
  const handleCreatePlan = async (name: string, selectedExerciseIds: string[]) => {
    if (!user) return;
    const newTemplate: Template = {
      name: name.trim(),
      exercises: selectedExerciseIds
    };
    const path = `users/${user.uid}/templates`;
    try {
      const id = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      setDoc(doc(db, 'users', user.uid, 'templates', id), newTemplate);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleUpdatePlan = async (oldName: string, name: string, selectedExerciseIds: string[]) => {
    if (!user) return;
    const newTemplate: Template = {
      name: name.trim(),
      exercises: selectedExerciseIds
    };
    const path = `users/${user.uid}/templates`;
    try {
      const oldId = oldName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const newId = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      if (oldId !== newId) {
        deleteDoc(doc(db, 'users', user.uid, 'templates', oldId));
      }
      setDoc(doc(db, 'users', user.uid, 'templates', newId), newTemplate);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleStartWorkoutFromTemplate = (template: Template) => {
    const initialExercises: WorkoutExercise[] = template.exercises.map(eid => ({
      id: eid,
      sets: [{ weight: '', reps: '', done: false }]
    }));

    const newWorkout: Workout = {
      id: 'w' + Date.now(),
      name: template.name,
      date: new Date().toISOString(),
      startTime: Date.now(),
      exercises: initialExercises,
    };

    setActiveWorkout(newWorkout);
    setScreen('active');
  };

  const handleDeleteTemplate = async (name: string) => {
    if (!user) return;
    const path = `users/${user.uid}/templates`;
    try {
      const id = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      deleteDoc(doc(db, 'users', user.uid, 'templates', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleOpenNewWorkout = () => {
    setNewWorkoutName('');
    setSaveAsTemplate(false);
    setShowNewWorkoutModal(true);
  };

  const handleStartWorkout = async () => {
    if (!user) return;
    const name = newWorkoutName.trim() || 'Custom Workout';
    
    // If template selected, pre-populate exercise groups
    const matchedTemplate = templates.find(t => t.name.toLowerCase() === name.toLowerCase());
    const initialExercises: WorkoutExercise[] = [];
    
    if (matchedTemplate) {
      matchedTemplate.exercises.forEach(eid => {
        initialExercises.push({
          id: eid,
          sets: [{ weight: '', reps: '', done: false }]
        });
      });
    }

    const newWorkout: Workout = {
      id: 'w' + Date.now(),
      name,
      date: new Date().toISOString(),
      startTime: Date.now(),
      exercises: initialExercises,
    };

    // Auto save template if toggled and doesn't exist
    if (saveAsTemplate && name && !templates.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      const newTemplate: Template = {
        name,
        exercises: []
      };
      const path = `users/${user.uid}/templates`;
      try {
        const id = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        setDoc(doc(db, 'users', user.uid, 'templates', id), newTemplate);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    setActiveWorkout(newWorkout);
    setShowNewWorkoutModal(false);
    setScreen('active');
  };

  const handleAddExerciseToActive = (exerciseId: string) => {
    if (!activeWorkout) return;
    
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises.push({
      id: exerciseId,
      sets: [{ weight: '', reps: '', done: false }]
    });

    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
    setShowAddExerciseModal(false);
  };

  const handleAddSet = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const sets = updatedExercises[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1] || { weight: '', reps: '', done: false };
    
    sets.push({
      weight: lastSet.weight,
      reps: lastSet.reps,
      done: false
    });

    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises.splice(exerciseIndex, 1);
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };

    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  const handleToggleSet = (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const set = updatedExercises[exerciseIndex].sets[setIndex];
    const isNowDone = !set.done;
    
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...set,
      done: isNowDone
    };

    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });

    if (isNowDone) {
      setShowRestPrompt(true);
    }
  };

  const handleFinishWorkout = async () => {
    if (!activeWorkout || !user) return;
    
    const finalDuration = Math.floor((Date.now() - activeWorkout.startTime) / 1000);
    
    // Save workout with completed exercises/sets
    const loggedWorkout: Workout = {
      ...activeWorkout,
      duration: finalDuration,
      date: new Date().toISOString()
    };

    const path = `users/${user.uid}/workouts`;
    try {
      setDoc(doc(db, 'users', user.uid, 'workouts', loggedWorkout.id), loggedWorkout);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }

    setActiveWorkout(null);
    setShowFinishConfirm(false);
    skipRestTimer();
    setScreen('home');
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/workouts`;
    try {
      deleteDoc(doc(db, 'users', user.uid, 'workouts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
    setPendingDeleteWorkoutId(null);
    setSelectedWorkoutId(null);
  };

  // --------------------------------------------------
  // EXERCISE LIBRARY CREATION
  // --------------------------------------------------
  const handleCreateExerciseInLibrary = async () => {
    if (!user) return;
    const trimmed = newLibName.trim();
    if (!trimmed) return;

    const newEx: Exercise = {
      id: 'e' + Date.now(),
      name: trimmed,
      muscle: newLibMuscle,
      type: newLibType
    };

    const path = `users/${user.uid}/exercises`;
    try {
      setDoc(doc(db, 'users', user.uid, 'exercises', newEx.id), newEx);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    setNewLibName('');
    setShowCreateLibraryModal(false);
  };

  const handleDeleteExerciseFromLibrary = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/exercises`;
    try {
      deleteDoc(doc(db, 'users', user.uid, 'exercises', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // --------------------------------------------------
  // WORKOUT EDIT DETAILS DRAFT ACTIONS
  // --------------------------------------------------
  const handleStartEditingWorkout = (workout: Workout) => {
    setEditingWorkoutDraft(JSON.parse(JSON.stringify(workout)));
  };

  const handleAddSetToDraft = (exerciseIndex: number) => {
    if (!editingWorkoutDraft) return;
    const draft = { ...editingWorkoutDraft };
    const sets = draft.exercises[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1] || { weight: '', reps: '', done: false };
    sets.push({
      weight: lastSet.weight,
      reps: lastSet.reps,
      done: false
    });
    setEditingWorkoutDraft(draft);
  };

  const handleRemoveSetFromDraft = (exerciseIndex: number, setIndex: number) => {
    if (!editingWorkoutDraft) return;
    const draft = { ...editingWorkoutDraft };
    draft.exercises[exerciseIndex].sets.splice(setIndex, 1);
    setEditingWorkoutDraft(draft);
  };

  const handleRemoveExerciseFromDraft = (exerciseIndex: number) => {
    if (!editingWorkoutDraft) return;
    const draft = { ...editingWorkoutDraft };
    draft.exercises.splice(exerciseIndex, 1);
    setEditingWorkoutDraft(draft);
  };

  const handleUpdateDraftSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    if (!editingWorkoutDraft) return;
    const draft = { ...editingWorkoutDraft };
    draft.exercises[exerciseIndex].sets[setIndex][field] = value;
    setEditingWorkoutDraft(draft);
  };

  const handleToggleDraftSetDone = (exerciseIndex: number, setIndex: number) => {
    if (!editingWorkoutDraft) return;
    const draft = { ...editingWorkoutDraft };
    const set = draft.exercises[exerciseIndex].sets[setIndex];
    set.done = !set.done;
    setEditingWorkoutDraft(draft);
  };

  const handleSaveWorkoutEdits = async () => {
    if (!editingWorkoutDraft || !user) return;
    const path = `users/${user.uid}/workouts`;
    try {
      setDoc(doc(db, 'users', user.uid, 'workouts', editingWorkoutDraft.id), editingWorkoutDraft);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    setEditingWorkoutDraft(null);
  };

  // --------------------------------------------------
  // COMPUTED STATS FOR DASHBOARD & METRICS
  // --------------------------------------------------
  const getWeekStats = () => {
    const nowTime = new Date();
    // Week start: Sunday 12:00 AM
    const weekStart = new Date(nowTime);
    weekStart.setDate(nowTime.getDate() - nowTime.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekWorkouts = workouts.filter(w => new Date(w.date) >= weekStart);
    
    let totalVolume = 0;
    let completedSetsCount = 0;

    weekWorkouts.forEach(w => {
      w.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.done) {
            completedSetsCount++;
            const weight = parseFloat(s.weight) || 0;
            const reps = parseInt(s.reps) || 0;
            totalVolume += weight * reps;
          }
        });
      });
    });

    return {
      workoutsCount: weekWorkouts.length,
      volume: totalVolume,
      sets: completedSetsCount
    };
  };

  const weekStats = getWeekStats();

  const getPersonalRecords = () => {
    const prMap: Record<string, { muscle: string; exerciseName: string; type: string; weight: number; reps: number; date: string }> = {};

    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        const exData = exercises.find(e => e.id === ex.id);
        if (!exData) return;

        ex.sets.forEach(s => {
          if (!s.done) return;
          const wt = parseFloat(s.weight) || 0;
          const rp = parseInt(s.reps) || 0;
          if (wt <= 0 && rp <= 0) return;

          const currentPR = prMap[ex.id];
          let isNewPR = false;

          if (!currentPR) {
            isNewPR = true;
          } else {
            if (exData.type === 'weight') {
              if (wt > currentPR.weight) isNewPR = true;
              else if (wt === currentPR.weight && rp > currentPR.reps) isNewPR = true;
            } else if (exData.type === 'bodyweight') {
              if (rp > currentPR.reps) isNewPR = true;
            } else if (exData.type === 'cardio') {
              if (rp > currentPR.reps) isNewPR = true;
              else if (rp === currentPR.reps && wt > currentPR.weight) isNewPR = true;
            }
          }

          if (isNewPR) {
            prMap[ex.id] = {
              muscle: exData.muscle,
              exerciseName: exData.name,
              type: exData.type,
              weight: wt,
              reps: rp,
              date: w.date
            };
          }
        });
      });
    });

    return Object.values(prMap).sort((a, b) => a.muscle.localeCompare(b.muscle) || a.exerciseName.localeCompare(b.exerciseName));
  };

  const personalRecords = getPersonalRecords();

  return (
    <WorkoutContext.Provider value={{
      exercises,
      templates,
      workouts,
      loading,
      activeWorkout,
      setActiveWorkout,
      screen,
      setScreen,
      navigateTo,
      elapsedTime,
      restTimeRemaining,
      showRestTimer,
      startRestTimer,
      skipRestTimer,
      showNewWorkoutModal,
      setShowNewWorkoutModal,
      showAddExerciseModal,
      setShowAddExerciseModal,
      showCreateLibraryModal,
      setShowCreateLibraryModal,
      showCreatePlanModal,
      setShowCreatePlanModal,
      selectedWorkoutId,
      setSelectedWorkoutId,
      editingWorkoutDraft,
      setEditingWorkoutDraft,
      showFinishConfirm,
      setShowFinishConfirm,
      showRestPrompt,
      setShowRestPrompt,
      pendingDeleteWorkoutId,
      setPendingDeleteWorkoutId,
      selectedTemplateToView,
      setSelectedTemplateToView,
      editingTemplate,
      setEditingTemplate,
      newWorkoutName,
      setNewWorkoutName,
      saveAsTemplate,
      setSaveAsTemplate,
      exerciseSearch,
      setExerciseSearch,
      muscleFilter,
      setMuscleFilter,
      newLibName,
      setNewLibName,
      newLibMuscle,
      setNewLibMuscle,
      newLibType,
      setNewLibType,
      handleCreatePlan,
      handleUpdatePlan,
      handleStartWorkoutFromTemplate,
      handleDeleteTemplate,
      handleOpenNewWorkout,
      handleStartWorkout,
      handleAddExerciseToActive,
      handleAddSet,
      handleRemoveExercise,
      handleUpdateSet,
      handleToggleSet,
      handleFinishWorkout,
      handleDeleteWorkout,
      handleCreateExerciseInLibrary,
      handleDeleteExerciseFromLibrary,
      handleStartEditingWorkout,
      handleAddSetToDraft,
      handleRemoveSetFromDraft,
      handleRemoveExerciseFromDraft,
      handleUpdateDraftSet,
      handleToggleDraftSetDone,
      handleSaveWorkoutEdits,
      weekStats,
      personalRecords,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
