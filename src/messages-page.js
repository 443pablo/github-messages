import { supabase } from "./api/supabase";
import { fetchConversations } from "./api/conversations";
import { sendMessage, onNewMessage, fetchMessages } from "./api/messages";
import { renderConversationList, handleConversationClick } from "./components/ConversationList";
import { renderMessages } from "./components/MessagesView";

export const messagesPage = async () => {
  if (location.pathname !== "/messages" && location.pathname !== "/messages/") {
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const main = document.querySelector(
    "body > div.logged-in.env-production.page-responsive > div.application-main > main"
  );

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

  const isDarkMode = document.documentElement.getAttribute('data-color-mode') === 'dark';
  const borderColor = isDarkMode ? '#30363d' : '#ddd';
  const subtleBorderColor = isDarkMode ? '#30363d' : '#eee';

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
          <button type="submit">Send</button>
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
      const messages = await fetchMessages(conversationId);
      renderMessages(messages, session.user.id);
  }

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
