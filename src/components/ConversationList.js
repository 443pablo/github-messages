export function renderConversationList(conversations) {
    const listElement = document.getElementById("conversation-list");
    if (!conversations || conversations.length === 0) {
        listElement.innerHTML = `<li>No conversations</li>`;
        return;
    }

    const items = conversations.map(conv => `
        <li style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; cursor: pointer; transition: background-color 0.2s ease-in-out; border-radius: 6px;" data-conversation-id="${conv.id}">
            <img src="${conv.otherUser.avatar}" alt="avatar" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            <div style="flex:1;">
                <div style="font-weight: bold;">${conv.otherUser.name}</div>
                <div style="font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${conv.lastMessage}</div>
            </div>
        </li>`
    ).join("");

    listElement.innerHTML = items;
}

export const handleConversationClick = (onConversationSelect) => {
    const listElement = document.getElementById("conversation-list");
    let currentSelectedItem = null;

    listElement.addEventListener("click", (event) => {
        const li = event.target.closest("li[data-conversation-id]");
        if (li) {
            if (currentSelectedItem) {
                currentSelectedItem.style.backgroundColor = "";
            }
            
            const isDarkMode = document.documentElement.getAttribute('data-color-mode') === 'dark';
            li.style.backgroundColor = isDarkMode ? '#30363d' : '#f0f0f0';
            currentSelectedItem = li;

            const conversationId = li.getAttribute("data-conversation-id");
            if (!conversationId) return;
            onConversationSelect(conversationId);
        }
    });
};
