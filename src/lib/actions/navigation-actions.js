"use server";
import { createClient } from "@/lib/supabase-server";

export async function getProtectNavigation() {
    try {
        const supabase = await createClient(); 
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            //console.log("Servidor: No se encontró usuario");
            return { success: false, menu: [] };
        }

        // 1. OBTENER PERFIL (Corregido pError por error)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, role_id, roles(rank_level)')
            .eq('id', user.id)
            .single();

        // IMPORTANTE: Aquí usamos profileError
        if (profileError || !profile) {
            //console.error("Error cargando perfil:", profileError);
            throw new Error('Profile not found');
        }

        const userRank = profile.roles?.rank_level || 0;

        // 2. TRAER MENÚ (Asegúrate de que la FKey coincida con el nombre en Supabase)
        const { data: allMenuItems, error: mError } = await supabase
            .from('navigation_menu')
            .select(`
                *, 
                required_role:roles(rank_level)
            `)
            .eq('is_active', true)
            .order('display_order');

        if (mError) throw mError;

        // 3. FILTRADO
        const filteredMenu = allMenuItems.filter(item => {
            if (!item.required_role) return true;
            return userRank >= item.required_role.rank_level;
        });

        return {
            success: true,
            menu: filteredMenu,
            user: {
                name: profile.full_name,
                role: profile.role_id,
            }
        };

    } catch (error) {
        // Esto te dirá exactamente qué está pasando en la terminal de VS Code
        //console.error("DEBUG - RBAC Error completo:", error.message);
        return { success: false, menu: [] };
    }
}