import { supabase } from "./supabase";

export async function sendMessage(conversationId, senderId, content) {
    const { data, error } = await supabase
        .from("messages")
        .insert([
            {
                conversation_id: conversationId,
                sender_id: senderId,
                content,
            },
        ]);
    if (error) throw error;
    return data;
}

export function onNewMessage(conversationId, callback) {
    return supabase
        .channel('messages')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            payload => {
                callback(payload.new);
            }
        )
        .subscribe();
}

export async function fetchMessages(conversationId) {
    const { data: messages, error } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
    if (error) throw error;
    return messages;
}
