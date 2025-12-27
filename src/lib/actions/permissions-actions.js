"use server";
import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

/**
 * LECTURA: Obtiene toda la información para la matriz de permisos
 */
export async function getPermissionsData() {
    const supabase = await createClient();

    const [rolesRes, menusRes, permissionsRes] = await Promise.all([
        supabase.from('roles').select('id, rank_level, description'),
        supabase.from('navigation_menu').select('*').order('display_order'),
        supabase.from('role_menu_permissions').select('role_id, menu_id')
    ]);

    /* if (rolesRes.error || menusRes.error || permissionsRes.error) {
        return { success: false, error: "Error loading permissions data" };
    } */
   if (rolesRes.error || menusRes.error || permissionsRes.error) {
        console.error("DEBUG ROLES:", rolesRes.error);
        console.error("DEBUG MENUS:", menusRes.error);
        console.error("DEBUG PERMISSIONS:", permissionsRes.error);
        
        return { 
            success: false, 
            error: rolesRes.error?.message || menusRes.error?.message || permissionsRes.error?.message 
        };
    }

    return {
        success: true,
        roles: rolesRes.data,
        menus: menusRes.data,
        permissions: permissionsRes.data
    };
}

/**
 * ESCRITURA: Activa o desactiva un permiso específico
 */
export async function togglePermission(roleId, menuId, hasPermission) {
    const supabase = await createClient();

    try {
        if (hasPermission) {
            const { error } = await supabase
                .from("role_menu_permissions")
                .delete()
                .eq("role_id", roleId)
                .eq("menu_id", menuId);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from("role_menu_permissions")
                .insert({ role_id: roleId, menu_id: menuId });
            if (error) throw error;
        }

        // Revalidamos el layout principal donde está el menú para que los cambios se vean
        revalidatePath("/", "layout"); 
        revalidatePath('/(dashboard)', 'layout');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}