"use server";
import { createClient } from "@/lib/supabase-server";
import { unstable_noStore as noStore } from "next/cache";


export async function getProtectNavigation() {
    noStore();
    try {
        const supabase = await createClient(); 
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) return { success: false, menu: [] };

        // 1. OBTENER PERFIL
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, role_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) throw new Error('Profile not found');

        // 2. TRAER SOLO LOS MENÚS A LOS QUE ESTE ROL TIENE ACCESO
        // Usamos un JOIN a través de la tabla de permisos
        const { data: allowedMenu, error: mError } = await supabase
            .from('navigation_menu')
            .select(`
                *,
                role_menu_permissions!inner(role_id)
            `)
            .eq('is_active', true)
            .eq('role_menu_permissions.role_id', profile.role_id)
            .order('display_order');

        if (mError) throw mError;

        return {
            success: true,
            menu: allowedMenu,
            user: {
                name: profile.full_name,
                role: profile.role_id,
            }
        };

    } catch (error) {
        console.error("RBAC Error:", error.message);
        return { success: false, menu: [] };
    }
}