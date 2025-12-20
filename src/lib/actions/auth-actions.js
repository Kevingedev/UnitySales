"use server";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getMyProfile() {
  try {
    // Por ahora, simulamos que el usuario está logueado como Admin
    // En producción aquí llamarías a supabase.auth.getUser()
    /* const mockUser = {
      id: "u123",
      full_name: "Kevin Bilbao",
      role: "admin", 
      email: "kevin@tienda.com"
    }; */
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        console.log("No user found in session");
        return { success: false, data: null };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role_id, roles(rank_level)')
        .eq('id', user.id)
        .single();
        
    if (profileError || !profile) {
        console.error("Error cargando perfil:", profileError);
        return { success: false, data: null };
    }

    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: error.message };
  }
}