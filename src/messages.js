
import { supabase } from "./db";
import { renderConversationsList } from "./conversations";

export const messagesPage = async () => {
    if (location.pathname === "/messages" || location.pathname === "/messages/") {

        // if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            document.title = "Messages - GitHub";
            const main = document.querySelector("body > div.logged-in.env-production.page-responsive > div.application-main > main");
            main.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh;">
                    <h2>Welcome to GitHub Messages</h2>
                    <p>You need to sign in with GitHub to use messages.</p>
                    <button id="sign-in-github" style="padding: 8px 16px; font-size: 16px; cursor: pointer;" class="Button--primary Button--medium Button">Sign in with GitHub</button>
                </div>
            `;
            document.getElementById("sign-in-github").addEventListener("click", async () => {
                const { error } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin + "/messages" } });
                if (error) {
                    alert('Error signing in: ' + error.message);
                    return;
                }
            });
            return;
        }

        document.title = "Messages - GitHub";
        const main = document.querySelector("body > div.logged-in.env-production.page-responsive > div.application-main > main");
        main.innerHTML = `
            <div style="position: relative; height: 80vh;">
                <button id="sign-out-github" style="position: absolute; top: 16px; right: 16px; padding: 8px 16px; font-size: 14px; cursor: pointer; z-index: 10;" class="Button--secondary Button--small Button">Sign out</button>
                <div style="display: flex; height: 100%; border: 1px solid #ddd;">
                    <aside style="min-width: 200px; max-width: 250px; border-right: 1px solid #eee; padding: 8px; overflow-y: auto;">
                        <h3>Conversations</h3>
                        <ul id="conversation-list" style="list-style: none; padding: 0; margin: 0;"></ul>
                    </aside>
                    <section style="flex: 1; padding: 8px; display: flex; flex-direction: column;">
                        <h3>Messages</h3>
                        <div id="messages-list" style="flex: 1; overflow-y: auto; border: 1px solid #eee; margin-bottom: 8px; padding: 8px; background: #fafbfc;"></div>
                        <form id="send-message-form" style="display: flex; gap: 4px;">
                            <input type="text" id="message-input" placeholder="Type a message..." style="flex: 1;" />
                            <button type="submit">Send</button>
                        </form>
                    </section>
                </div>
            </div>
        `;

        document.getElementById("sign-out-github").addEventListener("click", async () => {
            await supabase.auth.signOut();
            location.reload();
        });

        // Render conversations list
        await renderConversationsList(session.user.id);
    }
}