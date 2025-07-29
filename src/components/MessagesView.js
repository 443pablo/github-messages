import { renderContextMenu } from "./context/Message";
import { format, isToday, isYesterday, isThisWeek, isThisYear, parseISO } from "date-fns";
import { showCustomAlert } from "../utils";

export function renderMessages(messages, currentUserId, conversation, userProfiles = new Map()) {
  const messagesList = document.getElementById("messages-list");
  if (!messages) {
    messagesList.innerHTML = "";
    return;
  }
  
  // Helper function to get user display name and profile info
  const getUserInfo = (userId) => {
    const userProfile = userProfiles.get(userId);
    const displayName = userProfile?.name || "Unknown User";
    const githubUsername = userProfile?.username || "unknown";
    
    return {
      name: displayName,
      username: githubUsername, // This is the actual GitHub username for routing
      isCurrentUser: userId === currentUserId
    };
  };

  // Helper function to format date for separators
  const formatDateSeparator = (date) => {
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else if (isThisWeek(date)) {
      return format(date, "EEEE"); // Monday, Tuesday, etc.
    } else if (isThisYear(date)) {
      return format(date, "MMMM d"); // January 15
    } else {
      return format(date, "MMMM d, yyyy"); // January 15, 2023
    }
  };

  // Group messages by date
  const messagesByDate = new Map();
  messages.forEach(msg => {
    const msgDate = parseISO(msg.created_at);
    const dateKey = format(msgDate, "yyyy-MM-dd");
    
    if (!messagesByDate.has(dateKey)) {
      messagesByDate.set(dateKey, []);
    }
    messagesByDate.get(dateKey).push(msg);
  });

  let htmlContent = "";
  let msgIdx = 0; // Global message index for context menu

  // messages grouped by date
  messagesByDate.forEach((dayMessages, dateKey) => {
    const date = new Date(dateKey);
    
    // date separator
    htmlContent += `
      <div class="date-separator">
        <span class="date-separator-line"></span>
        <span class="date-separator-text">${formatDateSeparator(date)}</span>
        <span class="date-separator-line"></span>
      </div>
    `;

    // add messages for this day
    dayMessages.forEach(msg => {
      const userInfo = getUserInfo(msg.sender_id);
      const msgDate = parseISO(msg.created_at);
      const fullDateTime = format(msgDate, "EEEE, MMMM d, yyyy 'at' h:mm:ss a");
      
      htmlContent += `
        <div class="message-item" data-message-idx="${msgIdx}">
          <span class="message-sender">
            <span class="message-sender-link" data-username="${userInfo.username}" data-user-id="${msg.sender_id}">
              ${userInfo.name}
            </span>:
          </span>
          <span class="message-content">${msg.content}</span>
          <span class="message-timestamp" title="${fullDateTime}">${new Date(
            msg.created_at
          ).toLocaleTimeString()}</span>
        </div>
      `;
      msgIdx++;
    });
  });

  messagesList.innerHTML = htmlContent;

  // click handlers for username links
  messagesList.querySelectorAll('.message-sender-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const username = link.dataset.username;
      if (username && username !== "Unknown User" && username !== "unknown") {
        window.open(`https://github.com/${username}`, '_blank');
      } else {
        showCustomAlert("This user does not have a valid GitHub profile.");
      }
    });
  });

  renderContextMenu(messagesList, messages);

  messagesList.scrollTop = messagesList.scrollHeight;
}
