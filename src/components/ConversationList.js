export function renderConversationList(conversations) {
    const listElement = document.getElementById("conversation-list");
    if (!conversations || conversations.length === 0) {
        listElement.innerHTML = `<li>No conversations</li>`;
        return;
    }

    const items = conversations.map(conv => `
        <li class="gh-messages-conversation-item" data-conversation-id="${conv.id}">
            <img src="${conv.otherUser.avatar}" alt="avatar" class="gh-messages-conversation-avatar">
            <div class="gh-messages-conversation-content">
                <div class="gh-messages-conversation-name">${conv.name ?? conv.otherUser.name}</div>
                <div class="gh-messages-conversation-preview">${conv.lastMessage}</div>
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
                currentSelectedItem.classList.remove("selected");
            }
            
            const isDark = document.documentElement.getAttribute('data-color-mode') === 'dark';
            li.classList.add("selected");
            if (isDark) {
                li.classList.add("dark");
            }
            currentSelectedItem = li;

            const conversationId = li.getAttribute("data-conversation-id");
            if (!conversationId) return;
            onConversationSelect(conversationId);
        }
    });
};
