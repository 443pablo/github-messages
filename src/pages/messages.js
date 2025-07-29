import { renderWelcomeView } from "../components/WelcomeView";
import { renderChatView } from "../components/ChatView";
import { supabase } from "../api/supabase";
import { fetchConversations, startConversation, getConversationByID } from "../api/conversations";
import { sendMessage, onNewMessage, fetchMessages } from "../api/messages";
import { renderConversationList, handleConversationClick } from "../components/ConversationList";
import { renderMessages } from "../components/MessagesView";
import { findUserByUsername, getUserProfiles } from "../api/users";
import { MAIN_CONTAINER } from "../constants";
import { showCustomAlert, showCustomPrompt, showCustomConfirm, isDarkMode } from "../utils";
import { errorHandler } from "../error";

export const messagesPage = async () => {
  if (location.pathname !== "/messages" && location.pathname !== "/messages/") {
    return;
  }

  // supabase errs after auth show up in query params
  errorHandler();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const main = document.querySelector(MAIN_CONTAINER);
  main.classList.add("gh-messages-visible");

  if (!session) {
    renderWelcomeView(main);
    return;
  }

  renderChatView(main);

  document
    .getElementById("sign-out-github")
    .addEventListener("click", async () => {
      await supabase.auth.signOut();
      location.reload();
    });

  let currentConversationId = null;
  let unsubscribe = null;

  const conversations = await fetchConversations(session.user.id);
  renderConversationList(conversations);

  async function showMessages(conversationId, showSpinner = false) {
    const messagesList = document.getElementById("messages-list");
    // loading spinner only when explicitly requested
    if (showSpinner) {
      messagesList.innerHTML = `<div class="gh-messages-loading"><svg class="gh-messages-spinner" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" stroke="#0969da"><g fill="none" fill-rule="evenodd"><g transform="translate(2 2)" stroke-width="3"><circle stroke-opacity=".3" cx="18" cy="18" r="18"/><path d="M36 18c0-9.94-8.06-18-18-18"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="1s" repeatCount="indefinite"/></path></g></g></svg></div>`;
    }
    
    const messages = await fetchMessages(conversationId);
    const conv = await getConversationByID(conversationId);
    
    // Fetch user profiles for all users in the conversation
    const userProfiles = await getUserProfiles(conv.users);
    const userProfilesMap = new Map();
    
    // Add current user profile from session metadata
    userProfilesMap.set(session.user.id, {
      id: session.user.id,
      name: session.user.user_metadata.user_name || session.user.user_metadata.full_name || "Unknown",
      username: session.user.user_metadata.user_name, // GitHub username for routing
      avatar_url: session.user.user_metadata.avatar_url
    });
    
    // Add other users' profiles
    userProfiles.forEach(profile => {
      userProfilesMap.set(profile.id, {
        ...profile,
        username: profile.user_name
      });
    });
    
    // Update the header to show the conversation participant
    const headerElement = document.getElementById("message-view-header");
    if (headerElement) {
      if (conv.name) {
        headerElement.textContent = conv.name;
      } else {
        const otherUserId = conv.users.find(uid => uid !== session.user.id);
        if (otherUserId && userProfilesMap.has(otherUserId)) {
          const otherUser = userProfilesMap.get(otherUserId);
          headerElement.textContent = `${otherUser.name}`;
        } else {
          headerElement.textContent = "Messages";
        }
      }
    }
    
    renderMessages(messages, session.user.id, conv, userProfilesMap);
  }

  document.getElementById("new-conversation-btn").addEventListener("click", async () => {
    const dummyUsers = [
      { name: 'John Doe', username: 'johndoe', avatar: 'https://avatars.githubusercontent.com/u/1' },
      { name: 'Jane Smith', username: 'janesmith', avatar: 'https://avatars.githubusercontent.com/u/2' },
      { name: 'AI Assistant', username: 'copilot', avatar: 'https://avatars.githubusercontent.com/u/87264559' },
    ];

    const dummyUsersHtml = dummyUsers.map(user => `
      <div class="gh-messages-user-suggestion" data-username="${user.username}">
        <img src="${user.avatar}" class="gh-messages-user-avatar">
        <div>
          <div class="gh-messages-user-name">${user.name}</div>
          <div class="gh-messages-user-username">${user.username}</div>
        </div>
      </div>
    `).join('');

    const suggestionsHtml = `
      <div class="gh-messages-user-suggestions">
        <h4>Suggestions</h4>
        ${dummyUsersHtml}
      </div>
    `;

    const username = await showCustomPrompt({ text: "Enter the GitHub username of the user you want to message:", html: suggestionsHtml });
    if (!username) return;

    if (username.toLowerCase() === session.user.user_metadata.user_name.toLowerCase()) {
      await showCustomAlert("Sorry you're lonely but you cannot start a conversation with yourself. (actually you can with the API shh)");
      return;
    }

    try {
      const otherUser = await findUserByUsername(username);
      if (!otherUser) {
        await showCustomConfirm(`${username} is not on GitHub Messages yet. You can still start a conversation, but they won't receive your messages until they sign up.`);
        return;
      }

      const conversation = await startConversation(session.user.id, otherUser.id);
      
      // Refresh conversation list
      const newConversations = await fetchConversations(session.user.id);
      renderConversationList(newConversations);

      // Programmatically click the new conversation to show its messages
      const conversationElement = document.querySelector(`li[data-conversation-id="${conversation.id}"]`);
      if (conversationElement) {
        conversationElement.click();
      }

    } catch (error) {
      console.error("Failed to start new conversation:", error);
      await showCustomAlert("Could not start a new conversation. Please try again.");
    }
  });

  handleConversationClick(async (conversationId) => {
    currentConversationId = conversationId;
    await showMessages(conversationId, true);
    if (unsubscribe) unsubscribe.unsubscribe();
    unsubscribe = onNewMessage(conversationId, async (msg) => {
      if (msg.sender_id !== session.user.id) {
        await showMessages(conversationId);
      }
    });
  });

  document
      .getElementById("send-message-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("message-input");
      const content = input.value.trim();
      if (!content || !currentConversationId) return;
      
      // immediately show the message as pending
      const messagesList = document.getElementById("messages-list");
      const tempId = `temp-${Date.now()}`;
      const pendingMessageHtml = `
        <div class="message-item pending" data-temp-id="${tempId}">
          <span class="message-sender">
            <span class="message-sender-link" data-username="${session.user.user_metadata.user_name}" data-user-id="${session.user.id}">
              ${session.user.user_metadata.full_name || session.user.user_metadata.user_name || "You"}
            </span>:
          </span>
          <span class="message-content">${content}</span>
          <span class="message-timestamp">Sending...</span>
        </div>
      `;
      messagesList.insertAdjacentHTML('beforeend', pendingMessageHtml);
      messagesList.scrollTop = messagesList.scrollHeight;
      
      input.value = "";
      
      try {
        await sendMessage(currentConversationId, session.user.id, content);
        // update the pending message to delivered state
        const pendingElement = document.querySelector(`[data-temp-id="${tempId}"]`);
        if (pendingElement) {
          pendingElement.classList.remove('pending');
          const timestampEl = pendingElement.querySelector('.message-timestamp');
          if (timestampEl) {
            timestampEl.textContent = new Date().toLocaleTimeString();
          }
        }
      } catch (error) {
        // if sending fails, remove the pending message
        const pendingElement = document.querySelector(`[data-temp-id="${tempId}"]`);
        if (pendingElement) {
          pendingElement.remove();
        }
        console.error("Failed to send message:", error);
      }
    });
};
