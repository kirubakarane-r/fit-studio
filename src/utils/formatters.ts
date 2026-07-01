export const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatDuration = (secs: number) => {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

export const formatDateShort = (isoString: string) => {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
};

export const formatDateFull = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const capitalize = (s: string) => s ? s[0].toUpperCase() + s.slice(1) : '';

export const getMuscleColor = (muscle: string) => {
  const colors: Record<string, string> = {
    chest: 'bg-red-500/10 text-red-400 border-red-500/20',
    back: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    legs: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    shoulders: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    arms: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    core: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    cardio: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  };
  return colors[muscle] || 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
};
