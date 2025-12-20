"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // console.log({email, password});

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid credentials. Access denied.");
      setLoading(false);
      console.log("error", error);
    } else {
      console.log("success");
      // Redirigir al dashboard después del login exitoso
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      {/* Efecto de fondo decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-md p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-brand/10 rounded-2xl mb-4 border border-brand/20">
            <ShieldCheck className="text-brand" size={40} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-white">
            System Access
          </h1>
          <p className="text-zinc-500 text-xs font-bold mt-2 uppercase tracking-widest">
            Enter Engineering Credentials
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              Terminal Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-black/40 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand outline-none transition-all placeholder:text-zinc-700"
                placeholder="operator@system.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              Encrypted Key
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-black/40 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand outline-none transition-all placeholder:text-zinc-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center uppercase tracking-tighter">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-brand/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Initialize Session"}
          </button>
        </form>

        <p className="text-center text-zinc-600 text-[10px] mt-8 uppercase font-bold tracking-widest italic">
          Authorized personnel only. Unity Sales v1.0
        </p>
      </div>
    </div>
  );
}