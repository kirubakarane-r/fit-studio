import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Upload, Scale, Ruler, Target, Check, Loader2, User as UserIcon, LogOut } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOAL_OPTIONS = [
  { value: 'Muscle Gain', label: 'Hypertrophy & Muscle Gain', icon: '💪' },
  { value: 'Fat Loss', label: 'Weight Loss & Lean Definition', icon: '🔥' },
  { value: 'Strength Training', label: 'Peak Power & Strength', icon: '🏋️' },
  { value: 'Endurance', label: 'Cardio & Athletic Endurance', icon: '🏃' },
  { value: 'Active Lifestyle', label: 'General Health & Active Lifestyle', icon: '🧘' }
];

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, profile, updateUserProfile, logout } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load user profile details from AuthContext in-memory profile instantly!
  useEffect(() => {
    if (!isOpen || !profile) return;
    setDisplayName(profile.displayName || '');
    setPhotoURL(profile.photoURL || null);
    setWeight(profile.weight || '');
    setHeight(profile.height || '');
    setGender(profile.gender || '');
    setGoal(profile.goal || '');
  }, [isOpen, profile]);

  if (!isOpen || !user) return null;

  const handleLogout = async () => {
    try {
      setError(null);
      await logout();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to log out. Please try again.');
    }
  };

  // Read uploaded picture file as base64 data url
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (.png, .jpg, .jpeg).');
      return;
    }

    // Limit base64 length to around 1MB for smooth firestore sync
    if (file.size > 1 * 1024 * 1024) {
      setError('Please choose an image under 1MB for optimized performance.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await updateUserProfile({
        displayName: displayName.trim(),
        photoURL,
        weight: weight.trim(),
        height: height.trim(),
        gender,
        goal
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving user profile details:', err);
      setError(err?.message || 'Failed to update user profile details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Container */}
      <div className="relative bg-[#121214] border border-neutral-850 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-900 flex justify-between items-center bg-[#161618]">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
              <UserIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-neutral-100 uppercase tracking-wider">
                User Profile
              </h3>
              <p className="text-[10px] text-neutral-500 font-medium">
                Update display name, avatar, and physical stats
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <form onSubmit={handleSave} className="space-y-6">
            
            {error && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-400 text-center leading-relaxed">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 text-center font-bold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Profile updated successfully!</span>
              </div>
            )}

              {/* Avatar upload section */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Profile Picture
                </label>

                <div className="flex items-center gap-4 bg-neutral-950/50 p-4 border border-neutral-900 rounded-2xl">
                  {/* Current Avatar preview */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-neutral-800 shadow bg-neutral-900 flex-shrink-0">
                    {photoURL ? (
                      <img 
                        src={photoURL} 
                        alt="Avatar Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-black uppercase text-neutral-400 bg-neutral-800">
                        {displayName?.slice(0, 2) || 'U'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Custom File Uploader button */}
                    <div className="flex gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-bold text-neutral-300 hover:text-neutral-100 rounded-xl cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Upload Photo</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                      </label>
                      {photoURL && (
                        <button
                          type="button"
                          onClick={() => setPhotoURL(null)}
                          className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 rounded-xl text-[11px] font-bold text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[9px] text-neutral-500 leading-relaxed">
                      Accepts JPEG, PNG or GIF. Max size 1MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Display Name Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-semibold transition-colors"
                />
              </div>

              {/* Physical details grid (Weight & Height) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Weight (kg)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 74.5"
                    className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Height (cm)</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 178"
                    className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Gender selection dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Gender
                </label>
                <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-850">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        gender === g
                          ? 'bg-neutral-900 text-emerald-400 border border-neutral-800 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal dropdown / select list */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Fitness Focus & Goal</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
                    className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-700 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-300 focus:outline-none font-semibold transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>
                      {goal ? (
                        <>
                          <span className="mr-1.5">{GOAL_OPTIONS.find(opt => opt.value === goal)?.icon}</span>
                          <span>{GOAL_OPTIONS.find(opt => opt.value === goal)?.label}</span>
                        </>
                      ) : (
                        <span className="text-neutral-500">Select your target objective...</span>
                      )}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isGoalDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {isGoalDropdownOpen && (
                    <>
                      {/* Invisible backdrop to close the dropdown */}
                      <div 
                        className="fixed inset-0 z-30 cursor-default" 
                        onClick={() => setIsGoalDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 mt-1.5 bg-[#121214] border border-neutral-850 rounded-xl shadow-2xl z-40 max-h-60 overflow-y-auto py-1 animate-in fade-in-50 slide-in-from-top-1 duration-100">
                        <button
                          type="button"
                          onClick={() => {
                            setGoal('');
                            setIsGoalDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs text-neutral-400 hover:bg-neutral-900 transition-colors flex items-center justify-between cursor-pointer ${
                            !goal ? 'text-emerald-400 font-bold bg-neutral-900/40' : ''
                          }`}
                        >
                          <span>Select your target objective...</span>
                          {!goal && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                        {GOAL_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setGoal(opt.value);
                              setIsGoalDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs text-neutral-200 hover:bg-neutral-900 transition-colors flex items-center gap-2 cursor-pointer ${
                              goal === opt.value ? 'text-emerald-400 font-bold bg-neutral-900/40' : ''
                            }`}
                          >
                            <span className="text-sm">{opt.icon}</span>
                            <span className="flex-1">{opt.label}</span>
                            {goal === opt.value && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="space-y-3 pt-4 border-t border-neutral-900">
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !displayName.trim()}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-500/5 border-t border-white/20"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/45 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>

            </form>
        </div>

      </div>
    </div>
  );
}
