import { supabase } from "./supabase";

export async function fetchConversations(currentUserId) {
    const { data: conversations, error } = await supabase
        .from("conversations")
        .select("id, users")
        .contains("users", [currentUserId]);

    if (error) {
        console.error("Error loading conversations", error);
        return [];
    }

    if (!conversations || conversations.length === 0) {
        return [];
    }

    //get the other user's info and the most recent message
    const conversationDetails = await Promise.all(conversations.map(async (conv) => {
        const otherUserId = conv.users.find(uid => uid !== currentUserId);
        if (!otherUserId) {
            return null;
        }
        // user info from public profiles table
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", otherUserId)
            .single();
        const name = profile?.name || "Unknown";
        const avatar = profile?.avatar_url || "https://github.com/ghost.png";

        //recent msg
        const { data: messages } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);
        const lastMsg = messages && messages.length > 0 ? messages[0].content : "No messages yet";

        return {
            id: conv.id,
            otherUser: { name, avatar },
            lastMessage: lastMsg,
        };
    }));

    return conversationDetails.filter(Boolean);
}
