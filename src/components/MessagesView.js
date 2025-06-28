export function renderMessages(messages, currentUserId, conversation) {
    const messagesList = document.getElementById("messages-list");
    if (!messages) {
        messagesList.innerHTML = "";
        return;
    }
    messagesList.innerHTML = messages
        .map(
            (msg) => `
              <div style="margin-bottom: 8px;">
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
    messagesList.scrollTop = messagesList.scrollHeight;
}
