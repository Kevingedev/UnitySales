import { ShieldCheck, Zap, X } from "lucide-react";
import { toast } from "sonner";

export const notify = {
  success: (title, desc) => {
    // Si por error pasamos un objeto en lugar de string, extraemos el mensaje
    const message = typeof desc === 'object' ? desc.description : desc;

    return toast.custom((t) => (
      <div className="w-[380px] bg-[var(--card)] border border-[var(--border)] border-l-4 border-l-brand shadow-2xl p-4 flex items-start gap-4 animate-in slide-in-from-right-10 backdrop-blur-md">
        <div className="bg-emerald-600/10 p-2 rounded-lg border border-emerald-600/20">
          <ShieldCheck size={20} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">
            {title}
          </h3>
          <p className="text-base text-zinc-500 uppercase mt-1">
            {message}
          </p>
        </div>
        <button onClick={() => toast.dismiss(t)}>
          <X size={14} className="text-zinc-600" />
        </button>
      </div>
    ));
  },

  error: (title, desc) => {
    const message = typeof desc === 'object' ? desc.description : desc;

    return toast.custom((t) => (
      <div className="w-[380px] bg-[var(--card)] border border-[var(--border)] border-l-4 border-l-red-600 shadow-2xl p-4 flex items-start gap-4 animate-in slide-in-from-right-10 backdrop-blur-md">
        <div className="bg-red-600/10 p-2 rounded-lg border border-red-600/20">
          <Zap size={20} className="text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-red-600">
            {title}
          </h3>
          <p className="text-base text-zinc-500 uppercase mt-1">
            {message}
          </p>
        </div>
        <button onClick={() => toast.dismiss(t)}>
          <X size={14} className="text-red-400" />
        </button>
      </div>
    ));
  }
};