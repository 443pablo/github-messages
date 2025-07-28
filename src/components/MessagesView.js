import { renderContextMenu } from "./context/Message";

export function renderMessages(messages, currentUserId, conversation, userProfiles = new Map()) {
  const messagesList = document.getElementById("messages-list");
  if (!messages) {
    messagesList.innerHTML = "";
    return;
  }
  
  // Helper function to get user display name
  const getUserDisplayName = (userId) => {
    if (userId === currentUserId) {
      return "You";
    }
    
    const userProfile = userProfiles.get(userId);
    return userProfile?.name || "Unknown User";
  };
  
  messagesList.innerHTML = messages
    .map(
      (msg, idx) => `
              <div class="message-item" data-message-idx="${idx}">
                  <span class="message-sender">${getUserDisplayName(msg.sender_id)}:</span>
                  <span class="message-content">${msg.content}</span>
                  <span class="message-timestamp">${new Date(
                    msg.created_at
                  ).toLocaleTimeString()}</span>
              </div>
          `
    )
    .join("");

  renderContextMenu(messagesList, messages);

  messagesList.scrollTop = messagesList.scrollHeight;
}
