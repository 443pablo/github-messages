import { supabase } from "./supabase";
import { Message } from "./messages";

export async function startConversation(currentUserId, otherUserId) {
    // check if convo already exists
    const { data: existingConversations, error: existingError } = await supabase
        .from('conversations')
        .select('id, users')
        .contains('users', [currentUserId])
        .contains('users', [otherUserId]);

    if (existingError) {
        console.error('Error checking for existing conversation', existingError);
        throw existingError;
    }

    // filter thru convos to avoid issues with gcs
    const privateConversation = existingConversations?.find(c => c.users.length === 2);
    if (privateConversation) {
        return privateConversation;
    }

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

export async function getConversationByID(conversationId) {
    const { data: conversation, error } = await supabase
        .from("conversations")
        .select("id, users, name")
        .eq("id", conversationId)
        .single();
        
    if (error) {
        console.error("Error fetching conversation by ID", error);
        return null;
    }

    return conversation;
}

export class Conversation {
    constructor(conversationId, currentUserId) {
        this.id = conversationId;
        this.currentUserId = currentUserId;
        this.users = [];
        this.name = null;
        this.otherUser = null;
        this.messages = [];
    }

    async load() {
        const conversationData = await getConversationByID(this.id);
        if (!conversationData) {
            throw new Error("Conversation not found");
        }
        this.users = conversationData.users;
        this.name = conversationData.name;

        const otherUserId = this.users.find(uid => uid !== this.currentUserId);
        if (otherUserId) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("name, avatar_url")
                .eq("id", otherUserId)
                .single();
            this.otherUser = {
                id: otherUserId,
                name: profile?.name || "Unknown",
                avatar: profile?.avatar_url || "https://github.com/ghost.png"
            };
        }

        await this.fetchMessages();
    }

    async fetchMessages() {
        const { data, error } = await supabase
            .from("messages")
            .select("id, conversation_id, sender_id, content, created_at")
            .eq("conversation_id", this.id)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching messages", error);
            return;
        }
        this.messages = data ? data.map(m => new Message(m)) : [];
    }

    async sendMessage(content) {
        const newMessage = await Message.send(this.id, this.currentUserId, content);
        this.messages.push(newMessage);
        return newMessage;
    }

    static async start(currentUserId, otherUserId) {
        const conversationData = await startConversation(currentUserId, otherUserId);
        const conversation = new Conversation(conversationData.id, currentUserId);
        await conversation.load();
        return conversation;
    }
}

