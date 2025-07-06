import { renderContextMenu } from "./context/Message";

export function renderMessages(messages, currentUserId, conversation) {
  const messagesList = document.getElementById("messages-list");
  if (!messages) {
    messagesList.innerHTML = "";
    return;
  }
  
  messagesList.innerHTML = messages
    .map(
      (msg, idx) => `
              <div class="message-item" data-message-idx="${idx}">
                  <span class="message-sender">${
                    msg.sender_id === currentUserId ? "You" : "Them"
                  }:</span>
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
