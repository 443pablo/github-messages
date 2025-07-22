import { supabase } from "../api/supabase";

export function renderWelcomeView(container) {
  document.title = "Messages - GitHub";
  container.innerHTML = `
    <div class="gh-messages-welcome">
        <h2>Welcome to GitHub Messages</h2>
        <p>You need to sign in with GitHub to use messages.</p>
        <button id="sign-in-github" class="gh-messages-signin-btn Button--primary Button--medium Button">Sign in with GitHub</button>
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
}
