import { supabase } from "./supabase";

export async function startConversation(currentUserId, otherUserId) {
    // Check if a conversation already exists between these two users
    const { data: existingConversations, error: existingError } = await supabase
        .from('conversations')
        .select('id, users')
        .contains('users', [currentUserId])
        .contains('users', [otherUserId]);

    if (existingError) {
        console.error('Error checking for existing conversation', existingError);
        throw existingError;
    }

    // Filter for conversations with exactly two users to avoid group chat conflicts
    const privateConversation = existingConversations?.find(c => c.users.length === 2);
    if (privateConversation) {
        return privateConversation;
    }

    // If no conversation exists, create a new one
    const { data: newConversation, error: newConversationError } = await supabase
        .from('conversations')
        .insert([{ users: [currentUserId, otherUserId] }])
        .select('id')
        .single();

    if (newConversationError) {
        console.error('Error creating new conversation', newConversationError);
        throw newConversationError;
    }

    return newConversation;
}

export async function fetchConversations(currentUserId) {
    const { data: conversations, error } = await supabase
        .from("conversations")
        .select("id, users, name")
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
            name: conv.name,
            otherUser: { name, avatar },
            lastMessage: lastMsg,
        };
    }));

    return conversationDetails.filter(Boolean);
}
