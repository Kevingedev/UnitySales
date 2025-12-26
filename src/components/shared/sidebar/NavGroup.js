"use client";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import NavItem from "@/components/shared/NavItem";

export default function NavGroup({ item, isOpen, pathname, onClick }) {
  // Estado para controlar si el submenú está desplegado
  const [isExpanded, setIsExpanded] = useState(false);

  // Efecto para mantener abierto el grupo si estamos en una ruta hija
  useEffect(() => {
    const isChildActive = item.children?.some(child => pathname === child.activePath);
    if (isChildActive) {
      setIsExpanded(true);
    }
  }, [pathname, item.children]);

  const IconComponent = item.icon;
  const isParentActive = pathname.startsWith(item.activePath);

  return (
    <div className="flex flex-col space-y-1">
      {/* Botón Principal del Grupo */}
      <button
        onClick={() => {
          if (onClick) {
            onClick();
            // Si estamos abriendo el sidebar, también queremos expandir este grupo
            if (!isOpen) setIsExpanded(true);
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
        className={`
          flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-xs
          ${isParentActive ? "bg-brand/10 text-brand" : "text-zinc-500 hover:bg-zinc-500/5 hover:text-[var(--foreground)]"}
          ${!isOpen && "justify-center"}
        `}
      >
        <div className="flex items-center gap-3">
          <IconComponent size={20} className={isParentActive ? "text-brand" : "group-hover:text-brand"} />
          {isOpen && (
            <span className="text-xs font-bold uppercase tracking-widest leading-none">
              {item.label}
            </span>
          )}
        </div>

        {isOpen && (
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Contenedor de Sub-items (Hijos) */}
      {isExpanded && isOpen && (
        <div className="ml-6 pl-3 border-l border-[var(--border)] flex flex-col space-y-1 animate-in slide-in-from-top-2 duration-300">
          {item.children.map((child) => (
            <NavItem
              key={child.href}
              icon={<child.icon size={16} />}
              href={child.href}
              label={child.label}
              isOpen={isOpen}
              active={pathname === child.activePath}
              isSubItem={true} // Podemos usar esta prop para estilos más compactos
            />
          ))}
        </div>
      )}
    </div>
  );
}