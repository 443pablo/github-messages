import { isDarkMode, showCustomAlert } from "../utils";

export function renderConversationDetailsView(conversation, currentUserId, userProfiles, onBack) {
  const messagesList = document.getElementById("messages-list");
  const sendMessageForm = document.getElementById("send-message-form");
  const isDark = isDarkMode();
  
  // hide the send message form
  if (sendMessageForm) {
    sendMessageForm.style.display = "none";
  }

  // determine if this is a group chat (more than 2 participants)
  const isGroupChat = conversation.users && conversation.users.length > 2;
  
  // get other participants info
  const participants = [];
  if (conversation.users) {
    conversation.users.forEach(userId => {
      if (userId !== currentUserId && userProfiles.has(userId)) {
        const profile = userProfiles.get(userId);
        participants.push({
          id: userId,
          name: profile.name,
          username: profile.username || profile.user_name,
          avatar: profile.avatar_url
        });
      }
    });
  }

  const conversationName = conversation.name || participants[0]?.name || "Unknown";

  const detailsHtml = `
    <div class="gh-conversation-details ${isDark ? 'dark' : ''}">
      <div class="gh-conversation-details-header">
        <button id="back-to-chat-btn" class="gh-back-button" title="Back to chat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
            <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"></path>
          </svg>
        </button>
        <h2>Conversation Details</h2>
      </div>

      <div class="gh-conversation-details-content">
        <div class="gh-conversation-details-section">
          <h3>Name</h3>
          <div class="gh-conversation-name-display">
            ${conversationName}
            ${isGroupChat ? '<button id="rename-conversation-btn" class="gh-details-action-btn">Rename</button>' : ''}
          </div>
        </div>

        <div class="gh-conversation-details-section">
          <h3>Participants (${participants.length + 1})</h3>
          <div class="gh-participants-list">
            ${userProfiles.has(currentUserId) ? `
              <div class="gh-participant-item" data-username="${userProfiles.get(currentUserId).username}">
                <img src="${userProfiles.get(currentUserId).avatar_url}" alt="avatar" class="gh-participant-avatar">
                <div class="gh-participant-info">
                  <div class="gh-participant-name">${userProfiles.get(currentUserId).name} <span class="gh-participant-you">(You)</span></div>
                  <div class="gh-participant-username">@${userProfiles.get(currentUserId).username}</div>
                </div>
              </div>
            ` : ''}
            ${participants.map(p => `
              <div class="gh-participant-item" data-username="${p.username}">
                <img src="${p.avatar}" alt="avatar" class="gh-participant-avatar">
                <div class="gh-participant-info">
                  <div class="gh-participant-name">${p.name}</div>
                  <div class="gh-participant-username">@${p.username}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="gh-conversation-details-section gh-danger-section">
          <h3>Actions</h3>
          <button id="block-user-btn" class="gh-details-action-btn gh-danger-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
              <path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
            </svg>
            Block ${participants.length === 1 ? participants[0].name : 'Participants'}
          </button>
          <button id="leave-conversation-btn" class="gh-details-action-btn gh-danger-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
              <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l1.97-1.97H6.75a.75.75 0 0 1 0-1.5Z"></path>
            </svg>
            Leave Conversation
          </button>
          <button id="delete-conversation-btn" class="gh-details-action-btn gh-danger-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
              <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path>
            </svg>
            Delete Conversation
          </button>
        </div>
      </div>
    </div>
  `;

  messagesList.innerHTML = detailsHtml;

  // attach event listeners
  document.getElementById("back-to-chat-btn")?.addEventListener("click", () => {
    if (sendMessageForm) {
      sendMessageForm.style.display = "flex";
    }
    onBack();
  });

  if (isGroupChat) {
    document.getElementById("rename-conversation-btn")?.addEventListener("click", async () => {
      const { showCustomPrompt } = await import("../utils");
      const newName = await showCustomPrompt({ 
        text: "Enter new conversation name:", 
        defaultValue: conversation.name || ""
      });
      
      if (newName && newName.trim()) {
        // TODO: implement rename api call
        console.log("rename conversation to:", newName);
        const { showCustomAlert } = await import("../utils");
        await showCustomAlert("Rename functionality coming soon!");
      }
    });
  }

  document.getElementById("block-user-btn")?.addEventListener("click", async () => {
    const { showCustomConfirm, showCustomAlert } = await import("../utils");
    const confirmed = await showCustomConfirm(
      `Are you sure you want to block ${participants.length === 1 ? participants[0].name : 'these participants'}? You will no longer receive messages from them.`
    );
    
    if (confirmed) {
      // TODO: implement block api call
      console.log("block users:", participants);
      await showCustomAlert("Block functionality coming soon!");
    }
  });

  document.getElementById("leave-conversation-btn")?.addEventListener("click", async () => {
    const { showCustomConfirm, showCustomAlert } = await import("../utils");
    const confirmed = await showCustomConfirm(
      "Are you sure you want to leave this conversation? You will no longer see messages from this chat."
    );
    
    if (confirmed) {
      // TODO: implement leave conversation api call
      console.log("leave conversation:", conversation.id);
      await showCustomAlert("Leave conversation functionality coming soon!");
    }
  });

  document.getElementById("delete-conversation-btn")?.addEventListener("click", async () => {
    const { showCustomConfirm, showCustomAlert } = await import("../utils");
    const confirmed = await showCustomConfirm(
      "Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently deleted."
    );
    
    if (confirmed) {
      // TODO: implement delete conversation api call
      console.log("delete conversation:", conversation.id);
      await showCustomAlert("Delete conversation functionality coming soon!");
    }
  });

  // click handlers for participant items
  messagesList.querySelectorAll('.gh-participant-item').forEach(item => {
    item.style.cursor = "pointer";
    
    item.addEventListener('click', () => {
      const username = item.dataset.username;
      if (username && username !== "Unknown User" && username !== "unknown") {
        window.open(`https://github.com/${username}`, '_blank');
      } else {
        showCustomAlert("This user does not have a valid GitHub profile.");
      }
    });
  });
}
