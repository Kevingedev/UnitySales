"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import * as Icons from "lucide-react";
import NavItem from "./NavItem";
import { getProtectNavigation } from "@/lib/actions/navigation-actions";
import NavGroup from "./sidebar/NavGroup";


export default function Sidebar({ isOpen, onToggle, pathname, navigationItems, aiItems }) {
  const [navItems, setNavItems] = useState([]);
  const [aiItemsState, setAiItemsState] = useState([]);

  // Cargar items de navegación desde la base de datos
  useEffect(() => {
    getProtectNavigation()
      .then((response) => {
        const itemsArray = response?.menu || [];

        // Función interna para construir el árbol de navegación
        const buildNavigationTree = (items, sectionName) => {
          // 1. Filtramos los items de la sección que son "RAÍZ" (sin parent_id)
          return items
            .filter(item => item.section === sectionName && !item.parent_id)
            .sort((a, b) => a.display_order - b.display_order) // Respetamos el orden
            .map(parent => ({
              id: parent.id,
              icon: Icons[parent.icon_name] || Icons.LayoutDashboard,
              href: parent.href,
              label: parent.label,
              activePath: parent.active_path,
              isAI: sectionName === "ai",
              // 2. Buscamos y mapeamos los hijos de este padre
              children: items
                .filter(child => child.parent_id === parent.id)
                .sort((a, b) => a.display_order - b.display_order)
                .map(child => ({
                  id: child.id,
                  icon: Icons[child.icon_name] || Icons.Circle, // Icono por defecto para subitems
                  href: child.href,
                  label: child.label,
                  activePath: child.active_path,
                }))
            }));
        };

        // Procesamos ambas secciones
        const mainItems = buildNavigationTree(itemsArray, "main");
        const aiItemsData = buildNavigationTree(itemsArray, "ai");

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
    <aside className={`${isOpen ? "w-80" : "w-20"} fixed inset-y-0 left-0 z-50 h-full bg-[var(--aside)] border-r border-[var(--border)] transition-all duration-300 flex flex-col shadow-2xl`}>
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
        {itemsToRender.map((item) => (
          <div key={item.id}>
            {item.children && item.children.length > 0 ? (
              /* Aquí irá el componente que se abre y cierra */
              <NavGroup
                item={item}
                isOpen={isOpen}
                pathname={pathname}
                onClick={!isOpen ? onToggle : undefined}
              />
            ) : (
              /* Tu NavItem actual para links simples */
              <NavItem
                icon={<item.icon size={20} />}
                href={item.href}
                label={item.label}
                isOpen={isOpen}
                active={pathname === item.activePath}
                onClick={!isOpen ? onToggle : undefined}
              />
            )}
          </div>
        ))}

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
                  onClick={!isOpen ? onToggle : undefined}
                />
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}

