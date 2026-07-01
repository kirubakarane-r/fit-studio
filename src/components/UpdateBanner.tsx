import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="bg-[#0e0e10] border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300 relative z-30">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-[11px] sm:text-xs font-medium text-emerald-400/90 leading-snug">
          New update is available in the app. Kindly update for latest changes.
        </span>
      </div>
      <div className="flex items-center shrink-0">
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-emerald-500 text-black hover:bg-emerald-400 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
        >
          Update
        </button>
      </div>
    </div>
  );
}
