"use client";
import { useState, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import {
    Plus, Edit, Trash2, Save, X, GripVertical, Check, FolderOpen, Link as LinkIcon, RefreshCw, LayoutTemplate, Shield
} from "lucide-react";
import NeuralSelect from "@/components/inventory/NeutralSelect";
import * as LucideIcons from "lucide-react";
import { notify } from "@/components/ui/ToastAlert";
import { getMenuManagementData, upsertNavigationItem, deleteNavigationItem } from "@/lib/actions/menu-actions";

// Dynamic Icon Component
const DynamicIcon = ({ name, size = 16, className }) => {
    const Icon = LucideIcons[name] || LucideIcons.HelpCircle;
    return <Icon size={size} className={className} />;
};

export default function MenuManagement() {
    const [isLoading, setIsLoading] = useState(true);
    const [menuItems, setMenuItems] = useState([]);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        label: "",
        href: "",
        icon_name: "Circle",
        active_path: "",
        section: "main",
        display_order: 0,
        required_role: "",
        parent_id: "null", // String "null" for select handling
        is_active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await getMenuManagementData();
            if (res.success) {
                setMenuItems(res.menuItems);
                setRoles(res.roles);
            }
        } catch (error) {
            toast.error("Error al cargar datos");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            id: item.id,
            label: item.label,
            href: item.href,
            icon_name: item.icon_name || "Circle",
            active_path: item.active_path || "",
            section: item.section || "main",
            display_order: item.display_order,
            required_role: item.required_role || "",
            parent_id: item.parent_id || "null",
            is_active: item.is_active
        });
    };

    const handleReset = () => {
        setFormData({
            id: null,
            label: "",
            href: "",
            icon_name: "Circle",
            active_path: "",
            section: "main",
            display_order: 0,
            required_role: "",
            parent_id: "null",
            is_active: true
        });
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este ítem permanentemente?")) return;

        const res = await deleteNavigationItem(id);
        if (res.success) {
            notify.success("Ítem eliminado");
            window.dispatchEvent(new Event("menu-updated"));
            loadData();
            if (formData.id === id) handleReset();
        } else {
            notify.error(res.error || "Error al eliminar");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare data for server action
        const payload = {
            ...formData,
            parent_id: formData.parent_id === "null" ? null : formData.parent_id,
            required_role: formData.required_role === "" ? null : formData.required_role
        };

        const res = await upsertNavigationItem(payload);

        if (res.success) {
            notify.success(formData.id ? "Ítem actualizado" : "Ítem creado");
            window.dispatchEvent(new Event("menu-updated"));
            loadData();
            handleReset();
        } else {
            notify.error(res.error || "Error al guardar");
        }
    };

    // Helper to organize items in tree structure for the list
    const organizeItems = (items) => {
        const parents = items.filter(i => !i.parent_id).sort((a, b) => a.display_order - b.display_order);

        return parents.map(parent => {
            const children = items
                .filter(i => i.parent_id === parent.id)
                .sort((a, b) => a.display_order - b.display_order);
            return { ...parent, children };
        });
    };

    const structuredItems = organizeItems(menuItems);

    if (isLoading) return (
        <div className="flex items-center justify-center p-12 text-zinc-500 animate-pulse">
            <RefreshCw className="animate-spin mr-2" /> Cargando sistema de navegación...
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
            {/* LEFT COLUMN: FORM (UPSERT) */}
            <div className="lg:col-span-8 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                    {structuredItems.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            <p className="text-sm font-medium">No navigation items found.</p>
                            <p className="text-xs">Create your first item using the form.</p>
                        </div>
                    )}

                    {structuredItems.map((parent) => (
                        <div key={parent.id} className="space-y-1">
                            {/* PARENT ITEM */}
                            <div className="group flex items-center gap-3 p-3 bg-[var(--background)] border border-[var(--border)] hover:border-brand/40 rounded-xl transition-all">
                                <div className="text-zinc-400 dark:text-zinc-500 cursor-grab active:cursor-grabbing">
                                    <GripVertical size={14} />
                                </div>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${parent.is_active ? 'bg-[var(--card)] text-brand' : 'bg-[var(--card)] text-zinc-400'}`}>
                                    <DynamicIcon name={parent.icon_name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-sm font-bold ${parent.is_active ? 'text-[var(--foreground)]' : 'text-zinc-500 line-through'}`}>
                                            {parent.label}
                                        </h3>
                                        {parent.section && (
                                            <span className="text-[9px] uppercase tracking-wider bg-[var(--background)] text-zinc-500 px-1.5 py-0.5 rounded border border-[var(--border)]">
                                                {parent.section}
                                            </span>
                                        )}
                                        {parent.required_role && (
                                            <span className="text-[9px] uppercase tracking-wider bg-brand/10 text-brand px-1.5 py-0.5 rounded border border-brand/20">
                                                {parent.required_role}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-mono truncate">{parent.href}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(parent)}
                                        className="p-2 text-zinc-500 hover:text-brand hover:bg-[var(--card)] rounded-lg transition-colors"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(parent.id)}
                                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-[var(--card)] rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* CHILDREN ITEMS */}
                            {parent.children && parent.children.map(child => (
                                <div key={child.id} className="group flex items-center gap-3 p-2 pl-4 ml-6 border-l-2 border-[var(--border)] hover:border-brand/20 transition-all bg-[var(--card)]/30 rounded-r-lg">
                                    <div className="text-zinc-700 cursor-grab text-[10px]">
                                        {child.display_order}
                                    </div>
                                    <div className={`w-6 h-6 rounded flex items-center justify-center ${child.is_active ? 'bg-[var(--background)]/50 text-brand/80' : 'bg-[var(--background)] text-zinc-700'}`}>
                                        <DynamicIcon name={child.icon_name} size={12} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium ${child.is_active ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 line-through'}`}>
                                                {child.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(child)}
                                            className="p-1.5 text-zinc-500 hover:text-brand hover:bg-[var(--background)] rounded-md transition-colors"
                                        >
                                            <Edit size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(child.id)}
                                            className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-[var(--background)] rounded-md transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {/* RIGHT COLUMN: LIST (TREE VIEW) */}
            <div className="lg:col-span-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 overflow-y-auto custom-scrollbar shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between mb-6 border-b border-[var(--border)] pb-4">
                    <h2 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                        <LayoutTemplate size={16} className="text-brand" />
                        {formData.id ? 'Editar Nodo' : 'Nuevo Nodo'}
                    </h2>
                    {formData.id && (
                        <button onClick={handleReset} className="text-xs text-zinc-300 hover:text-white bg-zinc-500 hover:bg-brand/80 border border-brand rounded-md px-2 py-1 transition-colors">
                            Cancelar
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* LABEL & SECTION */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Etiqueta</label>
                            <input
                                type="text"
                                required
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all placeholder:text-zinc-500"
                                placeholder="Dashboard"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sección</label>
                            <select
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] focus:outline-none focus:border-brand/50 transition-all appearance-none"
                            >
                                <option value="main">Main</option>
                                <option value="ai">AI Tools</option>
                                <option value="settings">Settings</option>
                            </select>
                        </div>
                    </div>

                    {/* HREF & ACTIVE PATH */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ruta (HREF)</label>
                        <div className="relative">
                            <LinkIcon size={12} className="absolute left-3 top-2.5 text-zinc-600" />
                            <input
                                type="text"
                                required
                                value={formData.href}
                                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-brand focus:outline-none focus:border-brand/50 transition-all placeholder:text-zinc-500"
                                placeholder="/inventory/batches"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active Path Pattern</label>
                        <input
                            type="text"
                            value={formData.active_path}
                            onChange={(e) => setFormData({ ...formData, active_path: e.target.value })}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-brand/50 transition-all placeholder:text-zinc-500"
                            placeholder="/inventory (auto match)"
                        />
                    </div>

                    {/* ICON NAME */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex justify-between">
                            <span>Icon Name (Lucide)</span>
                            <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-brand hover:underline cursor-pointer">Ver Iconos ↗</a>
                        </label>
                        <div className="flex gap-2">
                            <div className="w-9 h-9 shrink-0 bg-[var(--card)] rounded-lg flex items-center justify-center text-[var(--foreground)] border border-[var(--border)]">
                                <DynamicIcon name={formData.icon_name} />
                            </div>
                            <input
                                type="text"
                                value={formData.icon_name}
                                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] focus:outline-none focus:border-brand/50 transition-all placeholder:text-zinc-500"
                                placeholder="Package, Users, Calculator..."
                            />
                        </div>
                    </div>

                    {/* PARENT & ROLE */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <NeuralSelect
                                value={formData.parent_id}
                                onChange={(val) => setFormData({ ...formData, parent_id: val })}
                                label="Padre"
                                placeholder="-- Raíz --"
                                icon={FolderOpen}
                                options={[
                                    { value: "null", label: "-- Raíz --" },
                                    ...menuItems.filter(i => i.id !== formData.id).map(item => ({
                                        value: item.id,
                                        label: item.label
                                    }))
                                ]}
                            />
                        </div>
                        <div className="space-y-1">
                            <NeuralSelect
                                value={formData.required_role}
                                onChange={(val) => setFormData({ ...formData, required_role: val })}
                                label="Rol Requerido"
                                placeholder="Todos"
                                icon={Shield}
                                options={[
                                    { value: "", label: "Todos" },
                                    // { value: "Access", label: "Access (Auth Only)" },
                                    ...roles.map(r => ({
                                        value: r.id,
                                        label: `${r.id} `
                                    }))
                                ]}
                            />
                        </div>
                    </div>

                    {/* ORDER & STATUS */}
                    <div className="grid grid-cols-2 gap-4 items-center pt-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Orden</label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] focus:outline-none focus:border-brand/50 text-center"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 mt-auto h-[38px]">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer flex-1">Is Active?</label>
                            <div
                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${formData.is_active ? 'bg-brand' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                            >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${formData.is_active ? 'left-4.5' : 'left-0.5'}`} style={{ left: formData.is_active ? '18px' : '2px' }} />
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-6 border-t border-[var(--border)] mt-auto">
                        <button
                            type="submit"
                            className="w-full bg-brand hover:opacity-90 text-zinc-200 py-3 rounded-xl font-black uppercase text-sm transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2 group"
                        >
                            <Save size={18} className="group-hover:scale-110 transition-transform" />
                            {formData.id ? 'Guardar Cambios' : 'Crear Nodo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
