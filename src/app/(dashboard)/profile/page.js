"use client";
import { useState, useEffect } from "react";
import { User, Shield, Mail, Calendar, Hash, Signal } from "lucide-react";
import { getMyProfile } from "@/lib/actions/auth-actions";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data, success, user } = await getMyProfile();
      if (success) setProfile(data);
      if (success) setUser(user);
      setLoading(false);
    }
    loadData();
  }, []);

  // console.log("profile", profile);
  // console.log("user", user);
  if (loading) return <div className="animate-pulse text-zinc-500 text-lg font-bold">Cargando perfil...</div>;

  return (
    <div className="space-y-6">
      {/* Header de Perfil */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">MI PERFIL</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-widest">Configuración de acceso personal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Principal */}
        <div className="md:col-span-1 bg-[var(--background)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 bg-brand rounded-full flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-brand/40">
            {user?.full_name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.full_name}</h2>
            <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-bold rounded-full uppercase tracking-tighter">
              {user?.role_id|| "Standard User"}
            </span>
            
          </div>
        </div>

        {/* Detalles Técnicos */}
        <div className="md:col-span-2 bg-[var(--background)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] bg-zinc-500/5">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Shield size={14} className="text-brand" /> Información de Cuenta
            </h3>
          </div>
          <p className="text-lg text-zinc-500 text-center mt-4">
              {user?.description || "No vinculado"}
            </p>
          
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <DetailItem 
              icon={<Mail size={16}/>} 
              label="Correo Electrónico" 
              value={user?.email || "No vinculado"} 
            />
            <DetailItem 
              icon={<Hash size={16}/>} 
              label="ID de Usuario" 
              value={user?.id?.substring(0, 18) + "..."} 
            />
            <DetailItem 
              icon={<Calendar size={16}/>} 
              label="Miembro desde" 
              value={new Date(user?.created_at).toLocaleDateString()} 
            />
            <DetailItem 
              icon={<Shield size={16}/>} 
              label="Rango de Seguridad" 
              value={`Nivel ${user?.rank_level || 0}`} 
            />
            <DetailItem 
              icon={<Signal size={16}/>} 
              label="Último Inicio de Sesión" 
              value={
                new Intl.DateTimeFormat('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }).format(new Date(user?.last_login))} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}