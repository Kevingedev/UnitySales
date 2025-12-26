"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, LogOut, User, ChevronDown } from "lucide-react";
import { signOut, getMyProfile } from "@/lib/actions/auth-actions";

export default function Header({ 
  isDarkMode, 
  onToggleDarkMode, 
  // userName = "Usuario", 
  // userRole = "Access" 
  user
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const userInitials = user?.full_name
    ? user.full_name
    ?.split(" ")
    ?.map((n) => n[0])
    ?.join("")
    ?.toUpperCase()
    ?.slice(0, 2)
    : "";



  return (
    <header className="h-16 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-8 shrink-0 relative z-20">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
        Unity Sales <span className="text-brand">v1.0</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Toggle Dark Mode */}
        <button 
          onClick={onToggleDarkMode}
          className="p-2 rounded-full hover:bg-zinc-500/10 text-zinc-500 hover:text-brand transition-all"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Perfil de Usuario */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-all focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold leading-none">{user?.full_name}</p>
              <span className="text-[10px] text-brand font-bold uppercase">{user?.role_id}</span>
            </div>
            
            <div className="w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg shadow-brand/20 border-2 border-transparent hover:border-brand transition-all">
              {userInitials}
            </div>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú Desplegable */}
          {isMenuOpen && (
            <>
              {/* Overlay invisible para cerrar el menú al hacer clic fuera */}
              <div 
                className="fixed inset-0 z-[-1]" 
                onClick={() => setIsMenuOpen(false)}
              ></div>
              
              <div className="absolute right-0 mt-2 w-48 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in duration-200">
                <button 
                  className="w-full px-4 py-2 text-left text-xs flex items-center gap-3 hover:bg-zinc-500/10 transition-colors"
                  onClick={() => { /* Navegar a perfil */ setIsMenuOpen(false); window.location.href = '/profile'; }}
                >
                  <User size={16} className="text-zinc-500" />
                  Mi Perfil
                </button>
                
                <div className="h-px bg-[var(--border)] my-1 mx-2"></div>
                
                <form action={signOut}>
                  <button 
                    type="submit"
                    className="w-full px-4 py-2 text-left text-xs flex items-center gap-3 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}