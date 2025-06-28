import { supabase } from "./supabase";

export async function findUserByUsername(username) {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("name", username)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116: "exact one row not found"
        console.error("Error finding user by username", error);
        throw error;
    }

    return data;
}
