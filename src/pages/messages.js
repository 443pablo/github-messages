import { supabase } from "../api/supabase";
import { fetchConversations, startConversation, getConversationByID } from "../api/conversations";
import { sendMessage, onNewMessage, fetchMessages } from "../api/messages";
import { renderConversationList, handleConversationClick } from "../components/ConversationList";
import { renderMessages } from "../components/MessagesView";
import { findUserByUsername } from "../api/users";
import { MAIN_CONTAINER } from "../constants";
import { showCustomAlert, showCustomPrompt, isDarkMode } from "../utils";

export const messagesPage = async () => {
  if (location.pathname !== "/messages" && location.pathname !== "/messages/") {
    return;
  }

  

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const main = document.querySelector(MAIN_CONTAINER);
  main.style.opacity = "1";

  if (!session) {
    document.title = "Messages - GitHub";
    main.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh;">
                  <h2>Welcome to GitHub Messages</h2>
                  <p>You need to sign in with GitHub to use messages.</p>
                  <button id="sign-in-github" style="padding: 8px 16px; font-size: 16px; cursor: pointer;" class="Button--primary Button--medium Button">Sign in with GitHub</button>
              </div>
          `;
    document
      .getElementById("sign-in-github")
      .addEventListener("click", async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: { redirectTo: window.location.origin + "/messages" },
        });
        if (error) {
          alert("Error signing in: " + error.message);
        }
      });
    return;
  }

  document.title = "Messages - GitHub";

  const borderColor = isDarkMode() ? '#30363d' : '#ddd';
  const subtleBorderColor = isDarkMode() ? '#30363d' : '#eee';

  main.innerHTML = `
    <div style="position: relative; height: 80vh;">
      <div style="display: flex; height: calc(100% - 40px); border: 1px solid ${borderColor};border-radius:15px;margin:20px;">
        <aside style="min-width: 200px; max-width: 250px; border-right: 1px solid ${subtleBorderColor}; padding: 8px; overflow-y: auto;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3>Conversations</h3>
            <button id="new-conversation-btn" style="background-color: #0969da; border: none; padding: 4px; cursor: pointer; vertical-align: middle; border-radius: 6px; line-height: 1;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" style="display: inline-block; vertical-align: middle;">
                <path fill="white" d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path>
              </svg>
            </button>
          </div>
          <ul id="conversation-list" style="list-style: none; padding: 0; margin: 0;"></ul>
        </aside>
        <section style="flex: 1; padding: 8px; display: flex; flex-direction: column;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 8px;">
          <h3 style="margin: 0;">Messages</h3>
          <button id="sign-out-github" style="padding: 8px 16px; font-size: 14px; cursor: pointer; z-index: 10; margin-bottom: 8px;" class="Button--secondary Button--small Button">Sign out</button>
        </div>
        <div id="messages-list" style="flex: 1; overflow-y: auto; border: 1px solid ${subtleBorderColor}; margin-bottom: 8px; padding: 8px;"></div>
        <form id="send-message-form" style="display: flex; gap: 4px;">
          <input type="text" id="message-input" placeholder="Type a message..." style="flex: 1;" />
          <button class="Button--secondary Button--small Button" type="submit">Send</button>
        </form>
      </section>
    </div>
  `;

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

  async function showMessages(conversationId) {
    const messagesList = document.getElementById("messages-list");
    // loading spinner
    messagesList.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" stroke="#0969da"><g fill="none" fill-rule="evenodd"><g transform="translate(2 2)" stroke-width="3"><circle stroke-opacity=".3" cx="18" cy="18" r="18"/><path d="M36 18c0-9.94-8.06-18-18-18"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="1s" repeatCount="indefinite"/></path></g></g></svg></div>`;
    
    const messages = await fetchMessages(conversationId);
    const conv = await getConversationByID(conversationId);
    const usersInConversation = new Map();
    conv.users.forEach(userId => {
      usersInConversation.set(userId, null);
    });
    renderMessages(messages, session.user.id, conv);
  }

  document.getElementById("new-conversation-btn").addEventListener("click", async () => {
    const username = await showCustomPrompt("Enter the GitHub username of the user you want to message:");
    if (!username) return;

    if (username.toLowerCase() === session.user.user_metadata.user_name.toLowerCase()) {
      await showCustomAlert("You cannot start a conversation with yourself.");
      return;
    }

    try {
      const otherUser = await findUserByUsername(username);
      if (!otherUser) {
        await showCustomAlert("User not found. Note: usernames are case-sensitive.");
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
    await showMessages(conversationId);
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
      await sendMessage(currentConversationId, session.user.id, content);
      input.value = "";
      await showMessages(currentConversationId);
    });
};
