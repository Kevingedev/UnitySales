"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import * as Icons from "lucide-react";
import NavItem from "./NavItem";
import { getProtectNavigation } from "@/lib/actions/navigation-actions";
import NavGroup from "./sidebar/NavGroup";

export default function Sidebar({
  isOpen,
  onToggle,
  pathname,
  navigationItems,
  aiItems,
}) {
  const [navItems, setNavItems] = useState([]);
  const [aiItemsState, setAiItemsState] = useState([]);

  // Extraemos la lógica de carga para poder reutilizarla
  const loadNavigation = () => {
    getProtectNavigation()
      .then((response) => {
        const itemsArray = response?.menu || [];

        // Tu función buildNavigationTree que ya tienes...
        const buildNavigationTree = (items, sectionName) => {
          return items
            .filter((item) => item.section === sectionName && !item.parent_id)
            .sort((a, b) => a.display_order - b.display_order)
            .map((parent) => ({
              id: parent.id,
              icon: Icons[parent.icon_name] || Icons.LayoutDashboard,
              href: parent.href,
              label: parent.label,
              activePath: parent.active_path,
              isAI: sectionName === "ai",
              children: items
                .filter((child) => child.parent_id === parent.id)
                .sort((a, b) => a.display_order - b.display_order)
                .map((child) => ({
                  id: child.id,
                  icon: Icons[child.icon_name] || Icons.Circle,
                  href: child.href,
                  label: child.label,
                  activePath: child.active_path,
                })),
            }));
        };

        const mainItems = buildNavigationTree(itemsArray, "main");
        const aiItemsData = buildNavigationTree(itemsArray, "ai");

        setNavItems(mainItems);
        setAiItemsState(aiItemsData);
      })
      .catch((error) => console.error("Error loading menu:", error));
  };

  useEffect(() => {
    // 1. Carga inicial al montar el componente
    loadNavigation();

    // 2. Suscribirse al evento de actualización
    window.addEventListener("menu-updated", loadNavigation);

    // 3. Limpieza: Eliminar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("menu-updated", loadNavigation);
    };
  }, []);

  // Usar props si se pasan, sino usar los items cargados dinámicamente
  const itemsToRender = navigationItems || navItems;
  const aiItemsToRender = aiItems || aiItemsState;

  return (
    <aside
      className={`${isOpen ? "w-80" : "w-20"} h-full bg-[var(--aside)] border-r border-[var(--border)] transition-all duration-300 flex flex-col shadow-2xl shrink-0`}
    >
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
