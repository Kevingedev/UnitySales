"use server";
import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

/**
 * FULL DATA FETCH: Obtiene menú y roles para la gestión
 */
export async function getMenuManagementData() {
    const supabase = await createClient();

    try {
        const [menuRes, rolesRes] = await Promise.all([
            supabase.from('navigation_menu').select('*').order('display_order'),
            supabase.from('roles').select('id, description')
        ]);

        if (menuRes.error) throw menuRes.error;
        if (rolesRes.error) throw rolesRes.error;

        return {
            success: true,
            menuItems: menuRes.data,
            roles: rolesRes.data
        };
    } catch (error) {
        console.error("Error fetching menu data:", error);
        return { success: false, error: error.message };
    }
}

/**
 * UPSERT: Crea o Actualiza un ítem de menú
 * Si data.id existe, actualiza. Si no, crea.
 */
export async function upsertNavigationItem(data) {
    const supabase = await createClient();

    try {
        // Validación básica de campos requeridos (opcional, ya que el DB lo forzará, pero bueno para DX)
        if (!data.label || !data.href) {
            throw new Error("Label y Href son obligatorios");
        }

        // Si es INSERT (no tiene ID), quitamos la propiedad para que el DB genere el ID
        // y calculamos orden si no viene
        if (!data.id) {
            delete data.id;

            if (data.display_order === undefined || data.display_order === null) {
                const { data: lastItem } = await supabase
                    .from('navigation_menu')
                    .select('display_order')
                    .order('display_order', { ascending: false })
                    .limit(1)
                    .single();
                data.display_order = (lastItem?.display_order || 0) + 1;
            }
        }

        const { data: result, error } = await supabase
            .from('navigation_menu')
            .upsert(data)
            .select()
            .single();

        if (error) throw error;

        // Revalidar layouts
        revalidatePath("/", "layout");
        revalidatePath("/(dashboard)", "layout");

        return { success: true, data: result };
    } catch (error) {
        console.error("Upsert Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * DELETE: Elimina un ítem de menú
 */
export async function deleteNavigationItem(id) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('navigation_menu')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath("/", "layout");
        revalidatePath("/(dashboard)", "layout");

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Reordenar (Legacy/Utility): Actualiza solo el orden
 */
export async function updateMenuOrder(items) {
    const supabase = await createClient();

    try {
        for (const item of items) {
            const { error } = await supabase
                .from('navigation_menu')
                .update({ display_order: item.display_order })
                .eq('id', item.id);
            if (error) throw error;
        }

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
