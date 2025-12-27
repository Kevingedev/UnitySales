// admin/permissions/page.js
import { getPermissionsData } from "@/lib/actions/permissions-actions";
import PermissionManager from "@/components/admin/PermissionManager";

export default async function AdminPermissionsPage() {
    // 1. Cargamos datos desde la acción
    const data = await getPermissionsData();

    if (!data.success) {
        return <div className="p-10 text-red-500">Error: {data.error}</div>;
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-1">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-brand italic">
                    Security & RBAC
                </h1>
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.3em]">
                    Control de Acceso Basado en Roles / Matriz de Permisos
                </p>
            </header>

            <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden">
                <PermissionManager 
                    roles={data.roles} 
                    menus={data.menus} 
                    initialPermissions={data.permissions} 
                />
            </div>
        </div>
    );
}