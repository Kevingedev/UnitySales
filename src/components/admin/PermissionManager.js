"use client";
import { useState, useTransition } from "react";
import { ShieldCheck, ShieldAlert, Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { togglePermission } from "@/lib/actions/permissions-actions";
import { useRouter } from "next/navigation";

export default function PermissionsManager({ roles, menus, initialPermissions }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [permissions, setPermissions] = useState(initialPermissions);

  // Search State
  const [search, setSearch] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Logic
  const filteredMenus = menus.filter(menu =>
    menu.label.toLowerCase().includes(search.toLowerCase()) ||
    menu.href.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);

  const paginatedMenus = filteredMenus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggle = async (roleId, menuId) => {
    // 1. Determinar el estado actual buscando en el estado local
    const hasPermission = permissions.some(
      (p) => p.role_id === roleId && p.menu_id === menuId
    );

    // 2. Iniciar la transición para mantener la UI responsiva
    startTransition(async () => {

      // --- ACTUALIZACIÓN OPTIMISTA ---
      // Cambiamos el estado local ANTES de que responda el servidor
      if (hasPermission) {
        // Si lo tenía, lo quitamos
        setPermissions((prev) =>
          prev.filter((p) => !(p.role_id === roleId && p.menu_id === menuId))
        );
      } else {
        // Si no lo tenía, lo agregamos
        setPermissions((prev) => [...prev, { role_id: roleId, menu_id: menuId }]);
      }

      // --- COMUNICACIÓN CON EL SERVIDOR ---
      const res = await togglePermission(roleId, menuId, hasPermission);

      if (res.success) {
        // 3. Sincronizar componentes del servidor (Sidebar, etc.)
        // Esto refresca los Server Components sin recargar la página
        window.dispatchEvent(new Event("menu-updated"));
        router.refresh();
      } else {
        // --- FALLBACK (Si falla la DB) ---
        // Si hubo un error, revertimos el cambio optimista para mostrar la realidad
        console.error("Failed to update permission:", res.error);

        if (hasPermission) {
          // Volvemos a agregar el permiso que intentamos quitar
          setPermissions((prev) => [...prev, { role_id: roleId, menu_id: menuId }]);
        } else {
          // Quitamos el permiso que intentamos agregar
          setPermissions((prev) =>
            prev.filter((p) => !(p.role_id === roleId && p.menu_id === menuId))
          );
        }

        // Opcional: Mostrar un toast de error aquí
        alert("Error: No se pudo actualizar el permiso.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--card)] p-4 border border-[var(--border)] rounded-2xl">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand transition-colors" size={18} />
          <input
            type="text"
            placeholder="SEARCH MENU ITEM OR PATH..."
            className="w-full bg-zinc-500/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-brand transition-all placeholder:text-zinc-600"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-500/5 border-b border-[var(--border)]">
                <th className="p-4 text-[10px] font-black uppercase text-zinc-500">Navigation Menu Items</th>
                {roles.map((role) => (
                  <th key={role.id} className="p-4 text-[10px] font-black uppercase text-brand text-center">
                    {role.id} {/* O role.name si tienes esa columna */}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedMenus.map((menu) => (
                <tr key={menu.id} className="hover:bg-zinc-500/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold uppercase tracking-tight">{menu.label}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">{menu.href}</span>
                    </div>
                  </td>
                  {roles.map((role) => {
                    const isChecked = permissions.some(
                      (p) => p.role_id === role.id && p.menu_id === menu.id
                    );
                    return (
                      <td key={role.id} className="p-4 text-center">
                        <button
                          onClick={() => handleToggle(role.id, menu.id)}
                          disabled={isPending}
                          className={`p-2 rounded-xl transition-all ${isChecked
                            ? "bg-brand/10 text-brand shadow-[0_0_15px_rgba(var(--brand-rgb),0.2)]"
                            : "text-zinc-700 hover:bg-zinc-500/10"
                            }`}
                        >
                          {isPending ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : isChecked ? (
                            <ShieldCheck size={18} />
                          ) : (
                            <ShieldAlert size={18} />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-zinc-500/5 flex items-center justify-between">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            Showing {paginatedMenus.length} of {filteredMenus.length} items
          </div>

          <div className="flex items-center gap-1 bg-[var(--card)] p-1 rounded-lg border border-[var(--border)]">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 hover:bg-brand/10 text-zinc-500 hover:text-brand disabled:opacity-20 disabled:hover:bg-transparent transition-all rounded-md"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-3">
              <span className="text-[10px] font-black font-mono">
                PAGE {currentPage} <span className="text-zinc-500">/</span> {totalPages}
              </span>
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 hover:bg-brand/10 text-zinc-500 hover:text-brand disabled:opacity-20 disabled:hover:bg-transparent transition-all rounded-md"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}