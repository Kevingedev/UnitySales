import MenuManagement from "@/components/admin/MenuManagement";

export const metadata = {
    title: "Gestión de Menú | Unity Sales",
    description: "Configuración de navegación y permisos",
};

export default function MenuPage() {
    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-brand">
                    Gestión de Menú
                </h1>
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.3em]">
                    Configuración de navegación y permisos
                </p>
            </header>
            <MenuManagement />
        </div>
    );
}
