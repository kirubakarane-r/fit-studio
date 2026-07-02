import React from 'react';
import { Dumbbell, Clock } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';

// Screen Components (consume useWorkout)
import HomeScreen from './components/HomeScreen';
import ActiveWorkoutScreen from './components/ActiveWorkoutScreen';
import HistoryScreen from './components/HistoryScreen';
import ProgressScreen from './components/ProgressScreen';
import ExercisesScreen from './components/ExercisesScreen';
import LoginScreen from './components/LoginScreen';

// Modals, Overlays & Navigation
import NewWorkoutModal from './components/NewWorkoutModal';
import AddExerciseModal from './components/AddExerciseModal';
import CreateExerciseModal from './components/CreateExerciseModal';
import CreatePlanModal from './components/CreatePlanModal';
import RestPromptModal from './components/RestPromptModal';
import TemplateDetailModal from './components/TemplateDetailModal';
import WorkoutDetailModal from './components/WorkoutDetailModal';
import ConfirmDialogs from './components/ConfirmDialogs';
import RestTimer from './components/RestTimer';
import BottomNav from './components/BottomNav';
import UserProfileModal from './components/UserProfileModal';
import UpdateBanner from './components/UpdateBanner';

function WorkoutApp() {
  const { user, loading: authLoading, profile } = useAuth();
  const { screen, navigateTo, activeWorkout, loading: dataLoading } = useWorkout();
  const [showProfileModal, setShowProfileModal] = React.useState(false);

  // If Auth state is resolving, show full screen loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col items-center justify-center space-y-4">
        <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 animate-bounce">
          <Dumbbell className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest animate-pulse">
          Loading Fit Studio...
        </p>
      </div>
    );
  }

  // If user is not logged in, force LoginScreen
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col font-sans select-none antialiased">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#09090b]/85 backdrop-blur-md border-b border-neutral-900 px-4 h-14 flex items-center justify-between max-w-lg w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Fit<span className="text-emerald-400"> Studio</span>
          </span>
        </div>

        {/* User profile and active indicators */}
        <div className="flex items-center gap-2.5">
          {activeWorkout ? (
            <button
              onClick={() => navigateTo('active')}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 animate-pulse cursor-pointer"
            >
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Active</span>
            </button>
          ) : null}

          <div className="flex items-center border-l border-neutral-850 pl-2.5">
            <button
              onClick={() => setShowProfileModal(true)}
              className="relative w-7 h-7 rounded-full overflow-hidden border border-neutral-800 shadow hover:border-emerald-400 focus:outline-none transition-all cursor-pointer"
              title="View & Edit Profile"
            >
              {profile?.photoURL ? (
                <img 
                  src={profile.photoURL} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold uppercase text-neutral-300">
                  {(profile?.displayName || user.displayName || 'U').slice(0, 2)}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* UPDATE NOTIFICATION BANNER */}
      <div className="max-w-lg w-full mx-auto relative z-30">
        <UpdateBanner />
      </div>

      {/* SCREEN CONTAINER */}
      <main className="flex-1 max-w-lg w-full mx-auto pb-28 px-4 pt-4 overflow-y-auto">
        {dataLoading ? (
          <div className="flex flex-col items-center justify-center pt-24 space-y-4">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider animate-pulse">
              Syncing workout vault...
            </p>
          </div>
        ) : (
          <>
            {screen === 'home' && <HomeScreen />}
            {screen === 'active' && <ActiveWorkoutScreen />}
            {screen === 'history' && <HistoryScreen />}
            {screen === 'progress' && <ProgressScreen />}
            {screen === 'exercises' && <ExercisesScreen />}
          </>
        )}
      </main>

      {/* Floating Rest Timer */}
      <RestTimer />

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Setup New Session Modal */}
      <NewWorkoutModal />

      {/* Add Exercise Modal */}
      <AddExerciseModal />

      {/* Create Custom Exercise Modal */}
      <CreateExerciseModal />

      {/* Create Custom Workout Plan Modal */}
      <CreatePlanModal />

      {/* Rest Duration Option Prompt Modal */}
      <RestPromptModal />

      {/* Workout Detail and Edit View Sheet */}
      <WorkoutDetailModal />
      <TemplateDetailModal />

      {/* Dialog confirmations */}
      <ConfirmDialogs />

      {/* User Profile Details & Picture Modal */}
      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <WorkoutApp />
      </WorkoutProvider>
    </AuthProvider>
  );
}
