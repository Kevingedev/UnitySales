"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import * as Icons from "lucide-react";
import NavItem from "./NavItem";
import { getProtectNavigation } from "@/lib/actions/navigation-actions";


export default function Sidebar({ isOpen, onToggle, pathname, navigationItems, aiItems }) {
  const [navItems, setNavItems] = useState([]);
  const [aiItemsState, setAiItemsState] = useState([]);

  // Cargar items de navegación desde la base de datos
  useEffect(() => {
    getProtectNavigation()
      .then((response) => { // 'response' es el objeto { success, menu, user }
        // console.log("Respuesta completa de la DB:", response);

        // 1. Extraemos el array de la propiedad 'menu' con seguridad
        const itemsArray = response?.menu || [];

        // 2. Ahora filtramos sobre el ARRAY real
        const mainItems = itemsArray
          .filter(item => item.section === "main")
          .map(item => ({
            icon: Icons[item.icon_name] || Icons.LayoutDashboard,
            href: item.href,
            label: item.label,
            activePath: item.active_path,
          }));

        const aiItemsData = itemsArray
          .filter(item => item.section === "ai")
          .map(item => ({
            icon: Icons[item.icon_name] || Icons.BrainCircuit,
            href: item.href,
            label: item.label,
            activePath: item.active_path,
            isAI: true,
          }));

        setNavItems(mainItems);
        setAiItemsState(aiItemsData);
      })
      .catch((error) => {
        console.error("Error loading navigation menu:", error);
    });
  }, []);

  // Usar props si se pasan, sino usar los items cargados dinámicamente
  const itemsToRender = navigationItems || navItems;
  const aiItemsToRender = aiItems || aiItemsState;

  return (
    <aside className={`${isOpen ? "w-64" : "w-20"} bg-[var(--aside)] border-r border-[var(--border)] transition-all duration-300 flex flex-col shrink-0`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)]">
        {isOpen && (
          <span className="font-black text-brand text-xl tracking-tighter uppercase italic">
            Unity<span className="text-[var(--foreground)]">Sales</span>
          </span>
        )}
        <button 
          onClick={onToggle} 
          className="p-1.5 hover:bg-brand/10 rounded-md text-zinc-500 hover:text-brand"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {/* Items de navegación principales */}
        {itemsToRender.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavItem
              key={item.href}
              icon={<IconComponent size={20} />}
              href={item.href}
              label={item.label}
              isOpen={isOpen}
              active={pathname === item.activePath}
            />
          );
        })}
        
        {/* Separador y items de IA */}
        {aiItemsToRender.length > 0 && (
          <div className="pt-4 mt-4 border-t border-[var(--border)]">
            {aiItemsToRender.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavItem
                  key={item.href}
                  icon={<IconComponent size={20} />}
                  href={item.href}
                  label={item.label}
                  isOpen={isOpen}
                  isAI={item.isAI}
                  active={pathname === item.activePath}
                />
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}

