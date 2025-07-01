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
              <div class="message-item" data-message-idx="${idx}" style="margin-bottom: 8px; position: relative;">
                  <span style="font-weight: bold; color: #555;">${
                    msg.sender_id === currentUserId ? "You" : "Them"
                  }:</span>
                  <span>${msg.content}</span>
                  <span style="font-size: 11px; color: #aaa; margin-left: 8px;">${new Date(
                    msg.created_at
                  ).toLocaleTimeString()}</span>
              </div>
          `
    )
    .join("");

  renderContextMenu(messagesList);

  messagesList.scrollTop = messagesList.scrollHeight;
}
