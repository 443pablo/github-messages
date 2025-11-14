import { supabase } from "./supabase";

// find user by public github username (stored in profiles.user_name)
export async function findUserByUsername(username) {
    const { data, error } = await supabase
        .from("profiles")
        // select the identifying fields including user_name
        .select("id, name, user_name")
        .eq("user_name", username)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: "exact one row not found"
        console.error("Error finding user by username", error);
        throw error;
    }

    return data;
}

export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from("profiles")
        // include the public github username so callers can route to github
        .select("id, name, avatar_url, user_name")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error fetching user profile", error);
        throw error;
    }

    return data;
}

export async function getUserProfiles(userIds) {
    if (!userIds || userIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("profiles")
        // include user_name so caller code can set data-username correctly
        .select("id, name, avatar_url, user_name")
        .in("id", userIds);

    if (error) {
        console.error("Error fetching user profiles", error);
        throw error;
    }

    return data || [];
}