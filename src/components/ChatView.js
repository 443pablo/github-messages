import { isDarkMode } from "../utils";

export function renderChatView(container) {
  document.title = "Messages - GitHub";
  const isDark = isDarkMode();

  container.innerHTML = `
    <div class="gh-messages-container">
      <div class="gh-messages-main ${isDark ? 'dark' : ''}">
        <aside class="gh-messages-sidebar ${isDark ? 'dark' : ''}">
          <div class="gh-messages-sidebar-header">
            <h3>Conversations</h3>
            <button id="new-conversation-btn" class="gh-messages-new-conversation-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
                <path fill="white" d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path>
              </svg>
            </button>
          </div>
          <ul id="conversation-list" class="gh-messages-conversation-list"></ul>
        </aside>
        <section class="gh-messages-content">
        <div class="gh-messages-header">
          <h3 id="message-view-header">Messages</h3>
          <button id="sign-out-github" class="gh-messages-signout-btn Button--secondary Button--small Button">Sign out</button>
        </div>
        <div id="messages-list" class="gh-messages-list ${isDark ? 'dark' : ''}"></div>
        <form id="send-message-form" class="gh-messages-form">
          <input autocomplete="off" type="text" id="message-input" placeholder="Type a message..." class="gh-messages-input form-control" />
          <button class="Button--secondary Button--small Button" type="submit">Send</button>
        </form>
      </section>
    </div>
  `;
}
