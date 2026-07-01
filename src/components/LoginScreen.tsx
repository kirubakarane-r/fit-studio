import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setAuthenticating(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Login error state:', err);
      setError(err?.message || 'Failed to authenticate. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-neutral-800/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm z-10 flex flex-col items-center">
        {/* Animated Icon Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 shadow-xl mb-6 relative"
        >
          <Dumbbell className="w-10 h-10 text-emerald-400" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border border-[#09090b] rounded-full animate-ping" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border border-[#09090b] rounded-full" />
        </motion.div>

        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center space-y-2 mb-8"
        >
          <h1 className="text-3xl font-black tracking-tight text-neutral-100 font-sans">
            Fit<span className="text-emerald-400"> Studio</span>
          </h1>
          <p className="text-xs text-neutral-400 max-w-[280px] mx-auto leading-relaxed">
            Your premium, offline-first personal training vault. Track splits, log weights, and visual progress.
          </p>
        </motion.div>

        {/* Auth Panel Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full bg-[#121214] border border-neutral-850 p-6 rounded-3xl shadow-2xl space-y-6"
        >
          <div className="text-center space-y-1">
            <h2 className="text-sm font-extrabold text-neutral-100 uppercase tracking-widest">
              Secure Sign In
            </h2>
            <p className="text-[11px] text-neutral-500">
              Select your preferred secure authentication method
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-400 text-center leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Google/Gmail Sign-In Button */}
            <button
              id="google-login-btn"
              disabled={authenticating}
              onClick={handleGoogleLogin}
              className={`w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer select-none shadow-lg transition-all duration-250 active:scale-98 ${
                authenticating ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{authenticating ? 'Signing In...' : 'Sign in with Gmail'}</span>
            </button>
          </div>

          {/* Bottom Security Info */}
          <div className="flex justify-around pt-2 border-t border-neutral-900 text-[10px] text-neutral-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
              <span>Isolated Data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500/80" />
              <span>Realtime Sync</span>
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-[10px] text-neutral-600 mt-8 text-center animate-pulse"
        >
          Your personalized library of movements, splits and history logs are synced securely with Firestore.
        </motion.p>
      </div>
    </div>
  );
}
