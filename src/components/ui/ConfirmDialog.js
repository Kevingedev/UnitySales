"use client";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-[var(--card)] border border-red-400/20 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 animate-system-shake">

                {/* Header con advertencia */}
                <div className="p-6 pb-2 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-400/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-red-400" size={24} />
                    </div>
                    <h2 className="text-lg font-black uppercase tracking-tighter text-[var(--foreground)]">
                        {title || "CRITICAL_ACTION_REQUIRED"}
                    </h2>
                    <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                        {message || "Esta acción no se puede deshacer. El activo será purgado del sistema permanentemente."}
                    </p>
                </div>

                {/* Botones */}
                <div className="p-6 flex gap-3">
                    <button
                        disabled={loading}
                        onClick={onClose}
                        className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border border-[var(--border)] rounded-xl hover:bg-zinc-500/5 transition-all disabled:opacity-50"
                    >
                        Abort
                    </button>
                    <button
                        disabled={loading}
                        onClick={onConfirm}
                        className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-400 text-white rounded-xl hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? "Deleting..." : "Confirm Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}