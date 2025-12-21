"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import { getMyProfile } from "@/lib/actions/auth-actions";
import { getProtectNavigation } from "@/lib/actions/navigation-actions";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState({ profile: null, menu: [] });
  const pathname = usePathname();

  useEffect(() => {
    // 1. Tema
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") setIsDarkMode(false);

    // 2. Cargar Usuario y Menú en una sola lógica
    async function initDashboard() {
      const profileRes = await getMyProfile();
      const menuRes = await getProtectNavigation();
      /* console.log("profileRes", profileRes);
      console.log("menuRes", menuRes); */
      setUserData({
        profile: profileRes.success ? profileRes.data : null,
        menu: menuRes.success ? menuRes.menu : []
      });
      setMounted(true);
    }

    initDashboard();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode, mounted]);

  // Si no está montado, mostramos un contenedor vacío pero SIN etiquetas html/body
  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)]">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        pathname={pathname}
        user={userData.profile}
        // role={userData.profile?.role_id}
        menuItems={userData.menu}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header
          user={userData.profile}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
            {/* <Toaster richColors closeButton position="top-right" theme="system" /> */}
            <Toaster
              position="top-right"
              toastOptions={{
                unstyled: true,
                // Esto asegura que el contenedor no limite el tamaño de tus notificaciones
                className: 'pointer-events-auto flex justify-end items-start p-4',
              }}
              /* Espacio entre notificaciones */
              gap={12}
              /* Cuántos se ven a la vez */
              visibleToasts={5}
            />
          </div>
        </main>
      </div>
    </div>
  );
}