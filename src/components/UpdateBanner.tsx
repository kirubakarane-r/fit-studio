import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

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
    <div className="bg-emerald-500 text-black px-4 py-3 flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300 relative z-30">
      <div className="flex items-center gap-2 flex-1">
        <RefreshCw className="w-5 h-5 flex-shrink-0 animate-spin" />
        <span className="text-sm font-bold leading-tight">
          New update is available in the app. Kindly update for latest changes.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-black text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          Update
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="p-1 rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
