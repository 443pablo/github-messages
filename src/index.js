import { messagesPage } from "./pages/messages";
import { addProfileButtons, addNavButton } from "./components/ProfileButtons";

(async () => {
  addProfileButtons();
  addNavButton();
  await messagesPage();
})();
