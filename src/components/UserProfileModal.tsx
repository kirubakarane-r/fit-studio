import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Upload, Scale, Ruler, Target, Check, Loader2, User as UserIcon, LogOut, ChevronDown, Users, Activity } from 'lucide-react';

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
  const [age, setAge] = useState('');
  const [medicalIssue, setMedicalIssue] = useState('');
  
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
    setAge(profile.age || '');
    setMedicalIssue(profile.medicalIssue || '');
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

  // Read uploaded picture file, resize it using canvas, and convert to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (.png, .jpg, .jpeg).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG to ensure it's very small for Firestore sync
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoURL(dataUrl);
        setError(null);
      };
      img.onerror = () => setError('Failed to process image file.');
      img.src = reader.result as string;
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
        goal,
        age: age.trim(),
        medicalIssue: medicalIssue.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
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

        {/* Form Container wrapping both scrollable body and fixed footer */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
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
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-bold text-neutral-300 hover:text-neutral-100 rounded-xl cursor-pointer transition-colors whitespace-nowrap">
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

              {/* Physical details grid (Weight, Height, Age) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex flex-col justify-end space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-500 shrink-0" />
                    <span className="leading-tight">Weight<br className="hidden sm:block"/>(kg)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 74.5"
                    className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-mono px-2"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-500 shrink-0" />
                    <span className="leading-tight">Height<br className="hidden sm:block"/>(cm)</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 178"
                    className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-mono px-2"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-500 flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0">#</span>
                    <span className="leading-tight">Age</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-mono px-2"
                  />
                </div>
              </div>

              {/* Gender selection dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Gender</span>
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
                    className="w-full flex justify-between items-center bg-neutral-950 border border-neutral-850 hover:border-neutral-700 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-300 focus:outline-none font-semibold transition-all cursor-pointer"
                  >
                    <span>
                      {goal 
                        ? (() => {
                            const opt = GOAL_OPTIONS.find(o => o.value === goal);
                            return opt ? `${opt.icon} ${opt.label}` : goal;
                          })()
                        : 'Select your target objective...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${isGoalDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isGoalDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsGoalDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden z-50 shadow-2xl flex flex-col">
                        {GOAL_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setGoal(opt.value);
                              setIsGoalDropdownOpen(false);
                            }}
                            className={`text-left px-4 py-3 hover:bg-neutral-800 cursor-pointer text-xs font-semibold transition-colors flex items-center gap-2 ${
                              goal === opt.value ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-200'
                            }`}
                          >
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Medical Issue */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Medical Issues / Injuries</span>
                </label>
                <textarea
                  value={medicalIssue}
                  onChange={(e) => setMedicalIssue(e.target.value)}
                  placeholder="e.g. Lower back pain, shoulder impingement..."
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 text-xs rounded-xl p-3 text-neutral-200 focus:outline-none font-semibold transition-colors resize-none"
                />
              </div>

          </div>

          {/* Fixed Form Actions Footer */}
          <div className="p-5 border-t border-neutral-900 bg-[#161618] space-y-3 shrink-0">
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
  );
}
