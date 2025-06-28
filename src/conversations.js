import { supabase } from "./db";

// Render the conversations list for the logged in user
export async function renderConversationsList(currentUserId) {
    const { data: conversations, error } = await supabase
        .from("conversations")
        .select("id, users")
        .contains("users", [currentUserId]);

    if (error) {
        document.getElementById("conversation-list").innerHTML = `<li>Error loading conversations</li>`;
        return;
    }

    if (!conversations || conversations.length === 0) {
        document.getElementById("conversation-list").innerHTML = `<li>No conversations</li>`;
        return;
    }

    // For each conversation, get the other user's info and the most recent message
    const items = await Promise.all(conversations.map(async (conv) => {
        const otherUserId = conv.users.find(uid => uid !== currentUserId);
        if (!otherUserId) {
            return `<li>Error: No other user found in conversation</li>`;
        }
        // Get user info from auth.users
        const { data: userData } = await supabase.auth.admin.getUserById(otherUserId);
        const name = userData?.user?.user_metadata?.name || userData?.user?.raw_user_meta_data?.name || "Unknown";
        const avatar = userData?.user?.user_metadata?.avatar_url || userData?.user?.raw_user_meta_data?.avatar_url || "https://github.com/ghost.png";

        // Get most recent message
        const { data: messages } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);
        const lastMsg = messages && messages.length > 0 ? messages[0].content : "No messages yet";

        return `<li style="display: flex; align-items: center; gap: 8px; padding: 6px 0;">
            <img src="${avatar}" alt="avatar" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            <div style="flex:1;">
                <div style="font-weight: bold;">${name}</div>
                <div style="font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${lastMsg}</div>
            </div>
        </li>`;
    }));

    document.getElementById("conversation-list").innerHTML = items.join("");
}
